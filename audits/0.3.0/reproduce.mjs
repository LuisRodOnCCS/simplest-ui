import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium, firefox, webkit } from '@playwright/test';
import { createServer } from 'vite';

// Point at an extracted npm tarball, not this repository's potentially newer dist.
const root = resolve(process.argv[2] ?? '');
if (!process.argv[2]) throw new Error('Pass the extracted npm package directory as the first argument.');
const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
if (pkg.name !== '@luisrodonccs/simplest-ui' || pkg.version !== '0.3.0') {
  throw new Error('Expected the extracted @luisrodonccs/simplest-ui 0.3.0 npm package.');
}
const manifest = JSON.parse(await readFile(resolve(root, 'components.manifest.json'), 'utf8'));
const missingExports = [];
for (const [key, entry] of Object.entries(pkg.exports)) {
  for (const target of typeof entry === 'string' ? [entry] : Object.values(entry)) {
    try { await access(resolve(root, target)); } catch { missingExports.push({ key, target }); }
  }
}
const types = Object.fromEntries(await Promise.all(manifest.webComponents.map(async (entry) => [
  entry.tag, await readFile(resolve(root, `dist/components/${entry.tag.slice(4)}.d.ts`), 'utf8'),
])));
console.log(JSON.stringify({
  type: 'static', packageVersion: pkg.version, missingExports,
  'SUI-AUDIT-001': {
    listed: manifest.webComponents.find((entry) => entry.tag === 'sui-drawer').attributes.includes('hide-close-button'),
    declared: types['sui-drawer'].includes('hideCloseButton'),
  },
  'SUI-AUDIT-002': {
    toggle: manifest.webComponents.find((entry) => entry.tag === 'sui-dropdown').eventDetails?.['sui-toggle'] ?? null,
  },
  'SUI-AUDIT-006': {
    listed: manifest.webComponents.find((entry) => entry.tag === 'sui-modal').attributes.includes('hide-close-button'),
    declared: types['sui-modal'].includes('hideCloseButton'),
  },
  'SUI-AUDIT-008': {
    listed: manifest.webComponents.find((entry) => entry.tag === 'sui-tooltip').properties?.content,
    declared: /\b(?:get |set )?content(?:\(|:)/.test(types['sui-tooltip']),
  },
}, null, 2));

const server = await createServer({
  root,
  configFile: false,
  server: { host: '127.0.0.1', port: 0, strictPort: false },
  plugins: [{
    name: 'audit-page',
    configureServer(vite) {
      vite.middlewares.use((req, res, next) => {
        if (req.url !== '/') return next();
        res.setHeader('content-type', 'text/html');
        return res.end('<!doctype html><html><head><link rel="stylesheet" href="/dist/tokens.css"><link rel="stylesheet" href="/dist/styles.css"><script type="module" src="/dist/components.js"></script></head><body></body></html>');
      });
    },
  }],
});
await server.listen();
const url = `http://127.0.0.1:${server.httpServer.address().port}/`;

try {
  for (const [name, engine] of Object.entries({ chromium, firefox, webkit })) {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage();
      page.on('pageerror', (error) => console.error(`[${name}] ${error.message}`));
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => ['sui-tooltip', 'sui-popover', 'sui-toast', 'sui-modal', 'sui-drawer'].every((tag) => customElements.get(tag)));
      const result = await page.evaluate(async () => {
        const frame = () => new Promise(requestAnimationFrame);
        const results = {};

        // SUI-AUDIT-003: observed 0.3.0 result, not desired behavior.
        const toast = customElements.get('sui-toast').show({ message: 'Only message', duration: 0 });
        results['SUI-AUDIT-003'] = { title: toast.getAttribute('title'), text: toast.textContent };
        toast.remove();

        const tooltip = document.createElement('sui-tooltip');
        tooltip.setAttribute('content', 'Original');
        tooltip.innerHTML = '<button aria-describedby="prior">Help</button>';
        const prior = document.createElement('p');
        prior.id = 'prior'; prior.textContent = 'Existing description';
        document.body.append(prior, tooltip);
        const tip = tooltip.querySelector('[role=tooltip]');
        results['SUI-AUDIT-019'] = { describedBy: tooltip.querySelector('button').getAttribute('aria-describedby'), tooltipId: tip.id };
        tooltip.setAttribute('content', 'Updated');
        results['SUI-AUDIT-004'] = { attribute: tooltip.getAttribute('content'), text: tip.textContent };
        tooltip.remove(); prior.remove();

        const popover = document.createElement('sui-popover');
        popover.setAttribute('label', 'Original');
        popover.innerHTML = '<button slot="trigger">Open</button><div slot="content">Body</div>';
        document.body.append(popover);
        popover.setAttribute('label', 'Updated');
        results['SUI-AUDIT-007'] = { attribute: popover.getAttribute('label'), panelLabel: popover.querySelector('[slot=content]').getAttribute('aria-label') };
        popover.remove();

        document.body.style.overflow = 'scroll';
        const modal = document.createElement('sui-modal');
        const drawer = document.createElement('sui-drawer');
        modal.label = drawer.label = 'Dialog';
        document.body.append(modal, drawer);
        await Promise.all([modal.updateComplete, drawer.updateComplete]);
        modal.open = true; await modal.updateComplete;
        drawer.open = true; await drawer.updateComplete;
        modal.open = false; await modal.updateComplete;
        const afterFirst = document.body.style.overflow;
        drawer.open = false; await drawer.updateComplete;
        results['SUI-AUDIT-012'] = { afterFirst, afterBoth: document.body.style.overflow };
        modal.remove(); drawer.remove(); document.body.style.overflow = '';

        const tabs = document.createElement('sui-tabs');
        tabs.innerHTML = '<div data-tab="a" label="A">A</div><div data-tab="b" label="B">B</div>';
        document.body.append(tabs); await tabs.updateComplete; await frame();
        tabs.querySelector('[data-tab=b]').setAttribute('disabled', '');
        await frame(); await frame(); await tabs.updateComplete;
        results['SUI-AUDIT-013'] = { disabledAttribute: tabs.querySelector('[data-tab=b]').hasAttribute('disabled'), buttonDisabled: tabs.shadowRoot.querySelectorAll('[role=tab]')[1].disabled };
        tabs.remove();

        const dialog = document.createElement('sui-modal');
        dialog.label = 'Dialog'; document.body.append(dialog);
        await dialog.updateComplete; dialog.open = true; await dialog.updateComplete;
        dialog.setAttribute('hide-close-button', ''); await dialog.updateComplete;
        results['SUI-AUDIT-006'] = { closeButtonPresent: !!dialog.shadowRoot.querySelector('.close') };
        dialog.remove(); document.body.append(dialog); await dialog.updateComplete;
        results['SUI-AUDIT-005'] = { open: dialog.open, bodyOverflow: document.body.style.overflow };
        dialog.open = false; await dialog.updateComplete; dialog.remove();

        const t = document.createElement('sui-tooltip');
        t.innerHTML = '<button slot="trigger">Trigger</button><span slot="content">Old</span>';
        document.body.append(t);
        const replacement = document.createElement('span');
        replacement.slot = 'content'; replacement.textContent = 'New';
        t.querySelector('[slot=content]').replaceWith(replacement);
        await frame();
        results['SUI-AUDIT-010'] = { newId: replacement.id, describedBy: t.querySelector('button').getAttribute('aria-describedby') };
        t.remove();

        const p = document.createElement('sui-popover');
        p.innerHTML = '<button slot="trigger">Trigger</button><div slot="content">Body</div>';
        document.body.append(p); await frame();
        const trigger = p.querySelector('button');
        p.querySelector('[slot=content]').remove(); await frame();
        results['SUI-AUDIT-011'] = { controls: trigger.getAttribute('aria-controls'), targetExists: !!document.getElementById(trigger.getAttribute('aria-controls')) };
        p.remove();

        const notice = document.createElement('sui-toast');
        notice.className = 'consumer-class'; notice.setAttribute('title', 'Title'); notice.setAttribute('duration', '0');
        document.body.append(notice);
        results['SUI-AUDIT-017'] = { className: notice.className };
        notice.remove();

        const disabledTabs = document.createElement('sui-tabs');
        disabledTabs.innerHTML = '<div data-tab="a" label="A" disabled>A</div><div data-tab="b" label="B" disabled>B</div>';
        document.body.append(disabledTabs); await disabledTabs.updateComplete; await frame(); await disabledTabs.updateComplete;
        results['SUI-AUDIT-013-all-disabled'] = { value: disabledTabs.value, selected: [...disabledTabs.shadowRoot.querySelectorAll('[role=tab]')].map((button) => button.getAttribute('aria-selected')) };
        disabledTabs.remove();

        const descriptors = {};
        for (const [tag, property] of [['sui-popover', 'label'], ['sui-accordion', 'multiple'], ['sui-toast', 'duration']]) {
          const element = document.createElement(tag);
          const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), property);
          descriptors[tag] = { getter: !!descriptor?.get, setter: !!descriptor?.set };
        }
        results['SUI-AUDIT-009'] = descriptors;

        for (const tag of ['sui-popover', 'sui-tooltip']) {
          const element = document.createElement(tag);
          element.innerHTML = '<button id="first">First</button><button slot="trigger" id="named">Named</button><span slot="content">Body</span>';
          document.body.append(element); await frame();
          const attr = tag === 'sui-tooltip' ? 'aria-describedby' : 'aria-controls';
          results[`SUI-AUDIT-016-${tag}`] = { first: element.querySelector('#first').getAttribute(attr), named: element.querySelector('#named').getAttribute(attr) };
          element.remove();
        }

        const outer = document.createElement('sui-modal'), inner = document.createElement('sui-drawer');
        outer.label = inner.label = 'Dialog'; document.body.append(outer, inner);
        await Promise.all([outer.updateComplete, inner.updateComplete]);
        outer.open = true; await outer.updateComplete; inner.open = true; await inner.updateComplete;
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await Promise.all([outer.updateComplete, inner.updateComplete]);
        results['SUI-AUDIT-014'] = { modalOpen: outer.open, drawerOpen: inner.open };
        outer.remove(); inner.remove();

        const toggle = document.createElement('sui-dropdown');
        toggle.innerHTML = '<span slot="trigger">Menu</span><button>Item</button>';
        const toggleEvents = [];
        toggle.addEventListener('sui-toggle', (event) => toggleEvents.push(event.detail));
        document.body.append(toggle); await toggle.updateComplete;
        toggle.open = true; await toggle.updateComplete;
        results['SUI-AUDIT-002'] = { events: toggleEvents };
        toggle.open = false; await toggle.updateComplete; toggle.remove();

        const reassigned = document.createElement('sui-popover');
        reassigned.innerHTML = '<button slot="trigger" id="old-trigger">Old</button><button id="new-trigger">New</button><span slot="content">Body</span>';
        document.body.append(reassigned); await frame();
        const oldTrigger = reassigned.querySelector('#old-trigger'), newTrigger = reassigned.querySelector('#new-trigger');
        oldTrigger.removeAttribute('slot'); newTrigger.slot = 'trigger'; await frame(); await frame();
        newTrigger.click(); const afterNew = reassigned.open;
        oldTrigger.click();
        results['SUI-AUDIT-015'] = { oldControls: oldTrigger.getAttribute('aria-controls'), newControls: newTrigger.getAttribute('aria-controls'), afterNew, afterOld: reassigned.open };
        reassigned.open = false; reassigned.remove();
        return results;
      });
      // Keep the live stylesheet: setContent would replace the audited document.
      await page.evaluate(() => {
        const tooltip = document.createElement('sui-tooltip');
        tooltip.id = 'hover-audit';
        tooltip.setAttribute('content', 'Help');
        tooltip.innerHTML = '<button disabled>Disabled</button>';
        document.body.append(tooltip);
      });
      await page.waitForTimeout(200);
      const hoverTooltip = page.locator('#hover-audit [role=tooltip]');
      const opacityOf = () => hoverTooltip.evaluate((element) => getComputedStyle(element).opacity);
      const restOpacity = await opacityOf();
      await page.locator('#hover-audit').hover();
      await page.waitForTimeout(500);
      result['SUI-AUDIT-018'] = { rest: restOpacity, hovered: await opacityOf() };
      await page.mouse.move(0, 0);

      // Eight-case dynamic matrix from the Laravel adapter audit. Cases record
      // observed 0.3.0 behavior; they are not assertions of desired behavior.
      const settle = () => page.waitForTimeout(100);

      // Matrix 1: popover trigger removal/reinsertion; tooltip trigger replacement.
      await page.evaluate(() => {
        document.body.replaceChildren();
        window.case1Events = [];
        const popover = document.createElement('sui-popover');
        popover.id = 'case1';
        popover.label = 'Menu';
        popover.innerHTML = '<button slot="trigger" id="case1-trigger">Open</button><div slot="content">Body</div>';
        for (const event of ['sui-open', 'sui-close']) popover.addEventListener(event, () => window.case1Events.push(event));
        document.body.append(popover);
        window.case1Trigger = popover.querySelector('#case1-trigger');
        popover.open = true;
      });
      await page.locator('#case1-trigger').focus();
      const case1Removed = await page.evaluate(async () => {
        const popover = document.querySelector('#case1');
        window.case1Trigger.remove();
        await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame);
        return { open: popover.open, focus: document.activeElement.tagName, events: [...window.case1Events] };
      });
      const case1Reinserted = await page.evaluate(async () => {
        const popover = document.querySelector('#case1');
        popover.prepend(window.case1Trigger);
        await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame);
        window.case1Trigger.click();
        await new Promise(requestAnimationFrame);
        return { open: popover.open, controls: window.case1Trigger.getAttribute('aria-controls'), events: [...window.case1Events] };
      });
      const case1Tooltip = await page.evaluate(async () => {
        const prior = document.createElement('p');
        prior.id = 'case1-prior'; prior.textContent = 'Prior help';
        const tooltip = document.createElement('sui-tooltip');
        tooltip.id = 'case1-tooltip';
        tooltip.setAttribute('content', 'Tip');
        tooltip.innerHTML = '<button slot="trigger" aria-describedby="case1-prior">Help</button>';
        document.body.append(prior, tooltip);
        const replacement = document.createElement('button');
        replacement.slot = 'trigger'; replacement.setAttribute('aria-describedby', 'case1-prior'); replacement.textContent = 'New help';
        tooltip.querySelector('[slot=trigger]').replaceWith(replacement);
        await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame);
        replacement.focus();
        return {
          describedBy: replacement.getAttribute('aria-describedby'),
          tooltipId: tooltip.querySelector('[role=tooltip]')?.id ?? null,
          focus: document.activeElement.textContent,
        };
      });
      result['MATRIX-1'] = { removed: case1Removed, reinserted: case1Reinserted, tooltip: case1Tooltip };

      // Matrix 2: remove focused content in a drawer with a custom close control.
      await page.evaluate(() => {
        document.body.replaceChildren();
        const origin = document.createElement('button');
        origin.id = 'case2-origin'; origin.textContent = 'Origin';
        const drawer = document.createElement('sui-drawer');
        drawer.id = 'case2'; drawer.label = 'Menu';
        drawer.setAttribute('hide-close-button', '');
        drawer.innerHTML = '<button id="case2-inside">Inside</button><button id="case2-close" slot="footer">Close</button>';
        window.case2Events = [];
        drawer.addEventListener('sui-close', (event) => window.case2Events.push(event.detail?.reason ?? null));
        drawer.querySelector('#case2-close').addEventListener('click', () => drawer.close());
        document.body.append(origin, drawer);
        origin.focus(); drawer.open = true;
      });
      await page.locator('#case2-inside').focus();
      const case2Removed = await page.evaluate(async () => {
        document.querySelector('#case2-inside').remove();
        await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame);
        return { focus: document.activeElement.id || document.activeElement.tagName };
      });
      await page.keyboard.press('Tab');
      const case2Tab = await page.evaluate(() => document.activeElement.id || document.activeElement.tagName);
      await page.keyboard.press('Escape');
      const case2End = await page.evaluate(async () => {
        const drawer = document.querySelector('#case2');
        await drawer.updateComplete;
        return { open: drawer.open, focus: document.activeElement.id, events: [...window.case2Events] };
      });
      result['MATRIX-2'] = { removed: case2Removed, tab: case2Tab, end: case2End };

      // Matrix 3: move an open popover's content node away from and back to its slot.
      const case3 = await page.evaluate(async () => {
        document.body.replaceChildren();
        const popover = document.createElement('sui-popover');
        popover.id = 'case3'; popover.label = 'Menu';
        popover.innerHTML = '<button slot="trigger">Open</button><div slot="content" id="case3-panel">Body</div>';
        const panel = popover.querySelector('#case3-panel');
        const trigger = popover.querySelector('button');
        const events = [];
        for (const event of ['sui-open', 'sui-close']) popover.addEventListener(event, () => events.push(event));
        document.body.append(popover);
        popover.open = true;
        await new Promise(requestAnimationFrame);
        panel.removeAttribute('slot');
        await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame);
        const away = { open: popover.open, hidden: panel.hidden, role: panel.getAttribute('role'), controls: trigger.getAttribute('aria-controls'), events: [...events] };
        panel.setAttribute('slot', 'content');
        await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame);
        return { away, back: { open: popover.open, hidden: panel.hidden, role: panel.getAttribute('role'), controls: trigger.getAttribute('aria-controls'), events: [...events] } };
      });
      result['MATRIX-3'] = case3;

      // Matrix 4: computed accessible description before and after replacing content.
      await page.evaluate(() => {
        document.body.replaceChildren();
        const prior = document.createElement('p');
        prior.id = 'case4-prior'; prior.textContent = 'Existing description';
        const tooltip = document.createElement('sui-tooltip');
        tooltip.id = 'case4';
        tooltip.innerHTML = '<button slot="trigger">Action</button><span slot="content">Original tooltip</span>';
        tooltip.querySelector('button').setAttribute('aria-describedby', 'case4-prior');
        document.body.append(prior, tooltip);
      });
      await page.waitForTimeout(200);
      const descriptionCount = (description) => page.getByRole('button', { name: 'Action', description }).count();
      const case4Before = { prior: await descriptionCount('Existing description'), tooltip: await descriptionCount('Original tooltip'), replacement: await descriptionCount('Replacement tooltip') };
      await page.evaluate(() => {
        const replacement = document.createElement('span');
        replacement.slot = 'content'; replacement.textContent = 'Replacement tooltip';
        document.querySelector('#case4 [slot=content]').replaceWith(replacement);
      });
      await page.waitForTimeout(200);
      result['MATRIX-4'] = {
        before: case4Before,
        after: { prior: await descriptionCount('Existing description'), tooltip: await descriptionCount('Original tooltip'), replacement: await descriptionCount('Replacement tooltip') },
      };

      // Matrix 5: focused tab disabled, re-enabled, panel replaced and removed.
      await page.evaluate(() => {
        document.body.replaceChildren();
        const tabs = document.createElement('sui-tabs');
        tabs.id = 'case5';
        tabs.innerHTML = '<div data-tab="a" label="A">A</div><div data-tab="b" label="B">B</div>';
        window.case5Events = [];
        tabs.addEventListener('sui-change', (event) => window.case5Events.push(event.detail));
        document.body.append(tabs);
      });
      await page.waitForTimeout(200);
      await page.locator('#case5').evaluate((element) => element.shadowRoot.querySelectorAll('[role=tab]')[1].focus());
      const case5 = { baseline: await page.evaluate(() => ({ value: document.querySelector('#case5').value, events: [...window.case5Events] })) };
      await page.evaluate(() => document.querySelector('#case5 [data-tab=b]').setAttribute('disabled', ''));
      await page.keyboard.press('Enter');
      await settle();
      case5.disabled = await page.evaluate(() => ({ value: document.querySelector('#case5').value, events: [...window.case5Events], focus: document.querySelector('#case5').shadowRoot.activeElement?.textContent.trim() }));
      await page.evaluate(() => document.querySelector('#case5 [data-tab=b]').removeAttribute('disabled'));
      await page.keyboard.press('Enter');
      await settle();
      case5.enabled = await page.evaluate(() => ({ value: document.querySelector('#case5').value, events: [...window.case5Events], focus: document.querySelector('#case5').shadowRoot.activeElement?.textContent.trim() }));
      await page.evaluate(() => {
        const replacement = document.createElement('div');
        replacement.dataset.tab = 'b'; replacement.setAttribute('label', 'B2'); replacement.textContent = 'B2';
        document.querySelector('#case5 [data-tab=b]').replaceWith(replacement);
      });
      await settle();
      case5.replaced = await page.evaluate(() => {
        const tabs = document.querySelector('#case5');
        return {
          value: tabs.value,
          buttons: [...tabs.shadowRoot.querySelectorAll('[role=tab]')].map((button) => ({ id: button.id, controls: button.getAttribute('aria-controls') })),
          panels: [...tabs.querySelectorAll('[data-tab]')].map((panel) => ({ id: panel.id, tab: panel.dataset.tab })),
        };
      });
      await page.evaluate(() => document.querySelector('#case5 [data-tab=b]').remove());
      await settle();
      case5.removed = await page.evaluate(() => document.querySelector('#case5').value);
      result['MATRIX-5'] = case5;

      // Matrix 6: focused accordion item disabled, re-enabled and removed.
      await page.evaluate(() => {
        document.body.replaceChildren();
        const accordion = document.createElement('sui-accordion');
        accordion.id = 'case6';
        accordion.innerHTML = '<div class="ui-accordion__item" id="case6-a"><button class="ui-accordion__trigger">A</button><div class="ui-accordion__content">A body</div></div>'
          + '<div class="ui-accordion__item" id="case6-b"><button class="ui-accordion__trigger">B</button><div class="ui-accordion__content">B body</div></div>';
        window.case6Events = [];
        accordion.addEventListener('sui-change', (event) => window.case6Events.push(event.detail));
        document.body.append(accordion);
      });
      await page.locator('#case6-a button').click();
      await page.locator('#case6-a button').focus();
      await page.evaluate(() => document.querySelector('#case6-a').setAttribute('disabled', ''));
      await page.keyboard.press('Enter');
      const case6 = { disabled: await page.evaluate(() => ({
        focus: document.activeElement.textContent.trim(),
        open: document.querySelector('#case6-a').classList.contains('open'),
        events: [...window.case6Events],
      })) };
      await page.evaluate(() => document.querySelector('#case6-a').removeAttribute('disabled'));
      await page.keyboard.press('Enter');
      case6.enabled = await page.evaluate(() => ({
        open: document.querySelector('#case6-a').classList.contains('open'),
        events: [...window.case6Events],
      }));
      await page.evaluate(() => document.querySelector('#case6-a').remove());
      await settle();
      case6.removed = await page.evaluate(() => {
        const trigger = document.querySelector('#case6-b button');
        const content = document.querySelector('#case6-b .ui-accordion__content');
        return {
          focus: document.activeElement.id || document.activeElement.tagName,
          remaining: document.querySelectorAll('#case6 .ui-accordion__item').length,
          events: [...window.case6Events],
          controls: trigger.getAttribute('aria-controls'),
          contentId: content.id,
        };
      });
      result['MATRIX-6'] = case6;

      // Matrix 7: mutate one of two open popovers while focus is in the other.
      await page.evaluate(() => {
        document.body.replaceChildren();
        window.case7Events = [];
        for (let index = 0; index < 2; index += 1) {
          const popover = document.createElement('sui-popover');
          popover.id = `case7-${index}`; popover.label = `Menu ${index}`;
          popover.innerHTML = `<button slot="trigger">Open</button><div slot="content"><button id="case7-inside-${index}">Inside</button></div>`;
          for (const event of ['sui-open', 'sui-close']) popover.addEventListener(event, () => window.case7Events.push(`${popover.id}:${event}`));
          document.body.append(popover);
          popover.open = true;
        }
      });
      await page.locator('#case7-inside-1').focus();
      const case7 = await page.evaluate(async () => {
        const first = document.querySelector('#case7-0'), second = document.querySelector('#case7-1');
        const trigger = second.querySelector('[slot=trigger]');
        const before = { focus: document.activeElement.id, controls: trigger.getAttribute('aria-controls'), open: second.open };
        first.querySelector('[slot=content]').remove();
        await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame);
        return { before, after: { focus: document.activeElement.id, controls: trigger.getAttribute('aria-controls'), open: second.open }, events: [...window.case7Events] };
      });
      result['MATRIX-7'] = case7;

      // Matrix 8: remove the first-opened dialog while both types are open.
      result['MATRIX-8'] = await page.evaluate(async () => {
        const observed = {};
        for (const [firstTag, secondTag] of [['sui-modal', 'sui-drawer'], ['sui-drawer', 'sui-modal']]) {
          document.body.replaceChildren();
          document.body.style.overflow = 'scroll';
          const first = document.createElement(firstTag), second = document.createElement(secondTag);
          first.label = second.label = 'Dialog';
          const events = [];
          for (const element of [first, second]) element.addEventListener('sui-close', () => events.push(element === first ? 'first' : 'second'));
          document.body.append(first, second);
          await Promise.all([first.updateComplete, second.updateComplete]);
          first.open = true; await first.updateComplete;
          second.open = true; await second.updateComplete;
          first.remove();
          const removed = document.body.style.overflow;
          second.open = false; await second.updateComplete;
          observed[`${firstTag}+${secondTag}`] = { removed, final: document.body.style.overflow, events: [...events] };
          second.remove();
        }
        document.body.style.overflow = '';
        return observed;
      });

      console.log(JSON.stringify({ browser: name, browserVersion: browser.version(), packageVersion: pkg.version, results: result }, null, 2));
    } finally {
      await browser.close();
    }
  }
} finally {
  await server.close();
}
