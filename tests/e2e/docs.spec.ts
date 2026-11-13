import { expect, test } from "@playwright/test";
import { openDocs } from "./helpers";

test("catalog navigation exposes every current entry", async ({ page }) => {
  await openDocs(page);

  for (const id of ["button", "topbar", "support", "agent-skill", "vanilla-vite", "laravel-vite", "laravel-package", "dashboard"]) {
    await expect(page.locator(`[data-nav-id="${id}"]`)).toBeVisible();
  }
});

test("integration guides keep every code block below its preview", async ({ page }) => {
  await openDocs(page);

  for (const id of ["vanilla-vite", "laravel-vite", "laravel-package"]) {
    const section = page.locator(`#${id}`);
    const cards = section.locator(".docs-showcase");
    await expect(cards).toHaveCount(2);

    for (let index = 0; index < await cards.count(); index += 1) {
      const card = cards.nth(index);
      await expect(card.locator(":scope > .docs-preview")).toHaveCount(1);
      await expect(card.locator(":scope > pre.docs-code")).toHaveCount(1);
    }
  }
});

test("switches language and rerenders the documentation", async ({ page }) => {
  await openDocs(page);

  await page.locator("#docs-language-tabs").getByRole("tab", { name: "ES" }).click({ force: true });
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.locator('[data-nav-id="support"]')).toContainText("Soporte");

  await page.locator("#docs-language-tabs").getByRole("tab", { name: "EN" }).click({ force: true });
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("applies light and dark themes", async ({ page }) => {
  await openDocs(page);

  await page.locator("#docs-theme-tabs").getByRole("tab", { name: "Dark" }).click({ force: true });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.locator("#docs-theme-tabs").getByRole("tab", { name: "Light" }).click({ force: true });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("search filters navigation entries", async ({ page }) => {
  await openDocs(page);

  await page.locator(".docs-search").fill("topbar");
  await expect(page.locator('[data-nav-id="topbar"]')).not.toHaveClass(/docs-filtered/);
  await expect(page.locator('[data-nav-id="button"]')).toHaveClass(/docs-filtered/);
});
