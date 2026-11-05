import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../src/components/drawer";
import type { SuiDrawer } from "../src/components/drawer";

let drawer: SuiDrawer;
let opener: HTMLButtonElement;

beforeEach(async () => {
  document.body.innerHTML = `
    <button type="button" id="opener">Abrir</button>
    <sui-drawer>
      <span slot="title">Filtros</span>
      <p>Filtra los resultados disponibles.</p>
      <button slot="footer" type="button" id="apply">Aplicar</button>
    </sui-drawer>
  `;
  drawer = document.querySelector("sui-drawer") as SuiDrawer;
  opener = document.querySelector("#opener") as HTMLButtonElement;
  await drawer.updateComplete;
});

afterEach(() => {
  drawer.open = false;
  document.body.innerHTML = "";
  document.body.style.overflow = "";
});

const open = async () => {
  opener.focus();
  drawer.open = true;
  await drawer.updateComplete;
  await Promise.resolve();
};

describe("sui-drawer", () => {
  it("no renderiza contenido mientras está cerrado", () => {
    expect(drawer.shadowRoot!.querySelector(".backdrop")).toBeNull();
  });

  it("renderiza un diálogo lateral accesible al abrir", async () => {
    await open();
    const dialog = drawer.shadowRoot!.querySelector<HTMLElement>('[role="dialog"]')!;
    const title = drawer.shadowRoot!.querySelector(".title")!;

    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBe(title.id);
    expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
    expect(document.activeElement).toBe(drawer);
    expect(drawer.shadowRoot!.activeElement).toBe(drawer.shadowRoot!.querySelector(".close"));
  });

  it("acepta label y close-label", async () => {
    drawer.label = "Panel de filtros";
    drawer.closeLabel = "Cerrar filtros";
    await open();

    const dialog = drawer.shadowRoot!.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog.getAttribute("aria-label")).toBe("Panel de filtros");
    expect(dialog.hasAttribute("aria-labelledby")).toBe(false);
    expect(drawer.shadowRoot!.querySelector(".close")!.getAttribute("aria-label")).toBe("Cerrar filtros");
  });

  it("emite eventos y restaura el foco al cerrar con Escape", async () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    drawer.addEventListener("sui-open", onOpen);
    drawer.addEventListener("sui-close", onClose);

    await open();
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(document.body.style.overflow).toBe("hidden");

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await drawer.updateComplete;
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(drawer.open).toBe(false);
    expect(document.activeElement).toBe(opener);
    expect(document.body.style.overflow).toBe("");
  });

  it("cierra desde el backdrop salvo que se deshabilite", async () => {
    await open();
    drawer.shadowRoot!.querySelector<HTMLElement>(".backdrop")!.click();
    await drawer.updateComplete;
    expect(drawer.open).toBe(false);

    drawer.disableBackdropClose = true;
    await open();
    drawer.shadowRoot!.querySelector<HTMLElement>(".backdrop")!.click();
    await drawer.updateComplete;
    expect(drawer.open).toBe(true);
  });

  it("atrapa el foco entre el cierre y las acciones sloteadas", async () => {
    await open();
    const close = drawer.shadowRoot!.querySelector<HTMLButtonElement>(".close")!;
    const apply = drawer.querySelector<HTMLButtonElement>("#apply")!;

    apply.focus();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    expect(drawer.shadowRoot!.activeElement).toBe(close);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true, shiftKey: true }));
    expect(document.activeElement).toBe(apply);
  });
});
