import { expect, test } from "@playwright/test";

type Dialog = HTMLElement & { open: boolean; updateComplete: Promise<boolean> };

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => Boolean(customElements.get("sui-tooltip")));
});

test("drawer entry remains aligned to the viewport on repeated openings", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 375, height: 812 });
  const results = await page.evaluate(async () => {
    document.body.innerHTML = `<div style="transform: translateY(-2px); overflow: hidden"><sui-drawer label="Drawer" style="--sui-duration-normal: 600ms"></sui-drawer></div>`;
    const drawer = document.querySelector("sui-drawer") as Dialog & { close(): void };
    await drawer.updateComplete;
    const samples: { right: number; width: number; x: number; modal: boolean }[][] = [];
    for (let i = 0; i < 3; i++) {
      drawer.open = true;
      await drawer.updateComplete;
      const dialog = drawer.shadowRoot!.querySelector("dialog")!;
      const panel = drawer.shadowRoot!.querySelector<HTMLElement>(".panel")!;
      const animation = panel.getAnimations()[0];
      if (!animation) throw new Error(`Missing entry animation on opening ${i}`);
      animation.pause();
      const frames = [];
      for (const time of [0, 150, 300, 450, 600]) {
        animation.currentTime = time;
        const box = panel.getBoundingClientRect();
        frames.push({ right: box.right, width: box.width, x: new DOMMatrix(getComputedStyle(panel).transform).m41, modal: dialog.matches(":modal") });
      }
      samples.push(frames);
      animation.finish();
      const closed = new Promise<void>(resolve => drawer.addEventListener("sui-close", () => resolve(), { once: true }));
      drawer.close();
      await closed;
      await drawer.updateComplete;
    }
    return samples;
  });
  for (const frames of results) {
    for (const frame of frames) {
      expect(frame.modal).toBe(true);
      expect(frame.right - frame.x, JSON.stringify(frames)).toBeCloseTo(375, 0);
      expect(frame.x).toBeGreaterThanOrEqual(-0.5);
      expect(frame.x).toBeLessThanOrEqual(frame.width + 0.5);
    }
    expect(frames[0].x).toBeGreaterThan(frames[4].x);
    expect(frames[4].x).toBeCloseTo(0, 0);
  }
});

for (const tag of ["sui-drawer", "sui-modal"]) {
 for (const motion of ["reduce", "no-preference"] as const) {
  test(`${tag} entry motion respects ${motion}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: motion });
    const initial = await page.evaluate(async (name) => {
      document.body.innerHTML = `<${name} label="Motion" style="--sui-duration-normal: 2s"></${name}>`;
      const overlay = document.querySelector(name) as Dialog;
      await overlay.updateComplete;
      overlay.open = true;
      await overlay.updateComplete;
      const dialog = overlay.shadowRoot!.querySelector("dialog")!;
      const panel = overlay.shadowRoot!.querySelector(".panel")!;
      return {
        modal: dialog.matches(":modal"),
        animations: panel.getAnimations().length,
        backdropAnimations: dialog.getAnimations().length,
      };
    }, tag);
    expect(initial.modal).toBe(true);
    if (motion === "reduce") {
      expect(initial.animations).toBe(0);
      expect(initial.backdropAnimations).toBe(0);
    } else {
      expect(initial.animations).toBeGreaterThan(0);
      expect(initial.backdropAnimations).toBeGreaterThan(0);
      await expect.poll(() => page.locator(`${tag} >> .panel`).evaluate((panel) =>
        panel.getAnimations().some((animation) => Number(animation.currentTime) > 0)
      )).toBe(true);
      expect(await page.locator(`${tag} >> .panel`).evaluate((panel) =>
        getComputedStyle(panel).transform
      )).not.toBe("none");
    }
  });
  test(`${tag} exit motion retains modality with ${motion}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: motion });
    await page.evaluate(async (name) => {
      document.body.innerHTML = `<button id="origin">Open</button><${name} label="Motion" style="--sui-duration-normal: 2s"></${name}>`;
      const overlay = document.querySelector(name) as Dialog;
      await overlay.updateComplete;
      (document.querySelector("#origin") as HTMLElement).focus();
      overlay.open = true;
      await overlay.updateComplete;
      overlay.open = false;
      await overlay.updateComplete;
    }, tag);
    if (motion === "no-preference") {
      const dialog = page.locator(`${tag} >> dialog`);
      await expect(dialog).toBeVisible();
      expect(await dialog.evaluate(el => el.matches(":modal"))).toBe(true);
      expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
      await expect.poll(() => page.locator(`${tag} >> .panel`).evaluate(el =>
        el.getAnimations().some(animation => Number(animation.currentTime) > 0)
      )).toBe(true);
    }
    await expect(page.locator(`${tag} >> dialog`)).toHaveCount(0);
    await expect(page.locator("#origin")).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  });
 }
}

for (const tag of ["sui-drawer", "sui-modal"]) {
  test(`${tag} cancels interrupted exit and cleans up on removal`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const result = await page.evaluate(async name => {
      document.body.innerHTML = `<button id="origin">Open</button><${name} label="Overlay" style="--sui-duration-normal: 2s"></${name}>`;
      const overlay = document.querySelector(name) as Dialog & { close(reason?: string): void };
      const events: string[] = [];
      overlay.addEventListener("sui-open", () => events.push("open"));
      overlay.addEventListener("sui-close", event => events.push((event as CustomEvent).detail.reason));
      await overlay.updateComplete;
      (document.querySelector("#origin") as HTMLElement).focus();
      overlay.open = true;
      await overlay.updateComplete;
      overlay.close("escape");
      await overlay.updateComplete;
      const duringExit = {
        modal: overlay.shadowRoot!.querySelector("dialog")!.matches(":modal"),
        overflow: document.body.style.overflow,
      };
      overlay.open = true;
      await overlay.updateComplete;
      const afterReopen = {
        modal: overlay.shadowRoot!.querySelector("dialog")!.matches(":modal"),
        overflow: document.body.style.overflow,
        events: [...events],
      };
      overlay.close("backdrop");
      overlay.close("escape");
      await overlay.updateComplete;
      const closed = new Promise<void>(resolve => overlay.addEventListener("sui-close", () => resolve(), { once: true }));
      overlay.shadowRoot!.querySelectorAll("*").forEach(element =>
        element.getAnimations().forEach(animation => animation.finish())
      );
      await closed;
      await overlay.updateComplete;
      const afterClose = { events: [...events], focus: document.activeElement?.id, overflow: document.body.style.overflow };
      overlay.open = true;
      await overlay.updateComplete;
      overlay.open = false;
      await overlay.updateComplete;
      overlay.remove();
      const afterRemove = document.body.style.overflow;
      document.body.append(overlay);
      await overlay.updateComplete;
      return {
        duringExit, afterReopen, afterClose, afterRemove,
        dialogAfterReconnect: Boolean(overlay.shadowRoot!.querySelector("dialog")),
        events,
      };
    }, tag);
    expect(result.duringExit).toEqual({ modal: true, overflow: "hidden" });
    expect(result.afterReopen).toEqual({ modal: true, overflow: "hidden", events: ["open"] });
    expect(result.afterClose).toEqual({ events: ["open", "backdrop"], focus: "origin", overflow: "" });
    expect(result.afterRemove).toBe("");
    expect(result.dialogAfterReconnect).toBe(false);
    expect(result.events).toEqual(["open", "backdrop", "open"]);
  });

  for (const [method, reason] of [["property", "programmatic"], ["api", "programmatic"], ["button", "dismiss"], ["backdrop", "backdrop"]] as const) {
    test(`${tag} exits on ${method} with ${reason}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.setViewportSize({ width: 375, height: 812 });
      const result = await page.evaluate(async ([name, path]) => {
        document.body.innerHTML = `<header style="position: sticky; top: 0">Header</header><div style="transform: translateY(-2px)"><${name} label="Overlay" style="--sui-duration-normal: 2s"></${name}></div>`;
        const overlay = document.querySelector(name) as Dialog & { close(): void; disableBackdropClose: boolean };
        await overlay.updateComplete;
        overlay.open = true;
        await overlay.updateComplete;
        const dialog = overlay.shadowRoot!.querySelector("dialog")!;
        if (path === "backdrop") {
          overlay.disableBackdropClose = true;
          dialog.click();
          await overlay.updateComplete;
          if (!overlay.open) throw new Error("disabled backdrop closed");
          overlay.disableBackdropClose = false;
        }
        const closed = new Promise<string>(resolve => overlay.addEventListener("sui-close", e => resolve((e as CustomEvent).detail.reason), { once: true }));
        if (path === "property") overlay.open = false;
        if (path === "api") overlay.close();
        if (path === "button") overlay.shadowRoot!.querySelector<HTMLButtonElement>(".close")!.click();
        if (path === "backdrop") dialog.click();
        await overlay.updateComplete;
        const rect = dialog.getBoundingClientRect();
        const during = {
          modal: dialog.matches(":modal"),
          overflow: document.body.style.overflow,
          viewport: [rect.left, rect.top, rect.width, rect.height],
          headerCovered: document.elementFromPoint(8, 8) === overlay,
        };
        overlay.shadowRoot!.querySelectorAll("*").forEach(element => element.getAnimations().forEach(animation => animation.finish()));
        return { during, reason: await closed };
      }, [tag, method]);
      expect(result.during.modal).toBe(true);
      expect(result.during.overflow).toBe("hidden");
      expect(result.during.viewport).toEqual([0, 0, 375, 812]);
      expect(result.during.headerCovered).toBe(true);
      expect(result.reason).toBe(reason);
    });
  }
}

test("tooltip reconciles replacement, removal and reinsertion without losing descriptions", async ({ page }) => {
  await page.evaluate(() => {
    document.body.innerHTML = `<p id="prior">Existing help</p><sui-tooltip>
      <button slot="trigger" aria-describedby="prior">Help</button>
      <span slot="content" id="original">Original tooltip</span>
    </sui-tooltip>`;
  });
  const trigger = page.getByRole("button", { name: "Help" });
  await expect(trigger).toHaveAccessibleDescription("Existing help Original tooltip");
  await page.evaluate(() => {
    const tip = document.querySelector("sui-tooltip")!;
    const old = tip.querySelector("[slot=content]")!;
    const next = document.createElement("span");
    next.slot = "content";
    next.textContent = "Replacement tooltip";
    old.replaceWith(next);
    (window as unknown as { oldTip: Element }).oldTip = old;
  });
  await expect(trigger).toHaveAccessibleDescription("Existing help Replacement tooltip");
  await page.evaluate(() => document.querySelector("sui-tooltip [slot=content]")!.remove());
  await expect(trigger).toHaveAccessibleDescription("Existing help");
  await page.evaluate(() => {
    const old = (window as unknown as { oldTip: Element }).oldTip;
    document.querySelector("sui-tooltip")!.append(old);
  });
  await expect(trigger).toHaveAccessibleDescription("Existing help Original tooltip");
  await expect(trigger).toHaveAttribute("aria-describedby", "prior original");
});

test("tooltip uses the explicit trigger and hides disabled triggers", async ({ page }) => {
  await page.evaluate(() => {
    document.body.innerHTML = `<sui-tooltip content="Extra help"><button id="fallback">Other</button>
      <button slot="trigger" id="target" aria-disabled="true">Help</button></sui-tooltip>`;
  });
  const target = page.locator("#target");
  await expect(target).toHaveAttribute("aria-describedby", /sui-tooltip/);
  await expect(page.locator("#fallback")).not.toHaveAttribute("aria-describedby");
  await target.focus();
  await expect(page.locator("sui-tooltip")).not.toHaveClass(/ui-tooltip--visible/);
  await target.evaluate((element) => element.removeAttribute("aria-disabled"));
  await target.blur();
  await target.focus();
  await expect(page.locator("sui-tooltip")).toHaveClass(/ui-tooltip--visible/);
  await target.evaluate((element) => element.setAttribute("aria-disabled", "true"));
  await expect(page.locator("sui-tooltip [role=tooltip]")).toHaveCSS("opacity", "0");
});

for (const edge of ["left", "right"] as const) {
  test(`tooltip stays inside the viewport at the ${edge} edge when closed and open`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 600 });
    await page.evaluate((edge) => {
      document.body.innerHTML = `<p id="prior">Existing help</p><div style="display:flex;justify-content:${edge === "right" ? "flex-end" : "flex-start"};padding-top:120px">
        <sui-tooltip content="Additional context with a long explanation near the viewport edge">
          <button aria-describedby="prior">Help</button>
        </sui-tooltip></div>`;
    }, edge);
    const trigger = page.getByRole("button", { name: "Help" });
    const content = page.locator("sui-tooltip [role=tooltip]");
    await expect(trigger).toHaveAccessibleDescription("Existing help Additional context with a long explanation near the viewport edge");
    await expect(content).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);

    await trigger.focus();
    await expect(content).toBeVisible();
    await expect.poll(async () => {
      const box = await content.boundingBox();
      return Boolean(box && box.x >= 0 && box.x + box.width <= 320);
    }).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);

    await trigger.blur();
    await expect(content).toBeHidden();
    // Pointer dispatch exercises the same handler in WebKit without depending
    // on its platform-specific CSS hover emulation.
    await trigger.dispatchEvent("pointerenter");
    await expect(content).toBeVisible();
    await trigger.dispatchEvent("pointerleave");
    await expect(content).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  });
}

test("visible tooltip wraps long words and tracks resizing, scrolling and content replacement", async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 600 });
  await page.evaluate(() => {
    document.body.innerHTML = `<div id="scroller" style="overflow:auto;width:100%;height:300px">
      <div style="width:800px;padding-top:120px">
        <sui-tooltip style="margin-left:160px" content="Initial help"><button>Help</button></sui-tooltip>
      </div></div>`;
  });
  const trigger = page.getByRole("button", { name: "Help" });
  await trigger.focus();
  await page.locator("sui-tooltip").evaluate((element) => element.setAttribute("content", "word".repeat(100)));
  const content = page.locator("sui-tooltip [role=tooltip]");
  const expectInsideViewport = async () => {
    await expect.poll(async () => content.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return rect.left >= -0.5 && rect.right <= document.documentElement.clientWidth + 0.5 &&
        element.scrollWidth <= element.clientWidth + 1;
    })).toBe(true);
    const layout = await page.evaluate(() => ({
      viewport: innerWidth,
      width: document.documentElement.scrollWidth,
      boxes: [...document.querySelectorAll("body *")].map((element) => {
        const rect = element.getBoundingClientRect();
        return { tag: element.tagName, style: element.getAttribute("style"), left: rect.left, right: rect.right, width: rect.width };
      })
    }));
    expect(layout.width, JSON.stringify(layout)).toBeLessThanOrEqual(layout.viewport);
  };
  await expectInsideViewport();
  await page.setViewportSize({ width: 320, height: 600 });
  await expectInsideViewport();
  await page.locator("#scroller").evaluate((element) => element.scrollLeft = 100);
  await expectInsideViewport();
  await page.locator("sui-tooltip").evaluate((element) => {
    const replacement = document.createElement("span");
    replacement.slot = "content";
    replacement.style.color = "inherit";
    replacement.textContent = "Replacement " + "longword".repeat(50);
    element.append(replacement);
  });
  await expect(trigger).toHaveAccessibleDescription(/Replacement longword/);
  await expect(content).toBeVisible();
  await expectInsideViewport();
  await trigger.blur();
  await expect(content).toBeHidden();
  await expect(content).toHaveAttribute("style", "color: inherit;");
  await page.locator("sui-tooltip").evaluate((element) => {
    element.remove();
    document.body.append(element);
  });
  await expect(trigger).toHaveAccessibleDescription(/Replacement longword/);
  await trigger.focus();
  await expectInsideViewport();
});

test("popover updates label and reconciles focused panel removal and reinsertion", async ({ page }) => {
  await page.evaluate(() => {
    document.body.innerHTML = `<sui-popover label="Original"><button slot="trigger">Open</button>
      <div slot="content" id="panel"><button>Inside</button></div></sui-popover>`;
  });
  const trigger = page.getByRole("button", { name: "Open" });
  await trigger.click();
  await page.getByRole("button", { name: "Inside" }).focus();
  await page.locator("sui-popover").evaluate((element) => element.setAttribute("label", "Updated"));
  await expect(page.getByRole("dialog", { name: "Updated" })).toBeVisible();
  await page.evaluate(() => {
    const panel = document.querySelector("#panel")!;
    (window as unknown as { panel: Element }).panel = panel;
    panel.remove();
  });
  await expect(page.locator("sui-popover")).not.toHaveAttribute("open");
  await expect(trigger).not.toHaveAttribute("aria-controls");
  await expect(trigger).toBeFocused();
  await page.evaluate(() => document.querySelector("sui-popover")!.append((window as unknown as { panel: Element }).panel));
  await expect(trigger).toHaveAttribute("aria-controls", "panel");
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "Updated" })).toBeVisible();
});

for (const tag of ["sui-modal", "sui-drawer"]) {
  for (const ancestor of ["transform: translateY(-2px)", "filter: blur(0px)", "perspective: 500px", "will-change: transform", "contain: paint", "overflow: hidden; transform: translateZ(0)"]) {
    test(`${tag} covers viewport inside ${ancestor}`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.evaluate(async ([name, style]) => {
        document.body.innerHTML = `<button id="outside">Outside</button><div id="ancestor" style="${style};width:200px;height:100px"><${name} label="Overlay" style="--sui-drawer-width: 250px"><button>Inside</button></${name}></div>`;
        const overlay = document.querySelector(name) as Dialog;
        await overlay.updateComplete;
        overlay.open = true;
        await overlay.updateComplete;
      }, [tag, ancestor]);
      const dialog = page.locator(`${tag} >> dialog`);
      await expect(dialog).toBeVisible();
      expect(await dialog.evaluate((el) => el.matches(":modal"))).toBe(true);
      const rect = await dialog.boundingBox();
      expect(rect).not.toBeNull();
      expect(rect!.x).toBeCloseTo(0, 0);
      expect(rect!.y).toBeCloseTo(0, 0);
      expect(rect!.width).toBeCloseTo(375, 0);
      expect(rect!.height).toBeCloseTo(812, 0);
      await page.locator("#outside").evaluate((el: HTMLElement) => el.focus());
      await expect(page.locator("#outside")).not.toBeFocused();
      await page.keyboard.press("Escape");
      await expect(page.locator(tag)).not.toHaveAttribute("open");
    });
  }
}

for (const [outer, inner] of [["sui-modal", "sui-drawer"], ["sui-drawer", "sui-modal"], ["sui-modal", "sui-modal"], ["sui-drawer", "sui-drawer"]]) {
  test(`repeated Escape during exit keeps lower ${outer} open under ${inner}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.evaluate(async ([firstTag, secondTag]) => {
      document.body.innerHTML = `<${firstTag} id="first" label="First"></${firstTag}><${secondTag} id="second" label="Second" style="--sui-duration-normal: 2s"></${secondTag}>`;
      const first = document.querySelector("#first") as Dialog;
      const second = document.querySelector("#second") as Dialog;
      await Promise.all([first.updateComplete, second.updateComplete]);
      first.open = true;
      await first.updateComplete;
      second.open = true;
      await second.updateComplete;
    }, [outer, inner]);
    await page.keyboard.press("Escape");
    await expect(page.locator("#second")).not.toHaveAttribute("open");
    await page.keyboard.press("Escape");
    await expect(page.locator("#first")).toHaveAttribute("open", "");
    expect(await page.locator("#second >> dialog").evaluate(dialog => dialog.matches(":modal"))).toBe(true);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
    await page.locator("#second").evaluate(element => element.shadowRoot!.querySelectorAll("*").forEach(
      child => child.getAnimations().forEach(animation => animation.finish())
    ));
    await expect(page.locator("#second >> dialog")).toHaveCount(0);
    await expect(page.locator("#first")).toHaveAttribute("open", "");
  });

  test(`real Escape closes only top ${outer} then ${inner}`, async ({ page }) => {
    await page.evaluate(async ([firstTag, secondTag]) => {
      document.body.innerHTML = `<button id="origin">Open</button><${firstTag} id="first" label="First"><button id="nested-origin">Next</button></${firstTag}><${secondTag} id="second" label="Second"></${secondTag}>`;
      const first = document.querySelector("#first") as Dialog;
      const second = document.querySelector("#second") as Dialog;
      (document.querySelector("#origin") as HTMLElement).focus();
      first.open = true;
      await first.updateComplete;
      (document.querySelector("#nested-origin") as HTMLElement).focus();
      second.open = true;
      await second.updateComplete;
    }, [outer, inner]);
    await page.keyboard.press("Escape");
    await expect(page.locator("#second")).not.toHaveAttribute("open");
    await expect(page.locator("#first")).toHaveAttribute("open", "");
    expect(await page.locator("#first >> dialog").evaluate((el) => el.matches(":modal"))).toBe(true);
    await expect(page.locator("#nested-origin")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.locator("#first")).not.toHaveAttribute("open");
    await expect(page.locator("#origin")).toBeFocused();
  });

  test(`overlay stack: ${outer} then ${inner}`, async ({ page }) => {
    const result = await page.evaluate(async ([firstTag, secondTag]) => {
      document.body.style.overflow = "scroll";
      const first = document.createElement(firstTag) as Dialog;
      const second = document.createElement(secondTag) as Dialog;
      document.body.append(first, second);
      await Promise.all([first.updateComplete, second.updateComplete]);
      first.open = true;
      await first.updateComplete;
      second.open = true;
      await second.updateComplete;
      const events: string[] = [];
      first.addEventListener("sui-close", () => events.push("first"));
      second.addEventListener("sui-close", () => events.push("second"));
      const secondClosed = new Promise<void>(resolve => second.addEventListener("sui-close", () => resolve(), { once: true }));
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await secondClosed;
      const afterEscape = { first: first.open, second: second.open, overflow: document.body.style.overflow, events: [...events] };
      first.remove();
      const afterRemove = document.body.style.overflow;
      document.body.append(first);
      const afterReconnect = document.body.style.overflow;
      const firstClosed = new Promise<void>(resolve => first.addEventListener("sui-close", () => resolve(), { once: true }));
      first.open = false;
      await firstClosed;
      return { afterEscape, afterRemove, afterReconnect, final: document.body.style.overflow };
    }, [outer, inner]);
    expect(result.afterEscape).toEqual({ first: true, second: false, overflow: "hidden", events: ["second"] });
    expect(result.afterRemove).toBe("scroll");
    expect(result.afterReconnect).toBe("hidden");
    expect(result.final).toBe("scroll");
  });
}

test("toast preserves consumer DOM and uses one live region", async ({ page }) => {
  await page.evaluate(() => {
    document.body.innerHTML = `<sui-toast-container><sui-toast class="consumer" title="Saved" duration="0"><button>Undo</button></sui-toast></sui-toast-container>`;
  });
  const toast = page.locator("sui-toast");
  await expect(toast).toHaveClass(/consumer/);
  await expect(toast.locator("button")).toHaveText("Undo");
  await expect(toast).not.toHaveAttribute("role");
  await expect(page.locator("sui-toast-container")).toHaveAttribute("aria-live", "polite");
  await toast.evaluate((element) => element.setAttribute("variant", "success"));
  await expect(toast).toHaveClass(/consumer/);
  await expect(toast.locator("button")).toHaveText("Undo");
  await toast.evaluate((element) => document.body.append(element));
  await expect(toast).toHaveAttribute("role", "status");
});

test("tabs observe disabled changes and accordion emits generated item IDs", async ({ page }) => {
  await page.evaluate(() => {
    document.body.innerHTML = `<sui-tabs><div data-tab="a" label="A">A</div><div data-tab="b" label="B">B</div></sui-tabs>
      <sui-accordion><div class="ui-accordion__item"><button class="ui-accordion__trigger">Expand</button>
      <div class="ui-accordion__content">Content</div></div></sui-accordion>`;
  });
  const tab = page.getByRole("tab", { name: "B" });
  await expect(tab).toBeEnabled();
  await page.locator("[data-tab=b]").evaluate((element) => element.setAttribute("disabled", ""));
  await expect(tab).toBeDisabled();
  await page.locator("[data-tab=b]").evaluate((element) => element.removeAttribute("disabled"));
  await expect(tab).toBeEnabled();
  const detail = await page.evaluate(() => new Promise<string[]>((resolve) => {
    const accordion = document.querySelector("sui-accordion")!;
    accordion.addEventListener("sui-change", (event) => resolve((event as CustomEvent<{ open: string[] }>).detail.open), { once: true });
    accordion.querySelector<HTMLButtonElement>("button")!.click();
  }));
  expect(detail).toEqual([await page.locator(".ui-accordion__item").getAttribute("id")]);
  expect(detail[0]).toBeTruthy();
});

test("disconnecting the first overlay preserves the remaining lock", async ({ page }) => {
  const states = await page.evaluate(async () => {
    document.body.style.overflow = "scroll";
    const first = document.createElement("sui-modal") as Dialog;
    const second = document.createElement("sui-drawer") as Dialog;
    document.body.append(first, second);
    await Promise.all([first.updateComplete, second.updateComplete]);
    first.open = true;
    await first.updateComplete;
    second.open = true;
    await second.updateComplete;
    first.remove();
    const remaining = document.body.style.overflow;
    const closed = new Promise<void>(resolve => second.addEventListener("sui-close", () => resolve(), { once: true }));
    second.open = false;
    await closed;
    return { remaining, final: document.body.style.overflow };
  });
  expect(states).toEqual({ remaining: "hidden", final: "scroll" });
});

test("mutating one popover does not disturb another", async ({ page }) => {
  await page.evaluate(() => {
    document.body.innerHTML = `<sui-popover id="first"><button slot="trigger">First</button><div slot="content">First panel</div></sui-popover>
      <sui-popover id="second"><button slot="trigger">Second</button><div slot="content"><button>Second action</button></div></sui-popover>`;
    document.querySelector("#first")!.setAttribute("open", "");
    document.querySelector("#second")!.setAttribute("open", "");
  });
  const secondTrigger = page.locator("#second [slot=trigger]");
  const controls = await secondTrigger.getAttribute("aria-controls");
  await page.getByRole("button", { name: "Second action" }).focus();
  await page.locator("#first [slot=content]").evaluate((element) => element.remove());
  await expect(page.locator("#first")).not.toHaveAttribute("open");
  await expect(page.locator("#second")).toHaveAttribute("open", "");
  await expect(secondTrigger).toHaveAttribute("aria-controls", controls!);
  await expect(page.getByRole("button", { name: "Second action" })).toBeFocused();
});

test("tabs handle disabling, re-enabling, replacement and removal", async ({ page }) => {
  await page.evaluate(() => {
    document.body.innerHTML = `<sui-tabs><div data-tab="a" label="A">Panel A</div>
      <div data-tab="b" label="B">Panel B</div></sui-tabs>`;
    const tabs = document.querySelector("sui-tabs")!;
    (window as unknown as { tabChanges: string[] }).tabChanges = [];
    tabs.addEventListener("sui-change", (event) =>
      (window as unknown as { tabChanges: string[] }).tabChanges.push((event as CustomEvent<{ value: string }>).detail.value));
  });
  const b = page.getByRole("tab", { name: "B" });
  await expect(b).toBeEnabled();
  await page.locator("[data-tab=b]").evaluate((panel) => panel.setAttribute("disabled", ""));
  await expect(b).toBeDisabled();
  await page.locator("[data-tab=b]").evaluate((panel) => panel.removeAttribute("disabled"));
  await expect(b).toBeEnabled();
  await b.click();
  await expect(b).toHaveAttribute("aria-selected", "true");
  await page.locator("[data-tab=b]").evaluate((panel) => {
    const replacement = document.createElement("div");
    replacement.dataset.tab = "b";
    replacement.setAttribute("label", "B replacement");
    replacement.textContent = "Replacement panel";
    panel.replaceWith(replacement);
  });
  await expect(page.getByRole("tab", { name: "B replacement" })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("[data-tab=b]")).toBeVisible();
  await page.locator("[data-tab=b]").evaluate((panel) => panel.remove());
  await expect(page.getByRole("tab", { name: "B replacement" })).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "A" })).toHaveAttribute("aria-selected", "true");
  expect(await page.evaluate(() => (window as unknown as { tabChanges: string[] }).tabChanges)).toEqual(["b"]);
});

test("accordion respects disabled items and preserves the remaining item's references", async ({ page }) => {
  await page.evaluate(() => {
    document.body.innerHTML = `<sui-accordion>
      <div class="ui-accordion__item" id="item-a"><button class="ui-accordion__trigger">A</button><div class="ui-accordion__content">Panel A</div></div>
      <div class="ui-accordion__item" id="item-b"><button class="ui-accordion__trigger">B</button><div class="ui-accordion__content">Panel B</div></div>
      </sui-accordion>`;
    (window as unknown as { accordionChanges: string[][] }).accordionChanges = [];
    document.querySelector("sui-accordion")!.addEventListener("sui-change", (event) =>
      (window as unknown as { accordionChanges: string[][] }).accordionChanges.push((event as CustomEvent<{ open: string[] }>).detail.open));
  });
  const trigger = page.locator("#item-a button");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.locator("#item-a").evaluate((item) => item.setAttribute("disabled", ""));
  await trigger.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.locator("#item-a").evaluate((item) => item.removeAttribute("disabled"));
  await trigger.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await page.locator("#item-a").evaluate((item) => item.remove());
  const remaining = page.locator("#item-b");
  const panelId = await remaining.locator(".ui-accordion__content").getAttribute("id");
  expect(panelId).toBeTruthy();
  await expect(remaining.locator("button")).toHaveAttribute("aria-controls", panelId!);
  expect(await page.evaluate(() => (window as unknown as { accordionChanges: string[][] }).accordionChanges)).toEqual([["item-a"], []]);
});

test("drawer retains keyboard escape after removing focused content", async ({ page }) => {
  await page.evaluate(async () => {
    document.body.innerHTML = `<button id="origin">Origin</button><sui-drawer label="Panel" hide-close-button>
      <button id="inside">Inside</button><button slot="footer" id="close">Close</button></sui-drawer>`;
    const drawer = document.querySelector("sui-drawer") as Dialog;
    document.querySelector<HTMLButtonElement>("#origin")!.focus();
    await drawer.updateComplete;
    drawer.open = true;
    await drawer.updateComplete;
  });
  await page.locator("#inside").focus();
  await page.locator("#inside").evaluate((element) => element.remove());
  await page.keyboard.press("Tab");
  await expect(page.locator("#close")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("sui-drawer")).not.toHaveAttribute("open");
  await expect(page.locator("#origin")).toBeFocused();
});

test("tooltip transfers its description when the trigger is replaced and restored", async ({ page }) => {
  await page.evaluate(() => {
    document.body.innerHTML = `<p id="help">Existing help</p><sui-tooltip content="Tip">
      <button slot="trigger" aria-describedby="help">Old</button></sui-tooltip>`;
  });
  await expect(page.getByRole("button", { name: "Old" })).toHaveAccessibleDescription("Existing help Tip");
  await page.evaluate(() => {
    const old = document.querySelector("sui-tooltip button")!;
    (window as unknown as { oldTrigger: Element }).oldTrigger = old;
    const replacement = document.createElement("button");
    replacement.slot = "trigger";
    replacement.textContent = "New";
    replacement.setAttribute("aria-describedby", "help");
    old.replaceWith(replacement);
  });
  await expect(page.getByRole("button", { name: "New" })).toHaveAccessibleDescription("Existing help Tip");
  expect(await page.evaluate(() => (window as unknown as { oldTrigger: Element }).oldTrigger.getAttribute("aria-describedby"))).toBe("help");
  await page.evaluate(() => document.querySelector("sui-tooltip button")!.replaceWith((window as unknown as { oldTrigger: Element }).oldTrigger));
  await expect(page.getByRole("button", { name: "Old" })).toHaveAccessibleDescription("Existing help Tip");
});
