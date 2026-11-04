import "@luisrodonccs/simplest-ui/tokens.css";
import "@luisrodonccs/simplest-ui/styles.css";
import "@luisrodonccs/simplest-ui/components.js";

export default function App() {
  return (
    <>
      <a className="ui-skip-link" href="#main-content">Saltar al contenido</a>

      <div className="ui-app-shell">
        <aside className="ui-app-shell__sidebar">
          <div className="ui-app-shell__brand">Mi App</div>

          <div className="ui-nav__group-title">Espacio de trabajo</div>
          <nav className="ui-nav" aria-label="Navegación principal">
            <a href="#" className="ui-nav__item ui-nav__item--active" aria-current="page">
              Dashboard
            </a>
            <a href="#" className="ui-nav__item">Proyectos</a>
            <a href="#" className="ui-nav__item">Equipo</a>
          </nav>

          <div className="ui-nav__group-title">Cuenta</div>
          <nav className="ui-nav" aria-label="Cuenta">
            <a href="#" className="ui-nav__item">Configuración</a>
          </nav>
        </aside>

        <div className="ui-app-shell__content">
          <header className="ui-app-shell__header">
            <span className="ui-app-shell__title">Panel principal</span>
            <div className="ui-cluster">
              <sui-dropdown>
                <span slot="trigger">Acciones</span>
                <button type="button" data-value="export">Exportar</button>
                <button type="button" data-value="archive">Archivar</button>
              </sui-dropdown>
              <button className="ui-button ui-button--primary ui-button--sm" type="button">
                Nuevo proyecto
              </button>
            </div>
          </header>

          <main className="ui-app-shell__main" id="main-content" tabIndex={-1}>
            <div className="ui-grid ui-grid--auto">
              <div className="ui-stat">
                <div className="ui-stat__label">Proyectos</div>
                <div className="ui-stat__value">12</div>
                <div className="ui-stat__hint">+2 este mes</div>
              </div>
              <div className="ui-stat">
                <div className="ui-stat__label">Tareas</div>
                <div className="ui-stat__value">48</div>
                <div className="ui-stat__hint">8 pendientes</div>
              </div>
              <div className="ui-stat">
                <div className="ui-stat__label">Equipo</div>
                <div className="ui-stat__value">6</div>
                <div className="ui-stat__hint">Todos activos</div>
              </div>
            </div>

            <div className="ui-card">
              <div className="ui-card__header">
                <div className="ui-card__title">Resumen del proyecto</div>
              </div>
              <sui-tabs>
                <div data-tab="overview" label="Resumen">
                  Vista general del proyecto y sus métricas.
                </div>
                <div data-tab="activity" label="Actividad">
                  Últimos cambios realizados por el equipo.
                </div>
              </sui-tabs>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
