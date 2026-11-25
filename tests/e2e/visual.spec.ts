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

/**
 * Stabilizes screenshot coordinates. Fractional layout offsets shift element
 * captures by a pixel when surrounding content changes height, which makes
 * unrelated baselines fail. The target is offset by less than a pixel to sit on
 * whole coordinates and restored after the capture.
 */
async function stabilize(target: Locator) {
  await target.evaluate((element) => {
    const html = element as HTMLElement;
    const scroller = document.scrollingElement ?? document.documentElement;
    scroller.scrollTop = Math.round(scroller.scrollTop);
    scroller.scrollLeft = Math.round(scroller.scrollLeft);

    const rect = element.getBoundingClientRect();
    const dx = rect.left - Math.round(rect.left);
    const dy = rect.top - Math.round(rect.top);
    const style = getComputedStyle(html);
    html.dataset.suiSnapshotPosition = `${style.position}|${html.style.top}|${html.style.left}`;
    if (style.position === "static") {
      html.style.position = "relative";
    }
    if (Math.abs(dy) > 0.01) {
      html.style.top = `${-dy}px`;
    }
    if (Math.abs(dx) > 0.01) {
      html.style.left = `${-dx}px`;
    }
  });
}

async function restore(target: Locator) {
  await target.evaluate((element) => {
    const html = element as HTMLElement;
    const [position = "", top = "", left = ""] = (html.dataset.suiSnapshotPosition ?? "").split("|");
    html.style.position = position;
    html.style.top = top;
    html.style.left = left;
    delete html.dataset.suiSnapshotPosition;
  });
}

async function snapshot(page: Page, target: Locator, name: string) {
  await target.scrollIntoViewIfNeeded();
  await target.evaluate((element) => element.scrollIntoView({ block: "center", inline: "nearest" }));
  await stabilize(target);
  await page.mouse.move(1, 1);
  await expect(target).toHaveScreenshot(name);
  await restore(target);
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

test("interactive avatar groups stay visually stable when expanded", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openDocs(page);
  await settle(page);
  const group = page.locator("#avatar-group sui-avatar-group").first();
  const preview = page.locator("#avatar-group .docs-preview").first();
  await preview.evaluate(element => element.scrollIntoView({ block: "center", inline: "nearest" }));
  await stabilize(preview);
  await page.mouse.move(1, 1);
  await group.evaluate((element) => { (element as HTMLElement & { open: boolean }).open = true; });
  await expect(group).toHaveAttribute("open", "");
  await expect(preview).toHaveScreenshot("docs-avatar-group-expanded-light.png");
  await expect(group).toHaveAttribute("open", "");
  await restore(preview);
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

test("Laravel integration documentation keeps the preview and code sequence", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openDocs(page);
  await settle(page);

  await snapshot(page, page.locator("#laravel-vite .docs-guide-stack"), "docs-laravel-vite-light.png");
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
