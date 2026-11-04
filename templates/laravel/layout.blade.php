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
      <h2 style="font-size:14px;font-weight:600;margin-bottom:12px;">Mi App</h2>
      <nav class="ui-nav">
        <a href="#" class="ui-nav__item ui-nav__item--active">Dashboard</a>
        <a href="#" class="ui-nav__item">Configuración</a>
      </nav>
    </aside>
    <div class="ui-app-shell__content">
      <header class="ui-app-shell__header" style="display:flex;align-items:center;justify-content:space-between;">
        <span style="font-size:14px;font-weight:600;">@yield('title', 'Panel principal')</span>
        <button class="ui-button ui-button--primary ui-button--sm">Nuevo</button>
      </header>
      <main class="ui-app-shell__main">
        <div class="ui-container">
          @yield('content')
        </div>
      </main>
    </div>
  </div>
</body>
</html>