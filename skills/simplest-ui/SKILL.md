---
name: simplest-ui
description: Build, extend, review, or document interfaces that use the Simplest UI design system. Use this skill whenever a task occurs in a project with @luisrodonccs/simplest-ui installed, imports ui-* classes or sui-* elements, or asks to add UI to Simplest UI. Check the existing catalog before creating markup or components, reuse the system first, and preserve its accessibility and token conventions.
---

# Simplest UI

Build with Simplest UI as an existing product system, not as a bag of styles. The system is framework-agnostic: CSS classes provide presentational primitives, while only selected interactive patterns are registered Web Components.

## Start with the catalog

1. Locate `components.manifest.json` in the project root. If unavailable, read the package README and inspect the installed exports.
2. Identify whether the requested UI is already available as:
   - a CSS component (`ui-*` class),
   - a layout primitive (`ui-stack`, `ui-grid`, `ui-app-shell`, etc.), or
   - a registered Custom Element (`sui-*`).
3. Reuse the closest existing primitive. Compose CSS components before proposing a new component.
4. Never invent an unregistered `<sui-*>` tag. In particular, cards, tables and alerts are CSS components, not Custom Elements.

Read [references/catalog.md](references/catalog.md) for the current public surface and [references/authoring.md](references/authoring.md) before extending it.

## Use the correct entrypoint

Use the full bundle when Simplest UI owns the page foundation:

```ts
import "@luisrodonccs/simplest-ui/tokens.css";
import "@luisrodonccs/simplest-ui/styles.css";
```

When Bootstrap, Tailwind, or another system owns global styles, omit the Simplest reset:

```ts
import "@luisrodonccs/simplest-ui/tokens.css";
import "@luisrodonccs/simplest-ui/components.css";
```

Register all Web Components with `components.js`, or import only the needed behavior from `components/<name>`.

## Build markup

- Use `--sui-*` tokens and `ui-*` classes. Do not introduce parallel color, spacing, shadow or radius values when a token exists.
- Prefer semantic HTML: `<button>`, `<a>`, `<article>`, `<table>`, `<label>`, and form controls retain their native meaning.
- Use an interactive `sui-*` element only when it is listed in the catalog.
- Keep the component implementation as the behavior source of truth; examples and application code must consume it rather than recreating its focus, Escape, or ARIA behavior.
- Add a clear accessible name to controls and use appropriate live-region roles for feedback.

## Extend only when necessary

Create a new CSS component if composition cannot communicate a reusable visual pattern. Create a Web Component only if the pattern has reusable state or complex accessible interaction.

When adding either kind:

1. Reuse tokens and prefixes (`ui-`, `sui-`, `--sui-`).
2. Implement keyboard support, focus behavior, semantic roles and `prefers-reduced-motion` where interaction requires them.
3. Add unit tests for behavior; do not rely solely on a demo.
4. Update `components.manifest.json`, the visual catalog, README, TypeScript JSX declarations when relevant, and changelog.
5. Run `npm run typecheck`, `npm test`, `npm run build`, and `npm pack --dry-run`.

## Output expectations

When responding to an implementation request, state which existing system primitive you selected and why. If no suitable primitive exists, briefly justify the extension before adding it. Mention any import requirement for new behavior.
