import { expect, test } from "@playwright/test";

type Dialog = HTMLElement & { open: boolean; updateComplete: Promise<boolean> };

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => Boolean(customElements.get("sui-tooltip")));
});

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

for (const [outer, inner] of [["sui-modal", "sui-drawer"], ["sui-drawer", "sui-modal"], ["sui-modal", "sui-modal"], ["sui-drawer", "sui-drawer"]]) {
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
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await Promise.all([first.updateComplete, second.updateComplete]);
      const afterEscape = { first: first.open, second: second.open, overflow: document.body.style.overflow, events: [...events] };
      first.remove();
      const afterRemove = document.body.style.overflow;
      document.body.append(first);
      const afterReconnect = document.body.style.overflow;
      first.open = false;
      await first.updateComplete;
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
    second.open = false;
    await second.updateComplete;
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
