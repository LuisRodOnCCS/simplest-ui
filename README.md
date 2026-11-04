# Simplest UI

Design system framework-agnostic: tokens CSS, layouts y Web Components. Funciona igual en HTML plano, React, Vue, Laravel o cualquier stack que renderice HTML.

> Estado: `v0.1.0-rc.1` es el baseline auditado. Consulta [ROADMAP.md](./ROADMAP.md) para los siguientes hitos y [CHANGELOG.md](./CHANGELOG.md) para el historial de versiones.

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

// Import granular: registra únicamente ese Web Component.
import "@luisrodonccs/simplest-ui/components/dropdown";
```

Sin bundler:

```html
<link rel="stylesheet" href="node_modules/@luisrodonccs/simplest-ui/dist/tokens.css" />
<link rel="stylesheet" href="node_modules/@luisrodonccs/simplest-ui/dist/styles.css" />
<script type="module" src="node_modules/@luisrodonccs/simplest-ui/dist/components.js"></script>
```

- `tokens.css`: variables de color, espaciado, tipografía, radios, sombras, motion y efectos.
- `styles.css`: reset, utilidades de layout y todos los componentes CSS (no incluye tokens).
- `components.js`: registra todos los Web Components. También se puede importar cada uno desde `@luisrodonccs/simplest-ui/components/<nombre>`.

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

## Integración con otros sistemas CSS

Simplest UI usa prefijos `ui-`, `sui-` y `--sui-`, por lo que sus clases, Custom Elements y tokens no colisionan con Bootstrap o Tailwind. Los Web Components también son independientes de cualquier framework.

El entrypoint completo incluye un reset y estilos base globales. En una aplicación que ya usa Bootstrap Reboot o Tailwind Preflight, importa solamente los tokens y los estilos de componentes:

```css
@import "@luisrodonccs/simplest-ui/tokens.css";
@import "@luisrodonccs/simplest-ui/components.css";
```

Entrypoints disponibles:

- `reset.css`: reset global opcional.
- `base.css`: tipografía, enlaces, utilidades y layouts.
- `components.css`: clases de componentes sin reset global.
- `styles.css`: reset, base y componentes en las layers `sui.reset`, `sui.base` y `sui.components`.

Consulta la guía de integración en el catálogo visual (`npm run docs:dev`).

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

Solo los elementos que aparecen en esta sección están registrados como etiquetas `<sui-*>`. El resto del catálogo es CSS semántico y se consume mediante clases `ui-*`; por ejemplo, `<article class="ui-card">`, `<table class="ui-table">` y `<div class="ui-alert">`.

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

- `open` abre/cierra; `label` da nombre accesible si no hay título; `close-label` personaliza la etiqueta del botón de cierre.
- `disable-backdrop-close` evita cerrar al pulsar el fondo.
- Atrapa el foco, lo restaura al cerrar, bloquea el scroll del body y cierra con `Escape`.
- Eventos: `sui-open` y `sui-close`.
- Personalización: `--sui-modal-width`.

### Accordion

```html
<sui-accordion>
  <div class="ui-accordion__item open" id="details">
    <button class="ui-accordion__trigger" type="button">Detalles</button>
    <div class="ui-accordion__content">Contenido inicial.</div>
  </div>
  <div class="ui-accordion__item" id="history">
    <button class="ui-accordion__trigger" type="button">Historial</button>
    <div class="ui-accordion__content">Contenido adicional.</div>
  </div>
</sui-accordion>
```

Normaliza los roles y relaciones ARIA, admite flechas/Home/End y emite `sui-change`. Por defecto solo queda una sección abierta; añade `multiple` para permitir varias.

### Popover y tooltip

```html
<sui-popover label="Acciones">
  <button slot="trigger" type="button">Acciones</button>
  <div slot="content"><button type="button">Editar</button></div>
</sui-popover>

<sui-tooltip content="Más información">Ayuda</sui-tooltip>
```

El popover actualiza ARIA, cierra por `Escape` o click fuera y se recoloca dentro del viewport. El tooltip crea su relación `aria-describedby` y se mantiene visible con hover o foco.

### Toasts

```js
import { SuiToast } from "@luisrodonccs/simplest-ui";

SuiToast.show({
  title: "Cambios guardados",
  message: "La operación se completó correctamente.",
  variant: "success",
  duration: 3200,
});
```

También puedes usar `<sui-toast title="..." message="..." variant="success">`. Los toasts se anuncian con `aria-live` y emiten `sui-dismiss` al cerrarse.

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
npm run docs:dev   # catálogo visual con temas y APIs
npm run build      # dist + declaraciones .d.ts
npm run typecheck
npm test           # Vitest + happy-dom
```

`npm run build` genera `dist/` con `tokens.css`, `styles.css`, `components.js`, `index.js`, entradas granulares por Web Component y sus `.d.ts`.

GitHub Actions ejecuta typecheck, tests, build y `npm pack --dry-run` en cada pull request y push a `main`.

## Construcción asistida por agentes

El repositorio y el paquete incluyen la skill [`skills/simplest-ui`](./skills/simplest-ui/SKILL.md). Esta guía indica a un agente cómo comprobar primero el catálogo, reutilizar componentes existentes y extender el sistema solo cuando sea necesario, sin inventar etiquetas `sui-*` no registradas.

La fuente de verdad del catálogo para agentes y documentación es [`components.manifest.json`](./components.manifest.json).

Las skills requieren instalación explícita en el directorio de skills que use cada agente; los agentes no suelen descubrir automáticamente una skill dentro de `node_modules`. El paquete mantiene una copia versionada para que puedas enlazar o copiar `skills/simplest-ui` en tu gestor de skills. Sus prompts de evaluación están en [`skills/simplest-ui/evals`](./skills/simplest-ui/evals).

## Contribuir

Lee [CONTRIBUTING.md](./CONTRIBUTING.md) antes de añadir o modificar componentes. Las contribuciones deben respetar los tokens, prefijos, semántica HTML, accesibilidad, pruebas y documentación visual del sistema.

## Publicación

```bash
npm run build
npm publish
```

`prepublishOnly` ejecuta typecheck, tests y build antes de publicar.
