import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../src/components/modal";
import type { SuiDialogCloseEvent, SuiModal } from "../src/components/modal";

let modal: SuiModal;
let opener: HTMLButtonElement;

beforeEach(async () => {
  document.body.innerHTML = `
    <button type="button" id="opener">Abrir</button>
    <sui-modal>
      <span slot="title">Confirmación</span>
      <p>¿Deseas continuar?</p>
      <button slot="footer" type="button" id="confirm">Confirmar</button>
    </sui-modal>
  `;
  modal = document.querySelector("sui-modal") as SuiModal;
  opener = document.querySelector("#opener") as HTMLButtonElement;
  await modal.updateComplete;
});

afterEach(() => {
  modal.open = false;
  document.body.innerHTML = "";
  document.body.style.overflow = "";
});

const open = async () => {
  opener.focus();
  modal.open = true;
  await modal.updateComplete;
  await Promise.resolve();
};

describe("sui-modal", () => {
  it("no emite eventos de estado durante la inicialización", async () => {
    const freshModal = document.createElement("sui-modal") as SuiModal;
    const onOpen = vi.fn();
    const onClose = vi.fn();
    freshModal.addEventListener("sui-open", onOpen);
    freshModal.addEventListener("sui-close", onClose);
    document.body.append(freshModal);

    await freshModal.updateComplete;

    expect(onOpen).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    freshModal.remove();

    const initiallyOpenModal = document.createElement("sui-modal") as SuiModal;
    const onInitialOpen = vi.fn();
    initiallyOpenModal.addEventListener("sui-open", onInitialOpen);
    initiallyOpenModal.open = true;
    document.body.append(initiallyOpenModal);

    await initiallyOpenModal.updateComplete;

    expect(onInitialOpen).not.toHaveBeenCalled();
    initiallyOpenModal.remove();
  });

  it("no renderiza contenido mientras está cerrado", () => {
    expect(modal.shadowRoot!.querySelector(".backdrop")).toBeNull();
  });

  it("renderiza un diálogo accesible al abrir", async () => {
    await open();

    const dialog = modal.shadowRoot!.querySelector<HTMLElement>('[role="dialog"]')!;
    const title = modal.shadowRoot!.querySelector(".title")!;
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBe(title.id);
    expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
  });

  it("usa label como nombre accesible cuando no hay título", async () => {
    modal.label = "Aviso";
    await open();
    const dialog = modal.shadowRoot!.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog.getAttribute("aria-label")).toBe("Aviso");
    expect(dialog.hasAttribute("aria-labelledby")).toBe(false);
  });

  it("permite personalizar la etiqueta accesible del cierre", async () => {
    modal.closeLabel = "Close dialog";
    await open();
    expect(modal.shadowRoot!.querySelector(".close")!.getAttribute("aria-label")).toBe("Close dialog");
  });

  it("emite sui-open y sui-close", async () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    modal.addEventListener("sui-open", onOpen);
    modal.addEventListener("sui-close", onClose);

    await open();
    expect(onOpen).toHaveBeenCalledTimes(1);

    modal.close();
    await modal.updateComplete;
    expect(onClose).toHaveBeenCalledTimes(1);
    expect((onClose.mock.calls[0][0] as SuiDialogCloseEvent).detail).toEqual({
      reason: "programmatic",
    });
  });

  it("cierra con Escape y restaura el foco", async () => {
    const onClose = vi.fn();
    modal.addEventListener("sui-close", onClose);
    await open();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await modal.updateComplete;

    expect(modal.open).toBe(false);
    expect(document.activeElement).toBe(opener);
    expect((onClose.mock.calls[0][0] as SuiDialogCloseEvent).detail.reason).toBe("escape");
  });

  it("cierra al hacer click en el backdrop y respeta disableBackdropClose", async () => {
    const onClose = vi.fn();
    modal.addEventListener("sui-close", onClose);
    await open();
    const backdrop = modal.shadowRoot!.querySelector<HTMLElement>(".backdrop")!;
    backdrop.click();
    await modal.updateComplete;
    expect(modal.open).toBe(false);
    expect((onClose.mock.calls[0][0] as SuiDialogCloseEvent).detail.reason).toBe("backdrop");

    modal.disableBackdropClose = true;
    await open();
    modal.shadowRoot!.querySelector<HTMLElement>(".backdrop")!.click();
    await modal.updateComplete;
    expect(modal.open).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("identifica el botón de cierre como dismiss", async () => {
    const onClose = vi.fn();
    modal.addEventListener("sui-close", onClose);
    await open();

    modal.shadowRoot!.querySelector<HTMLButtonElement>(".close")!.click();
    await modal.updateComplete;

    expect((onClose.mock.calls[0][0] as SuiDialogCloseEvent).detail.reason).toBe("dismiss");
  });

  it("bloquea el scroll del body mientras está abierto", async () => {
    await open();
    expect(document.body.style.overflow).toBe("hidden");

    modal.close();
    await modal.updateComplete;
    expect(document.body.style.overflow).toBe("");
  });

  it("atrapa el foco con Tab", async () => {
    await open();
    const focusables = modal.shadowRoot!.querySelectorAll<HTMLElement>("button");
    const closeButton = focusables[0];
    const confirm = modal.querySelector<HTMLButtonElement>("#confirm")!;

    confirm.focus();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    expect(modal.shadowRoot!.activeElement).toBe(closeButton);

    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", bubbles: true, shiftKey: true })
    );
    expect(document.activeElement).toBe(confirm);
  });
});
