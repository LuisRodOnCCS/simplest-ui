import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { openDashboard, openDocs } from "./helpers";

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() =>
    [...document.querySelectorAll("sui-tabs")].every((tabs) => tabs.hasAttribute("data-ready"))
  );
  await page.waitForTimeout(150);
  await page.mouse.move(1, 1);
}

async function snapshot(page: Page, target: Locator, name: string) {
  await target.scrollIntoViewIfNeeded();
  await target.evaluate((element) => element.scrollIntoView({ block: "center", inline: "nearest" }));
  await page.mouse.move(1, 1);
  await expect(target).toHaveScreenshot(name);
}

async function snapshotInPlace(page: Page, target: Locator, name: string) {
  await page.mouse.move(1, 1);
  await expect(target).toHaveScreenshot(name);
}

test("documentation hero stays visually stable in light theme", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openDocs(page);
  await settle(page);

  await snapshotInPlace(page, page.locator(".docs-hero"), "docs-hero-light.png");
});

test("documentation buttons stay visually stable across themes", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openDocs(page);
  await settle(page);

  const buttons = page.locator("#button .docs-showcase");
  await snapshot(page, buttons, "docs-buttons-light.png");

  await page.locator("#docs-theme-tabs").getByRole("tab", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await snapshot(page, buttons, "docs-buttons-dark.png");
});

test("documentation form controls stay visually stable in light theme", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openDocs(page);
  await settle(page);

  await snapshot(page, page.locator("#input-field .docs-showcase"), "docs-forms-light.png");
});

test("dialog lifecycle documentation stays visually stable in light theme", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openDocs(page);
  await settle(page);

  await snapshot(page, page.locator("#modal .docs-grid"), "docs-dialog-lifecycle-light.png");
});

test("agent skill documentation stays visually stable in light theme", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openDocs(page);
  await settle(page);

  await snapshot(page, page.locator("#agent-skill .docs-grid"), "docs-agent-skill-light.png");
});

test("documentation tabs stay visually stable in light theme", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openDocs(page);
  await settle(page);

  await snapshot(page, page.locator("#tabs .docs-showcase").first(), "docs-tabs-pill-light.png");
  await snapshot(page, page.locator("#tabs > .docs-reference"), "docs-tabs-box-light.png");
});

test("documentation topbar stays visually stable at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await openDocs(page);
  await settle(page);

  const topbar = page.locator(".docs-shell > .ui-topbar");
  await snapshotInPlace(page, topbar, "docs-topbar-320-light.png");

  await page.locator("#docs-theme-tabs").getByRole("tab", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await snapshotInPlace(page, topbar, "docs-topbar-320-dark.png");
});

test("dashboard stays visually stable across themes", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openDashboard(page);
  await settle(page);

  const content = page.locator(".ui-app-shell__content");
  await snapshot(page, content, "dashboard-light.png");

  await page.locator("#dashboard-theme-tabs").getByRole("tab", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await snapshot(page, content, "dashboard-dark.png");
});

test("dashboard stays visually stable at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await openDashboard(page);
  await settle(page);

  const main = page.locator(".ui-app-shell__main");
  await snapshot(page, main, "dashboard-320-light.png");

  await page.locator("#dashboard-theme-tabs").getByRole("tab", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await snapshot(page, main, "dashboard-320-dark.png");
});
