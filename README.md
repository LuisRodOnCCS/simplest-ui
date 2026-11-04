# Simplest UI

Design system framework-agnostic: tokens CSS, layouts y Web Components.

## Uso rápido

```html
<link rel="stylesheet" href="node_modules/@luisrodonccs/simplest-ui/dist/tokens.css" />
<link rel="stylesheet" href="node_modules/@luisrodonccs/simplest-ui/dist/styles.css" />
<script type="module" src="node_modules/@luisrodonccs/simplest-ui/dist/components.js"></script>
```

`styles.css` incluye el reset, las utilidades de layout y todos los componentes CSS. Solo necesitas cargar `tokens.css`, `styles.css` y `components.js`.

## Personalización

Los componentes consumen los tokens, así que sobrescribirlos cambia el sistema completo:

```css
:root {
  --sui-color-primary: #7c3aed;
  --sui-color-secondary: #db2777;
  --sui-radius-lg: 0.75rem;
  --sui-sidebar-width: 240px;
  --sui-shadow-card: 0 8px 30px rgba(124, 58, 237, 0.12);
}
```

Tema oscuro:

```html
<html data-theme="dark">
```

## Layout

```html
<div class="ui-app-shell">
  <aside class="ui-app-shell__sidebar">...</aside>
  <div class="ui-app-shell__content">
    <header class="ui-app-shell__header">...</header>
    <main class="ui-app-shell__main">...</main>
  </div>
</div>
```

`ui-app-shell` ocupa la página completa. Para una vista previa contenida, añade `ui-app-shell--contained`.

Utilidades: `.ui-container`, `.ui-stack`, `.ui-cluster`, `.ui-grid`, `.ui-grid--auto`.

## Componentes

- Acciones: `.ui-button`, `.ui-button--primary`, `.ui-button--danger`, `.ui-button--ghost`, `.ui-button--sm`
- Formularios: `.ui-field`, `.ui-label`, `.ui-help`, `.ui-error`, `.ui-input`, `.ui-textarea`, `.ui-select`, `.ui-checkbox`, `.ui-radio`, `.ui-radio-group`, `.ui-switch`
- Datos: `.ui-card`, `.ui-card--raised`, `.ui-card--glass`, `.ui-badge`, `.ui-chip`, `.ui-table`, `.ui-avatar`, `.ui-avatar-group`, `.ui-stat`, `.ui-empty`
- Feedback: `.ui-alert`, `.ui-toast`, `.ui-spinner`, `.ui-skeleton`, `.ui-progress`
- Navegación: `.ui-nav`, `.ui-tooltip`, `.ui-popover`, `.ui-accordion`, `.ui-drawer`
- Layout: `.ui-app-shell`, `.ui-app-shell--contained`

Web Components: `<sui-modal>`, `<sui-dropdown>`, `<sui-tabs>`.

### Tabs

```html
<sui-tabs>
  <div data-tab="general" label="General">Contenido general</div>
  <div data-tab="security" label="Seguridad">Contenido de seguridad</div>
</sui-tabs>
```

El componente lee los hijos con `data-tab`, usa `label` como texto de la pestaña y muestra el panel seleccionado. Emite `sui-change` con `{ value }`.

## Desarrollo

```bash
npm install
npm run dev
npm run build
npm run typecheck
```

`npm run build` genera `dist/` con los CSS, los módulos JS y las declaraciones `.d.ts`.
