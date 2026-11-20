---
name: simplest-ui
description: Build, extend, review, or document interfaces that use the Simplest UI design system. Use this skill whenever a task occurs in a project with @luisrodonccs/simplest-ui installed, imports ui-* classes or sui-* elements, adds UI to Laravel Blade or a Laravel package using Simplest UI, or asks to add UI to Simplest UI. Check the existing catalog and integration manifest before creating markup or components, reuse the system first, and preserve its accessibility and token conventions.
---

# Simplest UI

Build with Simplest UI as an existing product system, not as a bag of styles. The system is framework-agnostic: CSS classes provide presentational primitives, while only selected interactive patterns are registered Web Components.

## Start with the catalog

1. Locate `components.manifest.json` in the project root. If unavailable, read the package README and inspect the installed exports.
2. Identify whether the requested UI is already available as:
   - a CSS component (`ui-*` class),
   - a layout primitive (`ui-stack`, `ui-grid`, `ui-app-shell`, etc.), or
   - a registered Custom Element (`sui-*`).
3. Reuse the closest existing primitive. Compose CSS components before proposing a new component.
4. Never invent an unregistered `<sui-*>` tag. In particular, cards, tables and alerts are CSS components, not Custom Elements.

Read [references/catalog.md](references/catalog.md) for the current public surface,
[references/integrations.md](references/integrations.md) for installation workflows,
and [references/authoring.md](references/authoring.md) before extending it.

When editing the manifest, follow `docs/manifest-schema.md`. Every documented CSS
component or layout declares a `contract` and at least one example with
`id: "default"`; treat those as the normative markup, not the visual preview.

## Selecting a top bar vs. an app shell header

- `ui-topbar` is a standalone app-level bar (brand + controls, glass, sticky).
  Use it when there is no `ui-app-shell`, or when you want an autonomous bar.
- `ui-app-shell__header` is the header region inside an app shell (title +
  actions). Use it inside `ui-app-shell`.
- They are independent and composable: put a `ui-topbar` inside
  `ui-app-shell__content` if you want the glass/sticky bar inside a shell.
  Never assume one replaces the other.
- `ui-app-shell__header` supports optional `--sticky` (sticky positioning),
  `--scrolled` (state toggled by consumer JS; by itself changes nothing), and
  `--floating` (when combined with `--scrolled`, adopts a topbar-like look:
  rounded corners, card shadow). Toggle `--scrolled` on scroll; add `--floating`
  only if you want the floating appearance.

## Use the correct entrypoint

Use the full bundle when Simplest UI owns the page foundation:

```ts
import "@luisrodonccs/simplest-ui/tokens.css";
import "@luisrodonccs/simplest-ui/styles.css";
```

When Bootstrap, Tailwind, or another system owns global styles, omit the Simplest
reset. Add `base.css` when the markup uses layout primitives such as
`ui-app-shell` or `ui-skip-link`:

```ts
import "@luisrodonccs/simplest-ui/tokens.css";
import "@luisrodonccs/simplest-ui/base.css";
import "@luisrodonccs/simplest-ui/components.css";
```

Register all Web Components with `components.js`, or import only the needed behavior from `components/<name>`.

## Select the integration workflow

Read `integrations.manifest.json` when it is available. It records the supported
starter workflows; do not infer framework support from the presence of an old
example file.

- **Vanilla + Vite:** use `vanilla-vite` as the reference. Install the core package,
  import `tokens.css` before `styles.css`, and import only the needed Web Component
  entrypoints where practical.
- **Laravel application:** use `laravel-vite`. The application owns the Vite
  imports and loads Simplest UI once from `resources/css` and `resources/js`.
- **Laravel Composer package:** use `laravel-package` for workbench development.
  Blade can render `ui-*` classes and `sui-*` elements directly; neither requires
  a Laravel adapter. A package may instead provide its own registered Blade
  wrappers. Separate the asset decision into these contexts:
  1. **Workbench development:** its Vite entrypoints may load the package demo's
     CSS and required Web Component JavaScript.
  2. **Installed package in production:** the host application owns Simplest UI
     CSS and JavaScript by default.

If `luisrodonccs/laravel-simplest-ui` is installed, its registered `x-sui::*`
Blade components are an optional alternative; consult that package's own
documentation for its API and available asset modes. Do not assume that npm
installation or the `laravel-package` starter registers that namespace. The
starter's `x-sui-drawer` is a separate example wrapper and requires registration
by the consuming package.

A documented `package` asset mode may compile the required public CSS and
JavaScript exports into package-owned artifacts and publish them with the
upstream license. It must be exclusive with host asset loading: CSS-only builds
are insufficient when the rendered UI requires Web Component JavaScript. Do
not copy `dist` or use `asset('vendor/simplest-ui/...')`; package mode points to
the package's own published artifacts. Check version compatibility and load
Simplest UI only once per document. Its reset and root tokens are document-wide;
choose selective exports when another system owns the page foundation.

For every Laravel Composer package response, state the workbench and production
asset owners and which CSS and JavaScript the selected mode supplies.

## Diagnose an integration finding

When rendered behavior differs from expectations, do not assume either the core or
the adapter is at fault. Follow
[references/core-feedback.md](references/core-feedback.md): identify the installed
version and asset owner, compare against the contract for that installation,
reproduce with the package's documented markup where feasible, classify the cause,
and recommend the smallest fix in the repository that owns it.

Do not invent `ui-*` classes or `sui-*` elements, do not modify another repository
without authorization, and do not apply speculative core extensions. Never customize
an installed consumer skill copy as the permanent fix: correct the upstream source
and synchronize installed copies afterward.

## Build markup

- Use `--sui-*` tokens and `ui-*` classes. Do not introduce parallel color, spacing, shadow or radius values when a token exists.
- Prefer semantic HTML: `<button>`, `<a>`, `<article>`, `<table>`, `<label>`, and form controls retain their native meaning.
- Use an interactive `sui-*` element only when it is listed in the catalog.
- Keep the component implementation as the behavior source of truth; examples and application code must consume it rather than recreating its focus, Escape, or ARIA behavior.
- Add a clear accessible name to controls and use appropriate live-region roles for feedback.

## Extend only when necessary

Create a new CSS component if composition cannot communicate a reusable visual pattern. Create a Web Component only if the pattern has reusable state or complex accessible interaction.

Before proposing or implementing a new component, state that the current catalog
does not provide the required primitive and why composition is insufficient. A
project that merely consumes Simplest UI must not add a new `sui-*` element
locally: propose the upstream Simplest UI extension instead. Only implement a
new public component when working in the Simplest UI source repository.

When adding either kind in Simplest UI:

1. Reuse tokens and prefixes (`ui-`, `sui-`, `--sui-`).
2. Implement keyboard support, focus behavior, semantic roles and `prefers-reduced-motion` where interaction requires them.
3. Add unit tests for behavior; do not rely solely on a demo.
4. Update `components.manifest.json`, `integrations.manifest.json` when a supported
   workflow changes, the visual catalog, README, TypeScript JSX declarations when
   relevant, and changelog.
5. Run `npm run typecheck`, `npm test`, `npm run build`, `npm run docs:build`, and
   `npm pack --dry-run`.

An extension response must name the missing primitive, explain the composition
gap, and list the required tests, manifest, catalog, documentation, exports, and
changelog work. Do not present an implementation as complete while those public
surface updates are missing.

## Output expectations

When responding to an implementation request, state which existing system primitive you selected and why. If no suitable primitive exists, briefly justify the extension before adding it and list its required public-surface work. Mention any import requirement for new behavior. For a Laravel Composer package, also explicitly state the workbench asset owner, the production asset owner, and whether package-assets mode is valid.
