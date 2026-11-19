/** Accessible tag label with a ribbon shape, scaled by --sui-tag-height. */
export class SuiTag extends HTMLElement {
  private observer: ResizeObserver | null = null;

  static get observedAttributes() {
    return ["variant"];
  }

  get variant(): string {
    return this.getAttribute("variant") ?? "";
  }

  set variant(value: string) {
    if (value) this.setAttribute("variant", value);
    else this.removeAttribute("variant");
  }

  connectedCallback() {
    this.classList.add("ui-tag");
    this.upgrade();
    this.observer = new ResizeObserver(() => this.updateGeometry());
    this.observer.observe(this);
    queueMicrotask(() => this.updateGeometry());
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.observer = null;
  }

  attributeChangedCallback() {
    if (this.isConnected) this.applyVariant();
  }

  private upgrade() {
    if (!this.querySelector("svg")) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 400 100");
      svg.setAttribute("preserveAspectRatio", "xMinYMid meet");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      svg.append(path);
      this.prepend(svg);
    }
    if (!this.querySelector(":scope > span")) {
      const text = Array.from(this.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent ?? "")
        .join("")
        .trim();
      Array.from(this.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .forEach((node) => node.remove());
      const span = document.createElement("span");
      span.textContent = text;
      this.append(span);
    }
    this.applyVariant();
    this.updateGeometry();
  }

  private applyVariant() {
    const variants = ["primary", "success", "warning", "danger", "info", "outline"];
    variants.forEach((name) => this.classList.remove(`ui-tag--${name}`));
    const value = this.getAttribute("variant");
    if (value && variants.includes(value)) this.classList.add(`ui-tag--${value}`);
  }

  private updateGeometry() {
    const svg = this.querySelector<SVGSVGElement>("svg");
    const path = this.querySelector<SVGPathElement>("svg path");
    if (!svg || !path) return;
    const rect = this.getBoundingClientRect();
    if (rect.height === 0) return;
    const w = (rect.width / rect.height) * 100;
    const straight = Math.max(10, w - 67.36);
    const circleX = straight + 28.88;
    const d = `M19.54,99.07c-10.77,0-19.53-8.76-19.53-19.53V19.54C0,8.77,8.77,0,19.54,0h${straight.toFixed(2)}c5.51,0,10.8,2.35,14.49,6.44l27.11,30c6.75,7.47,6.75,18.73,0,26.19l-27.11,30c-3.7,4.09-8.98,6.44-14.49,6.44H19.54ZM${circleX.toFixed(2)},31.32c-10.05,0-18.22,8.17-18.22,18.22s8.17,18.22,18.22,18.22,18.22-8.17,18.22-18.22-8.17-18.22-18.22-18.22Z`;
    path.setAttribute("d", d);
    svg.setAttribute("viewBox", `0 0 ${w.toFixed(2)} 100`);
  }
}

if (!customElements.get("sui-tag")) {
  customElements.define("sui-tag", SuiTag);
}

declare global {
  interface HTMLElementTagNameMap {
    "sui-tag": SuiTag;
  }
}
