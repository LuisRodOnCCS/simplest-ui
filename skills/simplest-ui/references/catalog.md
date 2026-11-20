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
| `sui-tag` | `@luisrodonccs/simplest-ui/components/tag` | None |

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
- **Alert**: `ui-alert`, `ui-alert--success`, `ui-alert--warning`, `ui-alert--danger`, `ui-alert--info`, `ui-alert__title`, `ui-alert__body`
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
- **App Shell**: `ui-app-shell`, `ui-app-shell--contained`, `ui-app-shell__bar`, `ui-app-shell__sidebar`, `ui-app-shell__sidebar--sticky`, `ui-app-shell__sidebar--scroll`, `ui-app-shell__content`, `ui-app-shell__header`, `ui-app-shell__header--sticky`, `ui-app-shell__header--scrolled`, `ui-app-shell__header--floating`, `ui-app-shell__main`
- **Skip Link**: `ui-skip-link`

## Markup contracts

Each documented entry declares a contract and one or more examples. Start with the `default` example.

### Button

Required:
- Use a native button element with an explicit type.

Recommended:
- Use a link for navigation and a button for actions.

#### Primary action (`default`)

```html
<button class="ui-button ui-button--primary" type="button">Save changes</button>
```

#### Variants and sizes (`variants`)

```html
<button class="ui-button" type="button">Cancel</button>
<button class="ui-button ui-button--ghost" type="button">More options</button>
<button class="ui-button ui-button--danger" type="button">Delete</button>
<button class="ui-button ui-button--sm" type="button" disabled>Disabled</button>
```

Recommended for this example:
- Use ui-button--sm for compact toolbars and secondary actions.

### Input Field

Required:
- Associate every input with a visible label using for and id.
- Link help and error text with aria-describedby.

Recommended:
- Set aria-invalid on the input when ui-input--invalid is used.

#### Input with help text (`default`)

```html
<div class="ui-field">
  <label class="ui-label" for="name">Name</label>
  <input class="ui-input" id="name" aria-describedby="name-help" />
  <div class="ui-help" id="name-help">Use your full name.</div>
</div>
<div class="ui-field">
  <label class="ui-label" for="disabled-name">Name</label>
  <input class="ui-input" id="disabled-name" value="Disabled" disabled />
</div>
```

#### Invalid input (`invalid`)

```html
<div class="ui-field">
  <label class="ui-label" for="email">Email</label>
  <input class="ui-input ui-input--invalid" id="email" value="not-an-email" aria-invalid="true" aria-describedby="email-error" />
  <div class="ui-error" id="email-error">Enter a valid email address.</div>
</div>
```

Required for this example:
- Mark invalid inputs with aria-invalid="true".

### Textarea

Required:
- Associate the textarea with a visible label.

Recommended:
- Link error text with aria-describedby.

#### Textarea with label (`default`)

```html
<label class="ui-label" for="message">Message</label>
<textarea class="ui-textarea" id="message"></textarea>
```

#### Invalid textarea (`invalid`)

```html
<label class="ui-label" for="message-error">Message</label>
<textarea class="ui-textarea ui-textarea--invalid" id="message-error" aria-invalid="true" aria-describedby="message-error-text">Too short</textarea>
<div class="ui-error" id="message-error-text">Add at least 20 characters.</div>
```

Required for this example:
- Mark invalid textareas with aria-invalid="true".

### Select

Required:
- Associate the select with a visible label.

Recommended:
- Link error text with aria-describedby.

#### Select with label (`default`)

```html
<label class="ui-label" for="country">Country</label>
<select class="ui-select" id="country">
  <option>Mexico</option>
</select>
```

#### Invalid select (`invalid`)

```html
<div class="ui-field">
  <label class="ui-label" for="country-error">Country</label>
  <select class="ui-select ui-select--invalid" id="country-error" aria-invalid="true" aria-describedby="country-error-text">
    <option>Select a country</option>
  </select>
  <div class="ui-error" id="country-error-text">Choose an option.</div>
</div>
```

Required for this example:
- Mark invalid selects with aria-invalid="true".

### Checkbox

Required:
- Wrap the native checkbox and its label text in the same label element.

#### Checkbox with label (`default`)

```html
<label class="ui-checkbox">
  <input type="checkbox" name="updates" />
  Receive updates
</label>
```

#### Disabled checkbox (`disabled`)

```html
<label class="ui-checkbox ui-checkbox--disabled">
  <input type="checkbox" disabled />
  Disabled option
</label>
```

### Radio

Required:
- Group related radios in a fieldset with a legend.

#### Radio group (`default`)

```html
<fieldset class="ui-radio-group">
  <legend class="ui-label">Plan</legend>
  <label class="ui-radio"><input type="radio" name="plan" /> Starter</label>
  <label class="ui-radio"><input type="radio" name="plan" /> Pro</label>
</fieldset>
```

### Switch

Required:
- Use a native checkbox with role="switch" and an associated label.

#### Switch (`default`)

```html
<label class="ui-switch">
  <input type="checkbox" role="switch" checked />
  <span class="ui-switch__track"></span>
  Notifications
</label>
```

#### Disabled switch (`disabled`)

```html
<label class="ui-switch">
  <input type="checkbox" role="switch" disabled />
  <span class="ui-switch__track"></span>
  Disabled
</label>
```

### Card

Recommended:
- Use a heading inside ui-card__title when the card represents a section.

#### Card with heading (`default`)

```html
<article class="ui-card">
  <header class="ui-card__header"><h3 class="ui-card__title">Title</h3></header>
  <div class="ui-card__body">Supporting content.</div>
</article>
```

#### Raised card (`raised`)

```html
<article class="ui-card ui-card--raised">
  <div class="ui-card__body">Higher visual separation.</div>
</article>
```

### Badge Chip

Recommended:
- Use a badge for status and a chip for categories or filters.

#### Badge and chip (`default`)

```html
<span class="ui-badge ui-badge--success">Active</span>
<span class="ui-chip">Design systems</span>
```

### Alert

Required:
- Use role="status" for non-urgent updates and role="alert" for urgent errors.

#### Status alert (`default`)

```html
<div class="ui-alert ui-alert--warning" role="status">
  <div>
    <div class="ui-alert__title">Review required</div>
    <div class="ui-alert__body">Two fields are missing.</div>
  </div>
</div>
```

#### Urgent alert (`urgent`)

```html
<div class="ui-alert ui-alert--danger" role="alert">
  <div>
    <div class="ui-alert__title">Connection failed</div>
    <div class="ui-alert__body">Try again in a moment.</div>
  </div>
</div>
```

### Spinner

Required:
- Give the spinner role="status" and an accessible name.

#### Spinner (`default`)

```html
<span class="ui-spinner" role="status" aria-label="Loading"></span>
```

#### Small and large spinners (`sizes`)

```html
<span class="ui-spinner ui-spinner--sm" role="status" aria-label="Loading"></span>
<span class="ui-spinner ui-spinner--lg" role="status" aria-label="Loading"></span>
```

### Skeleton

Recommended:
- Hide decorative skeletons from assistive technology when nearby text already announces loading.

#### Text skeleton (`default`)

```html
<div class="ui-skeleton ui-skeleton--title"></div>
<div class="ui-skeleton ui-skeleton--text"></div>
```

### Progress

Required:
- Use role="progressbar" with aria-valuemin, aria-valuemax and aria-valuenow for determinate progress.
- Omit aria-valuenow for indeterminate progress.

#### Determinate progress (`default`)

```html
<div class="ui-progress" role="progressbar" aria-label="Upload progress" aria-valuenow="64" aria-valuemin="0" aria-valuemax="100">
  <div class="ui-progress__bar" style="width: 64%"></div>
</div>
```

#### Indeterminate progress (`indeterminate`)

```html
<div class="ui-progress ui-progress--indeterminate" role="progressbar" aria-label="Loading">
  <div class="ui-progress__bar"></div>
</div>
```

### Table

Required:
- Give every table an accessible name, preferably with a caption, visible or visually hidden.

#### Scrollable table (`default`)

```html
<div class="ui-table-wrap" role="region" aria-label="Users" tabindex="0">
  <table class="ui-table">
    <caption class="sr-only">Users</caption>
    ...
  </table>
</div>
```

Required for this example:
- Wrap tables that can overflow in ui-table-wrap with role="region" and an accessible name.
- Add tabindex="0" to the scroll wrapper so it is reachable from the keyboard.

Recommended for this example:
- Keep the wrapper label and the table caption consistent when both describe the same content.

#### Static table (`static`)

```html
<table class="ui-table">
  <caption>Users</caption>
  <thead>
    <tr><th>Name</th><th>Role</th></tr>
  </thead>
  <tbody>
    <tr><td>Ana García</td><td>Admin</td></tr>
  </tbody>
</table>
```

Recommended for this example:
- Use ui-table-wrap only when the table can overflow its container.

### Avatar

Required:
- Give an initials avatar an accessible label, or hide it when adjacent text names the person.
- Provide alt text for avatar images.

#### Initials and image avatar (`default`)

```html
<span class="ui-avatar" aria-label="Ada Lovelace">AL</span>
<span class="ui-avatar"><img src="avatar.jpg" alt="Ada Lovelace" /></span>
```

#### Avatar group (`group`)

```html
<div class="ui-avatar-group" aria-label="Team members">
  <span class="ui-avatar" aria-label="Ada Lovelace">AL</span>
  <span class="ui-avatar" aria-label="Grace Hopper">GH</span>
</div>
```

### Stat

Recommended:
- Use a label that explains what the value measures.

#### Stat (`default`)

```html
<div class="ui-stat">
  <div class="ui-stat__label">Users</div>
  <div class="ui-stat__value">1,284</div>
  <div class="ui-stat__hint">+12% this month</div>
</div>
```

### Empty State

Recommended:
- Explain the next action in ui-empty__body.

#### Empty state (`default`)

```html
<div class="ui-empty">
  <h3 class="ui-empty__title">No results</h3>
  <p class="ui-empty__body">Create a record to get started.</p>
</div>
```

### Nav

Required:
- Mark the current link with aria-current="page".

Recommended:
- Give the nav element an accessible name when the page has more than one navigation landmark.

#### Navigation with current page (`default`)

```html
<nav class="ui-nav" aria-label="Workspace">
  <a class="ui-nav__item ui-nav__item--active" href="/dashboard" aria-current="page">Dashboard</a>
</nav>
```

### Topbar

Recommended:
- Use a header element when the topbar introduces the page.
- Use wrapping groups such as ui-cluster for controls; children must be able to shrink or wrap on narrow screens.
- Brand content can be text, an image or both; the application chooses any compact alternative and action priorities.
- ui-select uses natural width within the bar; fixed or excessive minimum widths can still overflow.
- Use ui-topbar for a standalone app-level bar (brand + controls) outside an app shell.
- Inside ui-app-shell, prefer ui-app-shell__header (optionally --sticky/--scrolled); do not combine with a separate ui-topbar unless you want both.

#### Topbar (`default`)

```html
<header class="ui-topbar">
  <a class="ui-topbar__brand" href="/"><span class="ui-topbar__mark">S</span><span>Simplest UI</span></a>
  <div class="ui-topbar__controls">...</div>
</header>
```

### Container

Recommended:
- Use one ui-container per content region; do not nest containers.

#### Container (`default`)

```html
<div class="ui-container">...</div>
```

### Stack

Recommended:
- Adjust spacing with --ui-stack-gap instead of margins on children.

#### Stack (`default`)

```html
<div class="ui-stack">
  <div>One</div>
  <div>Two</div>
</div>
```

### Cluster

Recommended:
- Adjust spacing with --ui-cluster-gap instead of margins on children.

#### Cluster (`default`)

```html
<div class="ui-cluster">
  <button type="button">One</button>
  <button type="button">Two</button>
</div>
```

### Grid

Required:
- Use ui-grid to place content in a grid.

#### Adaptive grid (`default`)

```html
<div class="ui-grid ui-grid--auto">
  <article>One</article>
  <article>Two</article>
</div>
```

Required for this example:
- Use ui-grid--auto when the column count must adapt to the viewport.

Recommended for this example:
- Do not force a fixed column count for content that must reflow on narrow screens.

#### Fixed columns (`fixed`)

```html
<div class="ui-grid" style="--ui-grid-cols: 2">
  <article>One</article>
  <article>Two</article>
</div>
```

Required for this example:
- Set --ui-grid-cols only when the layout must keep a fixed column count.

### App Shell

Required:
- Give the main region a main element.

Recommended:
- Use ui-app-shell--contained when the shell should respect the container width.
- Use ui-app-shell__header for the header region inside the shell (title + actions).
- Use ui-app-shell__header--sticky for positioning; add --floating and toggle --scrolled from application code to opt into the floating appearance.
- Use ui-app-shell__sidebar--sticky for a sticky sidebar; constrain its height to the scrollport for independent menu scrolling. Sticky is disabled below 768px.
- Use ui-app-shell__sidebar--scroll when the menu should move with the content but scroll internally if it is too long.
- Use ui-app-shell__bar as an optional full-width region. Sticky positioning and measuring its height are the consuming application's responsibility.
- Bar and header contents wrap; group actions with ui-cluster and ensure nested controls can shrink or wrap.
- ui-select uses natural width within the bar or header; the application chooses brand content, action priorities and compact alternatives.
- Fixed or excessive minimum widths on nested content can still cause overflow.
- Set --sui-app-shell-top-offset to the height of any sticky bar above the sidebar and floating header.

#### App shell (`default`)

```html
<div class="ui-app-shell">
  <aside class="ui-app-shell__sidebar">...</aside>
  <div class="ui-app-shell__content">
    <header class="ui-app-shell__header">...</header>
    <main class="ui-app-shell__main">...</main>
  </div>
</div>
```

#### Shell with global bar (`with-bar`)

```html
<div class="ui-app-shell ui-app-shell--contained">
  <header class="ui-app-shell__bar">Workspace controls</header>
  <aside class="ui-app-shell__sidebar"><nav aria-label="Workspace">Navigation</nav></aside>
  <div class="ui-app-shell__content">
    <header class="ui-app-shell__header">Dashboard</header>
    <main class="ui-app-shell__main">Content</main>
  </div>
</div>
```

### Skip Link

Required:
- Place it as the first focusable element in the document.
- Point href at the id of the main landmark.
- Give the target tabindex="-1" so activation transfers focus.

Recommended:
- Verify real sequential Tab navigation, visible focus and focus transfer in the supported engines.
- If the target engine excludes links from its default Tab order, test whether an explicit tabindex="0" is needed for that environment instead of treating it as a universal requirement.

#### Skip to main content (`default`)

```html
<a class="ui-skip-link" href="#main-content">Skip to content</a>
<main id="main-content" tabindex="-1">...</main>
```

## Integrations

- **Vanilla + Vite** (stable): `vanilla-vite`
- **Laravel Blade + Vite** (stable): `laravel-vite`
- **Laravel package development** (stable): `laravel-package`
