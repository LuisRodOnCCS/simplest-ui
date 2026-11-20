# Contributing to Simplest UI

## Principles

1. Reuse an existing component, class, layout, or token before adding a new abstraction.
2. Keep prefixes consistent: `sui-` for Custom Elements and tokens; `ui-` for CSS classes.
3. Prefer semantic HTML before creating a custom element.
4. Create a Web Component only when it provides reusable state or accessible interaction.
5. Keep component code as the source of truth. Documentation and examples must consume it instead of recreating behavior.
6. `ui-topbar` and `ui-app-shell__header` are independent and composable; consult their manifest contracts when choosing or combining them.

## Change checklist

- [ ] Check `components.manifest.json` and the visual documentation before creating something new.
- [ ] Use `--sui-*` tokens rather than arbitrary visual values when an appropriate token exists.
- [ ] Include visible focus, keyboard support, semantic/ARIA behavior, and reduced-motion behavior where relevant.
- [ ] For Web Components, document attributes, slots, events, methods, and focus behavior.
- [ ] Add behavior tests and React JSX declarations when applicable.
- [ ] Update the manifest, visual documentation, README, skill references, and changelog.
- [ ] Give every documented `cssComponents`, `layouts` and `webComponents` entry a `contract` and a `default` example. Follow [`docs/manifest-schema.md`](./docs/manifest-schema.md).
- [ ] When adding a CSS component: create `src/components/<name>.css`, add its export in `package.json`, import it in `src/styles/components.css`, add `<name>` to `cssComponentNames` in `vite.config.ts`, register it in `components.manifest.json` (`classes`, `contract`, `examples`), add a case in `docs/assets/docs.ts` (`componentBody` + `cssReferences` + translations), run `npm run catalog:generate`, then `catalog:check`, `test`, `typecheck`, `docs:build`, `build` and `pack --dry-run`.
- [ ] When adding a Web Component: create `src/components/<name>.ts` and register `sui-<name>`; add `import`/`export` in `src/components/index.ts`; add the entry in `vite.config.ts`; add exports in `package.json` (`.js` + `.d.ts`, plus `.css` if it uses light-DOM classes); register it in `components.manifest.json` (`webComponents` with `tag`, `import`, `attributes`, `properties`, `slots`, `events`, `keyboard`, `contract`, `examples`); add a case in `docs/assets/docs.ts` (`showcase` + `api` rows + translations); run `npm run catalog:generate`, then `catalog:check`, `test`, `typecheck`, `docs:build`, `build` and `pack --dry-run`.
- [ ] Do not edit `docs/catalog.json`, `docs/contracts.json` or `skills/simplest-ui/references/catalog.md` by hand.
- [ ] Run `npm run catalog:generate` after changing `components.manifest.json`.
- [ ] Verify the new component appears in the documentation navigation and search (run `npm run docs:build` and check at 1280px and 320px); search is id-based, so an id like `tag` must match even when the title is localized.
- [ ] Run `npm run typecheck`, `npm test`, `npm run build`, `npm run docs:build`, and `npm pack --dry-run`.

## Visual documentation

- Put runnable or copyable snippets in `showcase(preview, snippet)` (or
  `implementation()`), never as a standalone `code()` block inside
  `.docs-reference` or `.docs-grid`.
- A showcase keeps the light preview above and its dark code block immediately
  below, with one shared border and radius. Use stacked showcases for multiple
  steps rather than side-by-side reference cards containing code.
- Review the rendered documentation at desktop and 320px, then update visual
  baselines only for intentional changes.

## Pull requests

Work from `dev` in a `feat/*`, `fix/*`, or `docs/*` branch. Changes land in `dev` before a verified release is promoted to `main`.

## Releases

Follow the [versioning and release policy](./VERSIONING.md). Keep release notes under `[Unreleased]` until the release is intentionally cut.
