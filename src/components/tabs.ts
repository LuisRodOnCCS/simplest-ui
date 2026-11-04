import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { PropertyValues } from "lit";

type TabItem = {
  id: string;
  label: string;
  panel: HTMLElement;
  disabled: boolean;
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
    .tabs-pill {
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
    .tabs-pill:hover {
      color: var(--sui-color-text);
    }
    .tabs-pill[aria-selected="true"] {
      background: var(--sui-gradient-primary);
      color: var(--sui-color-primary-contrast);
    }
    .tabs-pill[aria-selected="true"]:hover {
      background: var(--sui-gradient-primary-hover);
    }
    .tabs-pill:focus-visible {
      outline: none;
      box-shadow: var(--sui-focus-ring);
    }
    .tabs-pill:disabled,
    .tabs-pill[aria-disabled="true"] {
      opacity: 0.5;
      cursor: not-allowed;
    }

    :host([variant="box"]) .list {
      background: var(--sui-color-surface-muted);
      border: 1px solid var(--sui-color-border);
      border-radius: var(--sui-radius-lg);
      padding: var(--sui-space-0-5);
      gap: var(--sui-space-0-5);
      width: fit-content;
    }

    :host([variant="box"]) .tabs-pill {
      min-height: 2rem;
      padding: 0 var(--sui-space-2);
      color: var(--sui-color-text-muted);
      background: transparent;
      border: 0;
      border-radius: var(--sui-radius-md);
      font-size: var(--sui-font-size-xs);
    }

    :host([variant="box"]) .tabs-pill:hover {
      color: var(--sui-color-text);
    }

    :host([variant="box"]) .tabs-pill[aria-selected="true"] {
      color: var(--sui-color-primary-text);
      background: var(--sui-color-surface-raised);
      box-shadow: var(--sui-shadow-sm);
    }

    :host([variant="box"]) .tabs-pill[aria-selected="true"]:hover {
      background: var(--sui-color-surface-raised);
    }

    :host([variant="box"]) .tabs-pill:disabled,
    :host([variant="box"]) .tabs-pill[aria-disabled="true"] {
      opacity: 0.5;
      cursor: not-allowed;
    }

    :host([variant="box"]) ::slotted([data-tab]) {
      display: none;
      margin: 0;
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
  @property({ type: String }) variant: "pill" | "box" = "pill";

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
    const enabled = this.tabs.filter((tab) => !tab.disabled);
    if (!enabled.length) return;
    const selected = this.tabs.find((tab) => tab.id === this.value);
    if (!selected || selected.disabled) {
      this.value = enabled[0].id;
      return;
    }
    if (!this.tabs.some((tab) => tab.id === this.value)) {
      this.value = enabled[0].id;
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
      .map((el) => `${el.getAttribute("data-tab")}|${el.getAttribute("label")}|${el.hasAttribute("disabled")}`)
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
        disabled: el.hasAttribute("disabled"),
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
    const tab = this.tabs.find((item) => item.id === id);
    if (!tab || tab.disabled || this.value === id) return;
    this.value = id;
    this.dispatchEvent(
      new CustomEvent("sui-change", { detail: { value: id }, bubbles: true, composed: true })
    );
  }

  private handleSlotChange = () => {
    this.collectTabs();
  };

  private handleKeydown = (e: KeyboardEvent) => {
    const enabledIndices = this.tabs.map((tab, index) => (tab.disabled ? -1 : index)).filter((index) => index >= 0);
    if (!enabledIndices.length) return;

    const current = Math.max(this.selectedIndex, 0);
    const currentPosition = enabledIndices.indexOf(current);
    const safePosition = currentPosition >= 0 ? currentPosition : 0;
    let nextPosition = safePosition;

    switch (e.key) {
      case "ArrowRight":
        nextPosition = (safePosition + 1) % enabledIndices.length;
        break;
      case "ArrowLeft":
        nextPosition = (safePosition - 1 + enabledIndices.length) % enabledIndices.length;
        break;
      case "Home":
        nextPosition = 0;
        break;
      case "End":
        nextPosition = enabledIndices.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    const nextIndex = enabledIndices[nextPosition];
    this.select(this.tabs[nextIndex].id);
    this.updateComplete.then(() => {
      this.renderRoot.querySelectorAll<HTMLButtonElement>(".tabs-pill")[nextIndex]?.focus();
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
              class="tabs-pill"
              type="button"
              role="tab"
              id=${this.tabId(index)}
              aria-selected=${selected ? "true" : "false"}
              aria-disabled=${tab.disabled ? "true" : "false"}
              ?disabled=${tab.disabled}
              aria-controls=${tab.panel.id}
              tabindex=${selected && !tab.disabled ? 0 : -1}
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
