/** Runs a cancellable exit without adding a delay when motion is reduced. */
export function animateOverlayExit(
  dialog: HTMLDialogElement,
  panel: HTMLElement,
  direction: "drawer" | "modal",
  complete: () => void,
): () => void {
  const animations: Animation[] = [];
  let duration = 0;
  if (!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches && typeof panel.animate === "function") {
    const style = getComputedStyle(panel);
    const durationValue = style.animationDuration.split(",")[0].trim();
    const easing = style.animationTimingFunction.split(/,(?![^()]*\))/)[0].trim();
    const options = { duration: durationValue.endsWith("ms") ? parseFloat(durationValue) : parseFloat(durationValue) * 1000, easing, fill: "forwards" as const };
    if (Number.isFinite(options.duration) && options.duration > 0) {
      duration = options.duration;
      const current = getComputedStyle(panel);
      animations.push(panel.animate(
        [{ transform: current.transform, opacity: current.opacity }, direction === "drawer"
          ? { transform: "translateX(100%)", opacity: 1 }
          : { transform: "translateY(var(--sui-space-4))", opacity: 0 }],
        options,
      ));
      animations.push(dialog.animate(
        [{ backgroundColor: getComputedStyle(dialog).backgroundColor }, { backgroundColor: "transparent" }],
        options,
      ));
    }
  }
  if (!animations.length) {
    complete();
    return () => {};
  }
  let fallback = 0;
  let settled = false;
  let cancelled = false;
  const finish = () => {
    if (settled || cancelled) return;
    settled = true;
    window.clearTimeout(fallback);
    complete();
  };
  // Closing, focus restoration and `sui-close` must not depend on the animation
  // timeline advancing: browsers can stall it (hidden pages, throttled rendering),
  // leaving the dialog modal and the background inert. Release the exit effect
  // once the declared duration has elapsed even if `finished` never settles.
  fallback = window.setTimeout(() => {
    animations.forEach(animation => animation.cancel());
    finish();
  }, duration + 100);
  Promise.all(animations.map(animation => animation.finished)).then(finish).catch(finish);
  return () => {
    cancelled = true;
    window.clearTimeout(fallback);
    animations.forEach(animation => animation.cancel());
  };
}
