<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>@yield('title', 'Mi App')</title>
  <link rel="stylesheet" href="{{ asset('vendor/simplest-ui/tokens.css') }}" />
  <link rel="stylesheet" href="{{ asset('vendor/simplest-ui/styles.css') }}" />
  <script type="module" src="{{ asset('vendor/simplest-ui/components.js') }}"></script>
</head>
<body>
  <div class="ui-app-shell">
    <aside class="ui-app-shell__sidebar">
      <div class="ui-app-shell__brand">Mi App</div>
      <nav class="ui-nav" aria-label="Navegación principal">
        <a href="#" class="ui-nav__item ui-nav__item--active">Dashboard</a>
        <a href="#" class="ui-nav__item">Configuración</a>
      </nav>
    </aside>
    <div class="ui-app-shell__content">
      <header class="ui-app-shell__header">
        <span class="ui-app-shell__title">@yield('title', 'Panel principal')</span>
        <button class="ui-button ui-button--primary ui-button--sm" type="button">Nuevo</button>
      </header>
      <main class="ui-app-shell__main">
        @yield('content')
      </main>
    </div>
  </div>
</body>
</html>
