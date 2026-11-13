# Simplest UI for Laravel package authors

These files are intended for an existing Composer package and its workbench.

```bash
npm install --save-dev @luisrodonccs/simplest-ui
```

Load `workbench/resources/css/simplest-ui.css` and
`workbench/resources/js/simplest-ui.js` through the workbench Vite setup. The Blade
component is optional ergonomics: it must render standard `sui-*` markup and must
not bundle Simplest UI assets.

## Host application contract

The application that installs the Laravel package imports Simplest UI once:

```css
@import "@luisrodonccs/simplest-ui/styles.css";
```

```js
import "@luisrodonccs/simplest-ui/components.js";
```

The Composer package documents this requirement; it does not publish copied files
from `dist`.
