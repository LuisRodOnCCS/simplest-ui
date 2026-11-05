# Roadmap

`v0.1.0-rc.1` is the audited P0–P2 baseline. This roadmap records planned work; it does not describe released features until they appear in the changelog.

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
- [ ] Evaluate the skill against real reuse, composition, and extension prompts.
- [ ] Publish installation instructions for OpenCode, Claude Code, and other supported agents.
- [ ] Generate the documentation site from the manifest rather than sharing IDs manually.

## P5 — Release quality

- [x] Add E2E coverage in Chromium, Firefox, and WebKit.
- [x] Run automated Axe accessibility audits.
- [x] Add visual regression coverage for components and themes.
- [x] Document browser support and SSR guidance.
- [ ] Define versioning policy and publish `v0.1.0`.
- [ ] Deploy visual documentation through GitHub Pages.

## `v1.0.0` criteria

- Stable and documented public Web Component APIs.
- Tested framework/CSS-system integration.
- Published SSR and framework guidance.
- Automated browser, accessibility, and visual testing.
- Deprecation policy and release process in place.

## Deferred — v2+

- Validate real Bootstrap 5 and current Tailwind integration examples.
- Validate and document React/Vue integration.
