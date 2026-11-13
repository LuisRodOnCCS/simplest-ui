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

When Bootstrap or Tailwind supplies a reset, import `tokens.css` and `components.css`, not the complete `styles.css` bundle. Keep Simplest class names intact rather than translating them into another utility system.

### Vanilla and Laravel

- For the complete system, import `tokens.css` before `styles.css`. For a smaller
  footprint, import `tokens.css` before the selected component styles.
- A Laravel application owns the Simplest UI Vite entrypoints and imports CSS and
  Web Component JavaScript once.
- A Composer package can render `ui-*` classes and registered `sui-*` elements in
  Blade views. It may use workbench assets during development, but it must not
  publish copied `dist` files or make the host application load a second copy.
- Use `laravel-vite` for an existing application and `laravel-package` for an
  existing Composer package. Read [integrations.md](integrations.md) before adding
  or changing either workflow.
