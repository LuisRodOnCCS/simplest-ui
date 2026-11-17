# Simplest UI for Laravel package authors

These files are intended for an existing Composer package and its workbench.

```bash
npm install --save-dev @luisrodonccs/simplest-ui
```

Load `workbench/resources/css/simplest-ui.css` and
`workbench/resources/js/simplest-ui.js` through the workbench Vite setup. The Blade
component is optional ergonomics: it must render standard `sui-*` markup.

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
offer an exclusive package-assets mode: compile public CSS exports into a
package-owned stylesheet, publish the upstream license beside it, and never copy
files from `dist` or load it alongside host mode. Package-assets mode cannot
provide Simplest UI Web Component JavaScript.
