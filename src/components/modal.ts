import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { PropertyValues } from "lit";

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

@customElement("sui-modal")
export class SuiModal extends LitElement {
  private static instanceCount = 0;
  private static scrollLocks = 0;
  private static previousOverflow = "";
  private readonly uid = ++SuiModal.instanceCount;

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

  private previouslyFocused: HTMLElement | null = null;
  private holdsScrollLock = false;

  private get titleId() {
    return `sui-modal-title-${this.uid}`;
  }

  private get bodyId() {
    return `sui-modal-body-${this.uid}`;
  }

  protected updated(changed: PropertyValues) {
    if (!changed.has("open")) return;

    if (this.open) {
      this.previouslyFocused = document.activeElement as HTMLElement | null;
      SuiModal.lockScroll();
      this.holdsScrollLock = true;
      this.dispatchEvent(new CustomEvent("sui-open", { bubbles: true, composed: true }));
      this.updateComplete.then(() => this.focusInitial());
    } else {
      this.releaseScrollLock();
      this.dispatchEvent(new CustomEvent("sui-close", { bubbles: true, composed: true }));
      this.previouslyFocused?.focus?.();
      this.previouslyFocused = null;
    }
  }

  private static lockScroll() {
    if (SuiModal.scrollLocks++ > 0) return;
    SuiModal.previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  private static unlockScroll() {
    if (SuiModal.scrollLocks === 0) return;
    SuiModal.scrollLocks--;
    if (SuiModal.scrollLocks === 0) {
      document.body.style.overflow = SuiModal.previousOverflow;
    }
  }

  private getFocusable(): HTMLElement[] {
    const inShadow = Array.from(this.renderRoot.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    const slotted = Array.from(this.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    return [...inShadow, ...slotted].filter((el) => !el.hasAttribute("disabled"));
  }

  private focusInitial() {
    const focusable = this.getFocusable();
    if (focusable.length) {
      focusable[0].focus();
      return;
    }
    this.renderRoot.querySelector<HTMLElement>(".panel")?.focus();
  }

  private getDeepActiveElement(): HTMLElement | null {
    let active = document.activeElement as HTMLElement | null;
    while (active?.shadowRoot?.activeElement) {
      active = active.shadowRoot.activeElement as HTMLElement;
    }
    return active;
  }

  private handleKeydown = (e: KeyboardEvent) => {
    if (!this.open) return;

    if (e.key === "Escape") {
      e.preventDefault();
      this.close();
      return;
    }

    if (e.key !== "Tab") return;

    const focusable = this.getFocusable();
    if (!focusable.length) {
      e.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = this.getDeepActiveElement();

    if (e.shiftKey && (active === first || !this.contains(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || !this.contains(active))) {
      e.preventDefault();
      first.focus();
    }
  };

  private handleBackdropClick = (e: MouseEvent) => {
    if (e.target !== e.currentTarget || this.disableBackdropClose) return;
    this.close();
  };

  openModal() {
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
    SuiModal.unlockScroll();
    this.holdsScrollLock = false;
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
            <button class="close" type="button" aria-label=${this.closeLabel} @click=${() => this.close()}>×</button>
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
