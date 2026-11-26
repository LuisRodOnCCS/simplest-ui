# Roadmap

`v0.3.1` is the current release. Released work is summarized below.

## Preparing v0.4.0 — Modal overlay top layer

- [x] Move `sui-modal` and `sui-drawer` to native modal dialogs so transformed
      and clipped ancestors cannot constrain their viewport coverage.
- [x] Retain the `escape` close reason, focus restoration, backdrop controls,
      inherited tokens and shared scroll locking. Document the intentional
      lifecycle change: `sui-close` fires after the exit animation.
- [x] Validate nested overlays, inert background, keyboard and pointer behavior,
      reduced motion and reconnection in Chromium, Firefox and WebKit.
- [x] Add coordinated modal and drawer entry/exit motion, respecting reduced
      motion and retaining modal resources during exit.
- [x] Validate the packed motion, geometry, interrupted exits and Escape stack
      across Chromium, Firefox and WebKit (213 packed tests overall).
- [ ] Run the unchanged Laravel overlay reproduction against a packed build
      without modifying the adapter's existing work.
- [x] Document the modal behavior change and prepare core 0.4.0 and generator
      0.1.4 with core range `^0.4.0` for a later authorized release.

## v0.3.1 — Adapter contract hardening and tooltip overflow fixes

- [x] Align documented Web Component attributes, writable properties and event details
      with the runtime and type declarations.
- [x] Preserve tooltip descriptions, toast content and caller-owned classes during updates.
- [x] Share modal/drawer scroll locks and close only the topmost overlay on Escape.
- [x] Reconcile dynamic tooltip/popover content and observe disabled tab changes.
- [x] Prevent closed tooltips from widening the page and constrain open tooltips
      to the viewport's horizontal edges.
- [x] Add packed-package regressions and validate both Laravel asset modes locally.
- [x] Derive the visual documentation version from generated metadata and align
      `create-simplest-ui` 0.1.3 with core range `^0.3.1`.

## v0.3.0 — Integration guidance, manifest and contract centralization

- [x] Clarify direct Laravel usage, optional Blade wrappers and the separate
      Laravel adapter.
- [x] Document exclusive package-owned builds containing the required CSS and
      JavaScript.
- [x] Run and record the updated Laravel skill evaluation prompts.
- [x] Add `schemaVersion: 1` and document the manifest schema in
      `docs/manifest-schema.md`.
- [x] Add a `contract` plus one or more `examples` for every CSS component,
      layout and Web Component in `components.manifest.json`.
- [x] Generate `docs/contracts.json` as the single source for copyable snippets
      and contract rows; `docs/catalog.json` remains navigation only.
- [x] Render additional examples as stacked `Variants` blocks in the visual
      documentation.
- [x] Validate that documented entries declare a contract and a `default`
      example, that example ids are unique, that `ui-*` classes are declared, and
      that non-default examples have a complete preview.
- [x] Align `AGENTS.md` and `CLAUDE.md`; update `CONTRIBUTING.md`.
- [x] Add manifest and package-content tests; stabilize visual baselines.
- [x] Make `ui-topbar`, `ui-app-shell__bar` and `ui-app-shell__header` wrap on
      narrow screens; document the responsive contract and limitations.
- [x] Add mobile navigation pattern to the dashboard example and to the
      documentation site, reusing `sui-drawer`.

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
