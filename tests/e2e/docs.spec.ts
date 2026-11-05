import { expect, test } from "@playwright/test";
import { openDocs } from "./helpers";

test("catalog navigation exposes every current entry", async ({ page }) => {
  await openDocs(page);

  for (const id of ["button", "topbar", "support", "agent-skill", "dashboard"]) {
    await expect(page.locator(`[data-nav-id="${id}"]`)).toBeVisible();
  }
});

test("switches language and rerenders the documentation", async ({ page }) => {
  await openDocs(page);

  await page.locator("#docs-language-tabs").getByRole("tab", { name: "ES" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.locator('[data-nav-id="support"]')).toContainText("Soporte");

  await page.locator("#docs-language-tabs").getByRole("tab", { name: "EN" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("applies light and dark themes", async ({ page }) => {
  await openDocs(page);

  await page.locator("#docs-theme-tabs").getByRole("tab", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.locator("#docs-theme-tabs").getByRole("tab", { name: "Light" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("search filters navigation entries", async ({ page }) => {
  await openDocs(page);

  await page.locator(".docs-search").fill("topbar");
  await expect(page.locator('[data-nav-id="topbar"]')).not.toHaveClass(/docs-filtered/);
  await expect(page.locator('[data-nav-id="button"]')).toHaveClass(/docs-filtered/);
});
