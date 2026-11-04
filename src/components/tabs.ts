import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { PropertyValues } from "lit";

type TabItem = {
  id: string;
  label: string;
  panel: HTMLElement;
};

@customElement("sui-tabs")
export class SuiTabs extends LitElement {
  private static instanceCount = 0;
  private readonly uid = ++SuiTabs.instanceCount;

  static styles = css`
    :host {
      display: block;
    }
    .list {
      display: flex;
      gap: var(--sui-space-1);
      background: var(--sui-color-surface-raised);
      border: 1px solid var(--sui-color-border);
      border-radius: var(--sui-radius-full);
      padding: var(--sui-space-1);
      width: fit-content;
      backdrop-filter: blur(var(--sui-blur-sm));
      -webkit-backdrop-filter: blur(var(--sui-blur-sm));
    }
    .tab {
      padding: var(--sui-space-1-5) var(--sui-space-3-5);
      font-size: var(--sui-font-size-xs);
      font-weight: var(--sui-font-weight-medium);
      color: var(--sui-color-text-muted);
      background: transparent;
      border: 0;
      border-radius: var(--sui-radius-full);
      cursor: pointer;
      transition: background var(--sui-duration-fast) var(--sui-easing-standard),
                  color var(--sui-duration-fast) var(--sui-easing-standard),
                  filter var(--sui-duration-fast) var(--sui-easing-standard);
    }
    .tab:hover {
      color: var(--sui-color-text);
    }
    .tab[aria-selected="true"] {
      background: var(--sui-gradient-primary);
      color: var(--sui-color-primary-contrast);
    }
    .tab[aria-selected="true"]:hover {
      background: var(--sui-gradient-primary-hover);
    }
    .tab:focus-visible {
      outline: none;
      box-shadow: var(--sui-focus-ring);
    }
    :host(:not([data-ready])) ::slotted([data-tab]) {
      display: none;
    }
    ::slotted([data-tab]) {
      display: block;
      margin-top: var(--sui-space-3);
      padding: var(--sui-space-1) var(--sui-space-0-5);
      font-size: var(--sui-font-size-sm);
      color: var(--sui-color-text-muted);
    }
    ::slotted([data-tab][hidden]) {
      display: none;
    }
  `;

  @property({ type: String }) value = "";

  @state() private tabs: TabItem[] = [];

  private lastSignature = "";
  private readonly labelObserver = new MutationObserver(() => this.collectTabs());

  private get selectedIndex() {
    return this.tabs.findIndex((tab) => tab.id === this.value);
  }

  connectedCallback() {
    super.connectedCallback();
    this.labelObserver.observe(this, { attributes: true, attributeFilter: ["label"], subtree: true });
    this.collectTabs();
    // Los hijos pueden no estar disponibles durante el parseo inicial del HTML.
    queueMicrotask(() => {
      if (this.isConnected) this.collectTabs();
    });
  }

  disconnectedCallback() {
    this.labelObserver.disconnect();
    super.disconnectedCallback();
  }

  protected willUpdate(changed: PropertyValues) {
    if (!changed.has("value")) return;
    if (this.tabs.length && !this.tabs.some((tab) => tab.id === this.value)) {
      this.value = this.tabs[0].id;
    }
  }

  protected updated(changed: PropertyValues) {
    if (changed.has("value")) {
      this.applySelection();
    }
  }

  private collectTabs() {
    const children = Array.from(this.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el.hasAttribute("data-tab")
    );

    const signature = children
      .map((el) => `${el.getAttribute("data-tab")}|${el.getAttribute("label")}`)
      .join("~");

    if (signature === this.lastSignature) {
      this.applySelection();
      return;
    }
    this.lastSignature = signature;

    this.tabs = children.map((el, index) => {
      const id = el.getAttribute("data-tab") ?? String(index);
      if (!el.id) {
        el.id = `sui-tabpanel-${this.uid}-${index}`;
      }
      el.setAttribute("role", "tabpanel");
      el.setAttribute("aria-labelledby", `sui-tab-${this.uid}-${index}`);
      return {
        id,
        label: el.getAttribute("label") ?? id,
        panel: el,
      };
    });

    if (!this.value || !this.tabs.some((tab) => tab.id === this.value)) {
      this.value = this.tabs[0]?.id ?? "";
    }
    this.applySelection();
    this.setAttribute("data-ready", "");
  }

  private applySelection() {
    for (const tab of this.tabs) {
      tab.panel.hidden = tab.id !== this.value;
    }
  }

  private select(id: string) {
    if (this.value === id) return;
    this.value = id;
    this.dispatchEvent(
      new CustomEvent("sui-change", { detail: { value: id }, bubbles: true, composed: true })
    );
  }

  private handleSlotChange = () => {
    this.collectTabs();
  };

  private handleKeydown = (e: KeyboardEvent) => {
    if (!this.tabs.length) return;

    const current = Math.max(this.selectedIndex, 0);
    let next = current;

    switch (e.key) {
      case "ArrowRight":
        next = (current + 1) % this.tabs.length;
        break;
      case "ArrowLeft":
        next = (current - 1 + this.tabs.length) % this.tabs.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = this.tabs.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    this.select(this.tabs[next].id);
    this.updateComplete.then(() => {
      this.renderRoot.querySelectorAll<HTMLButtonElement>(".tab")[next]?.focus();
    });
  };

  private tabId(index: number) {
    return `sui-tab-${this.uid}-${index}`;
  }

  render() {
    return html`
      <div
        class="list"
        role="tablist"
        aria-orientation="horizontal"
        @keydown=${this.handleKeydown}
      >
        ${this.tabs.map((tab, index) => {
          const selected = tab.id === this.value;
          return html`
            <button
              class="tab"
              type="button"
              role="tab"
              id=${this.tabId(index)}
              aria-selected=${selected ? "true" : "false"}
              aria-controls=${tab.panel.id}
              tabindex=${selected ? 0 : -1}
              @click=${() => this.select(tab.id)}
            >${tab.label}</button>
          `;
        })}
      </div>
      <slot @slotchange=${this.handleSlotChange}></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sui-tabs": SuiTabs;
  }
}
