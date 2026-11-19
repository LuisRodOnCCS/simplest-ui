# Roadmap

`v0.2.1` is the latest published release. Unreleased integration guidance
updates are described in the changelog; released work is summarized below.

## Unreleased — integration guidance

- [x] Clarify direct Laravel usage, optional Blade wrappers and the separate
  Laravel adapter.
- [x] Document exclusive package-owned builds containing the required CSS and
  JavaScript.
- [ ] Run and record the updated Laravel skill evaluation prompts.

## v0.2.0 — Vanilla and Laravel integrations

The core remains framework-agnostic: CSS, Web Components, slots, properties, and
DOM events are the integration contract. Laravel renders compatible HTML. Host
Vite ownership is the default; a package may additionally publish its own
precompiled CSS from public exports for no-Node consumers when its asset mode is
exclusive, documented, and does not duplicate client-side registration.

- [x] Publish `@luisrodonccs/create-simplest-ui`, a dependency-free starter generator.
- [x] Ship and validate a `vanilla-vite` starter that imports the public npm exports.
- [x] Ship a `laravel-vite` integration overlay for existing Laravel applications.
- [x] Ship a `laravel-package` overlay for Laravel package workbenches and Blade views.
- [x] Keep the host Laravel application responsible for loading Simplest UI assets once by default.
- [x] Support an explicit, CSS-only package-assets mode for no-Node Laravel consumers; it compiles public exports into a package-owned artifact rather than copying `dist`.
- [x] Provide Blade examples that render `ui-*` classes and `sui-*` custom elements.
- [x] Validate the generated Vanilla starter against packed npm artifacts and a production build.
- [x] Document installation, ownership of assets, and the package-author workflow.
- [x] Publish a neutral integration manifest for generators, documentation, and future adapters.
- [x] Validate `laravel-folios` with packed `0.2.0` assets and 126 Pest tests, 100% type coverage, PHPStan, Pint, and a production CSS build.
- [x] Validate `quotepdf-sandbox` package and host modes in a production browser build: each mode loaded one asset source, had no console errors, and passed Lighthouse accessibility and best-practices audits (100/100).

### Deferred adapters

- [ ] Add a React adapter only after validating React client applications. It must wrap the existing Web Components rather than duplicate their behavior.
- [ ] Evaluate React SSR/Next.js separately from the client adapter.
- [ ] Validate Vue and other framework adapters from the same public Web Component contract.

## Delivered in v0.1.x

- Framework-agnostic CSS tokens, layouts, Web Components, granular entrypoints,
  bilingual visual documentation, and the Dashboard example.
- Generated component catalog, official agent skill, and installation guidance.
- Browser, Axe, visual-regression, package-consumer, documentation, and release
  verification in CI.
- Published `v0.1.0` and the `v0.1.1` lifecycle-event fix, with GitHub Pages
  documentation deployment.

## `v1.0.0` criteria

- Stable and documented public Web Component APIs.
- Tested framework/CSS-system integration.
- Published SSR and framework guidance.
- Automated browser, accessibility, and visual testing.
- Deprecation policy and release process in place.

## Deferred — v2+

- Validate real Bootstrap 5 and current Tailwind integration examples.
- Validate and document React/Vue integration.
