# Contributing to Simplest UI

## Principles

1. Reuse an existing component, class, layout, or token before adding a new abstraction.
2. Keep prefixes consistent: `sui-` for Custom Elements and tokens; `ui-` for CSS classes.
3. Prefer semantic HTML before creating a custom element.
4. Create a Web Component only when it provides reusable state or accessible interaction.
5. Keep component code as the source of truth. Documentation and examples must consume it instead of recreating behavior.

## Change checklist

- [ ] Check `components.manifest.json` and the visual documentation before creating something new.
- [ ] Use `--sui-*` tokens rather than arbitrary visual values when an appropriate token exists.
- [ ] Include visible focus, keyboard support, semantic/ARIA behavior, and reduced-motion behavior where relevant.
- [ ] For Web Components, document attributes, slots, events, methods, and focus behavior.
- [ ] Add behavior tests and React JSX declarations when applicable.
- [ ] Update the manifest, visual documentation, README, skill references, and changelog.
- [ ] Run `npm run typecheck`, `npm test`, `npm run build`, `npm run docs:build`, and `npm pack --dry-run`.

## Pull requests

Work from `dev` in a `feat/*`, `fix/*`, or `docs/*` branch. Changes land in `dev` before a verified release is promoted to `main`.

## Releases

Follow the [versioning and release policy](./VERSIONING.md). Keep release notes under `[Unreleased]` until the release is intentionally cut.
