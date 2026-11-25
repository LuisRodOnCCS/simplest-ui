import { expect, test } from "@playwright/test";
import { openDocs } from "./helpers";
import { readFileSync } from "node:fs";

const { version } = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as { version: string };

test("release badge and support line follow package metadata in both languages", async ({ page }) => {
  await openDocs(page);
  const releaseLine = `${version.split(".").slice(0, 2).join(".")}.x`;
  for (const width of [1280, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const language of ["EN", "ES"]) {
      await page.locator("#docs-language-tabs").getByRole("tab", { name: language, exact: true }).click({ force: true });
      await expect(page.locator("#overview .docs-hero__meta .ui-badge").first()).toHaveText(`v${version}`);
      await expect(page.locator("#support .docs-section__heading p")).toContainText(releaseLine);
      await expect(page.locator("#support .docs-api").filter({ hasText: "React, Vue" })).toContainText(releaseLine);
      await expect(page.locator("#support")).not.toContainText("0.2.x");
    }
  }
});

test("catalog navigation exposes every current entry", async ({ page }) => {
  await openDocs(page);

  for (const id of ["button", "topbar", "support", "agent-skill", "vanilla-vite", "laravel-vite", "laravel-package", "dashboard"]) {
    await expect(page.locator(`[data-nav-id="${id}"]`)).toBeVisible();
  }
});

test("integration guides keep every code block below its preview", async ({ page }) => {
  await openDocs(page);

  for (const id of ["vanilla-vite", "laravel-vite", "laravel-package"]) {
    const section = page.locator(`#${id}`);
    const cards = section.locator(".docs-showcase");
    await expect(cards).toHaveCount(2);

    for (let index = 0; index < await cards.count(); index += 1) {
      const card = cards.nth(index);
      await expect(card.locator(":scope > .docs-preview")).toHaveCount(1);
      await expect(card.locator(":scope > pre.docs-code")).toHaveCount(1);
    }
  }
});

test("additional examples render as variants with preview and code", async ({ page }) => {
  await openDocs(page);

  for (const id of ["button", "input-field", "table"]) {
    const variants = page.locator(`#${id} .docs-variant`);
    await expect(variants).toHaveCount(1);
    await expect(variants.locator(".docs-variant__preview")).toHaveCount(1);
    await expect(variants.locator("pre.docs-code")).toHaveCount(1);
  }
});

test("switches language and rerenders the documentation", async ({ page }) => {
  await openDocs(page);

  await page.locator("#docs-language-tabs").getByRole("tab", { name: "ES" }).click({ force: true });
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.locator('[data-nav-id="support"]')).toContainText("Soporte");
  await expect(page.locator("#laravel-vite .docs-guide-preview").first()).toContainText("Ejecuta el generador");
  await expect(page.locator("#modal .docs-api")).toContainText("el fondo permanece inerte");
  await expect(page.locator("#drawer .docs-api")).toContainText("updateComplete no espera");

  await page.locator("#docs-language-tabs").getByRole("tab", { name: "EN" }).click({ force: true });
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#laravel-vite .docs-guide-preview").first()).toContainText("Run the generator");
  await expect(page.locator("#vanilla-vite .docs-section__heading p")).toContainText("A minimal Vite project");
  await expect(page.locator("#modal .docs-api")).toContainText("background content stays inert");
});

test("overlay lifecycle examples show events and provide copyable code", async ({ page }) => {
  await openDocs(page);
  for (const kind of ["modal", "drawer"]) {
    const section = page.locator(`#${kind}`);
    await expect(section.locator(".docs-guide-stack pre code")).toContainText("sui-close");
    await section.locator(`.docs-guide-stack button[data-lifecycle-open="${kind}"]`).click();
    await expect(section.locator("[data-overlay-status]")).toHaveText("Open");
    await page.keyboard.press("Escape");
    await expect(section.locator("[data-overlay-status]")).toHaveText("Closed: escape");
  }
});

test("documentation navigation waits for exit and follows the latest breakpoint", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 700, height: 800 });
  await openDocs(page);
  const menu = page.locator("#docs-menu");
  await menu.evaluate(element => (element as HTMLElement).style.setProperty("--sui-duration-normal", "2s"));
  await page.locator("#docs-menu-trigger").click();
  await expect(menu).toHaveAttribute("open", "");
  await page.setViewportSize({ width: 1200, height: 800 });
  await expect(menu).not.toHaveAttribute("open");
  await expect(menu.locator("#docs-nav")).toHaveCount(1);
  expect(await menu.locator("dialog").evaluate(dialog => dialog.matches(":modal"))).toBe(true);
  await page.setViewportSize({ width: 700, height: 800 });
  await menu.evaluate(element => element.shadowRoot!.querySelectorAll("*").forEach(child =>
    child.getAnimations().forEach(animation => animation.finish())
  ));
  await expect(menu.locator("dialog")).toHaveCount(0);
  await expect(menu.locator("#docs-nav")).toHaveCount(1);
  await expect(page.locator("#docs-nav")).toHaveCount(1);
});

test("applies light and dark themes", async ({ page }) => {
  await openDocs(page);

  await page.locator("#docs-theme-tabs").getByRole("tab", { name: "Dark" }).click({ force: true });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.locator("#docs-theme-tabs").getByRole("tab", { name: "Light" }).click({ force: true });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("search filters navigation entries", async ({ page }) => {
  await openDocs(page);

  await page.locator(".docs-search").fill("topbar");
  await expect(page.locator('[data-nav-id="topbar"]')).not.toHaveClass(/docs-filtered/);
  await expect(page.locator('[data-nav-id="button"]')).toHaveClass(/docs-filtered/);
});
