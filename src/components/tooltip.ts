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
  private resizeObserver: ResizeObserver | null = null;
  private tracking = false;
  private positionFrame: number | undefined;
  private positioned: {
    element: HTMLElement;
    styles: { name: string; value: string; priority: string }[];
  } | null = null;

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
    this.observer.observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["disabled", "aria-disabled"]
    });
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

    if (content !== this.currentContent) this.stopPositioning();
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
      this.hideTooltip();
    } else if (this.classList.contains("ui-tooltip--visible")) {
      this.positionContent();
      this.startPositioning();
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
    this.hideTooltip();
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
    if (!this.classList.contains("ui-tooltip--visible")) {
      this.savePosition();
      // Measure from a safe starting point. In particular, WebKit can retain
      // an inline ancestor's overflow from the first uncorrected layout.
      this.currentContent.style.setProperty("left", `${-this.getBoundingClientRect().left}px`, "important");
    }
    this.classList.add("ui-tooltip--visible");
    this.positionContent();
    this.startPositioning();
  };

  private hideTooltip = () => {
    this.classList.remove("ui-tooltip--visible");
    this.stopPositioning();
  };

  private startPositioning() {
    if (this.tracking || !this.currentContent || !this.activeTrigger) return;
    this.tracking = true;
    window.addEventListener("resize", this.schedulePosition);
    window.addEventListener("scroll", this.schedulePosition, true);
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(this.schedulePosition);
      this.resizeObserver.observe(this.currentContent);
      this.resizeObserver.observe(this.activeTrigger);
    }
  }

  private stopPositioning() {
    this.tracking = false;
    window.removeEventListener("resize", this.schedulePosition);
    window.removeEventListener("scroll", this.schedulePosition, true);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    if (this.positionFrame !== undefined) cancelAnimationFrame(this.positionFrame);
    this.positionFrame = undefined;
    this.restorePosition();
  }

  private restorePosition() {
    if (!this.positioned) return;
    for (const { name, value, priority } of this.positioned.styles) {
      if (value) this.positioned.element.style.setProperty(name, value, priority);
      else this.positioned.element.style.removeProperty(name);
    }
    this.positioned = null;
  }

  private savePosition() {
    const content = this.currentContent;
    if (!content || this.positioned?.element === content) return;
    this.restorePosition();
    this.positioned = {
      element: content,
      styles: ["left", "max-width"].map((name) => ({
        name,
        value: content.style.getPropertyValue(name),
        priority: content.style.getPropertyPriority(name)
      }))
    };
  }

  private schedulePosition = () => {
    if (!this.tracking || this.positionFrame !== undefined) return;
    this.positionFrame = requestAnimationFrame(() => {
      this.positionFrame = undefined;
      this.positionContent();
    });
  };

  private positionContent() {
    const content = this.currentContent;
    const trigger = this.activeTrigger;
    if (!content || !trigger || !this.classList.contains("ui-tooltip--visible")) return;
    if (this.isDisabled(trigger)) {
      this.hideTooltip();
      return;
    }

    this.savePosition();
    // Re-evaluate the authored width constraint after a viewport change, but
    // keep the corrected left edge during measurement to avoid overflow.
    const originalMaxWidth = this.positioned!.styles.find(({ name }) => name === "max-width")!;
    if (originalMaxWidth.value) content.style.setProperty("max-width", originalMaxWidth.value, originalMaxWidth.priority);
    else content.style.removeProperty("max-width");
    const style = getComputedStyle(content);
    const margin = parseFloat(style.paddingLeft) || 0;
    const viewportWidth = document.documentElement.clientWidth;
    const available = Math.max(0, viewportWidth - 2 * margin);
    const maxWidth = style.maxWidth === "none" ? `${available}px` : `min(${style.maxWidth}, ${available}px)`;
    content.style.setProperty("max-width", maxWidth, "important");
    const rect = content.getBoundingClientRect();
    const anchor = trigger.getBoundingClientRect();
    const centered = (anchor.left + anchor.right - rect.width) / 2;
    const left = Math.max(margin, Math.min(centered, viewportWidth - margin - rect.width));
    const shift = left - rect.left;
    if (shift) {
      const baselineLeft = parseFloat(getComputedStyle(content).left) || 0;
      content.style.setProperty("left", `${baselineLeft + shift}px`, "important");
    }
  }
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
