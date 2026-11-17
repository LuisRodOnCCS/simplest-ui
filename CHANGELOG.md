# Changelog

This project follows [Semantic Versioning](https://semver.org/) and keeps history in a [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) inspired format.

## [Unreleased]

## [0.2.1] - 2026-11-17

### Security

- Upgraded the development toolchain to `vite ^8.3.8` and `vitest ^5.1.0`, closing the critical `vitest` and `tinypool` advisories plus the `vite` and `esbuild` findings reported by `npm audit`.
- Runtime dependencies remain unchanged: the published package still only requires `lit`, and `npm audit --omit=dev` reports no findings.

### Changed

- Rebuilt `dist` with Vite 8 so the published artifacts match a build of this tag. The library now emits an additional shared `decorate` chunk, and CSS is minified by Lightning CSS, which reorders declarations and adds the `--lightningcss-light` and `--lightningcss-dark` custom properties to `:root` in `tokens.css`. No component API, token name, class name, or export changed.
- CI and documentation deployment now run on Node 22, as required by `vitest 5`.
- Vite configurations use `import.meta.dirname` instead of `__dirname`.
- Generated catalog validation is line-ending agnostic, so Windows checkouts no longer report stale catalogs.

### Known issues

- `npm audit` still reports five high findings in development tooling, all traced to `GHSA-fc5q-39xc-vjpf` (`picomatch` regular expression denial of service). No patched version exists yet: the advisory declares `first_patched_version: null` and `4.0.7` is the latest release. The affected matching runs against developer-authored glob configuration only, and the vulnerability is not reachable from the published package.

## [0.1.1] - 2026-11-17

### Fixed

- `vanilla-vite` starters now generate `vite ^8.3.8` instead of `^5.2.0`, so new projects no longer start on the Vite 5 line that carries the reported advisories.
- Generated `package.json` files declare `engines.node` matching the Vite 8 requirement.

## [0.2.0] - 2026-11-17

### Added

- `@luisrodonccs/create-simplest-ui` with `vanilla-vite`, `laravel-vite`, and `laravel-package` starters.
- Versioned integration metadata, generated integration documentation, and packed-package validation for the Vanilla starter.
- Laravel guidance with host-owned Vite assets as the default plus an exclusive, CSS-only package-assets mode for no-Node consumers.
- Laravel-aware Simplest UI skill guidance, references, and evaluation prompts.

### Changed

- Web Component manifest entries now expose public class names, property types, and event detail metadata for future framework adapters.
- Removed historical, unpublished templates in favor of maintained generator templates.

## [0.1.1] - 2026-11-09

### Fixed

- `sui-modal`, `sui-drawer`, and `sui-dropdown` no longer emit lifecycle events during their initial render; modal and drawer close events now include a typed `reason` detail.

## [0.1.0] - 2026-11-05

### Added

- Bilingual visual documentation with full component, layout, token, and page coverage.
- `sui-drawer`, an accessible modal side-panel Web Component.
- Accessible responsive table wrapper via `ui-table-wrap`.
- Documentation coverage verification in CI.
- Published support policy covering browsers, environments, SSR, accessibility targets, and known limitations.
- Playwright and Axe end-to-end suite for Chromium, Firefox, and WebKit, including keyboard, focus, 320px responsive, and light/dark accessibility checks.
- Playwright visual regression coverage for documentation and dashboard surfaces in light and dark themes at desktop and 320px widths.
- Generated documentation navigation and agent catalog reference from `components.manifest.json`.
- Agent skill installation guidance for OpenCode, Claude Code, and compatible Agent Skills clients.
- Bilingual visual documentation for the official Simplest UI agent skill.
- Evaluated the agent skill against real composition, reuse, and extension prompts in OpenCode.
- GitHub Pages deployment workflow with a GitHub Pages-aware Vite base and root documentation redirect.

### Changed

- Technical repository documentation is now maintained in English.
- Tab panels rely on their own ids instead of cross-shadow ARIA references, which are invalid IDREFs.

### Fixed

- Residual `aria-pressed` on the document element in the documentation.
- Missing accessible name for the compact topbar brand.
- Insufficient contrast in documentation navigation labels, swatches, and spacing samples.
- Horizontal overflow in the documentation at 320px.

### Removed

- Legacy CSS-only Drawer implementation.

## [0.1.0-rc.1] - 2026-11-04

### Added

- CSS tokens, layouts, CSS components, and dark theme.
- Accessible modal, dropdown, tabs, accordion, popover, tooltip, and toast Web Components.
- Granular Web Component entrypoints, tests, and CI.
