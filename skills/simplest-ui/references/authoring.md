# Authoring rules

## Accessibility

- Use native controls and labels whenever possible.
- Pair controls and descriptions with `for`, `aria-describedby`, or component-provided relationships.
- Do not duplicate existing keyboard or focus logic outside a registered component.
- Custom events use the `sui-*` namespace, bubble, and are composed.

## Visual language

- Use semantic `--sui-*` tokens, not literal visual values.
- Preserve the soft surface, rounded border, and restrained glass effect of the system.
- Make focus visible and preserve reduced-motion behavior.
- In Simplest UI documentation, keep every copyable snippet in a `showcase`
  beneath its preview. Do not place bare dark code blocks inside reference cards
  or side-by-side grids.

## Adding components

### CSS component

1. Create `src/components/<name>.css` using `--sui-*` tokens.
2. Add the export in `package.json`, import it in `src/styles/components.css`,
   and add `<name>` to `cssComponentNames` in `vite.config.ts`.
3. Register the entry in `components.manifest.json` (`cssComponents`) with
   `classes`, `contract` and at least one `default` example.
4. Add a case in `docs/assets/docs.ts` (`componentBody` + `cssReferences` +
   translations).
5. Run `npm run catalog:generate`, then `catalog:check`, `test`, `typecheck`,
   `docs:build`, `build` and `pack --dry-run`.

### Web Component

Use this only when the component provides reusable state or accessible
interaction.

1. Create `src/components/<name>.ts`, register `sui-<name>`, and export the class
   from `src/components/index.ts`.
2. Add the entry to `vite.config.ts` and the `.js`/`.d.ts` exports to
   `package.json`.
3. If it uses light-DOM classes (like `sui-tooltip`, `sui-popover`, `sui-tag`),
   also create its `.css`, import it in `src/styles/components.css`, add it to
   `cssComponentNames`, and add a `.css` export.
4. Register the entry in `components.manifest.json` (`webComponents`) with `tag`,
   `import`, `attributes`, `properties`, `slots`, `events`, `keyboard`,
   `contract` and at least one `default` example. Markup uses `sui-*` tags.
5. Add a case in `docs/assets/docs.ts` (`showcase` + `api` rows + translations).
6. Run `npm run catalog:generate`, then `catalog:check`, `test`, `typecheck`,
   `docs:build`, `build` and `pack --dry-run`.

## Integration

When Bootstrap or Tailwind supplies a reset, import `tokens.css` and
`components.css`, not the complete `styles.css` bundle. Also import `base.css`
when the markup uses its layout primitives, including `ui-app-shell` and
`ui-skip-link`. Keep Simplest class names intact rather than translating them
into another utility system.

### Vanilla and Laravel

- For the complete system, import `tokens.css` before `styles.css`. For a smaller
  footprint, import `tokens.css` before the selected component styles.
- A Laravel application owns the Simplest UI Vite entrypoints and imports CSS and
  Web Component JavaScript once.
- A Composer package can render `ui-*` classes and registered `sui-*` elements in
  Blade views. Its normal production contract is host-owned Vite assets.
- Blade wrappers are optional: use a locally registered wrapper or, when the
  Laravel adapter is installed, its `x-sui::*` components. Neither is provided
  by the npm package alone.
- A no-Node package may offer an explicitly selected package-assets mode that
  compiles the required public Simplest UI CSS and JavaScript exports into its
  own published artifacts and includes the upstream license. It is exclusive
  with host loading and must not copy `dist`. A CSS-only build is insufficient
  when Web Components need JavaScript.
- Use `laravel-vite` for an existing application and `laravel-package` for an
  existing Composer package. Read [integrations.md](integrations.md) before adding
  or changing either workflow.
