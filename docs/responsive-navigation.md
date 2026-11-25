# Responsive navigation with App Shell and Drawer

This optional composition keeps the App Shell sidebar on wide screens and
offers a full-screen `sui-drawer` when the sidebar no longer fits. It is not a
default behavior of either component. The
[visual documentation](https://luisrodonccs.github.io/simplest-ui/) includes a
working dashboard example.

## Customizing top bars

`ui-topbar`, `ui-app-shell__bar`, and `ui-app-shell__header` are independent
building blocks. Their contents stay on one row when space permits and wrap
when needed. Use `ui-cluster` or another wrapping group for actions, and ensure
nested controls can shrink or wrap. Fixed widths or minimum widths larger than
the available space can still cause overflow; the components cannot adapt
arbitrary content automatically.

The brand may contain text, an image, or both. The components do not
automatically hide part of it; choose and provide a compact logo explicitly if
the application needs one. Provide appropriate alternative text for an image.

`ui-select` uses its natural width inside these bars, while retaining its normal
full-width behavior outside them. The application decides which actions are
important, when to group or move them to a menu, and which breakpoint to use.
Review keyboard access, wrapping and available vertical space with real content
at narrow widths and short viewport heights.

## Imports

```js
import "@luisrodonccs/simplest-ui/tokens.css";
import "@luisrodonccs/simplest-ui/styles.css";
import "@luisrodonccs/simplest-ui/components/drawer";
```

The application chooses its breakpoint. The dashboard uses `1024px` for its
own layout; this is not a package requirement. Keep one navigation tree and move
it between the sidebar and drawer when the layout changes rather than maintaining
two copies. The drawer uses the browser top layer to cover the viewport even
inside a transformed or clipped shell. Set `--sui-drawer-width: 100%` for
full-screen presentation.

In the upcoming 0.4.0 behavior, the background is inert while the drawer is
modal. Setting `open = false` or calling `close()` requests closure; the drawer,
focus trap and scroll locks remain active during exit. `sui-close` fires after
exit, while `updateComplete` only waits for the Lit update. Wait for `sui-close`
before moving navigation out of the drawer or focusing the background. Reopening
during exit cancels the pending close. Reduced motion skips the animation.

The dashboard uses a centered, fixed menu button and provides a matching close
button through the drawer's `footer` slot. Reserve enough bottom space in the
scrollable content for the button and device safe area; the drawer footer also
needs space so its scrollable content can reach the end. Fixed controls may
still cover content during scrolling; use a layout footer instead if that is
unacceptable.

## Standard mobile buttons (recommended)

Use this as the default pattern for every mobile navigation. It keeps the open
and close controls consistent, centered at the bottom, and avoids covering the
last navigation item.

```html
<button type="button" id="menu-trigger" class="menu-trigger"
  aria-label="Open navigation" aria-expanded="false" aria-controls="menu">
  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
</button>

<sui-drawer id="menu" label="Navigation" close-label="Close navigation"
  hide-close-button
  style="--sui-drawer-width: 100%; --sui-drawer-footer-min-height: calc(4rem + max(var(--sui-space-4), env(safe-area-inset-bottom)))">
  <span slot="title">Navigation</span>
  <nav aria-label="Primary"><a href="/projects">Projects</a></nav>
  <button type="button" slot="footer" id="menu-close" class="ui-button ui-button--primary"
    aria-label="Close navigation">
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2">
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  </button>
</sui-drawer>
```

```css
.menu-trigger,
.menu-close {
  position: fixed;
  left: 50%;
  bottom: calc(var(--sui-space-4) + env(safe-area-inset-bottom));
  transform: translateX(-50%);
  z-index: var(--sui-z-popover);
  width: 3rem;
  height: 3rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--sui-color-border);
  border-radius: var(--sui-radius-full);
  background: var(--sui-color-surface-raised);
  color: var(--sui-color-text);
  box-shadow: var(--sui-shadow-card);
  cursor: pointer;
}

/* The close control stays available inside the drawer during its exit. */
@media (min-width: 881px) {
  .menu-trigger { display: none; }
}
```

```js
const trigger = document.querySelector("#menu-trigger");
const menu = document.querySelector("#menu");
const close = document.querySelector("#menu-close");
const compact = window.matchMedia("(max-width: 880px)");

trigger?.addEventListener("click", () => {
  trigger.focus();
  if (menu) menu.open = true;
});
close?.addEventListener("click", () => menu?.close("dismiss"));
menu?.addEventListener("sui-open", () => trigger?.setAttribute("aria-expanded", "true"));
menu?.addEventListener("sui-close", () => {
  trigger?.setAttribute("aria-expanded", "false");
  if (compact.matches) trigger?.focus();
  // On wide layouts, move the navigation back to the sidebar here,
  // then focus an appropriate visible control if needed.
});
menu?.addEventListener("click", (event) => {
  if ((event.target as Element).closest("a")) menu.close("dismiss");
});
compact.addEventListener("change", () => {
  if (!compact.matches && menu?.open) menu.close("dismiss");
});
```

The drawer handles Escape, focus trapping, focus restoration and body scroll
locking; the application closes the drawer on navigation or on return to the
wide layout. Move the single navigation tree back after `sui-close`, checking
the current breakpoint again because it may have changed during the exit.

## Close controls and focus

The default drawer has a close button in its header. `hide-close-button` hides
only that button; use it **only** when supplying an accessible alternative:

```html
<sui-drawer id="navigation" label="Navigation" hide-close-button
  style="--sui-drawer-width: 100%">
  <nav aria-label="Primary"><a href="/projects">Projects</a></nav>
  <button type="button" slot="footer" id="close-navigation">Close menu</button>
</sui-drawer>
```

```js
const drawer = document.querySelector("#navigation");
document.querySelector("#close-navigation").addEventListener("click", () => {
  drawer.close("dismiss");
});
```

The application must also wire its open button, synchronize `aria-expanded`,
close on navigation and on return to the wide layout, and restore focus to a
visible control when the original opener becomes hidden. Give the opener an
accessible name and `aria-controls` pointing to the drawer.

The drawer handles Escape, focus trapping, focus restoration and body scroll
locking. If the application scrolls a separate shell element, it must lock and
restore that element separately while the drawer is open. Use
`--sui-drawer-footer-min-height` when a custom fixed footer control needs
additional reserved space.

Verify keyboard navigation, focus visibility and restoration, long-menu scrolling,
safe-area spacing and resizing across the breakpoint in the target browsers.
