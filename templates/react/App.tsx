import "@luisrodonccs/simplest-ui/tokens.css";
import "@luisrodonccs/simplest-ui/styles.css";
import "@luisrodonccs/simplest-ui/components.js";

export default function App() {
  return (
    <div className="ui-app-shell">
      <aside className="ui-app-shell__sidebar">
        <div className="ui-app-shell__brand">Mi App</div>
        <nav className="ui-nav" aria-label="Navegación principal">
          <a href="#" className="ui-nav__item ui-nav__item--active">Dashboard</a>
          <a href="#" className="ui-nav__item">Configuración</a>
        </nav>
      </aside>
      <div className="ui-app-shell__content">
        <header className="ui-app-shell__header">
          <span className="ui-app-shell__title">Panel principal</span>
          <button className="ui-button ui-button--primary ui-button--sm" type="button">Nuevo</button>
        </header>
        <main className="ui-app-shell__main">
          <div className="ui-card">
            <div className="ui-card__title">Bienvenido</div>
            <div className="ui-card__body">Contenido principal de tu aplicación.</div>
          </div>
        </main>
      </div>
    </div>
  );
}
