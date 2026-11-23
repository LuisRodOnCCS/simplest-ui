# Create Simplest UI

Create a Vanilla + Vite starter or add Simplest UI integration files to a Laravel
application or package.

Version `0.1.3` generates Vanilla projects with `@luisrodonccs/simplest-ui`
`^0.3.1`. The generator and core have independent version numbers. Laravel
overlays leave dependency installation to the host application or package.

```bash
npm create @luisrodonccs/simplest-ui@latest my-app -- --template vanilla-vite
npx @luisrodonccs/create-simplest-ui@latest . --template laravel-vite
```

Available templates:

- `vanilla-vite`: a standalone Vite project.
- `laravel-vite`: an overlay for an existing Laravel application.
- `laravel-package`: workbench assets and Blade examples for an existing Composer package.

Laravel packages render compatible markup. The host application imports Simplest UI
assets through Vite once.
