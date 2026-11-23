export type OverlayHandle = {
  close(reason: "escape"): void;
};

const stack: OverlayHandle[] = [];
let listening = false;

function handleKeydown(event: KeyboardEvent): void {
  if (event.key !== "Escape" || stack.length === 0) return;
  const top = stack[stack.length - 1];
  event.preventDefault();
  top.close("escape");
}

function startListening(): void {
  if (listening) return;
  document.addEventListener("keydown", handleKeydown);
  listening = true;
}

function stopListening(): void {
  if (!listening) return;
  document.removeEventListener("keydown", handleKeydown);
  listening = false;
}

/** Registers an open overlay as the most recent one. */
export function registerOverlay(handle: OverlayHandle): void {
  unregisterOverlay(handle);
  stack.push(handle);
  startListening();
}

/** Removes an overlay from the Escape stack. Safe to call repeatedly. */
export function unregisterOverlay(handle: OverlayHandle): void {
  const index = stack.indexOf(handle);
  if (index !== -1) stack.splice(index, 1);
  if (stack.length === 0) stopListening();
}

/** True when the overlay is the most recently opened one. */
export function isTopOverlay(handle: OverlayHandle): boolean {
  return stack[stack.length - 1] === handle;
}
