import { containsDeep, isFocusable } from "./internal/a11y";
import { computePlacement } from "./internal/position";

/** Accessible, light-DOM popover with click, keyboard and viewport handling. */
export class SuiPopover extends HTMLElement {
  private static instanceCount = 0;
  private readonly uid = ++SuiPopover.instanceCount;
  private readonly observer = new MutationObserver(() => this.upgrade());
  private previousOpen = false;
  private hasSynced = false;

  static get observedAttributes() {
    return ["open", "label"];
  }

  get open(): boolean {
    return this.hasAttribute("open");
  }

  set open(value: boolean) {
    this.toggleAttribute("open", value);
  }

  get label(): string {
    return this.getAttribute("label") ?? "";
  }

  connectedCallback() {
    this.classList.add("ui-popover");
    this.upgrade();
    this.observer.observe(this, { childList: true, subtree: true });
    queueMicrotask(() => this.upgrade());
    this.addEventListener("click", this.handleClick);
    document.addEventListener("click", this.handleDocumentClick);
    document.addEventListener("keydown", this.handleKeydown);
  }

  disconnectedCallback() {
    this.observer.disconnect();
    this.removeEventListener("click", this.handleClick);
    document.removeEventListener("click", this.handleDocumentClick);
    document.removeEventListener("keydown", this.handleKeydown);
  }

  attributeChangedCallback() {
    if (this.isConnected) this.sync();
  }

  private get trigger(): HTMLButtonElement | null {
    return this.querySelector<HTMLButtonElement>("[slot='trigger'], button, [data-popover-trigger]");
  }

  private get panel(): HTMLElement | null {
    return this.querySelector<HTMLElement>("[slot='content'], .ui-popover__content, [data-popover-content]");
  }

  private upgrade() {
    const trigger = this.trigger;
    const panel = this.panel;
    if (!trigger || !panel) return;

    trigger.type = trigger.type || "button";
    panel.classList.add("ui-popover__content");
    if (!panel.id) panel.id = `sui-popover-${this.uid}`;
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-controls", panel.id);
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", this.label || trigger.textContent?.trim() || "Popover");
    this.sync();
  }

  private sync() {
    const trigger = this.trigger;
    const panel = this.panel;
    if (!trigger || !panel) return;

    this.classList.toggle("open", this.open);
    trigger.setAttribute("aria-expanded", String(this.open));
    panel.hidden = !this.open;

    const stateChanged = this.hasSynced && this.open !== this.previousOpen;
    this.previousOpen = this.open;
    this.hasSynced = true;

    if (this.open) {
      requestAnimationFrame(() => this.measure());
      if (stateChanged) {
        this.dispatchEvent(new CustomEvent("sui-open", { bubbles: true, composed: true }));
      }
    } else {
      this.classList.remove("ui-popover--top", "ui-popover--end");
      if (stateChanged) {
        this.dispatchEvent(new CustomEvent("sui-close", { bubbles: true, composed: true }));
      }
    }
  }

  private measure() {
    const trigger = this.trigger?.getBoundingClientRect();
    const panel = this.panel?.getBoundingClientRect();
    if (!this.open || !trigger || !panel) return;
    const { side, align } = computePlacement(trigger, panel);
    this.classList.toggle("ui-popover--top", side === "top");
    this.classList.toggle("ui-popover--end", align === "end");
  }

  private close(restoreFocus = false) {
    if (!this.open) return;
    this.open = false;
    if (restoreFocus) this.trigger?.focus();
  }

  private handleClick = (event: MouseEvent) => {
    const trigger = this.trigger;
    const clicked = (event.target as HTMLElement).closest("[slot='trigger'], button, [data-popover-trigger]");
    if (!trigger || clicked !== trigger) return;
    event.preventDefault();
    this.open = !this.open;
  };

  private handleDocumentClick = (event: MouseEvent) => {
    if (this.open && !event.composedPath().includes(this)) this.close();
  };

  private handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && this.open) {
      event.preventDefault();
      this.close(true);
      return;
    }

    if (event.key === "Tab" && this.open) {
      queueMicrotask(() => {
        if (!containsDeep(this, document.activeElement)) this.close();
      });
      return;
    }

    if ((event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") && event.target === this.trigger) {
      event.preventDefault();
      this.open = true;
      requestAnimationFrame(() => this.panel && Array.from(this.panel.querySelectorAll<HTMLElement>("*")).find(isFocusable)?.focus());
    }
  };
}

if (!customElements.get("sui-popover")) {
  customElements.define("sui-popover", SuiPopover);
}

declare global {
  interface HTMLElementTagNameMap {
    "sui-popover": SuiPopover;
  }
}
