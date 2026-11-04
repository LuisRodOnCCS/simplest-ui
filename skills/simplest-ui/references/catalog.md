# Simplest UI catalog

Read `components.manifest.json` in the repository root first; it is the machine-readable source of truth.

## Registered Web Components

| Element | Use for |
| --- | --- |
| `sui-modal` | Modal dialog with focus trap and scroll lock. |
| `sui-dropdown` | Action menu. |
| `sui-tabs` | Tabbed content. |
| `sui-accordion` | Expandable sections. |
| `sui-popover` | Triggered contextual panel. |
| `sui-tooltip` | Short supplementary description. |
| `sui-toast` / `sui-toast-container` | Transient live feedback. |

## CSS components

Use `ui-card` for cards, `ui-table` for tables, `ui-alert` for alerts, `ui-button` for buttons and `ui-*` form controls for native form elements. They do not require JavaScript registration.

`ui-drawer` is currently a CSS pattern. Do not use `<sui-drawer>` until it is officially implemented.
