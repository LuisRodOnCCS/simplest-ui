# Roadmap

`v0.1.1` is the current public release. This roadmap records work planned beyond the current release; released features are recorded in the changelog.

## v0.2.0 — Vanilla and Laravel integrations

The core remains framework-agnostic: CSS, Web Components, slots, properties, and
DOM events are the integration contract. Laravel renders compatible HTML; it does
not reimplement component behavior or ship a second copy of the client assets.

- [ ] Publish `@luisrodonccs/create-simplest-ui`, a dependency-free starter generator.
- [ ] Ship and validate a `vanilla-vite` starter that imports the public npm exports.
- [ ] Ship and validate a `laravel-vite` integration overlay for existing Laravel applications.
- [ ] Ship a `laravel-package` overlay for Laravel package workbenches and Blade views.
- [ ] Keep the host Laravel application responsible for loading Simplest UI assets once.
- [ ] Provide Blade examples that render `ui-*` classes and `sui-*` custom elements.
- [ ] Test generated starters against packed npm artifacts, production builds, browser behavior, and Axe.
- [ ] Document installation, ownership of assets, and the package-author workflow.
- [ ] Publish a neutral integration manifest for generators, documentation, and future adapters.

### Deferred adapters

- [ ] Add a React adapter only after validating React client applications. It must wrap the existing Web Components rather than duplicate their behavior.
- [ ] Evaluate React SSR/Next.js separately from the client adapter.
- [ ] Validate Vue and other framework adapters from the same public Web Component contract.

## P3 — Documentation and interoperability

- [x] Publish separate reset, base, component, and complete CSS entrypoints.
- [x] Order the complete bundle with `sui.reset`, `sui.base`, and `sui.components` layers.
- [x] Document coexistence with other CSS systems.
- [x] Replace the initial demo with a complete bilingual visual documentation site.
- [x] Add a manifest and enforce manifest-to-documentation coverage.
- [x] Convert the legacy Drawer pattern into `<sui-drawer>` and remove the legacy CSS implementation.
- [x] Add an accessible responsive table wrapper.
- [x] Add the Dashboard example page and page navigation.
- [x] Add CSS imports per individual component when measured demand justifies the additional API surface.

## P4 — Agents and automation

- [x] Ship an official Simplest UI agent skill.
- [x] Evaluate the skill against real reuse, composition, and extension prompts.
- [x] Publish installation instructions for OpenCode, Claude Code, and other supported agents.
- [x] Generate the documentation site from the manifest rather than sharing IDs manually.

## P5 — Release quality

- [x] Add E2E coverage in Chromium, Firefox, and WebKit.
- [x] Run automated Axe accessibility audits.
- [x] Add visual regression coverage for components and themes.
- [x] Document browser support and SSR guidance.
- [x] Define the versioning policy.
- [x] Publish `v0.1.0`.
- [x] Deploy visual documentation through GitHub Pages.
- [x] Publish `v0.1.1` lifecycle-event fix.

## `v1.0.0` criteria

- Stable and documented public Web Component APIs.
- Tested framework/CSS-system integration.
- Published SSR and framework guidance.
- Automated browser, accessibility, and visual testing.
- Deprecation policy and release process in place.

## Deferred — v2+

- Validate real Bootstrap 5 and current Tailwind integration examples.
- Validate and document React/Vue integration.
