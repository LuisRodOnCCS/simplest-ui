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

test("dashboard keeps the sticky bar and sidebar visible while scrolling", async ({ page }) => {
  await openDashboard(page);

  // Force scrollable content.
  await page.locator(".ui-card").last().evaluate((el) => {
    (el as HTMLElement).style.height = "2000px";
  });

  const shell = page.locator(".docs-dashboard");
  const bar = page.locator(".docs-dashboard .ui-app-shell__bar");
  const sidebar = page.locator(".docs-dashboard .ui-app-shell__sidebar");
  const header = page.locator("#dashboard-header");

  const barBoxBefore = await bar.boundingBox();
  const sidebarBoxBefore = await sidebar.boundingBox();

  await shell.evaluate((el) => {
    (el as HTMLElement).scrollTop = 400;
  });

  await expect.poll(async () => header.getAttribute("class")).toContain("ui-app-shell__header--scrolled");

  const barBoxAfter = await bar.boundingBox();
  const sidebarBoxAfter = await sidebar.boundingBox();

  // Bar and sidebar stay in place (sticky) while content scrolls.
  expect(barBoxAfter?.y).toBeCloseTo(barBoxBefore?.y ?? 0, 0);
  expect(sidebarBoxAfter?.y).toBeCloseTo(sidebarBoxBefore?.y ?? 0, 0);

  // Floating mode: full border, radius, and top spacing matching main padding.
  await page.locator("#dashboard-header-mode").selectOption("floating");
  await expect.poll(async () => header.evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius))).toBeGreaterThan(0);
  const floatingStyles = await header.evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      borderTopWidth: s.borderTopWidth,
      borderRightWidth: s.borderRightWidth,
      borderBottomWidth: s.borderBottomWidth,
      borderLeftWidth: s.borderLeftWidth,
      borderRadius: s.borderTopLeftRadius,
      top: s.top,
    };
  });
  expect(floatingStyles.borderTopWidth).not.toBe("0px");
  expect(floatingStyles.borderRightWidth).not.toBe("0px");
  expect(floatingStyles.borderBottomWidth).not.toBe("0px");
  expect(floatingStyles.borderLeftWidth).not.toBe("0px");
  expect(floatingStyles.borderRadius).not.toBe("0px");
});

test("dashboard sidebar scrolls internally when the menu is long", async ({ page }) => {
  await openDashboard(page);

  const sidebar = page.locator(".docs-dashboard .ui-app-shell__sidebar");
  // Inject a long menu.
  await sidebar.evaluate((el) => {
    const nav = el.querySelector("nav") as HTMLElement;
    for (let i = 0; i < 60; i += 1) {
      const a = document.createElement("a");
      a.className = "ui-nav__item";
      a.href = "#";
      a.textContent = `Item ${i}`;
      nav.append(a);
    }
  });

  const before = await sidebar.evaluate((el) => el.scrollTop);
  await sidebar.evaluate((el) => {
    (el as HTMLElement).scrollTop = 200;
  });
  const after = await sidebar.evaluate((el) => el.scrollTop);

  expect(after).toBeGreaterThan(before);
});

test("short dashboard sidebar fills the remaining shell height", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openDashboard(page);
  await expect.poll(async () => {
    const shell = await page.locator(".docs-dashboard").boundingBox();
    const sidebar = await page.locator(".ui-app-shell__sidebar").boundingBox();
    return Math.abs((shell?.y ?? 0) + (shell?.height ?? 0) - (sidebar?.y ?? 0) - (sidebar?.height ?? 0));
  }).toBeLessThan(2);
});

test("dashboard sidebar returns to normal flow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await openDashboard(page);
  await expect(page.locator("#dashboard-menu-trigger")).toBeVisible();
  await expect(page.locator(".docs-dashboard .ui-app-shell__sidebar")).toHaveCount(0);
});

test("compact navigation opens, closes and returns to desktop without duplication", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await openDashboard(page);
  const trigger = page.locator("#dashboard-menu-trigger");
  const menu = page.locator("#dashboard-menu");
  await trigger.click();
  await expect(menu).toHaveAttribute("open", "");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(menu.getByRole("link", { name: "Projects" })).toBeVisible();
  const close = page.locator("#dashboard-menu-close");
  await expect(close).toBeFocused();
  await expect.poll(async () => {
    const triggerBox = await trigger.boundingBox();
    const closeBox = await close.boundingBox();
    return Math.max(Math.abs((triggerBox!.x + triggerBox!.width / 2) - (closeBox!.x + closeBox!.width / 2)), Math.abs(triggerBox!.y - closeBox!.y));
  }).toBeLessThan(2);
  await expect(page.locator(".ui-app-shell__sidebar")).toHaveCount(1);
  await expect(page.locator(".docs-dashboard")).toHaveCSS("overflow-y", "hidden");
  await page.keyboard.press("Escape");
  await expect(menu).not.toHaveAttribute("open", "");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(menu).toHaveAttribute("open", "");
  await close.click();
  await expect(menu).not.toHaveAttribute("open", "");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(menu).toHaveAttribute("open", "");
  await page.setViewportSize({ width: 1280, height: 700 });
  await expect(menu).not.toHaveAttribute("open", "");
  await expect(page.locator(".docs-dashboard .ui-app-shell__sidebar")).toBeVisible();
  await expect(page.locator(".ui-app-shell__sidebar")).toHaveCount(1);
  await expect(page.locator(".docs-dashboard")).toHaveCSS("overflow-y", "auto");
});

test("long sidebar supports independent wheel scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 });
  await openDashboard(page);
  const sidebar = page.locator(".ui-app-shell__sidebar");
  const shell = page.locator(".docs-dashboard");
  await sidebar.evaluate((element) => {
    const nav = element.querySelector("nav")!;
    for (let i = 0; i < 40; i++) {
      const link = document.createElement("a");
      link.href = "#dashboard";
      link.className = "ui-nav__item";
      link.textContent = `Test item ${i}`;
      nav.append(link);
    }
  });
  const shellBefore = await shell.evaluate((element) => element.scrollTop);
  await sidebar.hover();
  for (let i = 0; i < 8; i++) await page.mouse.wheel(0, 800);
  await expect.poll(() => sidebar.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await expect.poll(() => sidebar.evaluate((element) =>
    element.scrollHeight - element.clientHeight - element.scrollTop
  )).toBeLessThan(2);
  expect(await shell.evaluate((element) => element.scrollTop)).toBe(shellBefore);
});

test("native links support sequential navigation", async ({ page, browserName }) => {
  await page.setContent('<a href="#one">First</a><a href="#two">Second</a>');
  const second = page.getByRole("link", { name: "Second" });
  await page.getByRole("link", { name: "First" }).focus();
  await page.keyboard.press("Tab");
  if (browserName === "webkit" && !(await second.evaluate((element) => element === document.activeElement))) {
    await page.getByRole("link", { name: "First" }).focus();
    await page.keyboard.press("Alt+Tab");
    if (!(await second.evaluate((element) => element === document.activeElement))) {
      // WebKit automation can omit links from sequential focus; this is a fixture-only workaround.
      await second.evaluate((element) => element.setAttribute("tabindex", "0"));
      await page.getByRole("link", { name: "First" }).focus();
      await page.keyboard.press("Tab");
    }
  }
  await expect(second).toBeFocused();
});

test("long sidebar supports sequential keyboard navigation", async ({ page, browserName }) => {
  await page.setViewportSize({ width: 1280, height: 700 });
  await openDashboard(page);
  const sidebar = page.locator(".ui-app-shell__sidebar");
  await sidebar.evaluate((element, webkit) => {
    const nav = element.querySelector("nav")!;
    for (let i = 0; i < 40; i++) {
      const link = document.createElement("a");
      link.href = "#dashboard";
      link.className = "ui-nav__item";
      link.textContent = `Test item ${i}`;
      // Match the existing skip-link fixture for WebKit's automated Tab order.
      if (webkit) link.tabIndex = 0;
      nav.append(link);
    }
  }, browserName === "webkit");
  await sidebar.evaluate((element) => { element.scrollTop = 0; });
  await sidebar.getByRole("link", { name: "Test item 0" }).focus();
  for (let i = 0; i < 39; i++) await page.keyboard.press("Tab");
  const last = sidebar.getByRole("link", { name: "Test item 39" });
  await expect(last).toBeFocused();
  expect(await last.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
  await expect.poll(() => sidebar.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
});

test("floating header aligns after resize and respects reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1280, height: 800 });
  await openDashboard(page);
  const shell = page.locator(".docs-dashboard");
  const header = page.locator("#dashboard-header");
  await page.locator(".ui-card").last().evaluate((element) => { (element as HTMLElement).style.height = "2000px"; });
  await page.locator("#dashboard-header-mode").selectOption("floating");
  await shell.evaluate((element) => { element.scrollTop = 400; });
  await expect(header).toHaveClass(/--scrolled/);
  for (const width of [1280, 1000]) {
    await page.setViewportSize({ width, height: 800 });
    await expect.poll(async () => page.evaluate(() => {
      const header = document.querySelector<HTMLElement>("#dashboard-header")!.getBoundingClientRect();
      const bar = document.querySelector<HTMLElement>(".ui-app-shell__bar")!.getBoundingClientRect();
      const main = document.querySelector<HTMLElement>(".ui-app-shell__main")!;
      const box = main.getBoundingClientRect();
      const style = getComputedStyle(main);
      return Math.max(
        Math.abs(header.top - bar.bottom - parseFloat(style.paddingTop)),
        Math.abs(header.left - box.left - parseFloat(style.paddingLeft)),
        Math.abs(box.right - header.right - parseFloat(style.paddingRight))
      );
    })).toBeLessThan(2);
  }
  const durations = await header.evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(durations.split(",").every((value) => parseFloat(value) === 0)).toBe(true);
});
