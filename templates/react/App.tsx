import "@luisrodonccs/simplest-ui/tokens.css";
import "@luisrodonccs/simplest-ui/styles.css";
import "@luisrodonccs/simplest-ui/components.js";

export default function App() {
  return (
    <>
      <a className="ui-skip-link" href="#main-content">Skip to content</a>

      <div className="ui-app-shell">
        <aside className="ui-app-shell__sidebar">
          <div className="ui-app-shell__brand">My App</div>

          <div className="ui-nav__group-title">Workspace</div>
          <nav className="ui-nav" aria-label="Primary navigation">
            <a href="#" className="ui-nav__item ui-nav__item--active" aria-current="page">
              Dashboard
            </a>
            <a href="#" className="ui-nav__item">Proyectos</a>
            <a href="#" className="ui-nav__item">Equipo</a>
          </nav>

          <div className="ui-nav__group-title">Account</div>
          <nav className="ui-nav" aria-label="Account">
            <a href="#" className="ui-nav__item">Settings</a>
          </nav>
        </aside>

        <div className="ui-app-shell__content">
          <header className="ui-app-shell__header">
            <span className="ui-app-shell__title">Dashboard</span>
            <div className="ui-cluster">
              <sui-dropdown>
                <span slot="trigger">Actions</span>
                <button type="button" data-value="export">Export</button>
                <button type="button" data-value="archive">Archive</button>
              </sui-dropdown>
              <button className="ui-button ui-button--primary ui-button--sm" type="button">
                New project
              </button>
            </div>
          </header>

          <main className="ui-app-shell__main" id="main-content" tabIndex={-1}>
            <div className="ui-grid ui-grid--auto">
              <div className="ui-stat">
                <div className="ui-stat__label">Projects</div>
                <div className="ui-stat__value">12</div>
                <div className="ui-stat__hint">+2 this month</div>
              </div>
              <div className="ui-stat">
                <div className="ui-stat__label">Tasks</div>
                <div className="ui-stat__value">48</div>
                <div className="ui-stat__hint">8 pending</div>
              </div>
              <div className="ui-stat">
                <div className="ui-stat__label">Team</div>
                <div className="ui-stat__value">6</div>
                <div className="ui-stat__hint">All active</div>
              </div>
            </div>

            <div className="ui-card">
              <div className="ui-card__header">
                <div className="ui-card__title">Project summary</div>
              </div>
              <sui-tabs>
                <div data-tab="overview" label="Overview">
                  Project overview and metrics.
                </div>
                <div data-tab="activity" label="Activity">
                  Recent team activity.
                </div>
              </sui-tabs>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
