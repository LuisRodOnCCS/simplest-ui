import { createId } from "./internal/id";

/** Adds the ARIA relation to the existing CSS-only tooltip pattern. */
export class SuiTooltip extends HTMLElement {
  private readonly observer = new MutationObserver(() => this.upgrade());
  private readonly contentId = createId("sui-tooltip");
  private generated: HTMLElement | null = null;
  private currentContent: HTMLElement | null = null;
  private activeTrigger: HTMLElement | null = null;
  private describedTrigger: HTMLElement | null = null;
  private describedToken: string | null = null;

  static get observedAttributes() {
    return ["content"];
  }

  get content(): string {
    return this.getAttribute("content") ?? "";
  }

  set content(value: string) {
    if (value) this.setAttribute("content", value);
    else this.removeAttribute("content");
  }

  connectedCallback() {
    this.classList.add("ui-tooltip");
    this.upgrade();
    this.observer.observe(this, { childList: true, subtree: true });
    queueMicrotask(() => this.upgrade());
  }

  disconnectedCallback() {
    this.observer.disconnect();
    this.detachTrigger();
    this.classList.remove("ui-tooltip--visible");
  }

  attributeChangedCallback() {
    if (this.isConnected) this.upgrade();
  }

  private upgrade() {
    const attribute = this.getAttribute("content");
    const slotContent = this.querySelector<HTMLElement>("[slot='content']");

    if (slotContent && this.generated) {
      this.generated.remove();
      this.generated = null;
    }

    if (this.generated && !attribute) {
      this.generated.remove();
      this.generated = null;
    }

    let content = slotContent ?? this.generated;
    if (!content) {
      content = this.querySelector<HTMLElement>(".ui-tooltip__content");
    }

    if (!content && attribute) {
      this.generated = document.createElement("span");
      this.generated.setAttribute("data-sui-tooltip-generated", "");
      this.generated.textContent = attribute;
      this.append(this.generated);
      content = this.generated;
    }

    if (!content) {
      this.currentContent = null;
      this.detachTrigger();
      this.classList.remove("ui-tooltip--visible");
      return;
    }

    this.currentContent = content;
    content.classList.add("ui-tooltip__content");
    if (content === this.generated && attribute && content.textContent !== attribute) content.textContent = attribute;

    content.setAttribute("role", "tooltip");
    if (!content.id) content.id = this.contentId;

    const trigger = this.resolveTrigger(content);
    if (trigger !== this.activeTrigger) this.detachTrigger();
    this.attachTrigger(trigger);
    this.describe(trigger, content.id);

    if (this.isDisabled(trigger)) {
      this.classList.remove("ui-tooltip--visible");
    }
  }

  private resolveTrigger(content: HTMLElement): HTMLElement {
    const explicit = this.querySelector<HTMLElement>("[slot='trigger']");
    if (explicit) return explicit;

    const fallback = Array.from(
      this.querySelectorAll<HTMLElement>("button, a, input, [tabindex]")
    ).find((element) => !content.contains(element));

    if (fallback) return fallback;

    if (!this.hasAttribute("tabindex")) this.tabIndex = 0;
    return this;
  }

  private attachTrigger(trigger: HTMLElement) {
    this.activeTrigger = trigger;
    trigger.setAttribute("data-sui-tooltip-trigger", "");
    trigger.addEventListener("pointerenter", this.showTooltip);
    trigger.addEventListener("focusin", this.showTooltip);
    trigger.addEventListener("pointerleave", this.hideTooltip);
    trigger.addEventListener("focusout", this.hideTooltip);
  }

  private detachTrigger() {
    const trigger = this.activeTrigger;
    if (!trigger) return;

    trigger.removeEventListener("pointerenter", this.showTooltip);
    trigger.removeEventListener("focusin", this.showTooltip);
    trigger.removeEventListener("pointerleave", this.hideTooltip);
    trigger.removeEventListener("focusout", this.hideTooltip);
    trigger.removeAttribute("data-sui-tooltip-trigger");
    this.removeToken(trigger, this.describedToken);
    this.activeTrigger = null;
    this.describedTrigger = null;
    this.describedToken = null;
    this.classList.remove("ui-tooltip--visible");
  }

  private describe(trigger: HTMLElement, token: string) {
    if (this.describedTrigger && this.describedTrigger !== trigger) {
      this.removeToken(this.describedTrigger, this.describedToken);
    }
    if (this.describedTrigger === trigger && this.describedToken !== token) {
      this.removeToken(trigger, this.describedToken);
    }

    const tokens = splitTokens(trigger.getAttribute("aria-describedby"));
    if (!tokens.includes(token)) tokens.push(token);
    trigger.setAttribute("aria-describedby", tokens.join(" "));
    this.describedTrigger = trigger;
    this.describedToken = token;
  }

  private removeToken(element: HTMLElement | null, token: string | null) {
    if (!element || !token) return;
    const tokens = splitTokens(element.getAttribute("aria-describedby")).filter(
      (value) => value !== token
    );
    if (tokens.length) element.setAttribute("aria-describedby", tokens.join(" "));
    else element.removeAttribute("aria-describedby");
  }

  private isDisabled(trigger: HTMLElement): boolean {
    return (
      trigger.hasAttribute("disabled") ||
      trigger.getAttribute("aria-disabled") === "true"
    );
  }

  private showTooltip = () => {
    if (!this.currentContent || !this.activeTrigger) return;
    if (this.isDisabled(this.activeTrigger)) return;
    this.classList.add("ui-tooltip--visible");
  };

  private hideTooltip = () => {
    this.classList.remove("ui-tooltip--visible");
  };
}

function splitTokens(value: string | null): string[] {
  return (value ?? "").split(/\s+/).filter(Boolean);
}

if (!customElements.get("sui-tooltip")) {
  customElements.define("sui-tooltip", SuiTooltip);
}

declare global {
  interface HTMLElementTagNameMap {
    "sui-tooltip": SuiTooltip;
  }
}
