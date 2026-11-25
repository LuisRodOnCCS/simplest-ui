/** Runs a cancellable exit without adding a delay when motion is reduced. */
export function animateOverlayExit(
  dialog: HTMLDialogElement,
  panel: HTMLElement,
  direction: "drawer" | "modal",
  complete: () => void,
): () => void {
  const animations: Animation[] = [];
  if (!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches && typeof panel.animate === "function") {
    const style = getComputedStyle(panel);
    const duration = style.animationDuration.split(",")[0].trim();
    const easing = style.animationTimingFunction.split(/,(?![^()]*\))/)[0].trim();
    const options = { duration: duration.endsWith("ms") ? parseFloat(duration) : parseFloat(duration) * 1000, easing, fill: "forwards" as const };
    if (Number.isFinite(options.duration) && options.duration > 0) {
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
  let cancelled = false;
  Promise.all(animations.map(animation => animation.finished)).then(() => {
    if (!cancelled) complete();
  }).catch(() => {
    if (!cancelled) complete();
  });
  return () => {
    cancelled = true;
    animations.forEach(animation => animation.cancel());
  };
}
