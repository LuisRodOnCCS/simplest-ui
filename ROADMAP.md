# Roadmap

`v0.1.1` is the latest published release. `v0.2.0` is in development. Released
work is summarized below and detailed in the changelog; this roadmap emphasizes
the work still needed to release the next version.

## v0.2.0 — Vanilla and Laravel integrations

The core remains framework-agnostic: CSS, Web Components, slots, properties, and
DOM events are the integration contract. Laravel renders compatible HTML; it does
not reimplement component behavior or ship a second copy of the client assets.

- [ ] Publish `@luisrodonccs/create-simplest-ui`, a dependency-free starter generator.
- [x] Ship and validate a `vanilla-vite` starter that imports the public npm exports.
- [x] Ship a `laravel-vite` integration overlay for existing Laravel applications.
- [x] Ship a `laravel-package` overlay for Laravel package workbenches and Blade views.
- [x] Keep the host Laravel application responsible for loading Simplest UI assets once.
- [x] Provide Blade examples that render `ui-*` classes and `sui-*` custom elements.
- [x] Validate the generated Vanilla starter against packed npm artifacts and a production build.
- [x] Document installation, ownership of assets, and the package-author workflow.
- [x] Publish a neutral integration manifest for generators, documentation, and future adapters.
- [ ] Add a real Laravel application/package workbench test that exercises generated files in a browser and runs Axe.

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
