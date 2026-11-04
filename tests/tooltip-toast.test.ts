import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SuiToast } from "../src/components/toast";
import "../src/components/tooltip";

beforeEach(() => {
  document.body.innerHTML = "";
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("sui-tooltip", () => {
  it("crea y relaciona un tooltip accesible desde content", () => {
    document.body.innerHTML = `<sui-tooltip content="Más información">Ayuda</sui-tooltip>`;
    const tooltip = document.querySelector("sui-tooltip")!;
    const content = tooltip.querySelector<HTMLElement>(".ui-tooltip__content")!;
    expect(tooltip.classList.contains("ui-tooltip")).toBe(true);
    expect(content.textContent).toBe("Más información");
    expect(content.getAttribute("role")).toBe("tooltip");
    expect(tooltip.getAttribute("aria-describedby")).toBe(content.id);
  });
});

describe("sui-toast", () => {
  it("muestra toasts desde la API estática en un contenedor accesible", () => {
    const toast = SuiToast.show({ title: "Guardado", message: "Todo correcto", variant: "success", duration: 0 });
    const container = document.querySelector("sui-toast-container")!;
    expect(container.classList.contains("ui-toast-container")).toBe(true);
    expect(container.getAttribute("aria-live")).toBe("polite");
    expect(toast.classList.contains("ui-toast--success")).toBe(true);
    expect(toast.textContent).toContain("Guardado");
    expect(toast.textContent).toContain("Todo correcto");
  });

  it("se auto-descarta y emite sui-dismiss", () => {
    vi.useFakeTimers();
    const toast = SuiToast.show({ title: "Temporal", duration: 100 });
    const onDismiss = vi.fn();
    toast.addEventListener("sui-dismiss", onDismiss);
    vi.advanceTimersByTime(100);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(toast.isConnected).toBe(false);
  });
});
