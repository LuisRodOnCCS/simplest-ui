import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { PropertyValues } from "lit";
import { lockScroll, trapTabKey, unlockScroll } from "./internal/a11y";

/**
 * Accessible modal side panel. It keeps its content in light DOM so regular
 * Simplest UI classes can be used inside the title, body and footer slots.
 */
@customElement("sui-drawer")
export class SuiDrawer extends LitElement {
  private static instanceCount = 0;
  private readonly uid = ++SuiDrawer.instanceCount;
  private previouslyFocused: HTMLElement | null = null;
  private holdsScrollLock = false;

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
      padding: var(--sui-space-4);
      overflow: auto;
      color: var(--sui-color-text-muted);
      font-size: var(--sui-font-size-sm);
    }

    .footer {
      display: flex;
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

  private get titleId() {
    return `sui-drawer-title-${this.uid}`;
  }

  private get bodyId() {
    return `sui-drawer-body-${this.uid}`;
  }

  protected updated(changed: PropertyValues) {
    if (!changed.has("open")) return;

    if (this.open) {
      this.previouslyFocused = document.activeElement as HTMLElement | null;
      lockScroll();
      this.holdsScrollLock = true;
      this.dispatchEvent(new CustomEvent("sui-open", { bubbles: true, composed: true }));
      this.updateComplete.then(() => this.focusInitial());
      return;
    }

    this.releaseScrollLock();
    this.dispatchEvent(new CustomEvent("sui-close", { bubbles: true, composed: true }));
    this.previouslyFocused?.focus?.();
    this.previouslyFocused = null;
  }

  private focusInitial() {
    const close = this.renderRoot.querySelector<HTMLButtonElement>(".close");
    close?.focus();
  }

  private handleKeydown = (event: KeyboardEvent) => {
    if (!this.open) return;

    if (event.key === "Escape") {
      event.preventDefault();
      this.close();
      return;
    }

    if (event.key === "Tab") trapTabKey(event, this);
  };

  private handleBackdropClick = (event: MouseEvent) => {
    if (event.target !== event.currentTarget || this.disableBackdropClose) return;
    this.close();
  };

  openDrawer() {
    this.open = true;
  }

  close() {
    this.open = false;
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("keydown", this.handleKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this.handleKeydown);
    this.releaseScrollLock();
  }

  private releaseScrollLock() {
    if (!this.holdsScrollLock) return;
    unlockScroll();
    this.holdsScrollLock = false;
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
            <button class="close" type="button" aria-label=${this.closeLabel} @click=${() => this.close()}>×</button>
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
