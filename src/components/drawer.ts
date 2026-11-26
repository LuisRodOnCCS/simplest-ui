import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { PropertyValues } from "lit";
import { lockScroll, trapTabKey, unlockScroll } from "./internal/a11y";
import type { SuiDialogCloseReason } from "./internal/dialog-events";
import { createId } from "./internal/id";
import { isTopOverlay, registerOverlay, unregisterOverlay } from "./internal/overlay";
import { animateOverlayExit } from "./internal/overlay-motion";

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
  private retained = false;
  private cancelExit: (() => void) | undefined;

  static styles = css`
    :host { display: none; }
    :host([open]), :host([data-closing]) { display: block; }

    .backdrop {
      position: fixed;
      inset: 0;
      box-sizing: border-box;
      width: auto;
      height: auto;
      max-width: none;
      max-height: none;
      margin: 0;
      padding: 0;
      border: 0;
      /* A hidden overflow box can be scrolled by the browser when initial focus
         lands in the off-screen animated panel. Clip without creating a
         scroll container so focusing cannot shift the drawer's entry. */
      overflow: clip;
      display: flex;
      justify-content: flex-end;
      background: var(--sui-color-backdrop);
      backdrop-filter: blur(var(--sui-blur-backdrop));
      -webkit-backdrop-filter: blur(var(--sui-blur-backdrop));
      z-index: var(--sui-z-drawer-backdrop);
    }

    .backdrop::backdrop { background: transparent; }

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
      .backdrop[open] { animation: sui-drawer-backdrop-enter var(--sui-duration-normal) var(--sui-easing-standard); }
      .backdrop[open] .panel { animation: sui-drawer-enter var(--sui-duration-normal) var(--sui-easing-standard); }
      @keyframes sui-drawer-backdrop-enter { from { background-color: transparent; } to { background-color: var(--sui-color-backdrop); } }
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

  protected willUpdate(changed: PropertyValues) {
    if (changed.has("open") && !this.open && this.retained) this.setAttribute("data-closing", "");
  }

  protected updated(changed: PropertyValues) {
    if (!changed.has("open")) return;

    const previousOpen = changed.get("open");
    const wasOpen = previousOpen === true;
    const wasClosed = previousOpen === false;

    if (this.open) {
      const reopening = Boolean(this.cancelExit);
      this.cancelExit?.();
      this.cancelExit = undefined;
      this.removeAttribute("data-closing");
      this.retained = true;
      this.closeReason = undefined;
      if (!reopening && (wasClosed || previousOpen === undefined)) {
        this.previouslyFocused = document.activeElement as HTMLElement | null;
      }
      if (this.isConnected) this.acquireOverlay();
      this.showDialog();
      if (wasClosed && !reopening) {
        this.dispatchEvent(new CustomEvent("sui-open", { bubbles: true, composed: true }));
      }
      if (this.isConnected) this.focusInitial();
      return;
    }

    if (wasOpen && this.retained) {
      const finish = () => {
        const reason = this.closeReason ?? "programmatic";
        const restoreFocus = isTopOverlay(this.overlay);
        const previousFocus = this.previouslyFocused;
        this.cancelExit = undefined;
        this.renderRoot.querySelector<HTMLDialogElement>("dialog")?.close();
        this.retained = false;
        this.removeAttribute("data-closing");
        this.releaseOverlay();
        this.previouslyFocused = null;
        this.closeReason = undefined;
        this.requestUpdate();
        if (restoreFocus) previousFocus?.focus?.();
        this.dispatchEvent(
          new CustomEvent("sui-close", {
            detail: { reason },
            bubbles: true,
            composed: true,
          })
        );
      };
      const dialog = this.renderRoot.querySelector<HTMLDialogElement>("dialog");
      const panel = this.renderRoot.querySelector<HTMLElement>(".panel");
      if (dialog && panel && this.isConnected) {
        let completed = false;
        const cancel = animateOverlayExit(dialog, panel, "drawer", () => { completed = true; finish(); });
        if (!completed) this.cancelExit = cancel;
      } else finish();
    }
  }

  private focusInitial() {
    const close = this.renderRoot.querySelector<HTMLButtonElement>(".close");
    const customClose = this.querySelector<HTMLElement>('[slot="footer"] button, button[slot="footer"]');
    (close ?? customClose ?? this.renderRoot.querySelector<HTMLElement>(".panel"))?.focus();
  }

  private handleKeydown = (event: KeyboardEvent) => {
    if (!this.holdsScrollLock || !isTopOverlay(this.overlay) || event.key !== "Tab") return;
    trapTabKey(event, this);
  };

  private handleBackdropClick = (event: MouseEvent) => {
    if (event.target !== event.currentTarget || this.disableBackdropClose) return;
    this.close("backdrop");
  };

  private handleCancel = (event: Event) => {
    event.preventDefault();
    if (isTopOverlay(this.overlay)) this.close("escape");
  };

  private showDialog() {
    const dialog = this.renderRoot.querySelector<HTMLDialogElement>("dialog");
    if (this.isConnected && dialog && !dialog.open) dialog.showModal();
  }

  openDrawer() {
    this.open = true;
  }

  /** Request closure; `sui-close` fires after exit, not after `updateComplete`. */
  close(reason: SuiDialogCloseReason = "programmatic") {
    if (!this.open) return;
    this.closeReason = reason;
    this.open = false;
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("keydown", this.handleKeydown);
    if (this.open) {
      this.acquireOverlay();
      this.updateComplete.then(() => {
        if (this.open) this.showDialog();
      });
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this.handleKeydown);
    this.cancelExit?.();
    this.cancelExit = undefined;
    this.retained = this.open;
    this.removeAttribute("data-closing");
    this.renderRoot.querySelector<HTMLDialogElement>("dialog")?.close();
    this.releaseOverlay();
    if (!this.open) {
      this.closeReason = undefined;
      this.previouslyFocused = null;
      this.requestUpdate();
    }
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
    if (!this.open && !this.retained) return nothing;

    const labelledBy = this.label ? nothing : this.titleId;
    return html`
      <dialog class="backdrop" role="dialog" aria-modal="true"
        aria-label=${this.label || nothing} aria-labelledby=${labelledBy}
        aria-describedby=${this.bodyId} @click=${this.handleBackdropClick} @cancel=${this.handleCancel}>
        <aside
          class="panel"
          tabindex="-1"
        >
          <div class="header">
            <div class="title" id=${this.titleId}><slot name="title"></slot></div>
            ${this.hideCloseButton ? nothing : html`<button class="close" type="button" aria-label=${this.closeLabel} @click=${() => this.close("dismiss")}>×</button>`}
          </div>
          <div class="body" id=${this.bodyId}><slot></slot></div>
          <div class="footer"><slot name="footer"></slot></div>
        </aside>
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sui-drawer": SuiDrawer;
  }
}
