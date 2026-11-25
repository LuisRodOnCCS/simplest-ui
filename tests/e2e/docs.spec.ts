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
  await expect(page.locator("#radio .docs-section__heading p")).toHaveText("Agrupa opciones relacionadas mediante el mismo atributo name.");
  await expect(page.locator("#avatar-group .docs-api")).toContainText("el desplazamiento externo inicia el cierre animado");
  await expect(page.locator("#avatar-group .docs-api")).toContainText("las animaciones JavaScript usan ease");
  await expect(page.locator("#avatar-group .docs-variant h4")).toHaveText("Nombres visibles y desplazamiento");
  await expect(page.locator("#avatar-group .docs-variant__preview sui-avatar-group")).toHaveAttribute("label", "Integrantes del equipo");

  await page.locator("#docs-language-tabs").getByRole("tab", { name: "EN" }).click({ force: true });
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#laravel-vite .docs-guide-preview").first()).toContainText("Run the generator");
  await expect(page.locator("#vanilla-vite .docs-section__heading p")).toContainText("A minimal Vite project");
  await expect(page.locator("#modal .docs-api")).toContainText("background content stays inert");
  await expect(page.locator("#radio .docs-section__heading p")).toHaveText("Group related options using the same name attribute.");
  await expect(page.locator("#avatar-group .docs-api")).toContainText("external scrolling starts an animated close");
  await expect(page.locator("#avatar-group .docs-variant h4")).toHaveText("Visible names and scrolling");
  await expect(page.locator("#avatar-group .docs-variant__preview sui-avatar-group")).toHaveAttribute("label", "Team members");
});

for (const width of [1280, 375]) {
  test(`language changes preserve the reading position and focus at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await openDocs(page, "#radio");
    for (const id of ["radio", "modal"]) {
      await page.locator(`#${id}`).evaluate(element => window.scrollTo(0, window.scrollY + element.getBoundingClientRect().top - 180));
      const before = await page.locator(`#${id}`).evaluate(element => element.getBoundingClientRect().top);
      const originalHash = new URL(page.url()).hash;
      for (const [tab, lang] of [["ES", "es"], ["EN", "en"], ["ES", "es"], ["EN", "en"]]) {
        await page.locator("#docs-language-tabs").getByRole("tab", { name: tab, exact: true }).click();
        await expect(page.locator("html")).toHaveAttribute("lang", lang);
        await expect(page.locator("#docs-language-tabs").getByRole("tab", { name: tab, exact: true })).toBeFocused();
        await expect.poll(async () => Math.abs(
          await page.locator(`#${id}`).evaluate(element => element.getBoundingClientRect().top) - before
        )).toBeLessThan(5);
        expect(new URL(page.url()).hash).toBe(originalHash);
      }
    }
  });
}

test("language changes preserve the search filter and navigation scroll", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openDocs(page);
  const nav = page.locator("#docs-nav");
  await nav.evaluate(element => { element.scrollTop = 180; });
  const before = await nav.evaluate(element => element.scrollTop);
  await page.locator("#docs-language-tabs").getByRole("tab", { name: "ES", exact: true }).click();
  expect(await page.locator("#docs-nav").evaluate(element => element.scrollTop)).toBe(before);
  await page.locator(".docs-search").fill("radio");
  await page.locator("#docs-language-tabs").getByRole("tab", { name: "EN", exact: true }).click();
  await expect(page.locator(".docs-search")).toHaveValue("radio");
  await expect(page.locator("#radio")).not.toHaveClass(/docs-filtered/);
  await expect(page.locator("#button")).toHaveClass(/docs-filtered/);
});

test("keyboard language switching retains focus without moving the reading position", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openDocs(page);
  await page.locator("#radio").evaluate(element => window.scrollTo(0, window.scrollY + element.getBoundingClientRect().top - 180));
  const before = await page.locator("#radio").evaluate(element => element.getBoundingClientRect().top);
  await page.locator("#docs-language-tabs").getByRole("tab", { name: "EN", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#docs-language-tabs").getByRole("tab", { name: "ES", exact: true })).toBeFocused();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect.poll(async () => Math.abs(
    await page.locator("#radio").evaluate(element => element.getBoundingClientRect().top) - before
  )).toBeLessThan(3);
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

test("interactive avatar examples show a count and optional names", async ({ page }) => {
  await openDocs(page);
  const groups = page.locator("#avatar-group sui-avatar-group");
  const compact = groups.first();
  const button = compact.getByRole("button", { name: "Team members" });
  await expect(compact.locator(".surface .count")).toHaveText("+2");
  await compact.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await button.hover();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await expect(compact.locator(".surface .name")).toHaveCount(0);
  await page.mouse.move(1, 1);
  const named = groups.nth(1);
  const namedButton = named.getByRole("button", { name: "Team members" });
  await namedButton.focus();
  await expect(namedButton).toHaveAttribute("aria-expanded", "true");
  await expect(named.locator(".surface .name")).toHaveText(["Ada Lovelace", "Grace Hopper", "Katherine Johnson", "Mary Jackson"]);
  const scrolling = page.locator("#avatar-group .docs-variant__preview sui-avatar-group");
  await expect(scrolling.locator("span.ui-avatar")).toHaveCount(6);
  await expect(page.locator("#avatar-group .docs-variant pre")).toContainText("--sui-avatar-group-visible-rows: 3");
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
