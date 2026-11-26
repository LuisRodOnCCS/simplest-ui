# Simplest UI repository guide for agents

This repository defines the Simplest UI design system, its documentation and its
agent skill. Keep the public surface small, semantic and evidence-based.

## Read first

- `CONTRIBUTING.md` for principles and the change checklist.
- `docs/manifest-schema.md` for the manifest contract.
- `components.manifest.json` as the source of truth for public components,
  classes, tokens, examples and requirements.

## Manifest rules

- Every documented entry in `cssComponents`, `layouts` and `webComponents` needs a
  `contract` and at least one example with `id: "default"`.
- Global requirements belong in `contract`; example-specific requirements belong
  in `examples[].required` or `examples[].recommended`. Do not duplicate them.
- Add another example only when it changes markup, state, accessibility or
  behavior. Do not add cosmetic variants.
- Example ids are lowercase kebab-case and unique within their entry.
- Non-default examples render as visual variants, so their markup must be
  complete. Use `...` only in the `default` example, which has a dedicated
  preview in the documentation.
- Every `ui-*` class in example markup must already be declared in `classes`.
- Do not put bilingual copy, previews or demo HTML in the manifest.
- Do not invent `ui-*` classes, `sui-*` elements or tokens.

## Component selection

- `ui-topbar` is a standalone app-level bar (brand + controls, glass, sticky).
  `ui-app-shell__header` is the header region inside an app shell (title +
  actions). They are independent and composable; never assume one replaces the
  other. `--sticky` keeps it visible on scroll with its original styles;
  `--scrolled` is a state (no visual change alone); `--floating` combined with
  `--scrolled` adopts a topbar-like look (radius + shadow). Toggle `--scrolled`
  with consumer JS.
- `ui-app-shell__sidebar` supports optional `--sticky`: the sidebar stays
  visible while the main content scrolls; a long menu scrolls internally.
  Disabled automatically on mobile.
## Adding a CSS component

1. Create `src/components/<name>.css` using `--sui-*` tokens; no hardcoded colors,
   animations or shadows unless justified.
2. Add `"./components/<name>.css": "./dist/components/<name>.css"` to
   `package.json` exports.
3. Add `@import "../components/<name>.css";` to `src/styles/components.css` so the
   styles ship in the `components.css` bundle.
4. Add `<name>` to `cssComponentNames` in `vite.config.ts` so the build emits
   `dist/components/<name>.css`.
5. Register the entry in `components.manifest.json` (`cssComponents`) with
   `classes`, `contract` and at least one example with `id: "default"`.
6. Add a case in `docs/assets/docs.ts` (`componentBody`) plus a `cssReferences`
   entry and translations.
7. Run `npm run catalog:generate`, then `catalog:check`, `test`, `typecheck`,
   `docs:build`, `build` and `pack --dry-run`.

## Adding a Web Component

Use this only when the component provides reusable state or accessible
interaction (principle 4 in `CONTRIBUTING.md`).

1. Create `src/components/<name>.ts` (light-DOM or encapsulated) and register
   `sui-<name>` via `customElements.define`, exporting the class.
2. Add `import "./<name>";` and `export { Sui<Name> } from "./<name>";` to
   `src/components/index.ts`.
3. Add `<name>: resolve(import.meta.dirname, "src/components/<name>.ts")` to
   the `entry` object in `vite.config.ts`.
4. Add `"./components/<name>": { "types": "./dist/components/<name>.d.ts",
   "import": "./dist/<name>.js" }` to `package.json` exports.
5. If the component uses light-DOM classes (like `sui-tooltip`, `sui-popover`,
   `sui-tag`), also create `src/components/<name>.css`, import it in
   `src/styles/components.css`, add it to `cssComponentNames`, and add a
   `"./components/<name>.css"` export.
6. Register the entry in `components.manifest.json` (`webComponents`) with
   `tag`, `import`, `attributes`, `properties`, `slots`, `events`, `keyboard`,
   `contract` and at least one example with `id: "default"`. Its markup uses
   `sui-*` tags; `ui-*` classes are not validated for Web Components.
7. Add a case in `docs/assets/docs.ts` (`componentBody`) using `showcase(...)` +
   `api([...])` rows, plus translations.
8. Run `npm run catalog:generate`, then `catalog:check`, `test`, `typecheck`,
   `docs:build`, `build` and `pack --dry-run`.

## Generated files

Do not edit these by hand:

- `docs/catalog.json`
- `docs/contracts.json`
- `skills/simplest-ui/references/catalog.md`

Regenerate them with `npm run catalog:generate`.

## Before finishing

- `npm run catalog:check` (validates the manifest and generated artifacts)
- `npm run typecheck`
- `npm test`
- `npm run docs:build`
- `npm run build`
- `npm pack --dry-run`

## Releases

Follow `RELEASING.md` for the full review before tagging or publishing. The
release-alignment tests in `tests/release.test.ts` fail `npm test` when the
changelog, README, roadmap, migration guide or generator core range drift from
`package.json`. The `branch-sync` CI job fails a push to `dev` that does not
contain `main`.

If a schema field changes, bump `schemaVersion`, update
`docs/manifest-schema.md` and add a changelog entry.
