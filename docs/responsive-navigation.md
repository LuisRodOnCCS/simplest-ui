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
two copies. Place the drawer outside the scrollable shell so it can cover the
viewport, and set `--sui-drawer-width: 100%` for full-screen presentation.

The dashboard uses a centered, fixed menu button and provides a matching close
button through the drawer's `footer` slot. Reserve enough bottom space in the
scrollable content for the button and device safe area; the drawer footer also
needs space so its scrollable content can reach the end. Fixed controls may
still cover content during scrolling; use a layout footer instead if that is
unacceptable.

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
