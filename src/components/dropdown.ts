import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

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
      border-radius: 999px;
      padding: var(--sui-space-2) var(--sui-space-3);
      font-size: var(--sui-font-size-sm);
      color: var(--sui-color-text);
      backdrop-filter: blur(8px);
      cursor: pointer;
    }
    .trigger:hover {
      background: var(--sui-color-surface-muted);
      border-color: var(--sui-color-primary);
      color: var(--sui-color-primary);
    }
    .menu {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      min-width: 170px;
      background: var(--sui-color-surface-raised);
      border: 1px solid var(--sui-color-border);
      border-radius: 14px;
      box-shadow: 0 10px 30px rgba(99, 102, 241, 0.12);
      backdrop-filter: blur(12px);
      padding: 6px;
      z-index: 100;
      display: none;
    }
    :host([open]) .menu {
      display: block;
    }
    .item {
      display: block;
      width: 100%;
      text-align: left;
      padding: 7px 10px;
      border: 0;
      background: transparent;
      border-radius: 8px;
      font-size: var(--sui-font-size-sm);
      color: var(--sui-color-text);
      cursor: pointer;
      transition: background var(--sui-duration-fast) var(--sui-easing-standard);
    }
    .item:hover {
      background: var(--sui-color-surface-muted);
      color: var(--sui-color-primary);
    }
  `;

  @property({ type: Boolean, reflect: true }) open = false;

  @state() private items: string[] = [];

  private handleDocumentClick = (e: MouseEvent) => {
    if (!this.contains(e.target as Node)) {
      this.open = false;
    }
  };

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", this.handleDocumentClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("click", this.handleDocumentClick);
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

  render() {
    return html`
      <button class="trigger" @click=${(e: Event) => { e.stopPropagation(); this.toggle(); }}>
        <slot name="trigger">Opciones</slot>
      </button>
      <div class="menu" role="menu">
        <slot @slotchange=${(e: Event) => {
          const slot = e.target as HTMLSlotElement;
          this.items = slot.assignedElements().map((el) => el.textContent?.trim() ?? "");
        }}></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sui-dropdown": SuiDropdown;
  }
}