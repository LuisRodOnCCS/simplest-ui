import "@luisrodonccs/simplest-ui/tokens.css";
import "@luisrodonccs/simplest-ui/styles.css";
import "@luisrodonccs/simplest-ui/components.js";

export default function App() {
  return (
    <div className="ui-app-shell">
      <aside className="ui-app-shell__sidebar">
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Mi App</h2>
        <nav className="ui-nav">
          <a href="#" className="ui-nav__item ui-nav__item--active">Dashboard</a>
          <a href="#" className="ui-nav__item">Configuración</a>
        </nav>
      </aside>
      <div className="ui-app-shell__content">
        <header className="ui-app-shell__header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Panel principal</span>
          <button className="ui-button ui-button--primary ui-button--sm">Nuevo</button>
        </header>
        <main className="ui-app-shell__main">
          <div className="ui-container">
            <div className="ui-card">
              <div className="ui-card__title">Bienvenido</div>
              <div className="ui-card__body">Contenido principal de tu aplicación.</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}