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
`asset('vendor/simplest-ui/...')`. No Laravel adapter is required for this
integration, and installing the npm package alone does not register Blade
components.

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
asset contract. The starter supplies an optional `sui-drawer.blade.php` wrapper;
register the consuming package's component path with Blade before using this
example (or use `<sui-drawer>` directly):

```blade
<x-sui-drawer label="Filters">
    <x-slot:title>Filters</x-slot:title>
    <p>Compatible Blade markup.</p>
</x-sui-drawer>
```

Alternatively, when `luisrodonccs/laravel-simplest-ui` is installed and its
provider is registered, use its `x-sui::*` components, such as
`<x-sui::drawer>`. Its namespace is not registered by the npm package or this
starter. Consult the adapter's documentation for its actual version, API and
asset capabilities; do not introduce it as a dependency unless appropriate.

For production, state the asset decision explicitly. Host-owned Vite assets are
the default. A package may offer a separately selected **package-assets mode**
for consumers without Node, provided that it:

1. compiles the required public Simplest UI CSS exports and, when interactive
   elements are rendered, their JavaScript exports into package-owned artifacts;
2. publishes those artifacts and the upstream license under the package's own
   vendor path;
3. makes package and host asset loading mutually exclusive per document; and
4. documents compatible versions and the publish/update procedure.

A CSS-only build cannot supply Web Component behavior. Simplest UI's reset and
root tokens can affect the whole document; consider selective public exports
when another design system owns the page foundation.

It must never copy Simplest UI `dist` files or publish them as
`vendor/simplest-ui`.
