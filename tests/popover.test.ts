import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "../src/components/popover";
import type { SuiPopover } from "../src/components/popover";

let popover: SuiPopover;
let trigger: HTMLButtonElement;
let panel: HTMLElement;

beforeEach(async () => {
  document.body.innerHTML = `
    <sui-popover label="Acciones">
      <button slot="trigger" type="button">Abrir</button>
      <div slot="content"><button type="button">Editar</button></div>
    </sui-popover>
    <button id="outside" type="button">Fuera</button>
  `;
  popover = document.querySelector("sui-popover") as SuiPopover;
  trigger = popover.querySelector("[slot='trigger']") as HTMLButtonElement;
  panel = popover.querySelector("[slot='content']") as HTMLElement;
  await Promise.resolve();
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("sui-popover", () => {
  it("prepara roles, relaciones ARIA y contenido oculto", () => {
    expect(popover.classList.contains("ui-popover")).toBe(true);
    expect(panel.classList.contains("ui-popover__content")).toBe(true);
    expect(panel.getAttribute("role")).toBe("dialog");
    expect(panel.getAttribute("aria-label")).toBe("Acciones");
    expect(trigger.getAttribute("aria-controls")).toBe(panel.id);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(panel.hidden).toBe(true);
  });

  it("alterna con el trigger y actualiza ARIA", () => {
    trigger.click();
    expect(popover.open).toBe(true);
    expect(panel.hidden).toBe(false);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    trigger.click();
    expect(popover.open).toBe(false);
    expect(panel.hidden).toBe(true);
  });

  it("cierra con Escape y devuelve el foco", () => {
    popover.open = true;
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(popover.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it("cierra al pulsar fuera", () => {
    popover.open = true;
    document.querySelector<HTMLButtonElement>("#outside")!.click();
    expect(popover.open).toBe(false);
  });

  it("abre con teclado y enfoca la primera acción", async () => {
    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(popover.open).toBe(true);
    expect(document.activeElement).toBe(panel.querySelector("button"));
  });
});
