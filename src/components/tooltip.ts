/** Adds the ARIA relation to the existing CSS-only tooltip pattern. */
export class SuiTooltip extends HTMLElement {
  private static instanceCount = 0;
  private readonly uid = ++SuiTooltip.instanceCount;

  static get observedAttributes() {
    return ["content"];
  }

  connectedCallback() {
    this.classList.add("ui-tooltip");
    this.upgrade();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.upgrade();
  }

  private upgrade() {
    let content = this.querySelector<HTMLElement>("[slot='content'], .ui-tooltip__content");
    if (!content && this.getAttribute("content")) {
      content = document.createElement("span");
      content.textContent = this.getAttribute("content");
      this.append(content);
    }
    if (!content) return;

    content.classList.add("ui-tooltip__content");
    content.setAttribute("role", "tooltip");
    if (!content.id) content.id = `sui-tooltip-${this.uid}`;

    const trigger = this.querySelector<HTMLElement>("[slot='trigger'], button, a, input, [tabindex]") ?? this;
    if (trigger === this && !this.hasAttribute("tabindex")) this.tabIndex = 0;
    trigger.setAttribute("aria-describedby", content.id);
  }
}

if (!customElements.get("sui-tooltip")) {
  customElements.define("sui-tooltip", SuiTooltip);
}

declare global {
  interface HTMLElementTagNameMap {
    "sui-tooltip": SuiTooltip;
  }
}
