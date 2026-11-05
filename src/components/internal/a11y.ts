const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

/** True when the element can receive keyboard focus via normal tabbing. */
export function isFocusable(el: HTMLElement): boolean {
  if (el.hasAttribute("disabled")) return false;
  if (el.hasAttribute("hidden")) return false;
  if (el.getAttribute("aria-hidden") === "true") return false;
  if (el.getAttribute("tabindex") === "-1") return false;
  return el.matches(FOCUSABLE_SELECTOR);
}

/**
 * Collects focusable elements in DOM order, including the ones living inside
 * nested shadow roots (web components composed inside a dialog, toasts, etc.).
 */
export function collectFocusable(root: ParentNode): HTMLElement[] {
  const out: HTMLElement[] = [];

  const visit = (parent: ParentNode) => {
    for (const child of Array.from(parent.children)) {
      const el = child as HTMLElement;

      if (el.shadowRoot) {
        visit(el.shadowRoot);
      }
      if (isFocusable(el)) {
        out.push(el);
      }
      visit(el);
    }
  };

  const host = root as HTMLElement;
  if (host.shadowRoot) visit(host.shadowRoot);
  visit(root);
  return out;
}

/** `document.activeElement` resolved through open shadow roots. */
export function getDeepActiveElement(): HTMLElement | null {
  let active = document.activeElement as HTMLElement | null;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement as HTMLElement;
  }
  return active;
}

/** `contains` that also traverses shadow boundaries. */
export function containsDeep(host: Node, node: Node | null): boolean {
  let current: Node | null = node;
  while (current) {
    if (current === host) return true;
    const asShadow = current as ShadowRoot;
    current = current.parentNode ?? asShadow.host ?? null;
  }
  return false;
}

/**
 * Keeps Tab focus inside `host`. Call from a `keydown` listener while the
 * overlay is open.
 */
export function trapTabKey(event: KeyboardEvent, host: Node): void {
  const focusables = collectFocusable(host as ParentNode);
  if (!focusables.length) {
    event.preventDefault();
    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = getDeepActiveElement();
  const inside = containsDeep(host, active);

  if (event.shiftKey && (active === first || !inside)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (active === last || !inside)) {
    event.preventDefault();
    first.focus();
  }
}

let scrollLocks = 0;
let previousOverflow = "";

/** Body scroll lock shared by overlays; safe with nested overlays. */
export function lockScroll(): void {
  if (scrollLocks++ > 0) return;
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
}

export function unlockScroll(): void {
  if (scrollLocks === 0) return;
  scrollLocks--;
  if (scrollLocks === 0) {
    document.body.style.overflow = previousOverflow;
  }
}
