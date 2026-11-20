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
  for (const selector of [".ui-app-shell__bar", "#dashboard-header"]) {
    const overflow = await page.locator(selector).evaluate((element) => element.scrollWidth - element.clientWidth);
    expect(overflow, selector).toBeLessThanOrEqual(1);
  }
});

test("public bars wrap groups of controls at narrow widths", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await openDashboard(page);
  const bars = await page.evaluate(() => {
    const result: Array<{ overflow: number; hidden: number }> = [];
    for (const className of ["ui-topbar", "ui-app-shell__bar", "ui-app-shell__header"]) {
      const bar = document.createElement("header");
      bar.className = className;
      bar.style.width = "280px";
      bar.innerHTML = '<strong>Long workspace name</strong><div class="ui-cluster"><button type="button">Settings</button><button type="button">Projects</button><select aria-label="Theme"><option>System</option></select></div>';
      document.body.append(bar);
      result.push({
        overflow: bar.scrollWidth - bar.clientWidth,
        hidden: [...bar.querySelectorAll("button, select")].filter((element) => getComputedStyle(element).display === "none").length
      });
      bar.remove();
    }
    return result;
  });
  for (const bar of bars) {
    expect(bar.overflow).toBeLessThanOrEqual(1);
    expect(bar.hidden).toBe(0);
  }
});

test("dashboard bar keeps controls in one row on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openDashboard(page);
  const brand = await page.locator(".docs-dashboard .docs-brand").boundingBox();
  for (const selector of ["#dashboard-header-mode", "#dashboard-language-tabs", "#dashboard-theme-tabs"]) {
    const box = await page.locator(selector).boundingBox();
    expect(Math.abs((box!.y + box!.height / 2) - (brand!.y + brand!.height / 2)), selector).toBeLessThan(3);
  }
});

test("mobile brands keep text and images visible", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await openDashboard(page);
  await expect(page.locator(".docs-dashboard .docs-brand span").last()).toBeVisible();
  const dimensions = await page.evaluate(() => {
    const brand = document.createElement("div");
    brand.className = "ui-topbar__brand";
    brand.innerHTML = '<img alt="Brand" width="80" height="40" src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2240%22/%3E"><span>Brand name</span>';
    const topbar = document.createElement("header");
    topbar.className = "ui-topbar";
    topbar.append(brand);
    document.body.append(topbar);
    const image = brand.querySelector("img")!.getBoundingClientRect();
    const result = { width: image.width, height: image.height, text: brand.querySelector("span")!.getBoundingClientRect().width, overflow: topbar.scrollWidth - topbar.clientWidth };
    topbar.remove();
    return result;
  });
  expect(dimensions.width).toBeGreaterThan(0);
  expect(dimensions.height).toBeGreaterThan(0);
  expect(dimensions.width / dimensions.height).toBeCloseTo(2, 1);
  expect(dimensions.text).toBeGreaterThan(0);
  expect(dimensions.overflow).toBeLessThanOrEqual(1);
});

test("ui-grid--auto uses one column at 320px and multiple columns above the breakpoint", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await openDashboard(page);

  const grid = page.locator(".ui-grid--auto").first();
  expect(await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(1);

  await page.setViewportSize({ width: 1024, height: 800 });
  await expect.poll(() => grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBeGreaterThan(1);
});
