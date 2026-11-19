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

If a schema field changes, bump `schemaVersion`, update
`docs/manifest-schema.md` and add a changelog entry.
