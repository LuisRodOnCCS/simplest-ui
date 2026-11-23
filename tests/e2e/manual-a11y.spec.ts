import { expect, test } from "@playwright/test";

test("manual accessibility fixture exposes working review scenarios", async ({ page }) => {
  await page.goto("/audits/0.3.0/manual-a11y.html");
  await page.getByRole("button", { name: "Mostrar aviso en contenedor" }).click();
  await expect(page.locator("sui-toast-container sui-toast")).toContainText("cambios guardados");
  await page.getByRole("button", { name: "Mostrar aviso independiente" }).click();
  await expect(page.locator("#standalone-area sui-toast")).toContainText("conexión recuperada");
  await page.getByRole("button", { name: "Limpiar avisos" }).click();
  await expect(page.locator("sui-toast")).toHaveCount(0);

  const trigger = page.getByRole("button", { name: "Información de correo" });
  await expect(trigger).toHaveAccessibleDescription("Ayuda previa: el correo es obligatorio. Tooltip inicial: usa tu correo de trabajo.");
  await page.getByRole("button", { name: "Cambiar tooltip" }).click();
  await expect(trigger).toHaveAccessibleDescription("Ayuda previa: el correo es obligatorio. Tooltip actualizado: revisa el dominio de tu correo.");

  const drawerButton = page.getByRole("button", { name: "Abrir panel lateral" });
  // Keyboard activation establishes the focus return target in every engine;
  // WebKit does not focus native buttons on a pointer click.
  await drawerButton.focus();
  await drawerButton.press("Enter");
  await expect(page.getByRole("dialog", { name: "Panel lateral de prueba" })).toBeVisible();
  const modalButton = page.getByRole("button", { name: "Abrir diálogo interior" });
  await modalButton.focus();
  await modalButton.press("Enter");
  await expect(page.getByRole("dialog", { name: "Diálogo interior de prueba" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Diálogo interior de prueba" })).toBeHidden();
  await expect(modalButton).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Panel lateral de prueba" })).toBeHidden();
  await expect(drawerButton).toBeFocused();
});
