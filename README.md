# Simplest UI

Framework-agnostic design system with CSS tokens, semantic components, layouts, and accessible Web Components.

> `v0.1.0-rc.1` is the audited baseline. See [ROADMAP.md](./ROADMAP.md) for planned work and [CHANGELOG.md](./CHANGELOG.md) for release history.

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

The package uses `ui-` CSS classes, `sui-` custom-element names, and `--sui-` tokens. When Bootstrap, Tailwind, or another system owns global styles, import `tokens.css` and `components.css` rather than `styles.css`.

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

## Documentation

The visual documentation lives in `docs/` and supports English and Spanish. It covers every public CSS component, Web Component, layout, token category, and example page.

```bash
npm run docs:dev
npm run docs:build
```

The Dashboard page is available at `docs/pages/dashboard.html` while running the documentation server.

## Agent skill

`skills/simplest-ui` is a versioned agent skill. It guides agents to inspect `components.manifest.json`, reuse existing primitives first, and only extend the system when composition is insufficient. Install it in the skill directory used by your agent; agents do not usually discover skills inside `node_modules` automatically.

## Development

```bash
npm run typecheck
npm test
npm run build
npm run docs:build
npm pack --dry-run
```

`npm run build` validates every package export. `npm run docs:build` verifies that every manifest entry has a visual documentation entry. CI runs both checks.

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md). Contributions must preserve the token system, prefixes, semantic HTML, accessibility, tests, manifest coverage, and visual documentation.
