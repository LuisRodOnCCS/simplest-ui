import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../src/components/accordion";
import type { SuiAccordion } from "../src/components/accordion";

let accordion: SuiAccordion;
let triggers: HTMLButtonElement[];
let panels: HTMLElement[];

beforeEach(async () => {
  document.body.innerHTML = `
    <sui-accordion>
      <div class="ui-accordion__item open" id="one">
        <button class="ui-accordion__trigger">Uno</button>
        <div class="ui-accordion__content">Primer panel</div>
      </div>
      <div class="ui-accordion__item" id="two">
        <button class="ui-accordion__trigger">Dos</button>
        <div class="ui-accordion__content">Segundo panel</div>
      </div>
    </sui-accordion>
  `;
  accordion = document.querySelector("sui-accordion") as SuiAccordion;
  triggers = Array.from(accordion.querySelectorAll(".ui-accordion__trigger"));
  panels = Array.from(accordion.querySelectorAll(".ui-accordion__content"));
  await Promise.resolve();
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("sui-accordion", () => {
  it("normaliza las relaciones ARIA y el estado inicial", () => {
    expect(accordion.classList.contains("ui-accordion")).toBe(true);
    expect(triggers[0].getAttribute("aria-expanded")).toBe("true");
    expect(triggers[1].getAttribute("aria-expanded")).toBe("false");
    expect(panels[0].hidden).toBe(false);
    expect(panels[1].hidden).toBe(true);
    expect(panels[0].getAttribute("aria-labelledby")).toBe(triggers[0].id);
    expect(triggers[0].getAttribute("aria-controls")).toBe(panels[0].id);
  });

  it("abre un item y cierra los demás por defecto", () => {
    const onChange = vi.fn();
    accordion.addEventListener("sui-change", onChange);
    triggers[1].click();

    expect(triggers.map((trigger) => trigger.getAttribute("aria-expanded"))).toEqual(["false", "true"]);
    expect(panels.map((panel) => panel.hidden)).toEqual([true, false]);
    expect(onChange.mock.calls[0][0].detail).toEqual({ open: ["two"] });
  });

  it("permite varios panels abiertos con multiple", () => {
    accordion.setAttribute("multiple", "");
    triggers[1].click();
    expect(panels.map((panel) => panel.hidden)).toEqual([false, false]);
  });

  it("mueve el foco entre triggers con flechas, Home y End", () => {
    triggers[0].focus();
    triggers[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    expect(document.activeElement).toBe(triggers[1]);

    triggers[1].dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    expect(document.activeElement).toBe(triggers[0]);

    triggers[0].dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    expect(document.activeElement).toBe(triggers[1]);
  });
});
