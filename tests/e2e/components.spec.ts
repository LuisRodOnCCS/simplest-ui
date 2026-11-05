import { expect, test } from "@playwright/test";
import { openDocs } from "./helpers";

test.beforeEach(async ({ page }) => {
  await openDocs(page);
});

test("modal opens, closes with Escape, and restores focus", async ({ page }) => {
  const trigger = page.locator("[data-open-modal]");
  const modal = page.locator("#docs-modal");

  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(modal).toHaveAttribute("open", "");

  await page.keyboard.press("Escape");
  await expect(modal).not.toHaveAttribute("open", "");
  await expect(trigger).toBeFocused();
});

test("drawer opens, closes with Escape, and restores focus", async ({ page }) => {
  const trigger = page.locator("[data-open-drawer]");
  const drawer = page.locator("#docs-drawer");

  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(drawer).toHaveAttribute("open", "");

  await page.keyboard.press("Escape");
  await expect(drawer).not.toHaveAttribute("open", "");
  await expect(trigger).toBeFocused();
});

test("dropdown opens with the keyboard and closes with Escape", async ({ page }) => {
  const dropdown = page.locator("#dropdown sui-dropdown");
  const trigger = dropdown.locator(".trigger");

  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(dropdown).toHaveAttribute("open", "");
  await expect(dropdown.getByRole("menuitem", { name: "Export" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dropdown).not.toHaveAttribute("open", "");
  await expect(trigger).toBeFocused();
});

test("tabs switch panels in pill and box variants", async ({ page }) => {
  const pills = page.locator("#tabs sui-tabs").first();
  const security = pills.getByRole("tab", { name: "Security" });

  await security.click({ force: true });
  await expect(security).toHaveAttribute("aria-selected", "true");
  await expect(page.locator('#tabs [data-tab="security"]')).toBeVisible();
  await expect(page.locator('#tabs [data-tab="general"]')).toBeHidden();

  const box = page.locator('#tabs sui-tabs[variant="box"]');
  const light = box.getByRole("tab", { name: "Light" });

  await light.click({ force: true });
  await expect(light).toHaveAttribute("aria-selected", "true");
});

test("disabled tabs stay unselectable", async ({ page }) => {
  const pills = page.locator("#tabs sui-tabs").first();
  const disabled = pills.getByRole("tab", { name: "Disabled" });

  await expect(disabled).toHaveAttribute("aria-disabled", "true");
  await disabled.click({ force: true });
  await expect(disabled).toHaveAttribute("aria-selected", "false");
});

test("accordion expands another section", async ({ page }) => {
  const accordion = page.locator("#accordion sui-accordion");
  const history = accordion.getByRole("button", { name: "History" });

  await history.click({ force: true });
  await expect(history).toHaveAttribute("aria-expanded", "true");
  await expect(accordion.locator(".ui-accordion__item").nth(1)).toHaveClass(/open/);
});

test("popover opens and closes with Escape", async ({ page }) => {
  const popover = page.locator("#popover sui-popover");

  await popover.locator('[slot="trigger"]').click({ force: true });
  await expect(popover).toHaveAttribute("open", "");

  await page.keyboard.press("Escape");
  await expect(popover).not.toHaveAttribute("open", "");
});

test("tooltip appears on hover or focus", async ({ page }, testInfo) => {
  const tooltip = page.locator("#tooltip sui-tooltip").first();
  const trigger = tooltip.locator("button");

  if (testInfo.project.name === "webkit") {
    // Linux WebKit can hang while scrolling a pointer target into view. Focus
    // exercises the equivalent keyboard-accessible tooltip behavior.
    await trigger.evaluate((element) => (element as HTMLButtonElement).focus());
  } else {
    await trigger.hover();
  }

  await expect(tooltip.locator(".ui-tooltip__content")).toHaveCSS("opacity", "1");
});

test("toast announces a message", async ({ page }) => {
  await page.locator("[data-show-toast]").click({ force: true });

  const toast = page.locator(".ui-toast");
  await expect(toast).toBeVisible();
  await expect(toast).toHaveRole("status");
  await expect(toast).toContainText("Changes saved");
});
