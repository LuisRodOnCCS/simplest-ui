# Simplest UI

Design system framework-agnostic: tokens CSS, layouts y Web Components.

## Uso rápido

```html
<link rel="stylesheet" href="node_modules/@luisrodonccs/simplest-ui/dist/tokens.css" />
<link rel="stylesheet" href="node_modules/@luisrodonccs/simplest-ui/dist/styles.css" />
<link rel="stylesheet" href="node_modules/@luisrodonccs/simplest-ui/dist/components.css" />
<script type="module" src="node_modules/@luisrodonccs/simplest-ui/dist/components.js"></script>
```

## Personalización

Sobrescribe variables CSS:

```css
:root {
  --sui-color-primary: #7c3aed;
  --sui-radius-md: 0.75rem;
}
```

Tema oscuro:

```html
<html data-theme="dark">
```

## Componentes

- `.ui-button`, `.ui-button--primary`, `.ui-button--danger`, `.ui-button--ghost`
- `.ui-input`, `.ui-label`, `.ui-field`, `.ui-help`, `.ui-error`
- `.ui-card`, `.ui-card--raised`
- Layouts: `.ui-container`, `.ui-stack`, `.ui-cluster`, `.ui-grid`, `.ui-app-shell`
- `<sui-modal>`, `<sui-dropdown>`

## Desarrollo

```bash
pnpm install
pnpm dev
pnpm build
pnpm test
```