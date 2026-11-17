# Simplest UI for Laravel + Vite

Install the npm package in the Laravel application:

```bash
npm install @luisrodonccs/simplest-ui
```

Then add these local imports to the existing Vite entrypoints:

```css
/* resources/css/app.css */
@import "./simplest-ui.css";
```

```js
// resources/js/app.js
import "./simplest-ui";
```

The included Blade layout is an example only. The Laravel application owns these
Vite imports and loads Simplest UI once for every package view it renders.
