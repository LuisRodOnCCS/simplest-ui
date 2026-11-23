import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { PropertyValues } from "lit";
import { collectFocusable, lockScroll, trapTabKey, unlockScroll } from "./internal/a11y";
import type { SuiDialogCloseReason } from "./internal/dialog-events";
import { createId } from "./internal/id";
import { isTopOverlay, registerOverlay, unregisterOverlay } from "./internal/overlay";

export type {
  SuiDialogCloseEvent,
  SuiDialogCloseEventDetail,
  SuiDialogCloseReason,
} from "./internal/dialog-events";

@customElement("sui-modal")
export class SuiModal extends LitElement {
  private readonly uid = createId("sui-modal");
  private readonly overlay = { close: (reason: "escape") => this.close(reason) };

  static styles = css`
    :host {
      display: none;
    }
    :host([open]) {
      display: block;
    }
    .backdrop {
      position: fixed;
      inset: 0;
      background: var(--sui-color-backdrop);
      backdrop-filter: blur(var(--sui-blur-backdrop));
      -webkit-backdrop-filter: blur(var(--sui-blur-backdrop));
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--sui-z-modal);
      padding: var(--sui-space-4);
    }
    .panel {
      background: var(--sui-color-surface-raised);
      color: var(--sui-color-text);
      border: 1px solid var(--sui-color-border);
      border-radius: var(--sui-radius-xl);
      box-shadow: var(--sui-shadow-modal);
      backdrop-filter: blur(var(--sui-blur-lg));
      -webkit-backdrop-filter: blur(var(--sui-blur-lg));
      width: var(--sui-modal-width, 380px);
      max-width: 100%;
      max-height: 90vh;
      overflow: auto;
      padding: var(--sui-space-5-5);
      outline: none;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--sui-space-3);
      margin-bottom: var(--sui-space-2);
    }
    .title {
      font-size: var(--sui-font-size-base);
      font-weight: var(--sui-font-weight-semibold);
      margin: 0;
    }
    .close {
      background: transparent;
      border: 0;
      font-size: var(--sui-font-size-xl);
      line-height: 1;
      color: var(--sui-color-text-muted);
      padding: var(--sui-space-0-5);
      border-radius: var(--sui-radius-xs);
      cursor: pointer;
    }
    .close:hover {
      color: var(--sui-color-text);
    }
    .close:focus-visible {
      outline: none;
      box-shadow: var(--sui-focus-ring);
    }
    .body {
      font-size: var(--sui-font-size-sm);
      color: var(--sui-color-text-muted);
      margin-bottom: var(--sui-space-4-5);
    }
    .footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--sui-space-2);
    }
  `;

  @property({ type: Boolean, reflect: true }) open = false;

  /** Accessible name used when no `title` slot content is provided. */
  @property({ type: String }) label = "";

  /** Accessible label for the dialog's close button. */
  @property({ type: String, attribute: "close-label" }) closeLabel = "Close";

  /** Set to true to keep the modal open when the backdrop is clicked. */
  @property({ type: Boolean, attribute: "disable-backdrop-close" }) disableBackdropClose = false;

  /** Hide the built-in close button when an accessible alternative is provided. */
  @property({ type: Boolean, reflect: true, attribute: "hide-close-button" }) hideCloseButton = false;

  private previouslyFocused: HTMLElement | null = null;
  private holdsScrollLock = false;
  private closeReason: SuiDialogCloseReason | undefined;

  private get titleId() {
    return `${this.uid}-title`;
  }

  private get bodyId() {
    return `${this.uid}-body`;
  }

  protected updated(changed: PropertyValues) {
    if (!changed.has("open")) return;

    const previousOpen = changed.get("open");
    const wasOpen = previousOpen === true;
    const wasClosed = previousOpen === false;

    if (this.open) {
      this.closeReason = undefined;
      if (wasClosed || previousOpen === undefined) {
        this.previouslyFocused = document.activeElement as HTMLElement | null;
      }
      this.acquireOverlay();
      if (wasClosed) {
        this.dispatchEvent(new CustomEvent("sui-open", { bubbles: true, composed: true }));
      }
      this.updateComplete.then(() => this.focusInitial());
    } else {
      this.releaseOverlay();
      if (wasOpen) {
        this.dispatchEvent(
          new CustomEvent("sui-close", {
            detail: { reason: this.closeReason ?? "programmatic" },
            bubbles: true,
            composed: true,
          })
        );
        this.previouslyFocused?.focus?.();
        this.previouslyFocused = null;
      }
      this.closeReason = undefined;
    }
  }

  private focusInitial() {
    const focusable = collectFocusable(this);
    if (focusable.length) {
      focusable[0].focus();
      return;
    }
    this.renderRoot.querySelector<HTMLElement>(".panel")?.focus();
  }

  private handleKeydown = (e: KeyboardEvent) => {
    if (!this.open || !isTopOverlay(this.overlay) || e.key !== "Tab") return;
    trapTabKey(e, this);
  };

  private handleBackdropClick = (e: MouseEvent) => {
    if (e.target !== e.currentTarget || this.disableBackdropClose) return;
    this.close("backdrop");
  };

  openModal() {
    this.open = true;
  }

  close(reason: SuiDialogCloseReason = "programmatic") {
    if (!this.open) return;
    this.closeReason = reason;
    this.open = false;
    this.releaseOverlay();
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("keydown", this.handleKeydown);
    if (this.open) this.acquireOverlay();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this.handleKeydown);
    this.releaseOverlay();
  }

  private acquireOverlay() {
    if (this.holdsScrollLock) return;
    this.holdsScrollLock = true;
    lockScroll();
    registerOverlay(this.overlay);
  }

  private releaseOverlay() {
    if (!this.holdsScrollLock) return;
    this.holdsScrollLock = false;
    unlockScroll();
    unregisterOverlay(this.overlay);
  }

  render() {
    if (!this.open) return nothing;

    const labelledBy = this.label ? nothing : this.titleId;

    return html`
      <div class="backdrop" @click=${this.handleBackdropClick}>
        <div
          class="panel"
          role="dialog"
          aria-modal="true"
          aria-label=${this.label || nothing}
          aria-labelledby=${labelledBy}
          aria-describedby=${this.bodyId}
          tabindex="-1"
        >
          <div class="header">
            <div class="title" id=${this.titleId}><slot name="title"></slot></div>
            ${this.hideCloseButton ? nothing : html`<button class="close" type="button" aria-label=${this.closeLabel} @click=${() => this.close("dismiss")}>×</button>`}
          </div>
          <div class="body" id=${this.bodyId}><slot></slot></div>
          <div class="footer"><slot name="footer"></slot></div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sui-modal": SuiModal;
  }
}
