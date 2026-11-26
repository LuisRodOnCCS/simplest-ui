# Migrating from 0.3.x to 0.4.0

Simplest UI 0.4.0 changes the modality and close lifecycle of `sui-modal` and
`sui-drawer`. Review integrations that manage focus, stacking, navigation or
scrolling before upgrading.

## Modal and drawer

- Both elements use native modal dialogs in the browser top layer. Transformed or
  clipped ancestors no longer constrain them; content outside the active dialog
  is inert. Move any controls that must remain interactive inside the dialog.
- Dialog stacking follows opening order, not `--sui-z-modal` or
  `--sui-z-drawer-backdrop`. Review code that relies on those tokens to place
  content above an active modal.
- Setting `open = false` or calling `close()` requests closure. The dialog,
  focus trap and scroll lock remain active until the exit animation finishes.
  `sui-close` fires after exit; Lit's `updateComplete` does not wait for it.
  Wait for `sui-close` before removing the element, moving navigation out of a
  drawer or interacting with the background. Reopening during exit cancels the
  pending close event.
- Entry and exit respect `prefers-reduced-motion`. Test both motion settings
  and nested dialogs, including Escape and focus restoration.
- The drawer locks body scrolling; applications remain responsible for locking
  any independent scrolling shell.

## Additive components

`ui-fieldset` and `ui-fieldset__legend` provide optional semantic form grouping.
`sui-avatar-group` is an opt-in interactive component; the existing
`.ui-avatar-group` CSS remains available.

The accompanying `create-simplest-ui` 0.1.4 generator targets core `^0.4.0`
for new Vanilla projects. Laravel overlays leave dependency installation to the
host. Update existing applications' core dependency separately.
