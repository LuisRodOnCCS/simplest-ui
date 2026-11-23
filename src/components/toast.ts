export type ToastVariant = "default" | "success" | "warning" | "danger";

export type ToastOptions = ({ title: string; message?: string } | { title?: string; message: string }) & {
  variant?: ToastVariant;
  duration?: number;
};

/** Declarative toast, also available as `SuiToast.show(options)`. */
export class SuiToast extends HTMLElement {
  private dismissTimer: number | undefined;
  private generated: HTMLElement | null = null;
  private ownedVariant = "";
  private ownsRole = false;

  static get observedAttributes() {
    return ["title", "message", "variant", "duration"];
  }

  get duration(): number {
    const value = Number(this.getAttribute("duration") ?? 5000);
    return Number.isFinite(value) ? Math.max(0, value) : 5000;
  }

  set duration(value: number) {
    const next = Number(value);
    if (Number.isFinite(next) && next >= 0) this.setAttribute("duration", String(next));
    else this.removeAttribute("duration");
  }

  get message(): string {
    return this.getAttribute("message") ?? "";
  }

  set message(value: string) {
    if (value) this.setAttribute("message", value);
    else this.removeAttribute("message");
  }

  get variant(): ToastVariant {
    const value = this.getAttribute("variant");
    return value === "success" || value === "warning" || value === "danger" ? value : "default";
  }

  set variant(value: ToastVariant) {
    if (!value || value === "default") this.removeAttribute("variant");
    else this.setAttribute("variant", value);
  }

  connectedCallback() {
    this.classList.add("ui-toast");
    if (this.closest("sui-toast-container")) {
      if (this.ownsRole && this.getAttribute("role") === "status") this.removeAttribute("role");
      this.ownsRole = false;
    } else {
      if (!this.hasAttribute("role")) {
        this.setAttribute("role", "status");
        this.ownsRole = true;
      }
    }
    this.render();
    this.scheduleDismiss();
  }

  disconnectedCallback() {
    window.clearTimeout(this.dismissTimer);
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
      this.scheduleDismiss();
    }
  }

  dismiss() {
    window.clearTimeout(this.dismissTimer);
    this.dispatchEvent(new CustomEvent("sui-dismiss", { bubbles: true, composed: true }));
    this.remove();
  }

  private render() {
    const variant = this.getAttribute("variant") ?? "default";
    if (this.ownedVariant) this.classList.remove(this.ownedVariant);
    this.ownedVariant = variant !== "default" && /^(success|warning|danger)$/.test(variant) ? `ui-toast--${variant}` : "";
    if (this.ownedVariant) this.classList.add(this.ownedVariant);
    const titleText = this.getAttribute("title");
    const message = this.getAttribute("message");
    this.generated?.remove();
    this.generated = null;
    if (!titleText && !message) return;
    const content = document.createElement("div");
    if (titleText) {
      const title = document.createElement("div");
      title.className = "ui-toast__title";
      title.textContent = titleText;
      content.append(title);
    }
    if (message) {
      const body = document.createElement("div");
      body.className = "ui-toast__body";
      body.textContent = message;
      content.append(body);
    }
    this.generated = content;
    this.append(content);
  }

  private scheduleDismiss() {
    window.clearTimeout(this.dismissTimer);
    if (this.duration > 0) {
      this.dismissTimer = window.setTimeout(() => this.dismiss(), this.duration);
    }
  }

  static show(options: ToastOptions): SuiToast {
    let container = document.querySelector<SuiToastContainer>("sui-toast-container");
    if (!container) {
      container = document.createElement("sui-toast-container");
      document.body.append(container);
    }
    const toast = document.createElement("sui-toast") as SuiToast;
    if (options.title) toast.setAttribute("title", options.title);
    if (options.message) toast.setAttribute("message", options.message);
    if (options.variant && options.variant !== "default") toast.setAttribute("variant", options.variant);
    if (options.duration !== undefined) toast.setAttribute("duration", String(options.duration));
    container.append(toast);
    return toast;
  }
}

export class SuiToastContainer extends HTMLElement {
  connectedCallback() {
    this.classList.add("ui-toast-container");
    this.setAttribute("aria-live", this.getAttribute("aria-live") ?? "polite");
    this.setAttribute("aria-relevant", "additions");
  }
}

if (!customElements.get("sui-toast")) customElements.define("sui-toast", SuiToast);
if (!customElements.get("sui-toast-container")) customElements.define("sui-toast-container", SuiToastContainer);

declare global {
  interface HTMLElementTagNameMap {
    "sui-toast": SuiToast;
    "sui-toast-container": SuiToastContainer;
  }
}
