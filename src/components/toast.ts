export type ToastVariant = "default" | "success" | "warning" | "danger";

export type ToastOptions = {
  title: string;
  message?: string;
  variant?: ToastVariant;
  duration?: number;
};

/** Declarative toast, also available as `SuiToast.show(options)`. */
export class SuiToast extends HTMLElement {
  private dismissTimer: number | undefined;
  private generated = false;

  static get observedAttributes() {
    return ["title", "message", "variant", "duration"];
  }

  get duration(): number {
    const value = Number(this.getAttribute("duration") ?? 5000);
    return Number.isFinite(value) ? Math.max(0, value) : 5000;
  }

  connectedCallback() {
    this.classList.add("ui-toast");
    this.setAttribute("role", this.getAttribute("role") ?? "status");
    this.setAttribute("aria-live", this.getAttribute("aria-live") ?? "polite");
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
    this.className = `ui-toast${variant !== "default" ? ` ui-toast--${variant}` : ""}`;
    if (!this.getAttribute("title")) {
      if (this.generated) this.replaceChildren();
      return;
    }
    if (this.children.length && !this.generated) return;

    if (this.generated) this.replaceChildren();

    const content = document.createElement("div");
    const title = document.createElement("div");
    title.className = "ui-toast__title";
    title.textContent = this.getAttribute("title");
    content.append(title);
    this.generated = true;
    const message = this.getAttribute("message");
    if (message) {
      const body = document.createElement("div");
      body.className = "ui-toast__body";
      body.textContent = message;
      content.append(body);
    }
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
    toast.setAttribute("title", options.title);
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
