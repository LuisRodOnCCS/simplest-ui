import { expect, test } from "@playwright/test";

test("vanilla fixture loads individual CSS and one Web Component", async ({ page }) => {
  await page.goto("/tests/fixtures/vanilla/index.html");

  const button = page.locator("#primary");
  await expect(button).toBeVisible();
  await expect(button).toHaveCSS("background-image", /linear-gradient/);

  await expect(page.locator("#card")).toHaveCSS("border-radius", /px/);

  await expect.poll(() => page.evaluate(() => Boolean(customElements.get("sui-drawer")))).toBe(true);
  await page.evaluate(() => {
    (document.querySelector("#drawer") as HTMLElement & { open: boolean }).open = true;
  });
  await expect(page.locator("#drawer")).toHaveAttribute("open", "");
});

test("Laravel-style Vite fixture loads package entrypoints", async ({ page }) => {
  await page.goto("/tests/fixtures/laravel/index.html");

  const button = page.locator("#primary");
  await expect(button).toBeVisible();
  await expect(button).toHaveCSS("background-image", /linear-gradient/);
  await expect(page.locator("#card")).toHaveCSS("border-radius", /px/);

  await expect.poll(() => page.evaluate(() => Boolean(customElements.get("sui-drawer")))).toBe(true);
  await page.evaluate(() => {
    (document.querySelector("#drawer") as HTMLElement & { open: boolean }).open = true;
  });
  await expect(page.locator("#drawer")).toHaveAttribute("open", "");
});
