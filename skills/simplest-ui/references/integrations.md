# Integration workflows

Read `integrations.manifest.json` first. The following workflows are stable for
the current release line.

## Vanilla + Vite

Create a project with:

```bash
npm create @luisrodonccs/simplest-ui@latest my-app -- --template vanilla-vite
```

The starter consumes public npm exports only:

```js
import "@luisrodonccs/simplest-ui/tokens.css";
import "@luisrodonccs/simplest-ui/styles.css";
import "@luisrodonccs/simplest-ui/components/drawer";
```

Use `components.js` only when the application needs every registered Web
Component; otherwise prefer individual behavior entrypoints.

## Laravel Blade + Vite

From an existing Laravel application:

```bash
npm install @luisrodonccs/simplest-ui
npx @luisrodonccs/create-simplest-ui@latest . --template laravel-vite
```

The Laravel application owns the Vite imports:

```css
/* resources/css/simplest-ui.css */
@import "@luisrodonccs/simplest-ui/tokens.css";
@import "@luisrodonccs/simplest-ui/styles.css";
```

```js
// resources/js/simplest-ui.js
import "@luisrodonccs/simplest-ui/components.js";
```

Blade renders normal HTML and can use documented `ui-*` classes and `sui-*`
elements directly. Do not copy package `dist` files into `public/` and do not use
`asset('vendor/simplest-ui/...')`.

## Laravel Composer package

From an existing Composer package:

```bash
npm install --save-dev @luisrodonccs/simplest-ui
npx @luisrodonccs/create-simplest-ui@latest . --template laravel-package
```

Use the generated workbench Vite entrypoints for local development. Package Blade
components should render compatible markup, for example:

```blade
<x-sui-drawer label="Filters">
    <x-slot:title>Filters</x-slot:title>
    <p>Compatible Blade markup.</p>
</x-sui-drawer>
```

The package documents the host application requirement; it does not bundle CSS or
Web Component JavaScript for production.
