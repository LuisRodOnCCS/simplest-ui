import catalogData from "../catalog.json";

type Language = "en" | "es";
type ThemeChoice = "light" | "dark" | "system";
type CatalogItem = { id: string; label: string; kind: string; href?: string };
type CatalogGroup = { id: string; label: string; items: CatalogItem[] };

const catalog = catalogData as { groups: CatalogGroup[] };
const languageKey = "simplest-ui-docs-language";
const themeKey = "simplest-ui-docs-theme";
const media = window.matchMedia("(prefers-color-scheme: dark)");

const es: Record<string, string> = {
  "skip": "Saltar al contenido", "search": "Buscar componentes", "overview": "Introducción", "installation": "Instalación", "tokens": "Tokens", "support": "Soporte", "agent-skill": "Skill de Simplest UI", "foundations": "Fundamentos", "agents": "Agentes", "css-components": "Componentes CSS", "web-components": "Web Components", "layouts": "Layouts", "pages": "Páginas", "foundation": "Fundamento", "agent": "Agente", "css": "CSS", "web-component": "Web Component", "layout": "Layout", "page": "Página",
  "hero.title": "Interfaces simples, con un sistema claro.", "hero.copy": "Tokens CSS, componentes semánticos y Web Components accesibles para construir productos sin depender de un framework.", "hero.audit": "P0–P2 auditado", "hero.framework": "Framework-agnostic",
  "installation.title": "Instalación", "installation.copy": "Importa CSS para la apariencia e importa JavaScript solo para los elementos interactivos que necesites.", "installation.note": "Cards, tables, alerts y controles de formulario son componentes CSS. Solo los elementos documentados como Web Components usan etiquetas sui-*.",
  "tokens.title": "Tokens del sistema", "tokens.copy": "Los tokens semánticos mantienen colores, espaciado, tipografía y efectos coherentes en ambos temas.", "tokens.note": "Cambia el tema desde la cabecera para inspeccionar cómo se reasignan los tokens semánticos.",
  "support.title": "Soporte", "support.copy": "Qué ofrece Simplest UI para la línea de versión 0.1.x.", "agent-skill.title": "Skill para agentes", "agent-skill.copy": "Guía a los agentes para reutilizar Simplest UI con componentes, tokens y accesibilidad consistentes.", "agent-skill.what-title": "Construye con el sistema, no a su alrededor", "agent-skill.what-copy": "La skill oficial lee el manifest, elige primero primitivas existentes y preserva las convenciones de accesibilidad y tokens del sistema.", "agent-skill.step-one": "Inspecciona components.manifest.json.", "agent-skill.step-two": "Compón primitivas ui-* y sui-* documentadas.", "agent-skill.step-three": "Extiende el sistema solo cuando la composición no sea suficiente.", "agent-skill.install-title": "Instalación", "agent-skill.install-copy": "El paquete npm incluye la skill, pero no la activa automáticamente.", "agent-skill.config-label": "Ejemplo de configuración de OpenCode", "agent-skill.invoke": "Usa @simplest-ui en OpenCode o /simplest-ui en Claude Code.", "agent-skill.guide": "Lee la guía de instalación completa",
  "button.title": "Button", "button.copy": "Acciones nativas con variantes semánticas, tamaño compacto y estados disabled.", "input-field.title": "Input & field", "input-field.copy": "Combina label, input, texto de ayuda y error con HTML nativo.", "textarea.title": "Textarea", "textarea.copy": "Área de texto con estados default, invalid y disabled.", "select.title": "Select", "select.copy": "Select nativo con estados de validación y disabled.", "checkbox.title": "Checkbox", "checkbox.copy": "Checkbox nativo con label asociado y estado disabled.", "radio.title": "Radio", "radio.copy": "Agrupa opciones relacionadas mediante el mismo atributo name.", "switch.title": "Switch", "switch.copy": "Interruptor basado en checkbox nativo.", "card.title": "Card", "card.copy": "Agrupa contenido con superficies default, raised y glass.", "badge-chip.title": "Badge & chip", "badge-chip.copy": "Etiquetas compactas para estados, categorías y metadatos.", "alert.title": "Alert", "alert.copy": "Mensajes semánticos con roles adecuados para cada nivel de urgencia.", "spinner.title": "Spinner", "spinner.copy": "Indicador de carga circular en tres tamaños.", "skeleton.title": "Skeleton", "skeleton.copy": "Placeholders de carga para texto, títulos, avatares y bloques.", "progress.title": "Progress", "progress.copy": "Progreso horizontal determinado e indeterminado.", "table.title": "Table", "table.copy": "Tabla semántica con wrapper accesible para desplazamiento horizontal en móvil.", "avatar.title": "Avatar", "avatar.copy": "Iniciales, imágenes, tamaños y grupos de avatares.", "stat.title": "Stat", "stat.copy": "Resumen de una métrica con etiqueta, valor y contexto.", "empty-state.title": "Empty state", "empty-state.copy": "Estado vacío que explica el siguiente paso posible.", "nav.title": "Navigation", "nav.copy": "Navegación agrupada con estado actual explícito.",
  "modal.title": "Modal", "modal.copy": "Diálogo modal con foco atrapado, scroll-lock y restauración de foco.", "drawer.title": "Drawer", "drawer.copy": "Panel lateral modal con el mismo contrato accesible que un diálogo.", "dropdown.title": "Dropdown", "dropdown.copy": "Menú de acciones con roles y teclado integrados.", "tabs.title": "Tabs", "tabs.copy": "Contenido por pestañas navegable con flechas, Home y End.", "accordion.title": "Accordion", "accordion.copy": "Secciones expandibles con relaciones ARIA normalizadas.", "popover.title": "Popover", "popover.copy": "Panel contextual que conserva y restaura el foco.", "tooltip.title": "Tooltip", "tooltip.copy": "Descripción breve que crea aria-describedby automáticamente.", "toast.title": "Toast", "toast.copy": "Feedback transitorio anunciado mediante aria-live.",
  "container.title": "Container", "container.copy": "Limita el ancho del contenido y conserva padding lateral.", "stack.title": "Stack", "stack.copy": "Apila elementos con separación vertical consistente.", "cluster.title": "Cluster", "cluster.copy": "Agrupa elementos que pueden envolver en varias líneas.", "grid.title": "Grid", "grid.copy": "Distribuye contenido en columnas explícitas o automáticas.", "app-shell.title": "App shell", "app-shell.copy": "Estructura de aplicación con sidebar, cabecera y área principal.", "skip-link.title": "Skip link", "skip-link.copy": "Atajo de teclado para saltar directamente al contenido principal.", "dashboard.title": "Dashboard", "dashboard.copy": "Página completa que compone el App Shell y los componentes de datos.",
  "copy": "Copiar", "copied": "Copiado", "open": "Abrir", "close": "Cerrar", "save": "Guardar cambios", "cancel": "Cancelar", "confirm": "Confirmar", "delete": "Eliminar", "more": "Más opciones", "apply": "Aplicar", "reset": "Restablecer", "loading": "Cargando", "disabled": "Deshabilitado", "active": "Activo", "pending": "Pendiente", "error": "Error", "users": "Usuarios", "role": "Rol", "status": "Estado", "details": "Detalles", "history": "Historial", "actions": "Acciones", "general": "General", "security": "Seguridad", "notifications": "Notificaciones", "system": "Sistema", "light": "Claro", "dark": "Oscuro", "show-toast": "Mostrar toast", "open-modal": "Abrir modal", "open-drawer": "Abrir drawer", "table-note": "Usa ui-table-wrap con role=region y un label para permitir scroll horizontal accesible.", "page-open": "Abrir página", "previous": "Anterior", "next": "Siguiente", "modal-label": "Confirmación", "modal-close": "Cerrar modal", "modal-message": "¿Quieres continuar con esta acción?", "drawer-label": "Filtros", "drawer-close": "Cerrar filtros", "drawer-message": "Ajusta los resultados sin salir de esta vista.", "active-only": "Solo activos"
};

let language: Language = initialLanguage();

function initialLanguage(): Language {
  try {
    const saved = window.localStorage.getItem(languageKey);
    if (saved === "en" || saved === "es") return saved;
  } catch { /* Storage is optional. */ }
  return navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

function t(key: string, fallback?: string): string {
  return language === "es" ? (es[key] ?? fallback ?? key) : (fallback ?? key);
}

function appliedTheme(choice: ThemeChoice): "light" | "dark" {
  return choice === "system" ? (media.matches ? "dark" : "light") : choice;
}

function themeChoice(): ThemeChoice {
  try {
    const saved = window.localStorage.getItem(themeKey);
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
  } catch { /* Storage is optional. */ }
  return "system";
}

function setTheme(choice: ThemeChoice) {
  document.documentElement.dataset.theme = appliedTheme(choice);
  document.documentElement.dataset.themeChoice = choice;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function code(value: string) {
  return `<pre class="docs-code"><code>${escapeHtml(value)}</code><button class="docs-copy" type="button">${t("copy", "Copy")}</button></pre>`;
}

function showcase(preview: string, snippet?: string) {
  return `<div class="docs-showcase${snippet ? " docs-showcase--with-code" : ""}"><div class="docs-preview">${preview}</div>${snippet ? code(snippet) : ""}</div>`;
}

function section(id: string, kind: string, title: string, copy: string, body: string) {
  return `<section class="docs-section" id="${id}" data-search="${title.toLowerCase()} ${kind}"><div class="docs-section__heading"><div><h2>${title}</h2><p>${copy}</p></div><span class="docs-kind">${t(kind, kind)}</span></div>${body}</section>`;
}

function api(rows: Array<[string, string]>) {
  return `<div class="docs-reference"><h3>API</h3><table class="docs-api"><tbody>${rows.map(([key, value]) => `<tr><th><code>${key}</code></th><td>${value}</td></tr>`).join("")}</tbody></table></div>`;
}

function implementation(id: string, preview: string, rows: Array<[string, string]>) {
  return `<div class="docs-implementation">${showcase(preview, snippets[id])}${api(rows)}</div>`;
}

const snippets: Record<string, string> = {
  button: `<button class="ui-button ui-button--primary" type="button">Save changes</button>`,
  field: `<div class="ui-field">\n  <label class="ui-label" for="name">Name</label>\n  <input class="ui-input" id="name" aria-describedby="name-help" />\n  <div class="ui-help" id="name-help">Use your full name.</div>\n</div>`,
  "input-field": `<div class="ui-field">\n  <label class="ui-label" for="name">Name</label>\n  <input class="ui-input" id="name" aria-describedby="name-help" />\n  <div class="ui-help" id="name-help">Use your full name.</div>\n</div>\n<div class="ui-field">\n  <label class="ui-label" for="disabled-name">Name</label>\n  <input class="ui-input" id="disabled-name" value="Disabled" disabled />\n</div>`,
  textarea: `<label class="ui-label" for="message">Message</label>\n<textarea class="ui-textarea" id="message"></textarea>`,
  select: `<label class="ui-label" for="country">Country</label>\n<select class="ui-select" id="country">\n  <option>Mexico</option>\n</select>`,
  checkbox: `<label class="ui-checkbox">\n  <input type="checkbox" name="updates" />\n  Receive updates\n</label>`,
  radio: `<fieldset class="ui-radio-group">\n  <legend class="ui-label">Plan</legend>\n  <label class="ui-radio"><input type="radio" name="plan" /> Starter</label>\n</fieldset>`,
  switch: `<label class="ui-switch">\n  <input type="checkbox" role="switch" />\n  <span class="ui-switch__track"></span>\n  Notifications\n</label>`,
  card: `<article class="ui-card ui-card--raised">\n  <header class="ui-card__header"><h3 class="ui-card__title">Title</h3></header>\n  <p class="ui-card__body">Supporting content.</p>\n</article>`,
  "badge-chip": `<span class="ui-badge ui-badge--success">Active</span>\n<span class="ui-chip">Design systems</span>`,
  alert: `<div class="ui-alert ui-alert--warning" role="status">\n  <div><div class="ui-alert__title">Review required</div><div class="ui-alert__body">Two fields are missing.</div></div>\n</div>`,
  spinner: `<span class="ui-spinner" role="status" aria-label="Loading"></span>`,
  skeleton: `<div class="ui-skeleton ui-skeleton--title"></div>\n<div class="ui-skeleton ui-skeleton--text"></div>`,
  progress: `<div class="ui-progress" role="progressbar" aria-valuenow="64" aria-valuemin="0" aria-valuemax="100">\n  <div class="ui-progress__bar" style="width: 64%"></div>\n</div>`,
  drawer: `<sui-drawer label="Filters" close-label="Close filters">\n  <span slot="title">Filters</span>\n  <p>Adjust the results.</p>\n  <div slot="footer">...</div>\n</sui-drawer>`,
  modal: `<sui-modal label="Confirm action">\n  <span slot="title">Confirmation</span>\n  <p>Do you want to continue?</p>\n</sui-modal>`,
  table: `<div class="ui-table-wrap" role="region" aria-label="Users" tabindex="0">\n  <table class="ui-table">...</table>\n</div>`,
  avatar: `<span class="ui-avatar" aria-label="Ada Lovelace">AL</span>\n<span class="ui-avatar"><img src="avatar.jpg" alt="Ada Lovelace" /></span>`,
  stat: `<div class="ui-stat">\n  <div class="ui-stat__label">Users</div>\n  <div class="ui-stat__value">1,284</div>\n  <div class="ui-stat__hint">+12% this month</div>\n</div>`,
  "empty-state": `<div class="ui-empty">\n  <h3 class="ui-empty__title">No results</h3>\n  <p class="ui-empty__body">Create a record to get started.</p>\n</div>`,
  nav: `<nav class="ui-nav" aria-label="Workspace">\n  <a class="ui-nav__item ui-nav__item--active" href="/dashboard" aria-current="page">Dashboard</a>\n</nav>`,
  dropdown: `<sui-dropdown>\n  <span slot="trigger">Actions</span>\n  <button type="button" data-value="export">Export</button>\n  <button type="button" data-value="archive">Archive</button>\n</sui-dropdown>`,
  tabs: `<sui-tabs value="general">\n  <div data-tab="general" label="General">General content.</div>\n  <div data-tab="security" label="Security">Security content.</div>\n</sui-tabs>`,
  accordion: `<sui-accordion>\n  <div class="ui-accordion__item open">\n    <button class="ui-accordion__trigger" type="button">Details</button>\n    <div class="ui-accordion__content">Content.</div>\n  </div>\n</sui-accordion>`,
  popover: `<sui-popover label="Actions">\n  <button slot="trigger" type="button">Actions</button>\n  <div slot="content">Contextual content.</div>\n</sui-popover>`,
  tooltip: `<sui-tooltip content="Additional context">\n  <button type="button">Hover or focus</button>\n</sui-tooltip>`,
  container: `<div class="ui-container">...</div>`,
  stack: `<div class="ui-stack">\n  <div>One</div><div>Two</div>\n</div>`,
  cluster: `<div class="ui-cluster">\n  <button>One</button><button>Two</button>\n</div>`,
  grid: `<div class="ui-grid ui-grid--auto">\n  <article>One</article><article>Two</article>\n</div>`,
  "app-shell": `<div class="ui-app-shell">\n  <aside class="ui-app-shell__sidebar">...</aside>\n  <div class="ui-app-shell__content">\n    <header class="ui-app-shell__header">...</header>\n    <main class="ui-app-shell__main">...</main>\n  </div>\n</div>`,
  "topbar": `<header class="ui-topbar">\n  <a class="ui-topbar__brand" href="/"><span class="ui-topbar__mark">S</span><span>Simplest UI</span></a>\n  <div class="ui-topbar__controls">...</div>\n</header>`,
  "skip-link": `<a class="ui-skip-link" href="#main-content">Skip to content</a>\n<main id="main-content" tabindex="-1">...</main>`
};

const cssReferences: Record<string, Array<[string, string]>> = {
  button: [["Classes", "ui-button, --primary, --danger, --ghost, --sm"], ["Tokens", "--sui-control-height-*, --sui-radius-full, --sui-gradient-primary"]],
  "input-field": [["Classes", "ui-field, ui-label, ui-input, ui-help, ui-error, ui-input--invalid"], ["Tokens", "--sui-field-height, --sui-focus-ring, --sui-color-danger-ring"]],
  textarea: [["Classes", "ui-textarea, ui-textarea--invalid"], ["Token", "--sui-textarea-min-height"]],
  select: [["Classes", "ui-select, ui-select--invalid"], ["Tokens", "--sui-field-height, --sui-focus-ring"]],
  checkbox: [["Classes", "ui-checkbox, ui-checkbox--disabled"], ["Token", "--sui-check-size"]],
  radio: [["Classes", "ui-radio-group, ui-radio, ui-radio--disabled"], ["Token", "--sui-check-size"]],
  switch: [["Classes", "ui-switch, ui-switch__track"], ["Tokens", "--sui-switch-width, --sui-switch-height, --sui-switch-knob, --sui-switch-offset"]],
  card: [["Classes", "ui-card, --raised, --glass, __header, __title, __body, __footer"], ["Tokens", "--sui-shadow-card, --sui-shadow-card-hover, --sui-radius-xl"]],
  "badge-chip": [["Classes", "ui-badge variants, ui-chip"], ["Tokens", "--sui-badge-height, --sui-chip-height"]],
  alert: [["Classes", "ui-alert, --success, --warning, --danger, --info, __title, __body"], ["Use", "role=status for non-urgent updates; role=alert for urgent errors"]],
  spinner: [["Classes", "ui-spinner, --sm, --lg"], ["Tokens", "--sui-spinner-size, --sui-spinner-border, --sui-duration-spinner"]],
  skeleton: [["Classes", "ui-skeleton, --text, --title, --avatar, --block"], ["Tokens", "--sui-skeleton-block-height, --sui-duration-shimmer"]],
  progress: [["Classes", "ui-progress, __bar, --indeterminate"], ["Tokens", "--sui-progress-height, --sui-duration-progress"]],
  table: [["Classes", "ui-table-wrap, ui-table"], ["Token", "--sui-table-min-width"], ["Accessibility", "Use role=region, an accessible name, tabindex=0, and a table caption"]],
  avatar: [["Classes", "ui-avatar, --sm, --lg, ui-avatar-group"], ["Token", "--sui-avatar-size"]],
  stat: [["Classes", "ui-stat, __label, __value, __hint"], ["Tokens", "--sui-gradient-primary, --sui-space-4, --sui-radius-xl"]],
  "empty-state": [["Classes", "ui-empty, __title, __body"], ["Tokens", "--sui-space-10, --sui-radius-xl"]],
  nav: [["Classes", "ui-nav, __item, __item--active, __group-title"], ["Accessibility", "Use aria-current=page on the current link"]],
  container: [["Class", "ui-container"], ["Tokens", "--sui-container-sm, --sui-container-md, --sui-container-lg, --sui-container-xl"]],
  stack: [["Class", "ui-stack"], ["Token", "--ui-stack-gap"]],
  cluster: [["Class", "ui-cluster"], ["Token", "--ui-cluster-gap"]],
  grid: [["Classes", "ui-grid, ui-grid--auto"], ["Tokens", "--ui-grid-cols, --ui-grid-gap"]],
  "app-shell": [["Classes", "ui-app-shell, --contained, __sidebar, __content, __header, __main"], ["Token", "--sui-sidebar-width"]],
  "skip-link": [["Class", "ui-skip-link"], ["Behavior", "Visible only on keyboard focus"], ["Accessibility", "First focusable element pointing to the main landmark"]],
  "topbar": [["Classes", "ui-topbar, __brand, __mark, __controls, --glass"], ["Tokens", "--sui-z-popover, --sui-blur-lg, --sui-shadow-card"]]
};

function componentBody(id: string): string {
  switch (id) {
    case "overview": return `<header class="docs-hero" id="overview"><h1>${t("hero.title", "Simple interfaces, with a clear system.").replace("Simple interfaces,", "<span>Simple interfaces,</span>").replace("Interfaces simples,", "<span>Interfaces simples,</span>")}</h1><p>${t("hero.copy", "CSS tokens, semantic components and accessible Web Components for building products without framework lock-in.")}</p><div class="docs-hero__meta"><span class="ui-badge ui-badge--primary">v0.1.1</span><span class="ui-badge ui-badge--success">${t("hero.audit", "P0–P2 audited")}</span><span class="ui-badge ui-badge--outline">${t("hero.framework", "Framework-agnostic")}</span></div></header>`;
    case "installation": return showcase(`<p>${t("installation.note", "Cards, tables, alerts and form controls are CSS components. Only documented Web Components use sui-* tags.")}</p><p>For a smaller CSS footprint, import <code>tokens.css</code> followed by only the component styles you use.</p>`, `npm install @luisrodonccs/simplest-ui\n\n// Complete system\nimport "@luisrodonccs/simplest-ui/styles.css";\nimport "@luisrodonccs/simplest-ui/components.js";\n\n// Or import individual CSS components\nimport "@luisrodonccs/simplest-ui/tokens.css";\nimport "@luisrodonccs/simplest-ui/components/button.css";\nimport "@luisrodonccs/simplest-ui/components/card.css";`);
    case "tokens": return `<div class="docs-token-grid"><div class="docs-swatch" style="--docs-swatch:var(--sui-color-primary);--docs-swatch-text:var(--sui-color-primary-contrast)"><code>--sui-color-primary</code></div><div class="docs-swatch" style="--docs-swatch:var(--sui-color-secondary);--docs-swatch-text:#fff"><code>--sui-color-secondary</code></div><div class="docs-swatch" style="--docs-swatch:var(--sui-color-success-surface);--docs-swatch-text:var(--sui-color-success-text)"><code>success surface</code></div><div class="docs-swatch" style="--docs-swatch:var(--sui-color-surface-raised)"><code>surface raised</code></div></div><div class="docs-grid" style="margin-top:var(--sui-space-4)">${api([["Typography", "--sui-font-*"], ["Spacing", "--sui-space-*"], ["Radii", "--sui-radius-*"], ["Shadows", "--sui-shadow-*"], ["Motion", "--sui-duration-* / --sui-easing-*"], ["Effects", "--sui-blur-* / --sui-z-*"], ["Scrollbars", "--sui-scrollbar-*"]])}<div class="docs-reference"><h3>${t("tokens.note", "Use the theme control in the header to inspect semantic token remapping.")}</h3><p>Scrollbars are styled globally through <code>--sui-scrollbar-size</code>, <code>--sui-scrollbar-track</code>, <code>--sui-scrollbar-thumb</code>, and <code>--sui-scrollbar-thumb-hover</code>.</p>${code(`:root {\n  --sui-color-primary: #7c3aed;\n  --sui-radius-lg: 0.75rem;\n  --sui-scrollbar-size: 0.75rem;\n}`)}<div class="docs-scale" style="margin-top:var(--sui-space-4)"><span style="--scale:var(--sui-space-4)">4</span><span style="--scale:var(--sui-space-6)">6</span><span style="--scale:var(--sui-space-8)">8</span><span style="--scale:var(--sui-space-10)">10</span></div></div></div>`;
    case "support": {
      const isSpanish = language === "es";
      const table = (title: string, rows: Array<[string, string]>) => `<div class="docs-reference"><h3>${title}</h3><table class="docs-api"><tbody>${rows.map(([key, value]) => `<tr><th>${key}</th><td>${value}</td></tr>`).join("")}</tbody></table></div>`;
      const browsers = table(isSpanish ? "Navegadores" : "Browsers", [
        ["Chromium", isSpanish ? "Chrome y Edge, últimas dos versiones." : "Chrome and Edge, last two versions."],
        ["Gecko", isSpanish ? "Firefox, últimas dos versiones." : "Firefox, last two versions."],
        ["WebKit", isSpanish ? "Safari, últimas dos versiones en macOS e iOS." : "Safari, last two versions on macOS and iOS."],
        [isSpanish ? "Móvil" : "Mobile", isSpanish ? "Chrome Android y Safari iOS mediante sus motores actuales." : "Chrome Android and Safari iOS through their current engines."]
      ]);
      const environments = table(isSpanish ? "Entornos" : "Environments", [
        [isSpanish ? "Vanilla HTML/JS" : "Vanilla HTML/JS", isSpanish ? "Soportado. Módulos ES nativos e imports CSS del paquete." : "Supported. Native ES modules and package CSS imports."],
        [isSpanish ? "Laravel Blade + Vite" : "Laravel Blade + Vite", isSpanish ? "Soportado. Importa el paquete desde resources/js y resources/css." : "Supported. Import the package from resources/js and resources/css."],
        [isSpanish ? "Bundlers" : "Bundlers", isSpanish ? "Soportados si resuelven los exports del paquete." : "Supported when they resolve package exports."],
        ["React, Vue", isSpanish ? "No validado para la línea 0.1.x." : "Not validated for the 0.1.x line."]
      ]);
      const accessibility = table(isSpanish ? "Accesibilidad" : "Accessibility", [
        [isSpanish ? "Objetivo" : "Target", "WCAG 2.2 AA."],
        [isSpanish ? "Auditorías automáticas" : "Automated audits", isSpanish ? "Sin violaciones critical ni serious de Axe." : "No `critical` or `serious` Axe violations."],
        [isSpanish ? "Revisión manual" : "Manual review", isSpanish ? "Necesaria para flujos de teclado y lector de pantalla." : "Required for keyboard and screen reader flows."]
      ]);
      const versions = table(isSpanish ? "Versiones" : "Versions", [
        ["Node.js", isSpanish ? ">=18 para herramientas de build." : ">=18 for build tooling."],
        [isSpanish ? "Versionado" : "Versioning", isSpanish ? "Semantic Versioning; las versiones menores previas a 1.0 pueden incluir cambios incompatibles." : "Semantic Versioning; pre-1.0 minors may include breaking changes."],
        [isSpanish ? "Fuera de alcance" : "Out of scope", isSpanish ? "Adaptadores React/Vue, validación con Bootstrap/Tailwind, IE y Edge legacy, diseños RTL." : "React/Vue adapters, Bootstrap/Tailwind validation, IE and legacy Edge, RTL layouts."]
      ]);
      const ssr = `<div class="docs-reference" style="margin-top:var(--sui-space-4)"><h3>${isSpanish ? "Renderizado en servidor" : "Server-side rendering"}</h3><p>${isSpanish ? "El CSS puede cargarse durante el renderizado en servidor. Los Web Components deben importarse en el bundle de cliente porque se registran mediante customElements y usan window y document." : "CSS can load during server rendering. Web Components must be imported in the client bundle because they register through customElements and use window and document."}</p>${code(`// ${isSpanish ? "Bundle de servidor: solo estilos" : "Server bundle: styles only"}\nimport "@luisrodonccs/simplest-ui/tokens.css";\nimport "@luisrodonccs/simplest-ui/components/button.css";\n\n// ${isSpanish ? "Bundle de cliente: elementos interactivos" : "Client bundle: interactive elements"}\nimport "@luisrodonccs/simplest-ui/components/drawer";`)}<p style="margin-top:var(--sui-space-3)">${isSpanish ? "Los Web Components no tienen contrato de hidratación: se renderizan cuando el navegador actualiza el elemento, por lo que el HTML del servidor debe incluir contenido de respaldo útil." : "Web Components have no hydration contract: they render when the browser upgrades the element, so server markup must include meaningful fallback content."}</p></div>`;
      return `<div class="docs-grid">${browsers}${environments}</div><div class="docs-grid" style="margin-top:var(--sui-space-4)">${accessibility}${versions}</div>${ssr}`;
    }
    case "button": return implementation("button", `<div class="ui-cluster"><button class="ui-button ui-button--primary" type="button">${t("save", "Save changes")}</button><button class="ui-button" type="button">${t("cancel", "Cancel")}</button><button class="ui-button ui-button--ghost" type="button">${t("more", "More options")}</button><button class="ui-button ui-button--danger" type="button">${t("delete", "Delete")}</button><button class="ui-button ui-button--primary ui-button--sm" type="button">Small</button><button class="ui-button" type="button" disabled>${t("disabled", "Disabled")}</button></div>`, cssReferences.button);
    case "input-field": return implementation("input-field", `<div class="docs-grid"><div class="ui-field"><label class="ui-label" for="docs-name">Name</label><input class="ui-input" id="docs-name" placeholder="Ada Lovelace" /><div class="ui-help">Use your full name.</div></div><div class="ui-field"><label class="ui-label" for="docs-invalid">Email</label><input class="ui-input ui-input--invalid" id="docs-invalid" value="not-an-email" aria-describedby="docs-error" /><div class="ui-error" id="docs-error">Enter a valid email address.</div></div><div class="ui-field"><label class="ui-label" for="docs-disabled">Name</label><input class="ui-input" id="docs-disabled" value="Disabled" disabled /></div></div>`, cssReferences["input-field"]);
    case "textarea": return implementation("textarea", `<div class="docs-grid"><div class="ui-field"><label class="ui-label" for="docs-message">Message</label><textarea class="ui-textarea" id="docs-message" placeholder="Write a message"></textarea></div><div class="ui-field"><label class="ui-label" for="docs-invalid-message">Message</label><textarea class="ui-textarea ui-textarea--invalid" id="docs-invalid-message">Too short</textarea><div class="ui-error">Add at least 20 characters.</div></div><div class="ui-field"><label class="ui-label" for="docs-disabled-message">Message</label><textarea class="ui-textarea" id="docs-disabled-message" disabled>Disabled</textarea></div></div>`, cssReferences.textarea);
    case "select": return implementation("select", `<div class="docs-grid"><div class="ui-field"><label class="ui-label" for="docs-country">Country</label><select class="ui-select" id="docs-country"><option>Mexico</option><option>Spain</option><option>Argentina</option></select></div><div class="ui-field"><label class="ui-label" for="docs-invalid-country">Country</label><select class="ui-select ui-select--invalid" id="docs-invalid-country"><option>Select a country</option></select><div class="ui-error">Choose an option.</div></div><div class="ui-field"><label class="ui-label" for="docs-disabled-country">Country</label><select class="ui-select" id="docs-disabled-country" disabled><option>Disabled</option></select></div></div>`, cssReferences.select);
    case "checkbox": return implementation("checkbox", `<div class="ui-cluster"><label class="ui-checkbox"><input type="checkbox" checked /> ${t("active", "Active")}</label><label class="ui-checkbox"><input type="checkbox" /> Marketing emails</label><label class="ui-checkbox ui-checkbox--disabled"><input type="checkbox" disabled /> ${t("disabled", "Disabled")}</label></div>`, cssReferences.checkbox);
    case "radio": return implementation("radio", `<fieldset class="ui-radio-group"><legend class="ui-label">Plan</legend><label class="ui-radio"><input type="radio" name="plan" checked /> Starter</label><label class="ui-radio"><input type="radio" name="plan" /> Pro</label><label class="ui-radio ui-radio--disabled"><input type="radio" name="plan" disabled /> Disabled</label></fieldset>`, cssReferences.radio);
    case "switch": return implementation("switch", `<div class="ui-cluster"><label class="ui-switch"><input type="checkbox" checked /><span class="ui-switch__track"></span> Notifications</label><label class="ui-switch"><input type="checkbox" /><span class="ui-switch__track"></span> Digest</label><label class="ui-switch"><input type="checkbox" disabled /><span class="ui-switch__track"></span> ${t("disabled", "Disabled")}</label></div>`, cssReferences.switch);
    case "card": return implementation("card", `<div class="docs-grid docs-grid--three"><article class="ui-card"><div class="ui-card__title">Default</div><div class="ui-card__body">A quiet surface for grouped content.</div></article><article class="ui-card ui-card--raised"><div class="ui-card__title">Raised</div><div class="ui-card__body">Higher visual separation.</div></article><article class="ui-card ui-card--glass"><div class="ui-card__title">Glass</div><div class="ui-card__body">Soft blurred surface.</div></article></div>`, cssReferences.card);
    case "badge-chip": return implementation("badge-chip", `<div class="ui-cluster"><span class="ui-badge">Neutral</span><span class="ui-badge ui-badge--primary">Primary</span><span class="ui-badge ui-badge--success">${t("active", "Active")}</span><span class="ui-badge ui-badge--warning">${t("pending", "Pending")}</span><span class="ui-badge ui-badge--danger">${t("error", "Error")}</span><span class="ui-badge ui-badge--info">Info</span><span class="ui-badge ui-badge--outline">Outline</span><span class="ui-chip">Design systems</span></div>`, cssReferences["badge-chip"]);
    case "alert": return implementation("alert", `<div class="docs-preview--stack"><div class="ui-alert ui-alert--success" role="status"><div><div class="ui-alert__title">Saved</div><div class="ui-alert__body">Your changes are live.</div></div></div><div class="ui-alert ui-alert--warning" role="status"><div><div class="ui-alert__title">Review required</div><div class="ui-alert__body">Two required fields are missing.</div></div></div><div class="ui-alert ui-alert--danger" role="alert"><div><div class="ui-alert__title">Connection failed</div><div class="ui-alert__body">Try again in a moment.</div></div></div></div>`, cssReferences.alert);
    case "spinner": return implementation("spinner", `<div class="ui-cluster"><span class="ui-spinner" role="status" aria-label="${t("loading", "Loading")}"></span><span class="ui-spinner ui-spinner--sm" role="status" aria-label="${t("loading", "Loading")}"></span><span class="ui-spinner ui-spinner--lg" role="status" aria-label="${t("loading", "Loading")}"></span></div>`, cssReferences.spinner);
    case "skeleton": return implementation("skeleton", `<div style="max-width:32rem"><div class="ui-skeleton ui-skeleton--title"></div><div class="ui-skeleton ui-skeleton--text"></div><div class="ui-skeleton ui-skeleton--text" style="width:78%"></div><div class="ui-cluster" style="margin-top:var(--sui-space-3)"><span class="ui-skeleton ui-skeleton--avatar"></span><span class="ui-skeleton ui-skeleton--block" style="--sui-skeleton-block-height:3rem;max-width:14rem"></span></div></div>`, cssReferences.skeleton);
    case "progress": return implementation("progress", `<div class="docs-preview--stack"><div class="ui-progress" role="progressbar" aria-label="Upload progress" aria-valuenow="64" aria-valuemin="0" aria-valuemax="100"><div class="ui-progress__bar" style="width:64%"></div></div><div class="ui-progress ui-progress--indeterminate" role="progressbar" aria-label="${t("loading", "Loading")}"><div class="ui-progress__bar"></div></div></div>`, cssReferences.progress);
    case "table": {
      const users = t("users", "Users");
      const role = t("role", "Role");
      const status = t("status", "Status");
      const active = t("active", "Active");
      const pending = t("pending", "Pending");
      return implementation("table", `<div class="ui-table-wrap" role="region" aria-label="${users}" tabindex="0"><table class="ui-table"><caption class="sr-only">${users}</caption><thead><tr><th>Name</th><th>${role}</th><th>${status}</th></tr></thead><tbody><tr><td>Ana García</td><td>Admin</td><td><span class="ui-badge ui-badge--success">${active}</span></td></tr><tr><td>Carlos Ruiz</td><td>Editor</td><td><span class="ui-badge ui-badge--warning">${pending}</span></td></tr></tbody></table></div>`, cssReferences.table) + `<p>${t("table-note", "Use ui-table-wrap with role=region and a label for accessible horizontal scrolling.")}</p>`;
    }
    case "avatar": return implementation("avatar", `<div class="ui-cluster"><span class="ui-avatar ui-avatar--sm">AG</span><span class="ui-avatar">JD</span><span class="ui-avatar ui-avatar--lg">KL</span><span class="ui-avatar"><img alt="Ada Lovelace" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80" /></span><div class="ui-avatar-group"><span class="ui-avatar">A</span><span class="ui-avatar">B</span><span class="ui-avatar">C</span></div></div>`, cssReferences.avatar);
    case "stat": return implementation("stat", `<div class="docs-grid docs-grid--three"><div class="ui-stat"><div class="ui-stat__label">${t("users", "Users")}</div><div class="ui-stat__value">1,284</div><div class="ui-stat__hint">+12% this month</div></div><div class="ui-stat"><div class="ui-stat__label">Revenue</div><div class="ui-stat__value">$48.2k</div><div class="ui-stat__hint">+8% this month</div></div><div class="ui-stat"><div class="ui-stat__label">Availability</div><div class="ui-stat__value">97%</div><div class="ui-stat__hint">Online</div></div></div>`, cssReferences.stat);
    case "empty-state": return implementation("empty-state", `<div class="ui-empty"><div class="ui-empty__title">No results</div><div class="ui-empty__body">Create a record to get started.</div><button class="ui-button ui-button--primary ui-button--sm" type="button">Create record</button></div>`, cssReferences["empty-state"]);
    case "nav": return implementation("nav", `<div class="ui-nav__group-title">Workspace</div><nav class="ui-nav" aria-label="Workspace"><a href="#nav" class="ui-nav__item ui-nav__item--active" aria-current="page">Dashboard</a><a href="#nav" class="ui-nav__item">Projects</a><a href="#nav" class="ui-nav__item">Team</a><a href="#nav" class="ui-nav__item" aria-disabled="true" tabindex="-1">Disabled</a></nav>`, cssReferences.nav);
    case "modal": return `<div class="docs-grid">${showcase(`<button class="ui-button ui-button--primary" type="button" data-open-modal>${t("open-modal", "Open modal")}</button>`, snippets.modal)}${api([["Attributes", "open, label, close-label, disable-backdrop-close"], ["Slots", "title, default, footer"], ["Events", "sui-open; sui-close { reason: dismiss | escape | backdrop | programmatic }"], ["Event behavior", "Lifecycle events are emitted only after actual state transitions"], ["Keyboard", "Escape and focus trap"]])}</div>`;
    case "drawer": return `<div class="docs-grid">${showcase(`<button class="ui-button ui-button--ghost" type="button" data-open-drawer>${t("open-drawer", "Open drawer")}</button>`, snippets.drawer)}${api([["Attributes", "open, label, close-label, disable-backdrop-close"], ["Slots", "title, default, footer"], ["Events", "sui-open; sui-close { reason: dismiss | escape | backdrop | programmatic }"], ["Event behavior", "Lifecycle events are emitted only after actual state transitions"], ["Token", "--sui-drawer-width"]])}</div>`;
    case "dropdown": return `<div class="docs-grid">${showcase(`<sui-dropdown><span slot="trigger">${t("actions", "Actions")}</span><button type="button" data-value="export">Export</button><button type="button" data-value="archive">Archive</button><button type="button" data-value="delete" disabled>Delete</button></sui-dropdown>`, snippets.dropdown)}${api([["Attribute", "open"], ["Item attribute", "disabled / aria-disabled"], ["Events", "sui-open, sui-close, sui-toggle, sui-select"], ["Event behavior", "Lifecycle events are emitted only after actual state transitions"], ["Keyboard", "Arrows, Home, End, Enter, Space, Escape, Tab (disabled items are skipped)"]])}</div>`;
    case "tabs": return `<div class="docs-grid">${showcase(`<sui-tabs><div data-tab="general" label="${t("general", "General")}">${t("general", "General")} content.</div><div data-tab="security" label="${t("security", "Security")}">${t("security", "Security")} content.</div><div data-tab="notifications" label="${t("notifications", "Notifications")}">${t("notifications", "Notifications")} content.</div><div data-tab="disabled" label="${t("disabled", "Disabled")}" disabled>${t("disabled", "Disabled")} content.</div></sui-tabs>`, snippets.tabs)}${api([["Attribute", "value"], ["Tab attribute", "disabled"], ["Event", "sui-change { value }"], ["Keyboard", "Arrows, Home, End (disabled tabs are skipped)"]])}</div><div class="docs-reference" style="margin-top:var(--sui-space-4)"><h3>${t("tabs.choice", "Choice variation (segmented control)")}</h3><p>${t("tabs.choice-copy", "Use sui-tabs with variant=\"box\" for compact single-selection controls such as language or theme pickers.")}</p>${showcase(`<sui-tabs variant="box" value="system" aria-label="Theme"><span data-tab="system" label="System"></span><span data-tab="light" label="Light"></span><span data-tab="dark" label="Dark"></span><span data-tab="disabled" label="Disabled" disabled></span></sui-tabs>`)}${api([["Attribute", "variant=\"box\""], ["Classes", "tabs-pill (styled by host variant)"], ["States", "default, selected, disabled"], ["Use", "Language or theme selectors in compact toolbars"]])}</div>`;
    case "accordion": return `<div class="docs-grid">${showcase(`<sui-accordion><div class="ui-accordion__item open"><button class="ui-accordion__trigger" type="button">${t("details", "Details")}</button><div class="ui-accordion__content">First section content.</div></div><div class="ui-accordion__item"><button class="ui-accordion__trigger" type="button">${t("history", "History")}</button><div class="ui-accordion__content">Second section content.</div></div><div class="ui-accordion__item" disabled><button class="ui-accordion__trigger" type="button">${t("disabled", "Disabled")}</button><div class="ui-accordion__content">Disabled content.</div></div></sui-accordion>`, snippets.accordion)}${api([["Attribute", "multiple"], ["Item attribute", "disabled"], ["Event", "sui-change"], ["Keyboard", "ArrowUp, ArrowDown, Home, End (disabled items are skipped)"]])}</div>`;
    case "popover": return `<div class="docs-grid">${showcase(`<sui-popover label="${t("actions", "Actions")}"><button slot="trigger" class="ui-button ui-button--ghost" type="button">${t("actions", "Actions")}</button><div slot="content"><p>Contextual actions.</p><button class="ui-button ui-button--primary ui-button--sm" type="button">Edit</button></div></sui-popover>`, snippets.popover)}${api([["Attributes", "open, label"], ["Slots", "trigger, content"], ["Events", "sui-open, sui-close"], ["Keyboard", "ArrowDown, Enter, Space, Escape, Tab"]])}</div>`;
    case "tooltip": return `<div class="docs-grid">${showcase(`<sui-tooltip content="Additional context for this action"><button class="ui-button ui-button--ghost" type="button">Hover or focus</button></sui-tooltip><sui-tooltip content="Disabled trigger"><button class="ui-button ui-button--ghost" type="button" disabled>Disabled trigger</button></sui-tooltip>`, snippets.tooltip)}${api([["Attribute", "content"], ["Slots", "trigger, content"], ["Events", "none"], ["Keyboard", "focus"], ["Behavior", "Disabled triggers do not show the tooltip"]])}</div>`;
    case "toast": return `<div class="docs-grid">${showcase(`<button class="ui-button ui-button--primary" type="button" data-show-toast>${t("show-toast", "Show toast")}</button>`, `import { SuiToast } from "@luisrodonccs/simplest-ui";\n\nSuiToast.show({ title: "Changes saved", variant: "success" });`)}${api([["Attributes", "title, message, variant, duration"], ["Event", "sui-dismiss"], ["API", "SuiToast.show(options)"]])}</div>`;
    case "container": return implementation("container", `<div class="docs-layout-demo ui-container"><div>ui-container</div></div>`, cssReferences.container);
    case "stack": return implementation("stack", `<div class="docs-layout-demo ui-stack"><div>One</div><div>Two</div><div>Three</div></div>`, cssReferences.stack);
    case "cluster": return implementation("cluster", `<div class="docs-layout-demo ui-cluster"><div>One</div><div>Two</div><div>Three</div><div>Four</div></div>`, cssReferences.cluster);
    case "grid": return implementation("grid", `<div class="docs-layout-demo ui-grid ui-grid--auto"><div>One</div><div>Two</div><div>Three</div></div>`, cssReferences.grid);
    case "app-shell": return implementation("app-shell", `<div class="ui-app-shell ui-app-shell--contained"><aside class="ui-app-shell__sidebar"><div class="ui-app-shell__brand">Acme</div><nav class="ui-nav"><a class="ui-nav__item ui-nav__item--active" href="#app-shell">Dashboard</a></nav></aside><div class="ui-app-shell__content"><header class="ui-app-shell__header"><span class="ui-app-shell__title">Dashboard</span></header><main class="ui-app-shell__main"><div class="ui-card">Content</div></main></div></div>`, cssReferences["app-shell"]);
    case "skip-link": return implementation("skip-link", `<div style="display:grid;gap:var(--sui-space-3)"><a class="ui-skip-link" href="#skip-link-demo" style="position:static;transform:none;opacity:1;clip:auto;width:auto;height:auto">Skip to content</a><main id="skip-link-demo" tabindex="-1" style="padding:var(--sui-space-3);border:1px dashed var(--sui-color-border-strong);border-radius:var(--sui-radius-md)">Main content</main></div>`, cssReferences["skip-link"]);
    case "topbar": return implementation("topbar", `<header class="ui-topbar"><a class="ui-topbar__brand" href="/"><span class="ui-topbar__mark">S</span><span>Simplest UI</span></a><div class="ui-topbar__controls"><button class="ui-button ui-button--ghost ui-button--sm" type="button">EN</button><button class="ui-button ui-button--ghost ui-button--sm" type="button">ES</button></div></header>`, cssReferences.topbar);
    case "agent-skill": return `<div class="docs-grid"><div class="docs-reference"><h3>${t("agent-skill.what-title", "Build with the system, not around it")}</h3><p>${t("agent-skill.what-copy", "The official skill reads the manifest, selects existing primitives first, and preserves the system's accessibility and token conventions.")}</p><ol><li>${t("agent-skill.step-one", "Inspect components.manifest.json.")}</li><li>${t("agent-skill.step-two", "Compose documented ui-* and sui-* primitives.")}</li><li>${t("agent-skill.step-three", "Extend the system only when composition is insufficient.")}</li></ol></div><div class="docs-reference"><h3>${t("agent-skill.install-title", "Install")}</h3><p>${t("agent-skill.install-copy", "The npm package includes the skill but does not activate it automatically.")}</p><pre tabindex="0" aria-label="${t("agent-skill.config-label", "OpenCode configuration example")}"><code>// opencode.jsonc&#10;{ "skills": ["./node_modules/@luisrodonccs/simplest-ui/skills"] }</code></pre><p>${t("agent-skill.invoke", "Use @simplest-ui in OpenCode or /simplest-ui in Claude Code.")}</p><p><a href="https://github.com/LuisRodOnCCS/simplest-ui/blob/main/skills/simplest-ui/INSTALL.md">${t("agent-skill.guide", "Read the complete installation guide")}</a></p></div></div>`;
    case "dashboard": return `<a class="docs-page-link" href="./pages/dashboard.html"><div><h3>${t("dashboard.title", "Dashboard")}</h3><p>${t("dashboard.copy", "A full page composing App Shell and data components.")}</p></div><span class="ui-button ui-button--ghost ui-button--sm">${t("page-open", "Open page")}</span></a>`;
    default: return "";
  }
}

function renderNav() {
  return catalog.groups.map((group) => `<div class="docs-nav__group"><span class="docs-nav__label">${t(group.id, group.label)}</span>${group.items.map((item) => `<a href="${item.href ?? `#${item.id}`}" data-nav-id="${item.id}">${t(item.id, item.label)}<kbd>${t(item.kind, item.kind)}</kbd></a>`).join("")}</div>`).join("");
}

function renderSections() {
  return catalog.groups.flatMap((group) => group.items).map((item) => {
    const title = t(`${item.id}.title`, t(item.id, item.label));
    const copy = t(`${item.id}.copy`, "");
    if (item.id === "overview") return componentBody(item.id);
    return section(item.id, item.kind, title, copy, componentBody(item.id));
  }).join("");
}

function localizePreviewText() {
  if (language !== "es") return;
  const replacements: Record<string, string> = {
    "Save changes": "Guardar cambios", "Cancel": "Cancelar", "More options": "Más opciones", "Delete": "Eliminar", "Small": "Pequeño", "Disabled": "Deshabilitado", "Name": "Nombre", "Use your full name.": "Usa tu nombre completo.", "Email": "Correo electrónico", "Enter a valid email address.": "Introduce un correo válido.", "Message": "Mensaje", "Write a message": "Escribe un mensaje", "Too short": "Demasiado corto", "Add at least 20 characters.": "Añade al menos 20 caracteres.", "Country": "País", "Select a country": "Selecciona un país", "Choose an option.": "Elige una opción.", "Marketing emails": "Correos de marketing", "Plan": "Plan", "Notifications": "Notificaciones", "Digest": "Resumen", "A quiet surface for grouped content.": "Una superficie discreta para agrupar contenido.", "Higher visual separation.": "Mayor separación visual.", "Soft blurred surface.": "Superficie suave con desenfoque.", "Saved": "Guardado", "Your changes are live.": "Tus cambios ya están activos.", "Review required": "Revisión necesaria", "Two required fields are missing.": "Faltan dos campos obligatorios.", "Connection failed": "Error de conexión", "Try again in a moment.": "Inténtalo de nuevo en un momento.", "No results": "Sin resultados", "Create a record to get started.": "Crea un registro para comenzar.", "Create record": "Crear registro", "Workspace": "Espacio de trabajo", "Projects": "Proyectos", "Team": "Equipo", "Confirmation": "Confirmación", "Do you want to continue?": "¿Quieres continuar?", "Filters": "Filtros", "Adjust the results.": "Ajusta los resultados.", "Export": "Exportar", "Archive": "Archivar", "Contextual actions.": "Acciones contextuales.", "Edit": "Editar", "Hover or focus": "Pasa el cursor o enfoca", "Additional context for this action": "Contexto adicional para esta acción", "General content.": "Contenido general.", "Security content.": "Contenido de seguridad.", "Notifications content.": "Contenido de notificaciones.", "First section content.": "Contenido de la primera sección.", "Second section content.": "Contenido de la segunda sección.", "Default": "Predeterminada", "Raised": "Elevada", "Glass": "Cristal", "Revenue": "Ingresos", "Availability": "Disponibilidad", "Online": "En línea", "Content": "Contenido", "One": "Uno", "Two": "Dos", "Three": "Tres", "Four": "Cuatro"
  };
  const walker = document.createTreeWalker(document.querySelector("#content")!, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);
  textNodes.forEach((node) => {
    if (node.parentElement?.closest("code, pre")) return;
    const replacement = replacements[node.nodeValue?.trim() ?? ""];
    if (replacement) node.nodeValue = node.nodeValue!.replace(node.nodeValue!.trim(), replacement);
  });
  document.querySelectorAll<HTMLElement>("#content [placeholder], #content [aria-label]").forEach((element) => {
    ["placeholder", "aria-label"].forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (value && replacements[value]) element.setAttribute(attribute, replacements[value]);
    });
  });
}

function render() {
  document.documentElement.lang = language;
  document.title = language === "es" ? "Simplest UI · Documentación" : "Simplest UI · Documentation";
  document.querySelector("#docs-root")!.innerHTML = `
    <div class="docs-shell"><header class="ui-topbar"><a class="ui-topbar__brand" href="#overview"><span class="ui-topbar__mark" aria-hidden="true">S</span><span>Simplest UI</span></a><div class="ui-topbar__controls"><sui-tabs variant="box" value="${language}" id="docs-language-tabs" aria-label="Language"><span data-tab="en" label="EN"></span><span data-tab="es" label="ES"></span></sui-tabs><sui-tabs variant="box" value="${themeChoice()}" id="docs-theme-tabs" aria-label="Theme"><span data-tab="system" label="${t("system", "System")}"></span><span data-tab="light" label="${t("light", "Light")}"></span><span data-tab="dark" label="${t("dark", "Dark")}"></span></sui-tabs></div></header><div class="docs-layout"><nav class="docs-nav" aria-label="Documentation"><input class="docs-search" type="search" placeholder="${t("search", "Search components")}" aria-label="${t("search", "Search components")}" />${renderNav()}</nav><main class="docs-content" id="content" tabindex="-1">${renderSections()}</main></div></div>
    <sui-modal id="docs-modal" label="${t("modal-label", "Confirmation")}" close-label="${t("modal-close", "Close modal")}"><span slot="title">${t("modal-label", "Confirmation")}</span><p>${t("modal-message", "Do you want to continue with this action?")}</p><div slot="footer"><button class="ui-button" type="button" data-close-modal>${t("cancel", "Cancel")}</button><button class="ui-button ui-button--primary" type="button">${t("confirm", "Confirm")}</button></div></sui-modal>
    <sui-drawer id="docs-drawer" label="${t("drawer-label", "Filters")}" close-label="${t("drawer-close", "Close filters")}"><span slot="title">${t("drawer-label", "Filters")}</span><p>${t("drawer-message", "Adjust the results without leaving this view.")}</p><label class="ui-checkbox"><input type="checkbox" checked /> ${t("active-only", "Active only")}</label><div slot="footer"><button class="ui-button ui-button--ghost ui-button--sm" type="button">${t("reset", "Reset")}</button><button class="ui-button ui-button--primary ui-button--sm" type="button">${t("apply", "Apply")}</button></div></sui-drawer>`;
  localizePreviewText();
  bindInteractions();
  setTheme(themeChoice());
}

function bindInteractions() {
  document.querySelector("#docs-language-tabs")?.addEventListener("sui-change", (event) => {
    language = (event as CustomEvent).detail.value as Language;
    try { localStorage.setItem(languageKey, language); } catch { /* Storage is optional. */ }
    render();
  });
  document.querySelector("#docs-theme-tabs")?.addEventListener("sui-change", (event) => {
    const choice = (event as CustomEvent).detail.value as ThemeChoice;
    try { localStorage.setItem(themeKey, choice); } catch { /* Storage is optional. */ }
    setTheme(choice);
  });
  document.querySelectorAll<HTMLButtonElement>(".docs-copy").forEach((button) => button.addEventListener("click", async () => {
    const text = button.parentElement?.querySelector("code")?.textContent?.trim() ?? "";
    try { await navigator.clipboard.writeText(text); button.textContent = t("copied", "Copied"); window.setTimeout(() => { button.textContent = t("copy", "Copy"); }, 1600); } catch { button.textContent = "…"; }
  }));
  document.querySelectorAll<HTMLButtonElement>("[data-open-modal]").forEach((button) => button.addEventListener("click", () => document.querySelector<HTMLElement>("#docs-modal")?.setAttribute("open", "")));
  document.querySelectorAll<HTMLButtonElement>("[data-close-modal]").forEach((button) => button.addEventListener("click", () => document.querySelector<HTMLElement>("#docs-modal")?.removeAttribute("open")));
  document.querySelectorAll<HTMLButtonElement>("[data-open-drawer]").forEach((button) => button.addEventListener("click", () => { const drawer = document.querySelector<HTMLElement & { open?: boolean }>("#docs-drawer"); if (drawer) drawer.open = true; }));
  document.querySelectorAll<HTMLButtonElement>("[data-show-toast]").forEach((button) => button.addEventListener("click", () => customElements.whenDefined("sui-toast").then(() => {
    const Toast = customElements.get("sui-toast") as typeof HTMLElement & { show: (options: { title: string; message: string; variant: "success"; duration: number }) => void; };
    Toast.show({ title: language === "es" ? "Cambios guardados" : "Changes saved", message: language === "es" ? "La operación se completó correctamente." : "The operation completed successfully.", variant: "success", duration: 3200 });
  })));
  const search = document.querySelector<HTMLInputElement>(".docs-search");
  search?.addEventListener("input", () => {
    const query = search.value.trim().toLowerCase();
    document.querySelectorAll<HTMLElement>(".docs-section").forEach((item) => item.classList.toggle("docs-filtered", Boolean(query) && !item.dataset.search?.includes(query)));
    document.querySelectorAll<HTMLElement>("[data-nav-id]").forEach((item) => item.classList.toggle("docs-filtered", Boolean(query) && !item.textContent?.toLowerCase().includes(query)));
  });
  const setActiveNavigation = (id: string) => {
    document.querySelectorAll("[data-nav-id]").forEach((link) => link.removeAttribute("aria-current"));
    document.querySelector(`[data-nav-id="${id}"]`)?.setAttribute("aria-current", "location");
  };
  document.querySelectorAll<HTMLAnchorElement>("[data-nav-id]").forEach((link) => link.addEventListener("click", () => {
    const id = link.dataset.navId;
    if (id && link.getAttribute("href") === `#${id}`) setActiveNavigation(id);
  }));
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    setActiveNavigation(entry.target.id);
  }), { rootMargin: "-20% 0px -70% 0px" });
  document.querySelectorAll<HTMLElement>(".docs-hero[id], .docs-section").forEach((item) => observer.observe(item));
}

media.addEventListener("change", () => { if (document.documentElement.dataset.themeChoice === "system") setTheme("system"); });
render();
