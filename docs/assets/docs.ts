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
  "skip": "Saltar al contenido", "search": "Buscar componentes", "overview": "Introducción", "installation": "Instalación", "tokens": "Tokens", "foundations": "Fundamentos", "css-components": "Componentes CSS", "web-components": "Web Components", "layouts": "Layouts", "pages": "Páginas", "foundation": "Fundamento", "css": "CSS", "web-component": "Web Component", "layout": "Layout", "page": "Página",
  "hero.title": "Interfaces simples, con un sistema claro.", "hero.copy": "Tokens CSS, componentes semánticos y Web Components accesibles para construir productos sin depender de un framework.", "hero.audit": "P0–P2 auditado", "hero.framework": "Framework-agnostic",
  "installation.title": "Instalación", "installation.copy": "Importa CSS para la apariencia e importa JavaScript solo para los elementos interactivos que necesites.", "installation.note": "Cards, tables, alerts y controles de formulario son componentes CSS. Solo los elementos documentados como Web Components usan etiquetas sui-*.",
  "tokens.title": "Tokens del sistema", "tokens.copy": "Los tokens semánticos mantienen colores, espaciado, tipografía y efectos coherentes en ambos temas.", "tokens.note": "Cambia el tema desde la cabecera para inspeccionar cómo se reasignan los tokens semánticos.",
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
  document.querySelectorAll<HTMLButtonElement>("[data-theme-choice]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.themeChoice === choice));
  });
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function code(value: string) {
  return `<pre class="docs-code"><code>${escapeHtml(value)}</code><button class="docs-copy" type="button">${t("copy", "Copy")}</button></pre>`;
}

function showcase(preview: string, snippet?: string) {
  return `<div class="docs-showcase"><div class="docs-preview">${preview}</div>${snippet ? code(snippet) : ""}</div>`;
}

function section(id: string, kind: string, title: string, copy: string, body: string) {
  return `<section class="docs-section" id="${id}" data-search="${title.toLowerCase()} ${kind}"><div class="docs-section__heading"><div><h2>${title}</h2><p>${copy}</p></div><span class="docs-kind">${t(kind, kind)}</span></div>${body}</section>`;
}

function api(rows: Array<[string, string]>) {
  return `<div class="docs-reference"><h3>API</h3><table class="docs-api"><tbody>${rows.map(([key, value]) => `<tr><th><code>${key}</code></th><td>${value}</td></tr>`).join("")}</tbody></table></div>`;
}

const snippets = {
  button: `<button class="ui-button ui-button--primary" type="button">Save changes</button>`,
  field: `<div class="ui-field">\n  <label class="ui-label" for="name">Name</label>\n  <input class="ui-input" id="name" aria-describedby="name-help" />\n  <div class="ui-help" id="name-help">Use your full name.</div>\n</div>`,
  drawer: `<sui-drawer label="Filters" close-label="Close filters">\n  <span slot="title">Filters</span>\n  <p>Adjust the results.</p>\n  <div slot="footer">...</div>\n</sui-drawer>`,
  modal: `<sui-modal label="Confirm action">\n  <span slot="title">Confirmation</span>\n  <p>Do you want to continue?</p>\n</sui-modal>`,
  table: `<div class="ui-table-wrap" role="region" aria-label="Users" tabindex="0">\n  <table class="ui-table">...</table>\n</div>`
};

function componentBody(id: string): string {
  switch (id) {
    case "overview": return `<header class="docs-hero"><h1>${t("hero.title", "Simple interfaces, with a clear system.").replace("simple", "<span>simple</span>")}</h1><p>${t("hero.copy", "CSS tokens, semantic components and accessible Web Components for building products without framework lock-in.")}</p><div class="docs-hero__meta"><span class="ui-badge ui-badge--primary">v0.1.0-rc.1</span><span class="ui-badge ui-badge--success">${t("hero.audit", "P0–P2 audited")}</span><span class="ui-badge ui-badge--outline">${t("hero.framework", "Framework-agnostic")}</span></div></header>`;
    case "installation": return showcase(`<p>${t("installation.note", "Cards, tables, alerts and form controls are CSS components. Only documented Web Components use sui-* tags.")}</p>`, `npm install @luisrodonccs/simplest-ui\n\nimport "@luisrodonccs/simplest-ui/tokens.css";\nimport "@luisrodonccs/simplest-ui/styles.css";\nimport "@luisrodonccs/simplest-ui/components.js";`);
    case "tokens": return `<div class="docs-token-grid"><div class="docs-swatch" style="--docs-swatch:var(--sui-color-primary);--docs-swatch-text:var(--sui-color-primary-contrast)"><code>--sui-color-primary</code></div><div class="docs-swatch" style="--docs-swatch:var(--sui-color-secondary);--docs-swatch-text:#fff"><code>--sui-color-secondary</code></div><div class="docs-swatch" style="--docs-swatch:var(--sui-color-success-surface);--docs-swatch-text:var(--sui-color-success-text)"><code>success surface</code></div><div class="docs-swatch" style="--docs-swatch:var(--sui-color-surface-raised)"><code>surface raised</code></div></div><div class="docs-grid" style="margin-top:var(--sui-space-4)">${api([["Typography", "--sui-font-*"], ["Spacing", "--sui-space-*"], ["Radii", "--sui-radius-*"], ["Shadows", "--sui-shadow-*"], ["Motion", "--sui-duration-* / --sui-easing-*"], ["Effects", "--sui-blur-* / --sui-z-*"]])}<div class="docs-reference"><h3>${t("tokens.note", "Use the theme control in the header to inspect semantic token remapping.")}</h3><div class="docs-scale" style="margin-top:var(--sui-space-4)"><span style="--scale:var(--sui-space-4)">4</span><span style="--scale:var(--sui-space-6)">6</span><span style="--scale:var(--sui-space-8)">8</span><span style="--scale:var(--sui-space-10)">10</span></div></div></div>`;
    case "button": return showcase(`<div class="ui-cluster"><button class="ui-button ui-button--primary" type="button">${t("save", "Save changes")}</button><button class="ui-button" type="button">${t("cancel", "Cancel")}</button><button class="ui-button ui-button--ghost" type="button">${t("more", "More options")}</button><button class="ui-button ui-button--danger" type="button">${t("delete", "Delete")}</button><button class="ui-button ui-button--primary ui-button--sm" type="button">Small</button><button class="ui-button" type="button" disabled>${t("disabled", "Disabled")}</button></div>`, snippets.button);
    case "input-field": return `<div class="docs-grid">${showcase(`<div class="ui-field"><label class="ui-label" for="docs-name">Name</label><input class="ui-input" id="docs-name" placeholder="Ada Lovelace" /><div class="ui-help">Use your full name.</div></div>`, snippets.field)}${showcase(`<div class="ui-field"><label class="ui-label" for="docs-invalid">Email</label><input class="ui-input ui-input--invalid" id="docs-invalid" value="not-an-email" aria-describedby="docs-error" /><div class="ui-error" id="docs-error">Enter a valid email address.</div></div><div class="ui-field"><input class="ui-input" disabled value="Disabled" /></div>`)}</div>`;
    case "textarea": return showcase(`<div class="docs-grid"><div class="ui-field"><label class="ui-label" for="docs-message">Message</label><textarea class="ui-textarea" id="docs-message" placeholder="Write a message"></textarea></div><div class="ui-field"><label class="ui-label" for="docs-invalid-message">Message</label><textarea class="ui-textarea ui-textarea--invalid" id="docs-invalid-message">Too short</textarea><div class="ui-error">Add at least 20 characters.</div></div></div>`);
    case "select": return showcase(`<div class="docs-grid"><div class="ui-field"><label class="ui-label" for="docs-country">Country</label><select class="ui-select" id="docs-country"><option>Mexico</option><option>Spain</option><option>Argentina</option></select></div><div class="ui-field"><label class="ui-label" for="docs-invalid-country">Country</label><select class="ui-select ui-select--invalid" id="docs-invalid-country"><option>Select a country</option></select><div class="ui-error">Choose an option.</div></div></div>`);
    case "checkbox": return showcase(`<div class="ui-cluster"><label class="ui-checkbox"><input type="checkbox" checked /> ${t("active", "Active")}</label><label class="ui-checkbox"><input type="checkbox" /> Marketing emails</label><label class="ui-checkbox ui-checkbox--disabled"><input type="checkbox" disabled /> ${t("disabled", "Disabled")}</label></div>`);
    case "radio": return showcase(`<fieldset class="ui-radio-group"><legend class="ui-label">Plan</legend><label class="ui-radio"><input type="radio" name="plan" checked /> Starter</label><label class="ui-radio"><input type="radio" name="plan" /> Pro</label></fieldset>`);
    case "switch": return showcase(`<div class="ui-cluster"><label class="ui-switch"><input type="checkbox" checked /><span class="ui-switch__track"></span> Notifications</label><label class="ui-switch"><input type="checkbox" /><span class="ui-switch__track"></span> Digest</label><label class="ui-switch"><input type="checkbox" disabled /><span class="ui-switch__track"></span> ${t("disabled", "Disabled")}</label></div>`);
    case "card": return `<div class="docs-grid docs-grid--three"><article class="ui-card"><div class="ui-card__title">Default</div><div class="ui-card__body">A quiet surface for grouped content.</div></article><article class="ui-card ui-card--raised"><div class="ui-card__title">Raised</div><div class="ui-card__body">Higher visual separation.</div></article><article class="ui-card ui-card--glass"><div class="ui-card__title">Glass</div><div class="ui-card__body">Soft blurred surface.</div></article></div>`;
    case "badge-chip": return showcase(`<div class="ui-cluster"><span class="ui-badge">Neutral</span><span class="ui-badge ui-badge--primary">Primary</span><span class="ui-badge ui-badge--success">${t("active", "Active")}</span><span class="ui-badge ui-badge--warning">${t("pending", "Pending")}</span><span class="ui-badge ui-badge--danger">${t("error", "Error")}</span><span class="ui-badge ui-badge--info">Info</span><span class="ui-badge ui-badge--outline">Outline</span><span class="ui-chip">Design systems</span></div>`);
    case "alert": return showcase(`<div class="docs-preview--stack"><div class="ui-alert ui-alert--success" role="status"><div><div class="ui-alert__title">Saved</div><div class="ui-alert__body">Your changes are live.</div></div></div><div class="ui-alert ui-alert--warning" role="status"><div><div class="ui-alert__title">Review required</div><div class="ui-alert__body">Two required fields are missing.</div></div></div><div class="ui-alert ui-alert--danger" role="alert"><div><div class="ui-alert__title">Connection failed</div><div class="ui-alert__body">Try again in a moment.</div></div></div></div>`);
    case "spinner": return showcase(`<div class="ui-cluster"><span class="ui-spinner" aria-label="${t("loading", "Loading")}"></span><span class="ui-spinner ui-spinner--sm" aria-label="${t("loading", "Loading")}"></span><span class="ui-spinner ui-spinner--lg" aria-label="${t("loading", "Loading")}"></span></div>`);
    case "skeleton": return showcase(`<div style="max-width:32rem"><div class="ui-skeleton ui-skeleton--title"></div><div class="ui-skeleton ui-skeleton--text"></div><div class="ui-skeleton ui-skeleton--text" style="width:78%"></div><div class="ui-cluster" style="margin-top:var(--sui-space-3)"><span class="ui-skeleton ui-skeleton--avatar"></span><span class="ui-skeleton ui-skeleton--block" style="--sui-skeleton-block-height:3rem;max-width:14rem"></span></div></div>`);
    case "progress": return showcase(`<div class="docs-preview--stack"><div class="ui-progress" aria-label="Upload progress"><div class="ui-progress__bar" style="width:64%"></div></div><div class="ui-progress ui-progress--indeterminate" aria-label="${t("loading", "Loading")}"><div class="ui-progress__bar"></div></div></div>`);
    case "table": {
      const users = t("users", "Users");
      const role = t("role", "Role");
      const status = t("status", "Status");
      const active = t("active", "Active");
      const pending = t("pending", "Pending");
      return showcase(`<div class="ui-table-wrap" role="region" aria-label="${users}" tabindex="0"><table class="ui-table"><caption class="sr-only">${users}</caption><thead><tr><th>Name</th><th>${role}</th><th>${status}</th></tr></thead><tbody><tr><td>Ana García</td><td>Admin</td><td><span class="ui-badge ui-badge--success">${active}</span></td></tr><tr><td>Carlos Ruiz</td><td>Editor</td><td><span class="ui-badge ui-badge--warning">${pending}</span></td></tr></tbody></table></div>`, snippets.table) + `<p>${t("table-note", "Use ui-table-wrap with role=region and a label for accessible horizontal scrolling.")}</p>`;
    }
    case "avatar": return showcase(`<div class="ui-cluster"><span class="ui-avatar ui-avatar--sm">AG</span><span class="ui-avatar">JD</span><span class="ui-avatar ui-avatar--lg">KL</span><span class="ui-avatar"><img alt="Ada Lovelace" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80" /></span><div class="ui-avatar-group"><span class="ui-avatar">A</span><span class="ui-avatar">B</span><span class="ui-avatar">C</span></div></div>`);
    case "stat": return `<div class="docs-grid docs-grid--three"><div class="ui-stat"><div class="ui-stat__label">${t("users", "Users")}</div><div class="ui-stat__value">1,284</div><div class="ui-stat__hint">+12% this month</div></div><div class="ui-stat"><div class="ui-stat__label">Revenue</div><div class="ui-stat__value">$48.2k</div><div class="ui-stat__hint">+8% this month</div></div><div class="ui-stat"><div class="ui-stat__label">Availability</div><div class="ui-stat__value">97%</div><div class="ui-stat__hint">Online</div></div></div>`;
    case "empty-state": return showcase(`<div class="ui-empty"><div class="ui-empty__title">No results</div><div class="ui-empty__body">Create a record to get started.</div><button class="ui-button ui-button--primary ui-button--sm" type="button">Create record</button></div>`);
    case "nav": return showcase(`<div class="ui-nav__group-title">Workspace</div><nav class="ui-nav" aria-label="Workspace"><a href="#nav" class="ui-nav__item ui-nav__item--active" aria-current="page">Dashboard</a><a href="#nav" class="ui-nav__item">Projects</a><a href="#nav" class="ui-nav__item">Team</a></nav>`);
    case "modal": return `<div class="docs-grid">${showcase(`<button class="ui-button ui-button--primary" type="button" data-open-modal>${t("open-modal", "Open modal")}</button>`, snippets.modal)}${api([["Attributes", "open, label, close-label, disable-backdrop-close"], ["Slots", "title, default, footer"], ["Events", "sui-open, sui-close"], ["Keyboard", "Escape and focus trap"]])}</div>`;
    case "drawer": return `<div class="docs-grid">${showcase(`<button class="ui-button ui-button--ghost" type="button" data-open-drawer>${t("open-drawer", "Open drawer")}</button>`, snippets.drawer)}${api([["Attributes", "open, label, close-label, disable-backdrop-close"], ["Slots", "title, default, footer"], ["Events", "sui-open, sui-close"], ["Token", "--sui-drawer-width"]])}</div>`;
    case "dropdown": return `<div class="docs-grid">${showcase(`<sui-dropdown><span slot="trigger">${t("actions", "Actions")}</span><button type="button" data-value="export">Export</button><button type="button" data-value="archive">Archive</button></sui-dropdown>`)}${api([["Attribute", "open"], ["Events", "sui-open, sui-close, sui-toggle, sui-select"], ["Keyboard", "Arrows, Home, End, Enter, Space, Escape, Tab"]])}</div>`;
    case "tabs": return `<div class="docs-grid">${showcase(`<sui-tabs><div data-tab="general" label="${t("general", "General")}">${t("general", "General")} content.</div><div data-tab="security" label="${t("security", "Security")}">${t("security", "Security")} content.</div><div data-tab="notifications" label="${t("notifications", "Notifications")}">${t("notifications", "Notifications")} content.</div></sui-tabs>`)}${api([["Attribute", "value"], ["Event", "sui-change { value }"], ["Keyboard", "Arrows, Home, End"]])}</div>`;
    case "accordion": return `<div class="docs-grid">${showcase(`<sui-accordion><div class="ui-accordion__item open"><button class="ui-accordion__trigger" type="button">${t("details", "Details")}</button><div class="ui-accordion__content">First section content.</div></div><div class="ui-accordion__item"><button class="ui-accordion__trigger" type="button">${t("history", "History")}</button><div class="ui-accordion__content">Second section content.</div></div></sui-accordion>`)}${api([["Attribute", "multiple"], ["Event", "sui-change"], ["Keyboard", "ArrowUp, ArrowDown, Home, End"]])}</div>`;
    case "popover": return `<div class="docs-grid">${showcase(`<sui-popover label="${t("actions", "Actions")}"><button slot="trigger" class="ui-button ui-button--ghost" type="button">${t("actions", "Actions")}</button><div slot="content"><p>Contextual actions.</p><button class="ui-button ui-button--primary ui-button--sm" type="button">Edit</button></div></sui-popover>`)}${api([["Attributes", "open, label"], ["Slots", "trigger, content"], ["Events", "sui-open, sui-close"], ["Keyboard", "ArrowDown, Enter, Space, Escape, Tab"]])}</div>`;
    case "tooltip": return showcase(`<sui-tooltip content="Additional context for this action"><button class="ui-button ui-button--ghost" type="button">Hover or focus</button></sui-tooltip>`);
    case "toast": return `<div class="docs-grid">${showcase(`<button class="ui-button ui-button--primary" type="button" data-show-toast>${t("show-toast", "Show toast")}</button>`, `import { SuiToast } from "@luisrodonccs/simplest-ui";\n\nSuiToast.show({ title: "Changes saved", variant: "success" });`)}${api([["Attributes", "title, message, variant, duration"], ["Event", "sui-dismiss"], ["API", "SuiToast.show(options)"]])}</div>`;
    case "container": return showcase(`<div class="docs-layout-demo ui-container"><div>ui-container</div></div>`, `<div class="ui-container">...</div>`);
    case "stack": return showcase(`<div class="docs-layout-demo ui-stack"><div>One</div><div>Two</div><div>Three</div></div>`, `<div class="ui-stack">...</div>`);
    case "cluster": return showcase(`<div class="docs-layout-demo ui-cluster"><div>One</div><div>Two</div><div>Three</div><div>Four</div></div>`, `<div class="ui-cluster">...</div>`);
    case "grid": return showcase(`<div class="docs-layout-demo ui-grid ui-grid--auto"><div>One</div><div>Two</div><div>Three</div></div>`, `<div class="ui-grid ui-grid--auto">...</div>`);
    case "app-shell": return showcase(`<div class="ui-app-shell ui-app-shell--contained"><aside class="ui-app-shell__sidebar"><div class="ui-app-shell__brand">Acme</div><nav class="ui-nav"><a class="ui-nav__item ui-nav__item--active" href="#app-shell">Dashboard</a></nav></aside><div class="ui-app-shell__content"><header class="ui-app-shell__header"><span class="ui-app-shell__title">Dashboard</span></header><main class="ui-app-shell__main"><div class="ui-card">Content</div></main></div></div>`);
    case "skip-link": return `<div class="docs-reference"><h3>Skip link</h3><p>Use <code>.ui-skip-link</code> as the first focusable element and point it to the application main landmark. It becomes visible only on keyboard focus.</p>${code(`<a class="ui-skip-link" href="#main-content">Skip to content</a>\n<main id="main-content" tabindex="-1">...</main>`)}</div>`;
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
    <div class="docs-shell"><header class="docs-topbar"><a class="docs-brand" href="#overview" aria-label="Simplest UI"><span class="docs-mark" aria-hidden="true">S</span><span>Simplest UI</span></a><div class="docs-controls"><div class="docs-choice" role="group" aria-label="Language"><button type="button" data-language="en" aria-pressed="${language === "en"}">EN</button><button type="button" data-language="es" aria-pressed="${language === "es"}">ES</button></div><div class="docs-choice" role="group" aria-label="Theme"><button type="button" data-theme-choice="system">${t("system", "System")}</button><button type="button" data-theme-choice="light">${t("light", "Light")}</button><button type="button" data-theme-choice="dark">${t("dark", "Dark")}</button></div></div></header><div class="docs-layout"><nav class="docs-nav" aria-label="Documentation"><input class="docs-search" type="search" placeholder="${t("search", "Search components")}" aria-label="${t("search", "Search components")}" />${renderNav()}</nav><main class="docs-content" id="content" tabindex="-1">${renderSections()}</main></div></div>
    <sui-modal id="docs-modal" label="${t("modal-label", "Confirmation")}" close-label="${t("modal-close", "Close modal")}"><span slot="title">${t("modal-label", "Confirmation")}</span><p>${t("modal-message", "Do you want to continue with this action?")}</p><div slot="footer"><button class="ui-button" type="button" data-close-modal>${t("cancel", "Cancel")}</button><button class="ui-button ui-button--primary" type="button">${t("confirm", "Confirm")}</button></div></sui-modal>
    <sui-drawer id="docs-drawer" label="${t("drawer-label", "Filters")}" close-label="${t("drawer-close", "Close filters")}"><span slot="title">${t("drawer-label", "Filters")}</span><p>${t("drawer-message", "Adjust the results without leaving this view.")}</p><label class="ui-checkbox"><input type="checkbox" checked /> ${t("active-only", "Active only")}</label><div slot="footer"><button class="ui-button ui-button--ghost ui-button--sm" type="button">${t("reset", "Reset")}</button><button class="ui-button ui-button--primary ui-button--sm" type="button">${t("apply", "Apply")}</button></div></sui-drawer>`;
  localizePreviewText();
  bindInteractions();
  setTheme(themeChoice());
}

function bindInteractions() {
  document.querySelectorAll<HTMLButtonElement>("[data-language]").forEach((button) => button.addEventListener("click", () => {
    language = button.dataset.language as Language;
    try { localStorage.setItem(languageKey, language); } catch { /* Storage is optional. */ }
    render();
  }));
  document.querySelectorAll<HTMLButtonElement>("[data-theme-choice]").forEach((button) => button.addEventListener("click", () => {
    const choice = button.dataset.themeChoice as ThemeChoice;
    try { localStorage.setItem(themeKey, choice); } catch { /* Storage is optional. */ }
    setTheme(choice);
  }));
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
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll("[data-nav-id]").forEach((link) => link.removeAttribute("aria-current"));
    document.querySelector(`[data-nav-id="${entry.target.id}"]`)?.setAttribute("aria-current", "location");
  }), { rootMargin: "-20% 0px -70% 0px" });
  document.querySelectorAll<HTMLElement>(".docs-section").forEach((item) => observer.observe(item));
}

media.addEventListener("change", () => { if (document.documentElement.dataset.themeChoice === "system") setTheme("system"); });
render();
