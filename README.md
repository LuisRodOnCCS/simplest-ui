# Simplest UI

Framework-agnostic design system with CSS tokens, semantic components, layouts, and accessible Web Components.

> `v0.1.0` is the next public release. See [ROADMAP.md](./ROADMAP.md) for planned work, [CHANGELOG.md](./CHANGELOG.md) for release history, and [VERSIONING.md](./VERSIONING.md) for the release policy.

## Install

```bash
npm install @luisrodonccs/simplest-ui
```

```ts
import "@luisrodonccs/simplest-ui/tokens.css";
import "@luisrodonccs/simplest-ui/styles.css";
import "@luisrodonccs/simplest-ui/components.js";
```

For one interactive element only:

```ts
import "@luisrodonccs/simplest-ui/components/drawer";
```

## CSS entrypoints

| Entrypoint | Purpose |
| --- | --- |
| `tokens.css` | Color, spacing, typography, radius, shadow, motion, and effect tokens. |
| `reset.css` | Optional global reset. |
| `base.css` | Base typography, utilities, and layouts. |
| `components.css` | Component classes without a global reset. |
| `styles.css` | Complete bundle ordered in `sui.reset`, `sui.base`, and `sui.components` layers. |

Every CSS component is also available as an individual import. Import `tokens.css` first; add `base.css` only when you need its typography, utilities, or layouts.

```ts
import "@luisrodonccs/simplest-ui/tokens.css";
import "@luisrodonccs/simplest-ui/components/button.css";
import "@luisrodonccs/simplest-ui/components/card.css";
```

This is suitable for vanilla applications and Laravel Blade projects built with Vite. The package uses `ui-` CSS classes, `sui-` custom-element names, and `--sui-` tokens.

## CSS components

Use semantic HTML with `ui-*` classes. Cards, tables, alerts, avatars, progress indicators, form controls, and layouts are CSS components rather than custom elements.

```html
<article class="ui-card ui-card--glass">
  <h2 class="ui-card__title">Project summary</h2>
  <p class="ui-card__body">A semantic card component.</p>
</article>

<div class="ui-table-wrap" role="region" aria-label="Users" tabindex="0">
  <table class="ui-table">...</table>
</div>
```

## Web Components

| Element | Import | Highlights |
| --- | --- | --- |
| `<sui-modal>` | `components/modal` | Focus trap, scroll lock, Escape, focus restoration. |
| `<sui-drawer>` | `components/drawer` | Accessible modal side panel. |
| `<sui-dropdown>` | `components/dropdown` | Action menu and keyboard navigation. |
| `<sui-tabs>` | `components/tabs` | Arrow-key tab navigation. |
| `<sui-accordion>` | `components/accordion` | Single or multiple disclosure panels. |
| `<sui-popover>` | `components/popover` | Contextual dialog and viewport placement. |
| `<sui-tooltip>` | `components/tooltip` | Automatic `aria-describedby`. |
| `<sui-toast>` | `components/toast` | Live announcements and `SuiToast.show()`. |

```html
<sui-drawer label="Filters" close-label="Close filters">
  <span slot="title">Filters</span>
  <p>Adjust the current result set.</p>
  <div slot="footer"><button class="ui-button" type="button">Apply</button></div>
</sui-drawer>
```

Interactive components expose `sui-*` custom events and include keyboard behavior, ARIA relationships, visible focus, and reduced-motion support.

## Theme

Override semantic tokens to adapt the full system:

```css
:root {
  --sui-color-primary: #7c3aed;
  --sui-radius-lg: 0.75rem;
}
```

Use `<html data-theme="dark">` to apply the built-in dark token mapping.

## Support

| Area | Support |
| --- | --- |
| Browsers | Chrome, Edge, Firefox, and Safari, last two versions; current Chrome Android and Safari iOS. |
| Environments | Vanilla HTML/JavaScript and Laravel Blade with Vite. |
| Rendering | CSS during SSR; Web Components in the client bundle. |
| Accessibility | WCAG 2.2 AA target; no `critical` or `serious` Axe violations. |

React, Vue, Bootstrap, and Tailwind integration are not validated for `0.1.0`. See [SUPPORT.md](./SUPPORT.md) for the complete policy, including SSR and known limitations.

## Documentation

The visual documentation lives in `docs/` and supports English and Spanish. It covers every public CSS component, Web Component, layout, token category, and example page.

```bash
npm run docs:dev
npm run docs:build
```

The Dashboard page is available at `docs/pages/dashboard.html` while running the documentation server.

## Agent skill

`skills/simplest-ui` is a versioned Agent Skill. It guides agents to inspect `components.manifest.json`, reuse existing primitives first, and only extend the system when composition is insufficient. It is included in the npm package but is not activated automatically. See the [installation guide](./skills/simplest-ui/INSTALL.md) for OpenCode, Claude Code, and other Agent Skills clients.

## Testing

Unit and component tests use Vitest:

```bash
npm test
```

End-to-end tests use Playwright and Axe across Chromium, Firefox, and WebKit. They cover documentation navigation, component keyboard and focus behavior, the 320px responsive floor, Axe audits in light and dark themes, and the vanilla and Laravel/Vite consumer fixtures.

```bash
npm run test:e2e:install   # first run only
npm run test:e2e
```

`npm run test:e2e` builds the package before starting the suite. Tests fail on any `critical` or `serious` Axe violation.

Visual regression tests compare documentation and dashboard screenshots in light and dark themes at desktop and 320px widths. Baselines are stored with the `-win32` suffix and generated on Windows to match the dedicated CI job.

```bash
npm run test:visual
npm run test:visual:update   # after an intentional visual change
```

## Development

```bash
npm run typecheck
npm test
npm run build
npm run test:consumer
npm run docs:build
npm pack --dry-run
```

`npm run build` validates every package export. `npm run test:consumer` bundles the Laravel/Vite and SSR fixtures. `npm run docs:build` verifies that every manifest entry has a visual documentation entry. CI runs these checks plus the Playwright suite.

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md). Contributions must preserve the token system, prefixes, semantic HTML, accessibility, tests, manifest coverage, and visual documentation.
