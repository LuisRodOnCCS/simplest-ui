# Simplest UI catalog

Generated from `components.manifest.json` by `npm run catalog:generate`. Do not edit manually.

Read `components.manifest.json` in the repository root first; it is the machine-readable source of truth.

## Registered Web Components

| Element | Import | Keyboard |
| --- | --- | --- |
| `sui-modal` | `@luisrodonccs/simplest-ui/components/modal` | Escape, focus trap |
| `sui-drawer` | `@luisrodonccs/simplest-ui/components/drawer` | Escape, focus trap |
| `sui-dropdown` | `@luisrodonccs/simplest-ui/components/dropdown` | ArrowUp, ArrowDown, Home, End, Enter, Space, Escape, Tab |
| `sui-tabs` | `@luisrodonccs/simplest-ui/components/tabs` | ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home, End |
| `sui-accordion` | `@luisrodonccs/simplest-ui/components/accordion` | ArrowUp, ArrowDown, Home, End |
| `sui-popover` | `@luisrodonccs/simplest-ui/components/popover` | ArrowDown, Enter, Space, Escape, Tab |
| `sui-tooltip` | `@luisrodonccs/simplest-ui/components/tooltip` | focus |
| `sui-toast` | `@luisrodonccs/simplest-ui/components/toast` | None |

## CSS components

- **Button**: `ui-button`, `ui-button--primary`, `ui-button--danger`, `ui-button--ghost`, `ui-button--sm`
- **Input Field**: `ui-field`, `ui-label`, `ui-help`, `ui-error`, `ui-input`, `ui-input--invalid`
- **Textarea**: `ui-textarea`, `ui-textarea--invalid`
- **Select**: `ui-select`, `ui-select--invalid`
- **Checkbox**: `ui-checkbox`, `ui-checkbox--disabled`
- **Radio**: `ui-radio`, `ui-radio-group`
- **Switch**: `ui-switch`, `ui-switch__track`
- **Card**: `ui-card`, `ui-card--raised`, `ui-card--glass`, `ui-card__header`, `ui-card__title`, `ui-card__body`, `ui-card__footer`
- **Badge Chip**: `ui-badge`, `ui-badge--primary`, `ui-badge--success`, `ui-badge--warning`, `ui-badge--danger`, `ui-badge--info`, `ui-badge--outline`, `ui-chip`
- **Alert**: `ui-alert`, `ui-alert--success`, `ui-alert--warning`, `ui-alert--danger`, `ui-alert--info`
- **Spinner**: `ui-spinner`, `ui-spinner--sm`, `ui-spinner--lg`
- **Skeleton**: `ui-skeleton`, `ui-skeleton--text`, `ui-skeleton--title`, `ui-skeleton--avatar`, `ui-skeleton--block`
- **Progress**: `ui-progress`, `ui-progress__bar`, `ui-progress--indeterminate`
- **Table**: `ui-table-wrap`, `ui-table`
- **Avatar**: `ui-avatar`, `ui-avatar--sm`, `ui-avatar--lg`, `ui-avatar-group`
- **Stat**: `ui-stat`, `ui-stat__label`, `ui-stat__value`, `ui-stat__hint`
- **Empty State**: `ui-empty`, `ui-empty__title`, `ui-empty__body`
- **Nav**: `ui-nav`, `ui-nav__item`, `ui-nav__item--active`, `ui-nav__group-title`
- **Topbar**: `ui-topbar`, `ui-topbar__brand`, `ui-topbar__mark`, `ui-topbar__controls`, `ui-topbar--glass`

## Layouts

- **Container**: `ui-container`
- **Stack**: `ui-stack`
- **Cluster**: `ui-cluster`
- **Grid**: `ui-grid`, `ui-grid--auto`
- **App Shell**: `ui-app-shell`, `ui-app-shell--contained`, `ui-app-shell__sidebar`, `ui-app-shell__header`, `ui-app-shell__main`
- **Skip Link**: `ui-skip-link`

## Markup contracts

These entries require markup beyond their class names. Follow the example and requirements for the installed version.

### Table

```html
<div class="ui-table-wrap" role="region" aria-label="Users" tabindex="0">
  <table class="ui-table">
    <caption class="sr-only">Users</caption>
    ...
  </table>
</div>
```

Required:
- The scroll container needs role="region" and an accessible name
- tabindex="0" keeps the horizontal scroll container reachable from the keyboard
- Give the table an accessible name; a caption, visible or visually hidden, is the preferred mechanism

Recommended:
- Keep the caption and the region label consistent when both name the same content

### Grid

```html
<div class="ui-grid ui-grid--auto">
  <article>One</article>
  <article>Two</article>
</div>
```

Required:
- Use ui-grid--auto when the column count must adapt to the viewport

Recommended:
- Do not force a fixed column count for content that must reflow on narrow screens

### Skip Link

```html
<a class="ui-skip-link" href="#main-content">Skip to content</a>
<main id="main-content" tabindex="-1">...</main>
```

Required:
- Place it as the first focusable element in the document
- Point href at the id of the main landmark
- Give the target tabindex="-1" so activation transfers focus

Recommended:
- Verify real sequential Tab navigation, visible focus and focus transfer in the supported engines
- If the target engine excludes links from its default Tab order, test whether an explicit tabindex="0" is needed for that environment instead of treating it as a universal requirement

## Integrations

- **Vanilla + Vite** (stable): `vanilla-vite`
- **Laravel Blade + Vite** (stable): `laravel-vite`
- **Laravel package development** (stable): `laravel-package`
