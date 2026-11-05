import { LitElement, html, css } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import type { PropertyValues } from "lit";
import { computePlacement, type Align, type Side } from "./internal/position";

const ITEM_SELECTOR = '[role="menuitem"], button, a';

@customElement("sui-dropdown")
export class SuiDropdown extends LitElement {
  private static instanceCount = 0;
  private readonly uid = ++SuiDropdown.instanceCount;

  static styles = css`
    :host {
      display: inline-block;
      position: relative;
    }
    :host([open]) {
      z-index: var(--sui-z-dropdown);
    }
    .trigger {
      background: var(--sui-color-surface-raised);
      border: 1px solid var(--sui-color-border);
      border-radius: var(--sui-radius-full);
      height: var(--sui-control-height-md);
      padding: 0 var(--sui-space-3);
      font-size: var(--sui-font-size-sm);
      color: var(--sui-color-text);
      backdrop-filter: blur(var(--sui-blur-sm));
      -webkit-backdrop-filter: blur(var(--sui-blur-sm));
      cursor: pointer;
      transition: background var(--sui-duration-fast) var(--sui-easing-standard),
                  border-color var(--sui-duration-fast) var(--sui-easing-standard),
                  color var(--sui-duration-fast) var(--sui-easing-standard);
    }
    .trigger:hover {
      background: var(--sui-color-surface-muted);
      border-color: var(--sui-color-primary-hover);
      color: var(--sui-color-primary-hover);
    }
    .trigger:focus-visible {
      outline: none;
      box-shadow: var(--sui-focus-ring);
    }
    .menu {
      position: absolute;
      top: calc(100% + var(--sui-space-1-5));
      left: 0;
      min-width: var(--sui-dropdown-min-width, 170px);
      max-height: min(var(--sui-dropdown-max-height, 320px), 60vh);
      overflow-y: auto;
      overscroll-behavior: contain;
      background: var(--sui-color-surface-raised);
      border: 1px solid var(--sui-color-border);
      border-radius: var(--sui-radius-xl);
      box-shadow: var(--sui-shadow-menu);
      backdrop-filter: blur(var(--sui-blur-md));
      -webkit-backdrop-filter: blur(var(--sui-blur-md));
      padding: var(--sui-space-1-5);
      z-index: var(--sui-z-dropdown);
      display: none;
    }
    .menu--top {
      top: auto;
      bottom: calc(100% + var(--sui-space-1-5));
    }
    .menu--end {
      left: auto;
      right: 0;
    }
    :host([open]) .menu {
      display: block;
      animation: sui-dropdown-in var(--sui-duration-fast) var(--sui-easing-standard);
    }
    ::slotted(button),
    ::slotted(a),
    ::slotted([role="menuitem"]) {
      display: block;
      width: 100%;
      text-align: left;
      padding: var(--sui-space-1-5) var(--sui-space-2-5);
      border: 0;
      background: transparent;
      border-radius: var(--sui-radius-sm);
      font-size: var(--sui-font-size-sm);
      color: var(--sui-color-text);
      cursor: pointer;
      text-decoration: none;
      transition: background var(--sui-duration-fast) var(--sui-easing-standard),
                  color var(--sui-duration-fast) var(--sui-easing-standard);
    }
    ::slotted(button:hover),
    ::slotted(a:hover),
    ::slotted([role="menuitem"]:hover),
    ::slotted(button:focus-visible),
    ::slotted(a:focus-visible),
    ::slotted([role="menuitem"]:focus-visible) {
      background: var(--sui-color-surface-muted);
      color: var(--sui-color-primary-hover);
      outline: none;
    }
    ::slotted(button:disabled),
    ::slotted([aria-disabled="true"]) {
      opacity: 0.5;
      cursor: not-allowed;
    }
    @keyframes sui-dropdown-in {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (prefers-reduced-motion: reduce) {
      :host([open]) .menu {
        animation: none;
      }
    }
  `;

  @property({ type: Boolean, reflect: true }) open = false;

  @state() private align: Align = "start";
  @state() private side: Side = "bottom";

  @query(".trigger") private trigger!: HTMLButtonElement;
  @query(".menu") private menu!: HTMLElement;

  private startFromEnd = false;

  private get triggerId() {
    return `sui-dropdown-trigger-${this.uid}`;
  }

  private get menuId() {
    return `sui-dropdown-menu-${this.uid}`;
  }

  private get enabledItems(): HTMLElement[] {
    return this.allItems.filter(
      (item) => !item.hasAttribute("disabled") && item.getAttribute("aria-disabled") !== "true"
    );
  }

  private get allItems(): HTMLElement[] {
    return Array.from(this.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(
      (item) => !item.closest('[slot="trigger"]')
    );
  }

  protected updated(changed: PropertyValues) {
    if (!changed.has("open")) return;

    this.dispatchEvent(
      new CustomEvent("sui-toggle", {
        detail: { open: this.open },
        bubbles: true,
        composed: true,
      })
    );

    if (this.open) {
      this.prepareItems();
      this.dispatchEvent(new CustomEvent("sui-open", { bubbles: true, composed: true }));
      this.updateComplete.then(() => {
        this.measure();
        this.focusItem(this.startFromEnd ? this.enabledItems.length - 1 : 0);
      });
    } else {
      this.dispatchEvent(new CustomEvent("sui-close", { bubbles: true, composed: true }));
    }
  }

  private prepareItems() {
    for (const item of this.allItems) {
      if (!item.hasAttribute("role")) {
        item.setAttribute("role", "menuitem");
      }
      item.setAttribute("tabindex", "-1");
    }
  }

  private measure() {
    const trigger = this.trigger?.getBoundingClientRect();
    const menu = this.menu?.getBoundingClientRect();
    if (!trigger || !menu) return;

    const placement = computePlacement(trigger, menu);
    this.side = placement.side;
    this.align = placement.align;
  }

  private focusItem(index: number) {
    const items = this.enabledItems;
    if (!items.length) return;
    const item = items[((index % items.length) + items.length) % items.length];
    item.focus();
  }

  private setOpen(open: boolean, restoreFocus = false) {
    if (this.open === open) return;
    this.open = open;
    if (!open && restoreFocus) {
      this.trigger?.focus();
    }
  }

  private toggle(restoreFocus = false) {
    this.startFromEnd = false;
    this.setOpen(!this.open, restoreFocus);
  }

  private handleTriggerClick = (e: MouseEvent) => {
    e.stopPropagation();
    this.toggle();
  };

  private handleTriggerKeydown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
      case "Enter":
      case " ":
        e.preventDefault();
        this.startFromEnd = false;
        this.setOpen(true);
        break;
      case "ArrowUp":
        e.preventDefault();
        this.startFromEnd = true;
        this.setOpen(true);
        break;
    }
  };

  private handleMenuKeydown = (e: KeyboardEvent) => {
    const items = this.enabledItems;
    if (!items.length) return;

    const current = items.indexOf(document.activeElement as HTMLElement);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.focusItem(current + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        this.focusItem(current < 0 ? -1 : current - 1);
        break;
      case "Home":
        e.preventDefault();
        this.focusItem(0);
        break;
      case "End":
        e.preventDefault();
        this.focusItem(items.length - 1);
        break;
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        this.setOpen(false, true);
        break;
      case "Tab":
        this.setOpen(false);
        break;
    }
  };

  private handleDocumentClick = (e: MouseEvent) => {
    if (this.open && !e.composedPath().includes(this)) {
      this.setOpen(false);
    }
  };

  private handleFocusOut = (e: FocusEvent) => {
    const next = e.relatedTarget as Node | null;
    if (this.open && next && !this.contains(next)) {
      this.setOpen(false);
    }
  };

  private handleMenuClick = (e: MouseEvent) => {
    const origin = e.composedPath()[0] as HTMLElement | undefined;
    const target = origin?.closest?.(ITEM_SELECTOR) as HTMLElement | null;

    if (!target || target.hasAttribute("disabled") || target.getAttribute("aria-disabled") === "true") {
      return;
    }

    const value = target.getAttribute("data-value") ?? target.textContent?.trim() ?? "";
    this.setOpen(false, true);
    this.dispatchEvent(
      new CustomEvent("sui-select", { detail: { value }, bubbles: true, composed: true })
    );
  };

  private handleSlotChange = () => {
    if (this.open) this.prepareItems();
  };

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", this.handleDocumentClick);
    this.addEventListener("click", this.handleMenuClick);
    this.addEventListener("keydown", this.handleMenuKeydown);
    this.addEventListener("focusout", this.handleFocusOut);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("click", this.handleDocumentClick);
    this.removeEventListener("click", this.handleMenuClick);
    this.removeEventListener("keydown", this.handleMenuKeydown);
    this.removeEventListener("focusout", this.handleFocusOut);
  }

  render() {
    const menuClass = [
      "menu",
      this.side === "top" ? "menu--top" : "",
      this.align === "end" ? "menu--end" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return html`
      <button
        class="trigger"
        id=${this.triggerId}
        type="button"
        aria-haspopup="menu"
        aria-expanded=${this.open ? "true" : "false"}
        aria-controls=${this.menuId}
        @click=${this.handleTriggerClick}
        @keydown=${this.handleTriggerKeydown}
      >
        <slot name="trigger">Opciones</slot>
      </button>
      <div
        class=${menuClass}
        id=${this.menuId}
        role="menu"
        aria-labelledby=${this.triggerId}
      >
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sui-dropdown": SuiDropdown;
  }
}
