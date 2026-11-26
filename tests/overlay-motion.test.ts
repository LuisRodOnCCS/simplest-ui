import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { animateOverlayExit } from "../src/components/internal/overlay-motion";

let dialog: HTMLDialogElement;
let panel: HTMLElement;

const animatedStyle = {
  animationDuration: "200ms",
  animationTimingFunction: "ease",
  transform: "none",
  opacity: "1",
  backgroundColor: "rgba(15, 23, 42, 0.5)",
} as unknown as CSSStyleDeclaration;

function stubAnimations(finished: Promise<Animation>) {
  const cancel = vi.fn();
  const animate = vi.fn(() => ({ finished, cancel }) as unknown as Animation);
  panel.animate = animate as unknown as Element["animate"];
  dialog.animate = animate as unknown as Element["animate"];
  return cancel;
}

beforeEach(() => {
  vi.useFakeTimers();
  document.body.innerHTML = "<dialog><div class='panel'></div></dialog>";
  dialog = document.querySelector("dialog")!;
  panel = document.querySelector<HTMLElement>(".panel")!;
  vi.spyOn(window, "getComputedStyle").mockReturnValue(animatedStyle);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

describe("animateOverlayExit", () => {
  it("cierra al terminar la animación", async () => {
    stubAnimations(Promise.resolve({} as Animation));
    const complete = vi.fn();

    animateOverlayExit(dialog, panel, "modal", complete);
    await vi.advanceTimersByTimeAsync(0);

    expect(complete).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(5_000);
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it("cierra cuando el timeline de animación no avanza", () => {
    const cancel = stubAnimations(new Promise<Animation>(() => {}));
    const complete = vi.fn();

    animateOverlayExit(dialog, panel, "drawer", complete);
    expect(complete).not.toHaveBeenCalled();

    vi.advanceTimersByTime(299);
    expect(complete).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(cancel).toHaveBeenCalled();

    vi.advanceTimersByTime(5_000);
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it("no cierra después de cancelar la salida", () => {
    stubAnimations(new Promise<Animation>(() => {}));
    const complete = vi.fn();

    const cancelExit = animateOverlayExit(dialog, panel, "modal", complete);
    cancelExit();
    vi.advanceTimersByTime(5_000);

    expect(complete).not.toHaveBeenCalled();
  });

  it("cierra de inmediato con movimiento reducido", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const animate = vi.fn();
    panel.animate = animate as unknown as Element["animate"];
    const complete = vi.fn();

    animateOverlayExit(dialog, panel, "modal", complete);

    expect(complete).toHaveBeenCalledTimes(1);
    expect(animate).not.toHaveBeenCalled();
  });
});
