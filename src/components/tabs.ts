import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("sui-tabs")
export class SuiTabs extends LitElement {
  static styles = css`
    :host { display: block; }
    .list { display: flex; gap: var(--sui-space-1); border-bottom: 1px solid var(--sui-color-border); }
    .tab {
      padding: var(--sui-space-2) var(--sui-space-4);
      border: 0; background: transparent;
      color: var(--sui-color-text-muted);
      font-size: var(--sui-font-size-sm);
      font-weight: var(--sui-font-weight-medium);
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      cursor: pointer;
    }
    .tab[aria-selected="true"] { color: var(--sui-color-primary); border-bottom-color: var(--sui-color-primary); }
    .panel { padding: var(--sui-space-3) 0; }
    .panel[hidden] { display: none; }
  `;

  @property({ type: String }) value = "";

  @state() private tabs: { id: string; label: string }[] = [];

  connectedCallback() {
    super.connectedCallback();
    this.collectTabs();
  }

  private collectTabs() {
    const slot = this.shadowRoot?.querySelector("slot");
    // fallback: read light DOM children with data-tab
    const children = Array.from(this.children);
    this.tabs = children
      .filter((el) => el.hasAttribute("data-tab"))
      .map((el) => ({ id: el.getAttribute("data-tab")!, label: el.getAttribute("label") || el.getAttribute("data-tab")! }));
    if (!this.value && this.tabs.length) this.value = this.tabs[0].id;
  }

  private select(id: string) {
    this.value = id;
    this.dispatchEvent(new CustomEvent("sui-change", { detail: { value: id }, bubbles: true, composed: true }));
  }

  render() {
    return html`
      <div class="list" role="tablist">
        ${this.tabs.map(
          (t) => html`<button class="tab" role="tab" aria-selected=${this.value === t.id}
            @click=${() => this.select(t.id)}>${t.label}</button>`
        )}
      </div>
      <div class="panels">
        ${this.tabs.map(
          (t) => html`<div class="panel" ?hidden=${this.value !== t.id} role="tabpanel">
            <slot name=${t.id}></slot>
          </div>`
        )}
      </div>
    `;
  }
}

declare global { interface HTMLElementTagNameMap { "sui-tabs": SuiTabs; } }