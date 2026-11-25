import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => Boolean(customElements.get("sui-avatar-group")));
});

test("shows three avatars and a count, then expands the same surface", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => {
    document.body.innerHTML = `<div style="padding: 80px"><sui-avatar-group label="Team">
      ${Array.from({ length: 7 }, (_, i) => `<span class="ui-avatar" aria-label="Person ${i}">${i}</span>`).join("")}
    </sui-avatar-group><button id="next">Next</button></div>`;
  });
  const group = page.locator("sui-avatar-group");
  const trigger = group.getByRole("button", { name: "Team" });
  const surface = group.locator(".surface");
  const next = page.locator("#next");
  const before = await next.boundingBox();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(surface.locator(".count")).toHaveText("+4");
  await expect(group.getByRole("list", { name: "Team" }).getByRole("listitem")).toHaveCount(7);
  const extras = surface.locator(".extra");
  await expect(extras).toHaveCount(4);
  expect(await extras.first().evaluate(el => el.getBoundingClientRect().width)).toBe(0);
  await trigger.hover();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(await extras.first().evaluate(el => el.getBoundingClientRect().width)).toBeGreaterThan(0);
  expect(await surface.locator(".count").evaluate(el => getComputedStyle(el).opacity)).toBe("0");
  const spacing = await surface.evaluate(el => {
    const box = el.getBoundingClientRect();
    const members = el.querySelectorAll<HTMLElement>(".member:not(.count)");
    const first = members[0].getBoundingClientRect();
    const last = members[members.length - 1].getBoundingClientRect();
    const style = getComputedStyle(el);
    return { left: first.left - box.left, right: box.right - last.right,
      padding: parseFloat(style.paddingLeft), radius: style.borderRadius };
  });
  expect(spacing.padding).toBeLessThanOrEqual(2);
  expect(Math.abs(spacing.left - spacing.right)).toBeLessThan(1);
  expect(parseFloat(spacing.radius)).toBeGreaterThanOrEqual(999);
  await expect(group.getByRole("list", { name: "Team" }).getByRole("listitem")).toHaveCount(7);
  expect(await next.boundingBox()).toEqual(before);
  await page.mouse.move(0, 0);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(await next.boundingBox()).toEqual(before);
});

test("optional names and dynamic member changes remain accessible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => {
    document.body.innerHTML = `<sui-avatar-group label="Team">
      <span class="ui-avatar" aria-label="Ada Lovelace">AL</span>
      <span class="ui-avatar"><img alt="Grace Hopper" src="/missing.png"></span>
    </sui-avatar-group>`;
  });
  const group = page.locator("sui-avatar-group");
  const trigger = group.getByRole("button", { name: "Team" });
  const surface = group.locator(".surface");
  await trigger.focus();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(surface.locator(".name")).toHaveCount(0);
  await group.evaluate(el => el.setAttribute("show-names", ""));
  await expect(surface.locator(".name")).toHaveText(["Ada Lovelace", "Grace Hopper"]);
  await group.locator("span[aria-label='Ada Lovelace']").evaluate(el => el.setAttribute("aria-label", "Ada"));
  await expect(group.getByRole("list", { name: "Team" }).getByRole("listitem").first()).toHaveText("Ada");
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Space");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("wraps expanded avatars and limits height without moving its neighbors", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 400 });
  await page.evaluate(() => {
    document.body.innerHTML = `<sui-avatar-group label="Team">
      ${Array.from({ length: 30 }, (_, i) => `<span class="ui-avatar" aria-label="Person ${i}">${i}</span>`).join("")}
    </sui-avatar-group><button id="next">Next</button>`;
  });
  const group = page.locator("sui-avatar-group");
  const trigger = group.getByRole("button", { name: "Team" });
  const surface = group.locator(".surface");
  const before = await page.locator("#next").boundingBox();
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  const rows = await surface.locator(".member:not(.count)").evaluateAll(items =>
    new Set(items.map(item => Math.round(item.getBoundingClientRect().top))).size
  );
  expect(rows).toBeGreaterThan(1);
  const box = (await surface.boundingBox())!;
  expect(box.width).toBeLessThanOrEqual(304);
  expect(box.height).toBeLessThanOrEqual(384);
  expect(await page.locator("#next").boundingBox()).toEqual(before);
});

test("named groups scroll vertically and escape clipping ancestors", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 400 });
  await page.evaluate(() => {
    document.body.innerHTML = `<div style="position:absolute;right:0;bottom:0;width:120px;height:50px;overflow:hidden">
      <sui-avatar-group label="Team" show-names style="--sui-avatar-group-visible-rows: 3">
      ${Array.from({ length: 10 }, (_, i) => `<span class="ui-avatar" aria-label="Person ${i}">${i}</span>`).join("")}
      </sui-avatar-group></div>`;
  });
  const group = page.locator("sui-avatar-group");
  const trigger = group.getByRole("button", { name: "Team" });
  const surface = group.locator(".surface");
  await trigger.focus();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  const info = await surface.evaluate(el => {
    const rect = el.getBoundingClientRect();
    const members = [...el.querySelectorAll<HTMLElement>(".member:not(.count)")];
    return { topLayer: el.matches(":popover-open"), width: rect.right, bottom: rect.bottom,
      height: rect.height, scroll: el.scrollHeight, tops: members.slice(0, 3).map(member => member.getBoundingClientRect().top),
      radius: parseFloat(getComputedStyle(el).borderRadius) };
  });
  expect(info.topLayer).toBe(true);
  expect(info.width).toBeLessThanOrEqual(312);
  expect(info.bottom).toBeLessThanOrEqual(392);
  expect(info.scroll).toBeGreaterThan(info.height);
  expect(info.height).toBeLessThanOrEqual(155);
  expect(info.tops[0]).toBeLessThan(info.tops[1]);
  expect(info.tops[1]).toBeLessThan(info.tops[2]);
  expect(info.radius).toBeLessThan(100);
  await page.keyboard.press("ArrowDown");
  expect(await surface.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  const previous = await surface.evaluate(el => el.scrollTop);
  await surface.hover();
  await page.mouse.wheel(0, 80);
  await expect.poll(() => surface.evaluate(el => el.scrollTop)).toBeGreaterThan(previous);
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
});

test("external scrolling closes either group without moving its neighbors", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => {
    document.body.innerHTML = `<div id="scroller" style="height:150px;overflow:auto">
      <div style="height:800px"><sui-avatar-group label="Team">
      <span class="ui-avatar" aria-label="Ada">AL</span></sui-avatar-group></div></div>`;
  });
  const group = page.locator("sui-avatar-group");
  const trigger = group.getByRole("button", { name: "Team" });
  for (const names of [false, true]) {
    await group.evaluate((el, enabled) => el.toggleAttribute("show-names", enabled), names);
    await trigger.focus();
    await trigger.press("Enter");
    if (await trigger.getAttribute("aria-expanded") === "false") await trigger.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.locator("#scroller").evaluate(el => { el.scrollTop += 30; });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(group).not.toHaveAttribute("data-expanded");
    await trigger.blur();
  }
});

test("external scrolling plays the exit animation in both modes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const names of [false, true]) {
    await page.evaluate(showNames => {
      document.body.innerHTML = `<div id="scroller" style="height:150px;overflow:auto">
        <div style="height:800px"><sui-avatar-group label="Team" ${showNames ? "show-names" : ""} style="--sui-duration-normal: 1s">
        ${Array.from({ length: 5 }, (_, i) => `<span class="ui-avatar" aria-label="Person ${i}">${i}</span>`).join("")}
        </sui-avatar-group></div></div>`;
    }, names);
    const group = page.locator("sui-avatar-group");
    const surface = group.locator(".surface");
    const trigger = group.getByRole("button", { name: "Team" });
    await trigger.focus();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await surface.evaluate(el => el.getAnimations().forEach(animation => animation.finish()));
    await page.locator("#scroller").evaluate(el => { el.scrollTop = 30; });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(group).toHaveAttribute("data-expanded", "");
    await expect.poll(() => surface.evaluate(el => el.getAnimations().some(animation => Number(animation.currentTime) > 0))).toBe(true);
    await expect(group).not.toHaveAttribute("data-expanded", { timeout: 3000 });
  }
});

test("avatar-only expansion preserves compact surface height for all sizes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const size of ["ui-avatar--sm", "", "ui-avatar--lg"]) {
    await page.evaluate(size => {
      document.body.innerHTML = `<sui-avatar-group label="Team"><span class="ui-avatar ${size}" aria-label="Ada">AL</span></sui-avatar-group>`;
    }, size);
    const group = page.locator("sui-avatar-group");
    const surface = group.locator(".surface");
    const before = (await surface.boundingBox())!.height;
    await group.getByRole("button", { name: "Team" }).focus();
    await expect(group).toHaveAttribute("open");
    expect(Math.abs((await surface.boundingBox())!.height - before)).toBeLessThan(0.5);
  }
});

test("opening animation does not temporarily wrap a row that fits", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => {
    document.body.innerHTML = `<sui-avatar-group label="Team" style="--sui-duration-normal: 1s">
      ${Array.from({ length: 5 }, (_, i) => `<span class="ui-avatar" aria-label="Person ${i}">${i}</span>`).join("")}
    </sui-avatar-group>`;
  });
  const group = page.locator("sui-avatar-group");
  await group.getByRole("button", { name: "Team" }).focus();
  const rows = await group.locator(".surface").evaluate(async el => {
    const samples: number[] = [];
    for (let i = 0; i < 12; i++) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      samples.push(new Set([...el.querySelectorAll(".member:not(.count)")].map(item => Math.round(item.getBoundingClientRect().top))).size);
    }
    return samples;
  });
  expect(rows.every(count => count === 1)).toBe(true);
});

test("Escape closes a focused group before its enclosing modal", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(async () => {
    document.body.innerHTML = `<sui-modal label="Dialog"><div id="target"></div></sui-modal>`;
    const modal = document.querySelector("sui-modal") as HTMLElement & { open: boolean; updateComplete: Promise<boolean> };
    await modal.updateComplete;
    modal.open = true;
    await modal.updateComplete;
    document.querySelector("#target")!.innerHTML = `<sui-avatar-group label="Team"><span class="ui-avatar" aria-label="Ada">AL</span></sui-avatar-group>`;
  });
  const group = page.locator("sui-avatar-group");
  const trigger = group.getByRole("button", { name: "Team" });
  await trigger.focus();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("sui-modal")).toHaveAttribute("open", "");
  await page.keyboard.press("Escape");
  await expect(page.locator("sui-modal")).not.toHaveAttribute("open");
});

test("expands and collapses with animation when motion is allowed", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => {
    document.body.innerHTML = `<sui-avatar-group label="Team" style="--sui-duration-normal: 2s">
      ${Array.from({ length: 5 }, (_, i) => `<span class="ui-avatar" aria-label="Person ${i}">${i}</span>`).join("")}
    </sui-avatar-group>`;
  });
  const group = page.locator("sui-avatar-group");
  await group.getByRole("button", { name: "Team" }).click();
  const surface = group.locator(".surface");
  await expect.poll(() => surface.evaluate(el => el.getAnimations().some(a => Number(a.currentTime) > 0))).toBe(true);
  expect(await surface.locator(".member:not(.count)").nth(1).evaluate(el => el.getAnimations().length)).toBeGreaterThan(0);
  const count = surface.locator(".count");
  expect(await count.evaluate(el => el.getAnimations().length)).toBeGreaterThan(0);
  await surface.evaluate(el => el.getAnimations().forEach(animation => animation.finish()));
  await group.evaluate(el => { (el as HTMLElement & { open: boolean }).open = false; });
  await expect.poll(() => surface.evaluate(el => el.getAnimations().some(a => Number(a.currentTime) > 0))).toBe(true);
  const countFrames = await count.evaluate(el => (el.getAnimations()[0].effect as KeyframeEffect).getKeyframes().map(frame => frame.opacity));
  expect(countFrames).toEqual(["0", "0", "1"]);
  const frames = await surface.locator(".member:not(.count)").first().evaluate(el =>
    (el.getAnimations()[0].effect as KeyframeEffect).getKeyframes().map(frame => frame.transform));
  expect(frames.every(frame => !String(frame).includes("scale"))).toBe(true);
});

test("named group remains vertical throughout its exit animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => {
    document.body.innerHTML = `<sui-avatar-group label="Team" show-names style="--sui-duration-normal: 1s">
      ${Array.from({ length: 4 }, (_, i) => `<span class="ui-avatar" aria-label="Person ${i}">${i}</span>`).join("")}
    </sui-avatar-group>`;
  });
  const group = page.locator("sui-avatar-group");
  await group.getByRole("button", { name: "Team" }).focus();
  await expect(group).toHaveAttribute("data-expanded", "");
  await group.evaluate(el => { (el as HTMLElement & { open: boolean }).open = false; });
  const surface = group.locator(".surface");
  await expect(group).toHaveAttribute("data-expanded", "");
  expect(await surface.evaluate(el => getComputedStyle(el).flexDirection)).toBe("column");
  await expect.poll(() => surface.evaluate(el => el.getAnimations().some(animation => Number(animation.currentTime) > 0))).toBe(true);
  await expect(group).not.toHaveAttribute("data-expanded", { timeout: 3000 });
});

test.describe("touch", () => {
  test.use({ hasTouch: true });
  test("tapping toggles the group and tapping outside closes it", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.evaluate(() => {
      document.body.innerHTML = `<sui-avatar-group label="Team"><span class="ui-avatar" aria-label="Ada">AL</span></sui-avatar-group><button id="outside">Outside</button>`;
    });
    const trigger = page.getByRole("button", { name: "Team" });
    await trigger.tap();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await trigger.tap();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.tap();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.locator("#outside").tap();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
