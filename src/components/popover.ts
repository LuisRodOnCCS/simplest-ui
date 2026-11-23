import { containsDeep, isFocusable } from "./internal/a11y";
import { createId } from "./internal/id";
import { computePlacement } from "./internal/position";

/** Accessible, light-DOM non-modal popover with click, keyboard and viewport handling. */
export class SuiPopover extends HTMLElement {
  private readonly observer = new MutationObserver(() => this.upgrade());
  private readonly panelId = createId("sui-popover");
  private previousOpen = false;
  private hasSynced = false;
  private activeTrigger: HTMLElement | null = null;
  private activePanel: HTMLElement | null = null;
  private focusWasInside = false;

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

  set label(value: string) {
    if (value) this.setAttribute("label", value);
    else this.removeAttribute("label");
  }

  connectedCallback() {
    this.classList.add("ui-popover");
    this.upgrade();
    this.observer.observe(this, { childList: true, subtree: true });
    queueMicrotask(() => this.upgrade());
    this.addEventListener("click", this.handleClick);
    document.addEventListener("focusin", this.handleFocusIn);
    document.addEventListener("click", this.handleDocumentClick);
    document.addEventListener("keydown", this.handleKeydown);
  }

  disconnectedCallback() {
    this.observer.disconnect();
    this.removeEventListener("click", this.handleClick);
    document.removeEventListener("focusin", this.handleFocusIn);
    document.removeEventListener("click", this.handleDocumentClick);
    document.removeEventListener("keydown", this.handleKeydown);
  }

  attributeChangedCallback() {
    if (this.isConnected) this.upgrade();
  }

  private resolvePanel(): HTMLElement | null {
    return this.querySelector<HTMLElement>(
      "[slot='content'], .ui-popover__content, [data-popover-content]"
    );
  }

  private resolveTrigger(panel: HTMLElement | null): HTMLElement | null {
    const explicit = this.querySelector<HTMLElement>("[slot='trigger']");
    if (explicit) return explicit;

    const hook = Array.from(this.querySelectorAll<HTMLElement>("[data-popover-trigger]")).find(
      (element) => !panel?.contains(element)
    );
    if (hook) return hook;

    return (
      Array.from(
        this.querySelectorAll<HTMLElement>("button, a[href], input, [tabindex]")
      ).find((element) => !panel?.contains(element)) ?? null
    );
  }

  private upgrade() {
    const panel = this.resolvePanel();
    const trigger = this.resolveTrigger(panel);

    if (!trigger) {
      this.clearReferences();
      return;
    }

    if (!panel) {
      const restoreFocus =
        this.focusWasInside || Boolean(this.activePanel && containsDeep(this.activePanel, document.activeElement));
      const oldTrigger = this.activeTrigger ?? trigger;
      const wasOpen = this.open;
      this.clearReferences();
      if (wasOpen) {
        this.open = false;
        this.previousOpen = false;
        this.hasSynced = true;
        this.classList.remove("open", "ui-popover--top", "ui-popover--end");
        this.dispatchEvent(new CustomEvent("sui-close", { bubbles: true, composed: true }));
        if (restoreFocus) oldTrigger.focus();
      }
      this.focusWasInside = false;
      return;
    }

    if (this.activeTrigger && this.activeTrigger !== trigger) {
      this.clearTrigger(this.activeTrigger);
    }
    this.activeTrigger = trigger;
    this.activePanel = panel;

    if (trigger instanceof HTMLButtonElement) {
      trigger.type = trigger.type || "button";
    }

    panel.classList.add("ui-popover__content");
    if (!panel.id) panel.id = this.panelId;
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-controls", panel.id);
    panel.setAttribute("role", "dialog");
    this.sync();
  }

  private sync() {
    const trigger = this.activeTrigger;
    const panel = this.activePanel;
    if (!trigger || !panel) return;

    this.classList.toggle("open", this.open);
    trigger.setAttribute("aria-expanded", String(this.open));
    panel.hidden = !this.open;

    const label = this.label.trim();
    panel.setAttribute(
      "aria-label",
      label || trigger.textContent?.trim() || "Popover"
    );

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

  private clearTrigger(trigger: HTMLElement) {
    trigger.removeAttribute("aria-haspopup");
    trigger.removeAttribute("aria-controls");
    trigger.removeAttribute("aria-expanded");
  }

  private clearReferences() {
    if (this.activeTrigger) this.clearTrigger(this.activeTrigger);
    this.activeTrigger = null;
    this.activePanel = null;
  }

  private measure() {
    const trigger = this.activeTrigger?.getBoundingClientRect();
    const panel = this.activePanel?.getBoundingClientRect();
    if (!this.open || !trigger || !panel) return;
    const { side, align } = computePlacement(trigger, panel);
    this.classList.toggle("ui-popover--top", side === "top");
    this.classList.toggle("ui-popover--end", align === "end");
  }

  private close(restoreFocus = false) {
    if (!this.open) return;
    const trigger = this.activeTrigger;
    this.open = false;
    if (restoreFocus) trigger?.focus();
  }

  private handleFocusIn = (event: FocusEvent) => {
    this.focusWasInside = Boolean(
      this.activePanel && containsDeep(this.activePanel, event.target as Node)
    );
  };

  private handleClick = (event: MouseEvent) => {
    const trigger = this.activeTrigger;
    if (!trigger) return;
    const target = event.target as Node;
    if (target !== trigger && !trigger.contains(target)) return;
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

    if (
      (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") &&
      event.target === this.activeTrigger
    ) {
      event.preventDefault();
      this.open = true;
      const panel = this.activePanel;
      requestAnimationFrame(() => {
        if (panel) Array.from(panel.querySelectorAll<HTMLElement>("*")).find(isFocusable)?.focus();
      });
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
