import { expect, test } from "@playwright/test";
import { openDashboard } from "./helpers";

test("dashboard renders the app shell and switches theme", async ({ page }) => {
  await openDashboard(page);

  await expect(page.locator(".ui-stat")).toHaveCount(3);
  await expect(page.locator(".ui-table")).toBeVisible();

  await page.locator("#dashboard-theme-tabs").getByRole("tab", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.locator("#dashboard-language-tabs").getByRole("tab", { name: "ES" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.locator(".ui-app-shell__title")).toHaveText("Panel");
});
