# Simplest UI

Design system framework-agnostic: tokens CSS, layouts y Web Components. Funciona igual en HTML plano, React, Vue, Laravel o cualquier stack que renderice HTML.

## Instalación

```bash
npm install @luisrodonccs/simplest-ui
```

## Uso rápido

Con bundler:

```js
import "@luisrodonccs/simplest-ui/tokens.css";
import "@luisrodonccs/simplest-ui/styles.css";
import "@luisrodonccs/simplest-ui/components.js";

import { SuiTabs } from "@luisrodonccs/simplest-ui";
console.log(SuiTabs); // clases disponibles si necesitas referenciarlas
```

Sin bundler:

```html
<link rel="stylesheet" href="node_modules/@luisrodonccs/simplest-ui/dist/tokens.css" />
<link rel="stylesheet" href="node_modules/@luisrodonccs/simplest-ui/dist/styles.css" />
<script type="module" src="node_modules/@luisrodonccs/simplest-ui/dist/components.js"></script>
```

- `tokens.css`: variables de color, espaciado, tipografía, radios, sombras, motion y efectos.
- `styles.css`: reset, utilidades de layout y todos los componentes CSS (no incluye tokens).
- `components.js`: registra `<sui-modal>`, `<sui-dropdown>` y `<sui-tabs>`.

## Personalización

Los componentes consumen tokens, así que sobrescribirlos cambia el sistema completo:

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

Los tokens semánticos (`--sui-color-surface`, `--sui-color-text`, `--sui-color-border`, sombras, gradientes) se redefinen en `[data-theme="dark"]`.

## Layout

```html
<div class="ui-app-shell">
  <aside class="ui-app-shell__sidebar">
    <div class="ui-app-shell__brand">Mi App</div>
    <div class="ui-nav__group-title">Espacio de trabajo</div>
    <nav class="ui-nav" aria-label="Navegación principal">
      <a href="#" class="ui-nav__item ui-nav__item--active">Dashboard</a>
      <a href="#" class="ui-nav__item">Proyectos</a>
    </nav>
  </aside>
  <div class="ui-app-shell__content">
    <header class="ui-app-shell__header">
      <span class="ui-app-shell__title">Panel principal</span>
    </header>
    <main class="ui-app-shell__main">...</main>
  </div>
</div>
```

`ui-app-shell` ocupa la página completa. Para una vista previa contenida añade `ui-app-shell--contained`.

Utilidades: `.ui-container`, `.ui-stack`, `.ui-cluster`, `.ui-grid`, `.ui-grid--auto`, `.ui-skip-link`.

## Componentes

- Acciones: `.ui-button`, `.ui-button--primary`, `.ui-button--danger`, `.ui-button--ghost`, `.ui-button--sm`
- Formularios: `.ui-field`, `.ui-label`, `.ui-help`, `.ui-error`, `.ui-input`, `.ui-textarea`, `.ui-select`, `.ui-checkbox`, `.ui-radio`, `.ui-radio-group`, `.ui-switch`
- Datos: `.ui-card`, `.ui-card--raised`, `.ui-card--glass`, `.ui-badge`, `.ui-chip`, `.ui-table`, `.ui-avatar`, `.ui-avatar-group`, `.ui-stat`, `.ui-empty`
- Feedback: `.ui-alert`, `.ui-toast`, `.ui-spinner`, `.ui-skeleton`, `.ui-progress`
- Navegación: `.ui-nav`, `.ui-tooltip`, `.ui-popover`, `.ui-accordion`, `.ui-drawer`

## Web Components

### Tabs

```html
<sui-tabs>
  <div data-tab="general" label="General">Contenido general</div>
  <div data-tab="security" label="Seguridad">Contenido de seguridad</div>
</sui-tabs>
```

Cada hijo con `data-tab` es un panel; `label` es el texto de la pestaña. Soporta `value`, navegación con flechas/Home/End y emite `sui-change` con `{ value }`.

### Dropdown

```html
<sui-dropdown>
  <span slot="trigger">Acciones</span>
  <button type="button" data-value="export">Exportar</button>
  <button type="button" data-value="archive">Archivar</button>
</sui-dropdown>
```

- `open` refleja el estado y `aria-expanded` se actualiza solo.
- Abre con click, `ArrowDown`, `ArrowUp`, `Enter` o `Space`; navega con flechas/Home/End; cierra con `Escape` o `Tab`.
- Los items reciben `role="menuitem"` y `tabindex="-1"` automáticamente.
- Eventos: `sui-open`, `sui-close`, `sui-toggle` (`{ open }`) y `sui-select` (`{ value }`).
- Personalización: `--sui-dropdown-min-width`, `--sui-dropdown-max-height`.

### Modal

```html
<sui-modal>
  <span slot="title">Confirmación</span>
  <p>¿Deseas continuar?</p>
  <div slot="footer">
    <button class="ui-button" type="button">Cancelar</button>
    <button class="ui-button ui-button--primary" type="button">Confirmar</button>
  </div>
</sui-modal>
```

- `open` abre/cierra; `label` da nombre accesible si no hay título.
- `disable-backdrop-close` evita cerrar al pulsar el fondo.
- Atrapa el foco, lo restaura al cerrar, bloquea el scroll del body y cierra con `Escape`.
- Eventos: `sui-open` y `sui-close`.
- Personalización: `--sui-modal-width`.

## Accesibilidad

```html
<a class="ui-skip-link" href="#main-content">Saltar al contenido</a>
<main id="main-content" tabindex="-1">...</main>
```

- Tokens de contraste revisados para texto normal (AA) en modo claro y oscuro.
- Foco visible global con `--sui-focus-ring`; los componentes interactivos respetan `prefers-reduced-motion`.
- Los Web Components exponen roles, estados y relaciones ARIA, y navegación por teclado.

## Plantillas

- `templates/vanilla/index.html`
- `templates/react/App.tsx`
- `templates/laravel/layout.blade.php`

Las tres comparten la misma estructura de app-shell, navegación y componentes.

`templates/react/simplest-ui.d.ts` declara las etiquetas `sui-*` para que TypeScript las acepte en JSX.

## Desarrollo

```bash
npm install
npm run dev        # demo en examples/vanilla
npm run build      # dist + declaraciones .d.ts
npm run typecheck
npm test           # Vitest + happy-dom
```

`npm run build` genera `dist/` con `tokens.css`, `styles.css`, `components.js`, `index.js` y los `.d.ts`.

## Publicación

```bash
npm run build
npm publish
```

`prepublishOnly` ejecuta typecheck, tests y build antes de publicar.
