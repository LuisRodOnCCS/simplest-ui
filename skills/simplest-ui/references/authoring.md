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
- A no-Node package may offer an explicitly selected package-assets mode that
  compiles public Simplest UI CSS exports into its own published stylesheet and
  includes the upstream license. This mode is exclusive with host mode, may not
  copy `dist`, and must not ship Simplest UI Web Component JavaScript.
- Use `laravel-vite` for an existing application and `laravel-package` for an
  existing Composer package. Read [integrations.md](integrations.md) before adding
  or changing either workflow.
