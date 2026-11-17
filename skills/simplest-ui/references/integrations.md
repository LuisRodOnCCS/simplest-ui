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

When Tailwind or another reset owns the page, replace `styles.css` with the
public exports the page uses. A layout using `ui-app-shell`, for example, needs:

```css
@import "@luisrodonccs/simplest-ui/tokens.css";
@import "@luisrodonccs/simplest-ui/base.css";
@import "@luisrodonccs/simplest-ui/components.css";
```

## Laravel Composer package

From an existing Composer package:

```bash
npm install --save-dev @luisrodonccs/simplest-ui
npx @luisrodonccs/create-simplest-ui@latest . --template laravel-package
```

Use the generated workbench Vite entrypoints for local development. Those assets
serve the workbench demo only; they are not the installed package's production
asset contract. Package Blade components should render compatible markup, for
example:

```blade
<x-sui-drawer label="Filters">
    <x-slot:title>Filters</x-slot:title>
    <p>Compatible Blade markup.</p>
</x-sui-drawer>
```

For production, state the asset decision explicitly. A package that renders a
Web Component such as `sui-drawer` requires host-owned Vite CSS and the matching
Simplest UI JavaScript import; CSS-only package-assets mode is not valid for that
package. A package can offer a separately selected **package-assets mode** only
for consumers without Node when it needs no Simplest UI Web Component JavaScript,
provided that it:

1. compiles public Simplest UI CSS exports into a package-owned stylesheet;
2. publishes that stylesheet and the upstream license under the package's own
   vendor path;
3. makes package mode and host mode mutually exclusive; and
4. uses no Simplest UI Web Component JavaScript in package mode.

It must never copy Simplest UI `dist` files or publish them as
`vendor/simplest-ui`.
