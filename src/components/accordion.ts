const ITEM_SELECTOR = ".ui-accordion__item";
const TRIGGER_SELECTOR = ".ui-accordion__trigger";

/**
 * Progressive accordion controller.
 *
 * The element deliberately keeps its children in the light DOM so the regular
 * `.ui-accordion*` CSS classes remain usable in plain HTML and server views.
 */
export class SuiAccordion extends HTMLElement {
  private suppressEvents = false;
  private readonly observer = new MutationObserver(() => this.upgradeItems());

  static get observedAttributes() {
    return ["multiple"];
  }

  get multiple(): boolean {
    return this.hasAttribute("multiple");
  }

  connectedCallback() {
    this.classList.add("ui-accordion");
    this.setAttribute("role", "presentation");
    this.upgradeItems();
    this.observer.observe(this, { childList: true, subtree: true });
    queueMicrotask(() => this.upgradeItems());
    this.addEventListener("click", this.handleClick);
    this.addEventListener("keydown", this.handleKeydown);
  }

  disconnectedCallback() {
    this.observer.disconnect();
    this.removeEventListener("click", this.handleClick);
    this.removeEventListener("keydown", this.handleKeydown);
  }

  attributeChangedCallback() {
    if (this.isConnected) this.ensureSingleOpen();
  }

  private get items(): HTMLElement[] {
    return Array.from(this.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement && child.matches(ITEM_SELECTOR)
    );
  }

  private get triggers(): HTMLButtonElement[] {
    return this.items
      .map((item) => item.querySelector<HTMLButtonElement>(TRIGGER_SELECTOR))
      .filter((trigger): trigger is HTMLButtonElement => Boolean(trigger));
  }

  private upgradeItems() {
    this.suppressEvents = true;

    this.items.forEach((item, index) => {
      const trigger = item.querySelector<HTMLButtonElement>(TRIGGER_SELECTOR);
      const panel = item.querySelector<HTMLElement>(".ui-accordion__content");
      if (!trigger || !panel) return;

      trigger.type = "button";
      if (!panel.id) panel.id = `sui-accordion-panel-${crypto.randomUUID?.() ?? `${Date.now()}-${index}`}`;
      if (!trigger.id) trigger.id = `sui-accordion-trigger-${panel.id}`;

      trigger.setAttribute("aria-controls", panel.id);
      panel.setAttribute("role", "region");
      panel.setAttribute("aria-labelledby", trigger.id);
      this.setItemOpen(item, item.classList.contains("open"), false);
    });

    this.ensureSingleOpen();
    this.suppressEvents = false;
  }

  private ensureSingleOpen() {
    if (this.multiple) return;
    const firstOpen = this.items.find((item) => item.classList.contains("open"));
    for (const item of this.items) {
      if (item !== firstOpen && item.classList.contains("open")) {
        this.setItemOpen(item, false, false);
      }
    }
  }

  private setItemOpen(item: HTMLElement, open: boolean, announce = true) {
    const trigger = item.querySelector<HTMLButtonElement>(TRIGGER_SELECTOR);
    const panel = item.querySelector<HTMLElement>(".ui-accordion__content");
    if (!trigger || !panel) return;

    item.classList.toggle("open", open);
    trigger.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;

    if (announce && !this.suppressEvents) {
      this.dispatchEvent(
        new CustomEvent("sui-change", {
          detail: { open: this.items.filter((entry) => entry.classList.contains("open")).map((entry) => entry.id) },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  private toggle(item: HTMLElement) {
    const willOpen = !item.classList.contains("open");
    if (willOpen && !this.multiple) {
      this.items.forEach((entry) => {
        if (entry !== item) this.setItemOpen(entry, false, false);
      });
    }
    this.setItemOpen(item, willOpen);
  }

  private handleClick = (event: MouseEvent) => {
    const trigger = (event.target as HTMLElement).closest(TRIGGER_SELECTOR);
    if (!trigger || !this.contains(trigger)) return;
    const item = trigger.closest<HTMLElement>(ITEM_SELECTOR);
    if (item) this.toggle(item);
  };

  private handleKeydown = (event: KeyboardEvent) => {
    const trigger = (event.target as HTMLElement).closest(TRIGGER_SELECTOR) as HTMLButtonElement | null;
    if (!trigger) return;
    const triggers = this.triggers;
    const index = triggers.indexOf(trigger);
    if (index < 0) return;

    let next: HTMLButtonElement | undefined;
    switch (event.key) {
      case "ArrowDown": next = triggers[(index + 1) % triggers.length]; break;
      case "ArrowUp": next = triggers[(index - 1 + triggers.length) % triggers.length]; break;
      case "Home": next = triggers[0]; break;
      case "End": next = triggers[triggers.length - 1]; break;
      default: return;
    }

    event.preventDefault();
    next?.focus();
  };
}

if (!customElements.get("sui-accordion")) {
  customElements.define("sui-accordion", SuiAccordion);
}

declare global {
  interface HTMLElementTagNameMap {
    "sui-accordion": SuiAccordion;
  }
}
