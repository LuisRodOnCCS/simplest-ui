import type { Page } from "@playwright/test";

type Theme = "light" | "dark";

/** Opens the documentation with deterministic language and theme. */
export async function openDocs(page: Page, hash = "", theme: Theme = "light") {
  await page.addInitScript((value) => {
    localStorage.setItem("simplest-ui-docs-language", "en");
    localStorage.setItem("simplest-ui-docs-theme", value);
  }, theme);
  await page.goto(`/docs/index.html${hash}`);
  await page.locator("#content").waitFor();
}

/** Opens the Dashboard page with deterministic language and theme. */
export async function openDashboard(page: Page, theme: Theme = "light") {
  await page.addInitScript((value) => {
    localStorage.setItem("simplest-ui-docs-language", "en");
    localStorage.setItem("simplest-ui-docs-theme", value);
  }, theme);
  await page.goto("/docs/pages/dashboard.html");
  await page.locator(".docs-dashboard").waitFor();
}

/** Returns horizontal overflow in pixels for the current document. */
export async function horizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth - root.clientWidth;
  });
}
