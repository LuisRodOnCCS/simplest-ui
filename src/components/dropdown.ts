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
      background: var(--sui-color-surface);
      border: 1px solid var(--sui-color-border);
      border-radius: var(--sui-radius-md);
      padding: var(--sui-space-2) var(--sui-space-3);
      font-size: var(--sui-font-size-sm);
      color: var(--sui-color-text);
    }
    .trigger:hover {
      background: var(--sui-color-surface-muted);
    }
    .menu {
      position: absolute;
      top: calc(100% + var(--sui-space-1));
      left: 0;
      min-width: 10rem;
      background: var(--sui-color-surface-raised);
      border: 1px solid var(--sui-color-border);
      border-radius: var(--sui-radius-md);
      box-shadow: var(--sui-shadow-md);
      padding: var(--sui-space-1);
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
      padding: var(--sui-space-2) var(--sui-space-3);
      border: 0;
      background: transparent;
      border-radius: var(--sui-radius-sm);
      font-size: var(--sui-font-size-sm);
      color: var(--sui-color-text);
      cursor: pointer;
    }
    .item:hover {
      background: var(--sui-color-surface-muted);
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