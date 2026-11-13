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
