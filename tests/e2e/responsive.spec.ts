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
