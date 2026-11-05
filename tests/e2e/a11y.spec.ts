import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { openDashboard, openDocs } from "./helpers";

async function blockingViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  return results.violations
    .filter((violation) => violation.impact === "critical" || violation.impact === "serious")
    .map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      targets: violation.nodes.flatMap((node) => node.target)
    }));
}

test("documentation has no blocking accessibility violations", async ({ page }) => {
  await openDocs(page);

  expect(await blockingViolations(page)).toEqual([]);
});

test("dashboard has no blocking accessibility violations", async ({ page }) => {
  await openDashboard(page);

  expect(await blockingViolations(page)).toEqual([]);
});

test("documentation has no blocking accessibility violations in dark theme", async ({ page }) => {
  await openDocs(page, "", "dark");

  expect(await blockingViolations(page)).toEqual([]);
});

test("dashboard has no blocking accessibility violations in dark theme", async ({ page }) => {
  await openDashboard(page, "dark");

  expect(await blockingViolations(page)).toEqual([]);
});

test("open modal has no blocking accessibility violations", async ({ page }) => {
  await openDocs(page);
  await page.locator("[data-open-modal]").click({ force: true });
  await expect(page.locator("#docs-modal")).toHaveAttribute("open", "");

  expect(await blockingViolations(page)).toEqual([]);
});

test("open drawer has no blocking accessibility violations", async ({ page }) => {
  await openDocs(page);
  await page.locator("[data-open-drawer]").click({ force: true });
  await expect(page.locator("#docs-drawer")).toHaveAttribute("open", "");

  expect(await blockingViolations(page)).toEqual([]);
});
