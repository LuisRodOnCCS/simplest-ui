# Simplest UI for Laravel package authors

These files are intended for an existing Composer package and its workbench.

```bash
npm install --save-dev @luisrodonccs/simplest-ui
```

Load `workbench/resources/css/simplest-ui.css` and
`workbench/resources/js/simplest-ui.js` through the workbench Vite setup. The Blade
component is optional ergonomics: it must render standard `sui-*` markup.
Register the package's anonymous component path with Blade to use the example
`<x-sui-drawer>` wrapper, or use `<sui-drawer>` directly. The npm package does
not register Blade components.

If the separate `luisrodonccs/laravel-simplest-ui` Composer package is installed,
its registered `x-sui::*` components are another option. Consult its own
documentation for its API and supported asset modes; it is not required by this
starter.

## Host application contract

The application that installs the Laravel package imports Simplest UI once:

```css
@import "@luisrodonccs/simplest-ui/tokens.css";
@import "@luisrodonccs/simplest-ui/styles.css";
```

```js
import "@luisrodonccs/simplest-ui/components.js";
```

This is the default integration. A package with no-Node consumers may additionally
offer an exclusive package-assets mode: compile the required public CSS and
JavaScript exports into package-owned artifacts, publish the upstream license
beside them, and never copy files from `dist` or load both modes in the same
document. A CSS-only build is not enough for interactive Web Components.
Document compatible versions and the asset publication and upgrade procedure.
The reset and root tokens affect the document globally; use selective public
exports when another system owns the page foundation.
