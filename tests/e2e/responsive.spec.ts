import { expect, test } from "@playwright/test";
import { horizontalOverflow, openDashboard, openDocs } from "./helpers";

test("documentation does not overflow horizontally at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await openDocs(page);

  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
});

test("dashboard does not overflow horizontally at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await openDashboard(page);

  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
});

test("ui-grid--auto uses one column at 320px and multiple columns above the breakpoint", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await openDashboard(page);

  const grid = page.locator(".ui-grid--auto").first();
  expect(await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(1);

  await page.setViewportSize({ width: 1024, height: 800 });
  await expect.poll(() => grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBeGreaterThan(1);
});
