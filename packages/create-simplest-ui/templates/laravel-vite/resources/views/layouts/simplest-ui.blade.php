<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', config('app.name'))</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
  </head>
  <body>
    <a class="ui-skip-link" href="#main-content">Skip to content</a>
    <div class="ui-app-shell">
      <aside class="ui-app-shell__sidebar">
        <div class="ui-app-shell__brand">{{ config('app.name') }}</div>
        <nav class="ui-nav" aria-label="Primary navigation">
          <a class="ui-nav__item ui-nav__item--active" href="#" aria-current="page">Dashboard</a>
        </nav>
      </aside>
      <div class="ui-app-shell__content">
        <header class="ui-app-shell__header">
          <span class="ui-app-shell__title">@yield('title', 'Dashboard')</span>
        </header>
        <main class="ui-app-shell__main" id="main-content" tabindex="-1">
          @yield('content')
        </main>
      </div>
    </div>
  </body>
</html>
