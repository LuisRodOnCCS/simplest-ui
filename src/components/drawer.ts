import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { PropertyValues } from "lit";
import { lockScroll, trapTabKey, unlockScroll } from "./internal/a11y";
import type { SuiDialogCloseReason } from "./internal/dialog-events";
import { createId } from "./internal/id";
import { isTopOverlay, registerOverlay, unregisterOverlay } from "./internal/overlay";

export type {
  SuiDialogCloseEvent,
  SuiDialogCloseEventDetail,
  SuiDialogCloseReason,
} from "./internal/dialog-events";

/**
 * Accessible modal side panel. It keeps its content in light DOM so regular
 * Simplest UI classes can be used inside the title, body and footer slots.
 */
@customElement("sui-drawer")
export class SuiDrawer extends LitElement {
  private readonly uid = createId("sui-drawer");
  private readonly overlay = { close: (reason: "escape") => this.close(reason) };
  private previouslyFocused: HTMLElement | null = null;
  private holdsScrollLock = false;
  private closeReason: SuiDialogCloseReason | undefined;

  static styles = css`
    :host { display: none; }
    :host([open]) { display: block; }

    .backdrop {
      position: fixed;
      inset: 0;
      display: flex;
      justify-content: flex-end;
      background: var(--sui-color-backdrop);
      backdrop-filter: blur(var(--sui-blur-backdrop));
      -webkit-backdrop-filter: blur(var(--sui-blur-backdrop));
      z-index: var(--sui-z-drawer-backdrop);
    }

    .panel {
      display: flex;
      flex-direction: column;
      width: var(--sui-drawer-width, 320px);
      max-width: 100%;
      height: 100%;
      color: var(--sui-color-text);
      background: var(--sui-color-surface-raised);
      border-left: 1px solid var(--sui-color-border);
      box-shadow: var(--sui-shadow-drawer);
      backdrop-filter: blur(var(--sui-blur-lg));
      -webkit-backdrop-filter: blur(var(--sui-blur-lg));
      outline: none;
    }

    @media (prefers-reduced-motion: no-preference) {
      .panel { animation: sui-drawer-enter var(--sui-duration-normal) var(--sui-easing-standard); }
      @keyframes sui-drawer-enter { from { transform: translateX(100%); } to { transform: translateX(0); } }
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--sui-space-3);
      padding: var(--sui-space-4);
      border-bottom: 1px solid var(--sui-color-border);
    }

    .title {
      min-width: 0;
      font-size: var(--sui-font-size-md);
      font-weight: var(--sui-font-weight-semibold);
    }

    .close {
      flex: none;
      padding: var(--sui-space-0-5);
      color: var(--sui-color-text-muted);
      background: transparent;
      border: 0;
      border-radius: var(--sui-radius-xs);
      font-size: var(--sui-font-size-xl);
      line-height: 1;
      cursor: pointer;
    }

    .close:hover { color: var(--sui-color-text); }
    .close:focus-visible { outline: none; box-shadow: var(--sui-focus-ring); }

    .body {
      flex: 1;
      min-height: 0;
      padding: var(--sui-space-4);
      overflow: auto;
      color: var(--sui-color-text-muted);
      font-size: var(--sui-font-size-sm);
    }

    .footer {
      display: flex;
      flex-shrink: 0;
      min-height: var(--sui-drawer-footer-min-height, 0px);
      box-sizing: border-box;
      justify-content: flex-end;
      gap: var(--sui-space-2);
      padding: var(--sui-space-4);
      border-top: 1px solid var(--sui-color-border);
    }
  `;

  @property({ type: Boolean, reflect: true }) open = false;

  /** Accessible name used when no `title` slot content is provided. */
  @property({ type: String }) label = "";

  /** Accessible label for the drawer close button. */
  @property({ type: String, attribute: "close-label" }) closeLabel = "Close";

  /** Set to true to keep the drawer open when its backdrop is clicked. */
  @property({ type: Boolean, attribute: "disable-backdrop-close" }) disableBackdropClose = false;

  /** Hide the built-in close button when an accessible alternative is provided. */
  @property({ type: Boolean, reflect: true, attribute: "hide-close-button" }) hideCloseButton = false;

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
      return;
    }

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

  private focusInitial() {
    const close = this.renderRoot.querySelector<HTMLButtonElement>(".close");
    const customClose = this.querySelector<HTMLElement>('[slot="footer"] button, button[slot="footer"]');
    (close ?? customClose ?? this.renderRoot.querySelector<HTMLElement>(".panel"))?.focus();
  }

  private handleKeydown = (event: KeyboardEvent) => {
    if (!this.open || !isTopOverlay(this.overlay) || event.key !== "Tab") return;
    trapTabKey(event, this);
  };

  private handleBackdropClick = (event: MouseEvent) => {
    if (event.target !== event.currentTarget || this.disableBackdropClose) return;
    this.close("backdrop");
  };

  openDrawer() {
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
        <aside
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
        </aside>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sui-drawer": SuiDrawer;
  }
}
