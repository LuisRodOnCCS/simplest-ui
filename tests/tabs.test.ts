import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../src/components/tabs";
import type { SuiTabs } from "../src/components/tabs";

let tabs: SuiTabs;

beforeEach(async () => {
  document.body.innerHTML = `
    <sui-tabs>
      <div data-tab="general" label="General">Contenido general</div>
      <div data-tab="security" label="Seguridad">Contenido de seguridad</div>
      <div data-tab="notifications" label="Notificaciones">Contenido de notificaciones</div>
    </sui-tabs>
  `;
  tabs = document.querySelector("sui-tabs") as SuiTabs;
  await new Promise((resolve) => setTimeout(resolve, 0));
  await tabs.updateComplete;
});

afterEach(() => {
  document.body.innerHTML = "";
});

const shadowTabs = () => Array.from(tabs.shadowRoot!.querySelectorAll<HTMLButtonElement>(".tabs-pill"));
const panels = () => Array.from(tabs.querySelectorAll<HTMLElement>("[data-tab]"));

describe("sui-tabs", () => {
  it("construye una pestaña por cada hijo con data-tab", () => {
    expect(shadowTabs().map((tab) => tab.textContent?.trim())).toEqual([
      "General",
      "Seguridad",
      "Notificaciones",
    ]);
    expect(tabs.shadowRoot!.querySelector(".list")!.getAttribute("role")).toBe("tablist");
    expect(tabs.shadowRoot!.querySelector(".list")!.getAttribute("aria-orientation")).toBe(
      "horizontal"
    );
  });

  it("selecciona el primer panel por defecto y oculta el resto", () => {
    expect(tabs.value).toBe("general");
    expect(panels().map((panel) => panel.hidden)).toEqual([false, true, true]);
    expect(shadowTabs()[0].getAttribute("aria-selected")).toBe("true");
    expect(shadowTabs()[0].tabIndex).toBe(0);
    expect(shadowTabs()[1].tabIndex).toBe(-1);
  });

  it("marca los paneles con roles y relaciones ARIA", () => {
    const [first] = panels();
    expect(first.getAttribute("role")).toBe("tabpanel");
    expect(first.id).toBeTruthy();
    expect(first.getAttribute("aria-labelledby")).toBe(shadowTabs()[0].id);
    expect(shadowTabs()[0].getAttribute("aria-controls")).toBe(first.id);
  });

  it("cambia de panel al hacer click y emite sui-change", async () => {
    const onChange = vi.fn();
    tabs.addEventListener("sui-change", onChange);

    shadowTabs()[1].click();
    await tabs.updateComplete;

    expect(tabs.value).toBe("security");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].detail).toEqual({ value: "security" });
    expect(panels().map((panel) => panel.hidden)).toEqual([true, false, true]);
  });

  it("navega con las flechas, Home y End", async () => {
    const list = tabs.shadowRoot!.querySelector<HTMLElement>(".list")!;
    const press = async (key: string) => {
      list.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
      await tabs.updateComplete;
    };

    await press("ArrowRight");
    expect(tabs.value).toBe("security");

    await press("End");
    expect(tabs.value).toBe("notifications");

    await press("ArrowRight");
    expect(tabs.value).toBe("general");

    await press("ArrowLeft");
    expect(tabs.value).toBe("notifications");

    await press("Home");
    expect(tabs.value).toBe("general");
  });

  it("acepta un valor inicial y lo ignora si no existe", async () => {
    tabs.value = "security";
    await tabs.updateComplete;
    expect(panels().map((panel) => panel.hidden)).toEqual([true, false, true]);

    tabs.value = "missing";
    await tabs.updateComplete;
    expect(tabs.value).toBe("general");
  });

  it("marca el componente como listo tras recolectar paneles", () => {
    expect(tabs.hasAttribute("data-ready")).toBe(true);
  });

  it("reacciona a cambios en los paneles", async () => {
    const extra = document.createElement("div");
    extra.setAttribute("data-tab", "extra");
    extra.setAttribute("label", "Extra");
    extra.textContent = "Contenido extra";
    tabs.appendChild(extra);

    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));
    await tabs.updateComplete;

    expect(shadowTabs()).toHaveLength(4);
    expect(shadowTabs()[3].textContent?.trim()).toBe("Extra");
  });
});
