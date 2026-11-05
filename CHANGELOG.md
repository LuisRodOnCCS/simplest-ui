# Changelog

This project follows [Semantic Versioning](https://semver.org/) and keeps history in a [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) inspired format.

## [Unreleased]

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
