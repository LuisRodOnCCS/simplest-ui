import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("sui-dropdown")
export class SuiDropdown extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      position: relative;
    }
    .trigger {
      background: var(--sui-color-surface-raised);
      border: 1px solid var(--sui-color-border);
      border-radius: var(--sui-radius-full);
      height: var(--sui-control-height-md);
      padding: 0 var(--sui-space-3);
      font-size: var(--sui-font-size-sm);
      color: var(--sui-color-text);
      backdrop-filter: blur(var(--sui-blur-sm));
      -webkit-backdrop-filter: blur(var(--sui-blur-sm));
      cursor: pointer;
    }
    .trigger:hover {
      background: var(--sui-color-surface-muted);
      border-color: var(--sui-color-primary-hover);
      color: var(--sui-color-primary-hover);
    }
    .menu {
      position: absolute;
      top: calc(100% + var(--sui-space-1-5));
      left: 0;
      min-width: var(--sui-dropdown-min-width, 170px);
      background: var(--sui-color-surface-raised);
      border: 1px solid var(--sui-color-border);
      border-radius: var(--sui-radius-xl);
      box-shadow: var(--sui-shadow-menu);
      backdrop-filter: blur(var(--sui-blur-md));
      -webkit-backdrop-filter: blur(var(--sui-blur-md));
      padding: var(--sui-space-1-5);
      z-index: var(--sui-z-dropdown);
      display: none;
    }
    :host([open]) .menu {
      display: block;
    }
    ::slotted(button),
    ::slotted(a),
    ::slotted([role="menuitem"]) {
      display: block;
      width: 100%;
      text-align: left;
      padding: var(--sui-space-1-5) var(--sui-space-2-5);
      border: 0;
      background: transparent;
      border-radius: var(--sui-radius-sm);
      font-size: var(--sui-font-size-sm);
      color: var(--sui-color-text);
      cursor: pointer;
      text-decoration: none;
      transition: background var(--sui-duration-fast) var(--sui-easing-standard),
                  color var(--sui-duration-fast) var(--sui-easing-standard);
    }
    ::slotted(button:hover),
    ::slotted(a:hover),
    ::slotted([role="menuitem"]:hover) {
      background: var(--sui-color-surface-muted);
      color: var(--sui-color-primary);
    }
    ::slotted(button:disabled),
    ::slotted([aria-disabled="true"]) {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;

  @property({ type: Boolean, reflect: true }) open = false;

  private handleDocumentClick = (e: MouseEvent) => {
    if (!this.contains(e.target as Node)) {
      this.open = false;
    }
  };

  private handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && this.open) {
      this.open = false;
    }
  };

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", this.handleDocumentClick);
    document.addEventListener("keydown", this.handleKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("click", this.handleDocumentClick);
    document.removeEventListener("keydown", this.handleKeydown);
  }

  private toggle() {
    this.open = !this.open;
    this.dispatchEvent(
      new CustomEvent("sui-toggle", { detail: { open: this.open }, bubbles: true, composed: true })
    );
  }

  private select(value: string) {
    this.open = false;
    this.dispatchEvent(
      new CustomEvent("sui-select", { detail: { value }, bubbles: true, composed: true })
    );
  }

  private handleMenuClick = (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest(
      "button, a, [role='menuitem']"
    ) as HTMLElement | null;

    if (!target || target.hasAttribute("disabled") || target.getAttribute("aria-disabled") === "true") {
      return;
    }

    this.select(target.getAttribute("data-value") ?? target.textContent?.trim() ?? "");
  };

  render() {
    return html`
      <button
        class="trigger"
        type="button"
        aria-haspopup="menu"
        aria-expanded=${this.open ? "true" : "false"}
        @click=${(e: Event) => { e.stopPropagation(); this.toggle(); }}
      >
        <slot name="trigger">Opciones</slot>
      </button>
      <div class="menu" role="menu" @click=${this.handleMenuClick}>
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sui-dropdown": SuiDropdown;
  }
}
