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

  it("actualiza contenido y conserva referencias ajenas al reemplazar nodos", async () => {
    document.body.innerHTML = `<sui-tooltip content="Primero"><button slot="trigger" aria-describedby="ayuda error">Ayuda</button></sui-tooltip>`;
    await new Promise((resolve) => setTimeout(resolve, 0));
    const tooltip = document.querySelector("sui-tooltip")!;
    const old = tooltip.querySelector("button")!;
    const content = tooltip.querySelector<HTMLElement>("[role=tooltip]")!;
    expect(old.getAttribute("aria-describedby")).toBe(`ayuda error ${content.id}`);
    tooltip.content = "Segundo";
    expect(content.textContent).toBe("Segundo");
    const replacement = document.createElement("button");
    replacement.slot = "trigger";
    replacement.setAttribute("aria-describedby", "otra");
    old.replaceWith(replacement);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(old.getAttribute("aria-describedby")).toBe("ayuda error");
    expect(replacement.getAttribute("aria-describedby")).toBe(`otra ${content.id}`);
    tooltip.content = "";
    expect(replacement.getAttribute("aria-describedby")).toBe("otra");
    expect(tooltip.querySelector("[role=tooltip]")).toBeNull();
  });

  it("da prioridad al trigger explícito y no muestra controles deshabilitados", async () => {
    document.body.innerHTML = `<sui-tooltip content="Ayuda"><button>Otro</button><button slot="trigger" aria-disabled="true">Abrir</button></sui-tooltip>`;
    await new Promise((resolve) => setTimeout(resolve, 0));
    const tooltip = document.querySelector("sui-tooltip")!;
    const [other, trigger] = tooltip.querySelectorAll("button");
    expect(other.hasAttribute("aria-describedby")).toBe(false);
    expect(trigger.hasAttribute("aria-describedby")).toBe(true);
    trigger.dispatchEvent(new Event("focusin", { bubbles: true }));
    expect(tooltip.classList.contains("ui-tooltip--visible")).toBe(false);
    trigger.removeAttribute("aria-disabled");
    trigger.dispatchEvent(new Event("focusin", { bubbles: true }));
    expect(tooltip.classList.contains("ui-tooltip--visible")).toBe(true);
  });
});

describe("sui-toast", () => {
  it("admite mensaje sin título y conserva clases e hijos del consumidor", () => {
    const toast = SuiToast.show({ message: "Solo mensaje", duration: 0 });
    expect(toast.querySelector(".ui-toast__title")).toBeNull();
    expect(toast.textContent).toContain("Solo mensaje");
    expect(toast.textContent).not.toContain("undefined");
    expect(toast.hasAttribute("role")).toBe(false);
    toast.classList.add("consumer");
    const child = document.createElement("button");
    toast.append(child);
    toast.variant = "warning";
    expect(toast.classList.contains("consumer")).toBe(true);
    expect(toast.contains(child)).toBe(true);
    document.body.append(toast);
    expect(toast.getAttribute("role")).toBe("status");
    document.querySelector("sui-toast-container")!.append(toast);
    expect(toast.hasAttribute("role")).toBe(false);
  });
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

  it("acepta message, variant y duration como propiedades", () => {
    const toast = document.createElement("sui-toast") as SuiToast;
    toast.setAttribute("title", "Inicial");
    toast.setAttribute("duration", "0");
    document.body.append(toast);

    toast.message = "Mensaje actualizado";
    toast.variant = "success";
    toast.duration = 0;

    expect(toast.getAttribute("message")).toBe("Mensaje actualizado");
    expect(toast.classList.contains("ui-toast--success")).toBe(true);
    expect(toast.textContent).toContain("Mensaje actualizado");
    expect(toast.duration).toBe(0);
  });
});
