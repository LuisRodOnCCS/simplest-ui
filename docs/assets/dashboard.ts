type Language = "en" | "es";
type ThemeChoice = "light" | "dark" | "system";

const translations: Record<Language, Record<string, string>> = {
  en: { skip: "Skip to content", system: "System", light: "Light", dark: "Dark", workspace: "Workspace", dashboard: "Dashboard", projects: "Projects", team: "Team", account: "Account", settings: "Settings", actions: "Actions", export: "Export", archive: "Archive", "new-project": "New project", "projects-hint": "+2 this month", tasks: "Tasks", "tasks-hint": "8 pending", "team-hint": "All online", "project-summary": "Project summary", overview: "Overview", activity: "Activity", "overview-copy": "The project is on track for this sprint.", "activity-copy": "Four updates were published today.", "recent-team": "Recent team", "recent-projects": "Recent projects", project: "Project", owner: "Owner", status: "Status", active: "Active", pending: "Pending" },
  es: { skip: "Saltar al contenido", system: "Sistema", light: "Claro", dark: "Oscuro", workspace: "Espacio de trabajo", dashboard: "Panel", projects: "Proyectos", team: "Equipo", account: "Cuenta", settings: "Configuración", actions: "Acciones", export: "Exportar", archive: "Archivar", "new-project": "Nuevo proyecto", "projects-hint": "+2 este mes", tasks: "Tareas", "tasks-hint": "8 pendientes", "team-hint": "Todos en línea", "project-summary": "Resumen del proyecto", overview: "Resumen", activity: "Actividad", "overview-copy": "El proyecto avanza según lo previsto para este sprint.", "activity-copy": "Se publicaron cuatro actualizaciones hoy.", "recent-team": "Equipo reciente", "recent-projects": "Proyectos recientes", project: "Proyecto", owner: "Responsable", status: "Estado", active: "Activo", pending: "Pendiente" }
};
const languageKey = "simplest-ui-docs-language";
const themeKey = "simplest-ui-docs-theme";
const media = window.matchMedia("(prefers-color-scheme: dark)");
let language: Language = localStorage.getItem(languageKey) === "es" || (!localStorage.getItem(languageKey) && navigator.language.toLowerCase().startsWith("es")) ? "es" : "en";

function setLanguage(next: Language) { language = next; document.documentElement.lang = next; localStorage.setItem(languageKey, next); document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => { const value = translations[next][el.dataset.i18n ?? ""]; if (value) el.textContent = value; }); document.querySelectorAll<HTMLElement>("[data-i18n-label]").forEach((el) => { const value = translations[next][el.dataset.i18nLabel ?? ""]; if (value) el.setAttribute("label", value); }); document.querySelector("#dashboard-menu-trigger")?.setAttribute("aria-label", next === "es" ? "Abrir menú" : "Open menu"); document.querySelector("#dashboard-menu")?.setAttribute("label", next === "es" ? "Navegación" : "Navigation"); document.querySelector("#dashboard-menu")?.setAttribute("close-label", next === "es" ? "Cerrar menú" : "Close menu"); const langTabs = document.querySelector<HTMLElement & { value: string }>("#dashboard-language-tabs"); if (langTabs) langTabs.value = next; }
function setTheme(choice: ThemeChoice) { document.documentElement.dataset.theme = choice === "system" ? (media.matches ? "dark" : "light") : choice; document.documentElement.dataset.themeChoice = choice; localStorage.setItem(themeKey, choice); const themeTabs = document.querySelector<HTMLElement & { value: string }>("#dashboard-theme-tabs"); if (themeTabs) themeTabs.value = choice; }

customElements.whenDefined("sui-tabs").then(() => {
  const langTabs = document.querySelector<HTMLElement & { value: string }>("#dashboard-language-tabs");
  const themeTabs = document.querySelector<HTMLElement & { value: string }>("#dashboard-theme-tabs");
  if (langTabs) langTabs.value = language;
  if (themeTabs) themeTabs.value = (localStorage.getItem(themeKey) as ThemeChoice) || "system";
  langTabs?.addEventListener("sui-change", (event) => {
    setLanguage((event as CustomEvent).detail.value as Language);
    document.querySelector("#dashboard-menu-close")?.setAttribute("aria-label", language === "es" ? "Cerrar menú" : "Close menu");
  });
  themeTabs?.addEventListener("sui-change", (event) => setTheme((event as CustomEvent).detail.value as ThemeChoice));
});
media.addEventListener("change", () => { if (document.documentElement.dataset.themeChoice === "system") setTheme("system"); });
setLanguage(language);
setTheme((localStorage.getItem(themeKey) as ThemeChoice) || "system");

const header = document.querySelector<HTMLElement>("#dashboard-header");
const shell = document.querySelector<HTMLElement>(".docs-dashboard");
const bar = document.querySelector<HTMLElement>(".docs-dashboard .ui-app-shell__bar");
const sidebar = document.querySelector<HTMLElement>(".docs-dashboard .ui-app-shell__sidebar--sticky");
const modeSelect = document.querySelector<HTMLSelectElement>("#dashboard-header-mode");

const applyMode = () => {
  const floating = modeSelect?.value === "floating";
  header?.classList.toggle("ui-app-shell__header--floating", floating);
};
modeSelect?.addEventListener("change", applyMode);
applyMode();

const updateLayout = () => {
  if (!shell || !bar) return;
  const barHeight = bar.offsetHeight;
  shell.style.setProperty("--dashboard-bar-height", `${barHeight}px`);
  shell.style.setProperty("--sui-app-shell-top-offset", `${barHeight}px`);
  if (sidebar) {
    shell.style.setProperty("--dashboard-sidebar-height", `${Math.max(0, shell.clientHeight - barHeight)}px`);
  }
};
const layoutObserver = new ResizeObserver(updateLayout);
if (bar) layoutObserver.observe(bar);
if (shell) layoutObserver.observe(shell);
updateLayout();

const updateHeader = () => {
  const scrolled = (shell?.scrollTop ?? 0) > 16;
  header?.classList.toggle("ui-app-shell__header--scrolled", scrolled);
};
shell?.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const compactNavigation = window.matchMedia("(max-width: 1024px)");
const menu = document.querySelector<HTMLElement & { open: boolean; close: (reason?: "dismiss") => void }>("#dashboard-menu");
const menuTrigger = document.querySelector<HTMLButtonElement>("#dashboard-menu-trigger");
const menuClose = document.querySelector<HTMLButtonElement>("#dashboard-menu-close");
menuClose?.setAttribute("aria-label", language === "es" ? "Cerrar menú" : "Close menu");
const sidebarHome = sidebar?.parentElement;
const sidebarNext = sidebar?.nextSibling ?? null;
let shellOverflow = "";
let menuModal = false;

function syncNavigation() {
  if (!sidebar || !sidebarHome || !menu) return;
  if (compactNavigation.matches) {
    menu.append(sidebar);
  } else {
    if (menuModal) {
      if (menu.open) menu.close();
      return;
    }
    sidebarHome.insertBefore(sidebar, sidebarNext);
  }
}

menuTrigger?.addEventListener("click", () => {
  menuTrigger.focus();
  if (menu) menu.open = true;
});
menuClose?.addEventListener("click", () => menu?.close("dismiss"));
menu?.addEventListener("sui-open", () => {
  menuModal = true;
  menuTrigger?.setAttribute("aria-expanded", "true");
  if (shell) {
    shellOverflow = shell.style.overflow;
    shell.style.overflow = "hidden";
  }
});
menu?.addEventListener("sui-close", () => {
  menuModal = false;
  menuTrigger?.setAttribute("aria-expanded", "false");
  if (shell) shell.style.overflow = shellOverflow;
  syncNavigation();
  if (!compactNavigation.matches) sidebar?.querySelector<HTMLElement>("a")?.focus();
});
menu?.addEventListener("click", (event) => {
  if ((event.target as Element).closest("a")) menu.close();
});
compactNavigation.addEventListener("change", syncNavigation);
syncNavigation();
