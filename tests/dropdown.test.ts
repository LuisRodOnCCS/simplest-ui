import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../src/components/dropdown";
import type { SuiDropdown } from "../src/components/dropdown";

let dropdown: SuiDropdown;
let trigger: HTMLButtonElement;
let items: HTMLButtonElement[];

beforeEach(async () => {
  document.body.innerHTML = `
    <sui-dropdown>
      <span slot="trigger">Menú</span>
      <button type="button" data-value="a">Opción A</button>
      <button type="button" data-value="b">Opción B</button>
      <button type="button" data-value="c" disabled>Opción C</button>
    </sui-dropdown>
  `;
  dropdown = document.querySelector("sui-dropdown") as SuiDropdown;
  await dropdown.updateComplete;
  trigger = dropdown.shadowRoot!.querySelector<HTMLButtonElement>(".trigger")!;
  items = Array.from(dropdown.querySelectorAll<HTMLButtonElement>("button"));
});

afterEach(() => {
  document.body.innerHTML = "";
});

const openMenu = async () => {
  trigger.click();
  await dropdown.updateComplete;
  await Promise.resolve();
};

describe("sui-dropdown", () => {
  it("expone el trigger con ARIA y el menú etiquetado", () => {
    const menu = dropdown.shadowRoot!.querySelector(".menu")!;
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.getAttribute("aria-controls")).toBe(menu.id);
    expect(menu.getAttribute("role")).toBe("menu");
    expect(menu.getAttribute("aria-labelledby")).toBe(trigger.id);
  });

  it("abre y cierra al pulsar el trigger", async () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    dropdown.addEventListener("sui-open", onOpen);
    dropdown.addEventListener("sui-close", onClose);

    await openMenu();
    expect(dropdown.open).toBe(true);
    expect(dropdown.hasAttribute("open")).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(onOpen).toHaveBeenCalledTimes(1);

    trigger.click();
    await dropdown.updateComplete;
    expect(dropdown.open).toBe(false);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("prepara los items como menuitems y enfoca el primero", async () => {
    await openMenu();

    expect(items[0].getAttribute("role")).toBe("menuitem");
    expect(items[0].getAttribute("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(items[0]);
  });

  it("navega con flechas, Home y End saltando items deshabilitados", async () => {
    await openMenu();

    const press = async (key: string) => {
      items[0].dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
      await dropdown.updateComplete;
    };

    await press("ArrowDown");
    expect(document.activeElement).toBe(items[1]);

    await press("ArrowDown");
    expect(document.activeElement).toBe(items[0]);

    await press("End");
    expect(document.activeElement).toBe(items[1]);

    await press("Home");
    expect(document.activeElement).toBe(items[0]);
  });

  it("emite sui-select con el valor y devuelve el foco al trigger", async () => {
    const onSelect = vi.fn();
    dropdown.addEventListener("sui-select", onSelect);

    await openMenu();
    items[1].click();
    await dropdown.updateComplete;

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0].detail).toEqual({ value: "b" });
    expect(dropdown.open).toBe(false);
    expect(dropdown.shadowRoot!.activeElement).toBe(trigger);
  });

  it("cierra con Escape y restaura el foco", async () => {
    await openMenu();
    items[0].dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await dropdown.updateComplete;

    expect(dropdown.open).toBe(false);
    expect(dropdown.shadowRoot!.activeElement).toBe(trigger);
  });

  it("cierra al hacer click fuera", async () => {
    await openMenu();
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await dropdown.updateComplete;
    expect(dropdown.open).toBe(false);
  });

  it("abre con ArrowDown desde el trigger", async () => {
    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    await dropdown.updateComplete;
    await Promise.resolve();

    expect(dropdown.open).toBe(true);
    expect(document.activeElement).toBe(items[0]);
  });

  it("no selecciona items deshabilitados", async () => {
    const onSelect = vi.fn();
    dropdown.addEventListener("sui-select", onSelect);

    await openMenu();
    items[2].click();
    await dropdown.updateComplete;

    expect(onSelect).not.toHaveBeenCalled();
    expect(dropdown.open).toBe(true);
  });
});
