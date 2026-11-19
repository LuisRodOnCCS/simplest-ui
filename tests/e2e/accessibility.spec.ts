import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { openDashboard } from "./helpers";

/** Presses Tab until the active element matches, or returns false. */
async function tabTo(page: Page, selector: string, maxPresses = 60) {
  for (let index = 0; index < maxPresses; index += 1) {
    await page.keyboard.press("Tab");

    if (await page.evaluate((target) => document.activeElement?.matches(target) ?? false, selector)) {
      return true;
    }
  }

  return false;
}

async function expectSkipLinkTransfer(page: Page) {
  const skipLink = page.locator(".ui-skip-link");
  await expect(skipLink).toBeFocused();

  const box = await skipLink.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeLessThan(viewport!.height);

  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
}

// Chromium and Firefox include links in sequential Tab navigation by default.
test("skip link receives sequential keyboard focus and moves focus to main", async ({ page, browserName }) => {
  test.skip(browserName === "webkit", "WebKit automation excludes links from the default Tab order; see the explicit-tabindex test.");

  await openDashboard(page);
  await page.keyboard.press("Tab");
  await expectSkipLinkTransfer(page);
});

// Playwright WebKit mimics Safari's default navigation, which moves Tab through
// form controls rather than links. An explicit tabindex="0" makes the anchor
// reachable in that configuration; this does not establish a universal
// requirement for native browsers whose Tab order already includes links.
test("skip link honors an explicit tabindex in WebKit automation", async ({ page, browserName }) => {
  test.skip(browserName !== "webkit", "Documents the WebKit automation behavior.");

  await openDashboard(page);
  await page.locator(".ui-skip-link").evaluate((element) => element.setAttribute("tabindex", "0"));
  await page.keyboard.press("Tab");
  await expectSkipLinkTransfer(page);
});

test("scrollable table is reachable, shows focus, and scrolls with the keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await openDashboard(page);

  expect(await tabTo(page, ".ui-table-wrap")).toBe(true);

  const wrapper = page.locator(".ui-table-wrap");
  expect(await wrapper.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
  expect(await wrapper.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);

  await page.keyboard.press("ArrowRight");
  await expect.poll(() => wrapper.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
});
