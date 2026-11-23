# Upstream decisions — 0.3.0 integration audit

This is the upstream response to [`HANDOFF.md`](HANDOFF.md). It records one
disposition per finding, the intended behavior, the target release and the
regression that will lock the decision in. It is a decision record, not a
changelog: the code changes and their release notes live in `CHANGELOG.md`.

Date: 2026-11-23. Reviewed package: `@luisrodonccs/simplest-ui@0.3.0`.
Reviewed source: current `dev` checkout. No finding is dismissed as "works as
implemented" unless the contract below states it explicitly.

## How to read this document

Every finding gets exactly one disposition:

| Disposition | Meaning |
| --- | --- |
| **Confirmed defect** | Current behavior is wrong. The record states the intended behavior. |
| **Metadata correction** | Runtime is acceptable; manifest, declarations or examples are wrong or incomplete. |
| **Intended behavior** | Current behavior is the contract. It will be documented, not changed. |
| **Unsupported scenario** | The scenario will not be supported. It will be stated explicitly and tested as unsupported. |

Target releases:

- **0.3.1** — patch. Runtime, metadata and documentation corrections that make
  the current public API honest. No new public API is introduced. This is the
  release the Laravel adapter should pin.
- **0.4.0** — minor. Decisions that add or change public behavior and should
  land before the Livewire, React and Vue adapters.

## Summary

Findings 001–019 come from the audit. Findings 020–024 were added during the
upstream review and are marked as such in their records.

| ID | Disposition | Decision | Release |
| --- | --- | --- | --- |
| 001 | Metadata correction | Add `hide-close-button` / `hideCloseButton` to the drawer manifest. | 0.3.1 |
| 002 | Metadata correction | Document `sui-toggle` detail `{ open: boolean }` and guarantee its order. | 0.3.1 |
| 003 | Confirmed defect | `message` is supported; `show` accepts title or message; never render `undefined`; implement the declared properties. | 0.3.1 |
| 004 | Confirmed defect | Changing `content` after connection updates the generated tooltip text. | 0.3.1 |
| 005 | Confirmed defect | Reconnecting an open dialog re-acquires its overlay ownership. | 0.3.1 |
| 006 | Confirmed defect | Implement modal `hide-close-button` with drawer parity. | 0.3.1 |
| 007 | Confirmed defect | `label` changes refresh the popover panel's accessible name. | 0.3.1 |
| 008 | Metadata correction | `content` becomes a writable, attribute-backed tooltip property. | 0.3.1 |
| 009 | Metadata correction | All three getter-only config properties become writable and attribute-backed. | 0.3.1 |
| 010 | Confirmed defect | Content and trigger replacement/removal are supported; references are reconciled. | 0.3.1 |
| 011 | Confirmed defect | Removing required popover content closes it and clears `aria-controls`. | 0.3.1 |
| 012 | Confirmed defect | One scroll-lock owner for modal and drawer. | 0.3.1 |
| 013 | Confirmed defect + intended behavior | Observe `disabled` now; disable-selection policy in 0.4.0. | 0.3.1 / 0.4.0 |
| 014 | Confirmed defect | Escape closes only the topmost overlay. | 0.3.1 |
| 015 | Unsupported scenario | Moving `slot` between existing nodes is not supported; node replacement is. | 0.3.1 |
| 016 | Confirmed defect | An explicit `slot="trigger"` wins over fallback buttons. | 0.3.1 |
| 017 | Confirmed defect | The component owns only its own classes and generated content. | 0.3.1 |
| 018 | Confirmed defect | Disabled and `aria-disabled` triggers do not show the tooltip. | 0.3.1 |
| 019 | Confirmed defect | Compose `aria-describedby`; never discard caller tokens. | 0.3.1 |
| 020 | Confirmed defect | Accordion `sui-change` always emits usable item IDs. | 0.3.1 |
| 021 | Confirmed defect | One live region per toast stack. | 0.3.1 |
| 022 | Metadata correction | Shared ID generation that can be seeded by the consumer. | 0.3.1 / 0.4.0 |
| 023 | Intended behavior | Popover is a non-modal dialog; documented, not trapped. | 0.3.1 |
| 024 | Confirmed defect | Adopt `heading` for toast and deprecate `title`. | 0.4.0 |

## Decisions needed before fixes

These are the seven questions in `HANDOFF.md`, answered.

1. **Toast API (003).** `message` is a supported input. `SuiToast.show` accepts
   `{ title, message? }` or `{ message }`, and renders no title node when the
   title is absent. A discriminated union in the declarations replaces the
   current required `title`. The literal string `undefined` is never rendered.
   `message`, `variant` and `duration` become writable, reflected properties.
   The `title` heading attribute conflicts with the global `HTMLElement.title`
   (native tooltip, possible accessible description); 0.4.0 adds `heading` and
   deprecates `title` (024).

2. **Property model (008, 009).** Every manifest property that configures a
   component is writable and attribute-backed. Setting the property updates the
   component; for plain-DOM components it also writes the corresponding
   attribute, and Lit components observe it. `open` and `variant` reflect to the
   host attribute because styling depends on it. None of the current properties
   is genuinely read-only; `popover.label`, `accordion.multiple` and
   `toast.duration` are configuration inputs, and getter-only access is an
   implementation accident. Read-only metadata will exist in schema v2 for
   future derived values, but no current property uses it. Typed adapters may
   assign any manifest property and expect the attribute and rendered output to
   follow.

3. **Dynamic slots (010, 011, 015, 016).** Supported: initial markup, replacing
   a trigger or content node with a new node, removing a node, and reinserting
   the same node. Unsupported: moving an existing `slot` attribute to a
   different existing node. The supported operations reconcile ARIA references
   and listeners; the unsupported one has no guarantee. See the operation
   matrix below.

4. **Overlapping dialogs (012, 014).** Supported to two levels, which covers a
   modal inside a drawer. Scroll lock has one owner. Escape closes only the
   most recently opened overlay. Beyond two levels is best effort and is not
   guaranteed. Mixed types behave exactly like same-type nesting.

5. **Disabled tooltips (018).** A disabled control does not expose a tooltip.
   The tooltip appears on trigger hover or focus, never on wrapper hover, and
   never for `disabled` or `aria-disabled="true"` triggers. Disabled controls
   need visible help or a wrapper that carries `aria-describedby`. The manifest
   recommendation is correct; the CSS and the association are what change.

6. **Host classes on toast (017).** The component owns only `ui-toast` and
   `ui-toast--*`. Caller classes survive connection, variant changes and
   reconnect. The component also does not replace consumer-supplied children;
   only its generated subtree is managed.

7. **Disabled tabs (013).** 0.3.1 fixes observation: toggling `disabled`
   updates the rendered tab without needing another attribute change. 0.4.0
   defines selection: if the active tab becomes disabled, selection moves to
   the next enabled tab (wrapping), otherwise the previous one, otherwise none,
   and `sui-change` is emitted. With every tab disabled, `value` is empty, no
   panel is visible, every button is disabled and `aria-disabled="true"`, and
   the first button keeps `tabindex="0"` so the tablist stays discoverable.
   Re-enabling a tab does not restore selection automatically.

## Confirmed contract for adapters

These guarantees apply to every Web Component after 0.3.1. Adapters may rely on
them; anything not listed here is not a guarantee.

### Reference ownership

- The component adds one IDREF token to `aria-describedby` or sets
  `aria-controls` for its own generated reference. `aria-describedby` is
  composed; `aria-controls` is component-owned because the controlled content
  is required.
- Caller-supplied `aria-describedby` tokens are preserved, in their original
  order, with the component token appended.
- When the component removes or replaces its target, it removes only its own
  token. It never clears the attribute wholesale.
- Caller-supplied `id` values are preserved and reused.
- Generated IDs are unique per document. They are not guaranteed to be stable
  across page loads; adapters must not persist or diff them.

### Dynamic slot operations

| Operation | Trigger | Content | ARIA result |
| --- | --- | --- | --- |
| Initial connection | Supported | Supported | References applied |
| Replace node with a new node | Supported | Supported | Old references removed, new references applied |
| Remove node | Supported | Supported | Component references removed; caller tokens kept |
| Reinsert the same node | Supported | Supported | Existing ID and reference restored |
| Reassign `slot` between existing nodes | Unsupported | Unsupported | No guarantee |
| Reconnect the host element | Supported | Supported | ARIA and overlay ownership restored |

### Overlays

- One scroll-lock owner. The original inline `overflow` value is captured once
  and restored exactly after the last overlay closes or disconnects.
- Escape closes only the topmost open overlay. The underlying overlay stays
  open and keeps its scroll lock.
- Open and close events describe real transitions only. Reconnecting an open
  overlay does not emit a second `sui-open`; disconnecting does not emit
  `sui-close`.
- Focus restoration happens on a real close, not on disconnect.

### Events

- `sui-toggle` on dropdown carries `{ open: boolean }` and is emitted before the
  matching `sui-open` or `sui-close` for the same transition.
- `sui-close` on modal and drawer carries
  `{ reason: 'dismiss' | 'escape' | 'backdrop' | 'programmatic' }`.
- `sui-select` on dropdown and `sui-change` on tabs carry `{ value: string }`.
- `sui-change` on accordion carries `{ open: string[] }` with the IDs of open
  items. Items receive a generated ID when they have none.

### Properties

- Every documented property is a writable accessor.
- Assigning a property updates the component. Plain-DOM components also write
  the documented attribute; Lit components observe it.
- `open` and `variant` reflect to the host attribute because styling depends on
  the attribute selector.
- A property is never a silent no-op. Undocumented properties are not part of
  the contract.

### HTML

- Boolean attributes follow HTML: `open="false"` means open. Adapters must omit
  the attribute or assign the boolean property for false. This is documented,
  not changed.

## Finding records

### 001 — Drawer manifest omits a supported option

**Disposition:** Metadata correction.

Add `hide-close-button` to drawer `attributes` and `hideCloseButton` to
`properties`. No runtime change. The existing contract text and the
`docs/responsive-navigation.md` pattern already depend on it.

**Regression:** manifest/declaration/implementation consistency test across all
Web Components; drawer render test with and without the option.

### 002 — Dropdown toggle detail is missing from metadata

**Disposition:** Metadata correction.

Document `eventDetails["sui-toggle"] = "{ open: boolean }"`. Ordering is
guaranteed: `sui-toggle` precedes the matching `sui-open` or `sui-close`. This
matches the current implementation and is safe to promise.

**Regression:** both transitions assert detail and order; document the order in
the manifest contract.

### 003 — Toast properties and message-only API

**Disposition:** Confirmed defect.

Intended behavior:

- `SuiToast.show` accepts `{ title: string; message?: string }` or
  `{ message: string; title?: string }`. At least one is required at type
  level; when neither is provided, runtime renders an empty toast rather than
  `undefined`.
- `message`, `variant` and `duration` are writable properties that write their
  attribute. Assigning them updates the attribute and the rendered output.
- Only a generated subtree is managed. A title node is created only when a
  title is present.

0.4.0 adds `heading` as the canonical heading attribute and keeps `title` as a
deprecated alias, because `title` is the global `HTMLElement.title` (024).

**Regression:** title-only, message-only, both, neither; property assignment;
attribute/property parity; no `undefined` text; variant update after
connection; TypeScript signature test.

### 004 — Tooltip content attribute does not update generated text

**Disposition:** Confirmed defect.

When `content` changes after connection, the generated tooltip text changes.
Precedence: `slot="content"` wins over the `content` attribute; the attribute is
only the source for generated content. Removing the attribute with no slot
content removes the generated node and its reference.

**Regression:** set, change and remove `content` after connection and on
reconnect; assert text, role and references.

### 005 — Reconnected open dialog does not reacquire scroll lock

**Disposition:** Confirmed defect.

Reconnecting an open modal or drawer restores overlay ownership: scroll lock,
Escape registration and ARIA. It does not reset `previouslyFocused`, does not
move focus if focus is already inside the overlay, and does not emit duplicate
open or close events. A disconnect releases ownership; a reconnect reacquires
it.

**Regression:** disconnect/reconnect while open and closed; focus and event
counts; mixed types.

### 006 — Modal advertises but does not implement `hide-close-button`

**Disposition:** Confirmed defect.

Implement it with drawer parity, including the required accessible custom close
control. The alternative, removing it from the manifest, is rejected: the
drawer already supports it, the contract requires it and adapter parity is
worth more than deleting a working option.

**Regression:** close button present/absent; Escape and backdrop still work;
custom footer control receives focus; boolean attribute/property behavior.

### 007 — Dynamic popover label leaves a stale accessible name

**Disposition:** Confirmed defect.

The panel's accessible name is recomputed whenever `label` changes, when the
panel is replaced, and on reconnect. Fallback order: `label`, then the trigger's
trimmed text, then `"Popover"`. An empty `label` uses the fallback, not a stale
value.

**Regression:** set, change and remove `label` in closed and open states; panel
replacement; computed accessible name.

### 008 — Tooltip declares an undeclared `content` property

**Disposition:** Metadata correction.

`content` becomes a writable, attribute-backed property: getter reads the
attribute, setter writes it. This is consistent with 004 and removes the silent
no-op on property assignment.

**Regression:** property and attribute produce identical behavior; declarations
expose the accessor.

### 009 — Manifest does not express read-only APIs

**Disposition:** Metadata correction.

`popover.label`, `accordion.multiple` and `toast.duration` become writable and
attribute-backed. They are configuration inputs; read-only was accidental. No
current property is read-only. Schema v2 (0.4.0) will carry `writable`,
`attribute` and `reflect` metadata so generators do not have to infer it.

**Regression:** `Reflect.set` and direct assignment update the value, the
attribute and the rendered output; manifest/declaration parity.

### 010 — Replacing tooltip content leaves a dangling ARIA reference

**Disposition:** Confirmed defect.

Replacement and removal are supported. The reconciler re-resolves the trigger
and content, assigns the generated ID and `role="tooltip"` to the new content,
moves `aria-describedby` from the old trigger to the new one, and removes only
the component token when content is absent. Caller tokens and caller IDs are
preserved.

**Regression:** replace, remove and reinsert content and trigger; caller
`aria-describedby`; computed accessible description; two instances isolated.

### 011 — Popover content removal leaves `aria-controls` pointing at it

**Disposition:** Confirmed defect.

Content is required. If it is removed after connection, the popover closes,
`aria-controls` is removed from the trigger, and `sui-close` is emitted if it was
open. If focus was inside the removed content, focus returns to the trigger.
Replacing content keeps the popover usable and re-points `aria-controls` to the
new node. Reinserting the same node restores the existing ID.

**Regression:** removal while closed and while open; focused content removal;
replacement; reinsertion; event counts; `aria-controls` cleanup.

### 012 — Mixed modal and drawer scroll locks interfere

**Disposition:** Confirmed defect.

There is one scroll-lock owner in `src/components/internal/`. The modal's
private counter is removed. Mixed and same-type nesting behave identically in
both close orders, including disconnect. The original inline `overflow` is
captured once and restored exactly once.

**Regression:** mixed and same-type pairs; both close orders; disconnect;
pre-existing inline `overflow`; error cleanup; same tests for reconnect (005).

### 013 — Dynamically disabling a tab panel is not reflected

**Disposition:** Confirmed defect (observation) and intended behavior
(selection policy).

0.3.1 observes `disabled` and the tab identity attributes, so toggling
`disabled` updates the rendered tab immediately without a label change. The
selection policy is fixed in 0.4.0 as described in decision 7. Until then, a
disabled tab may remain selected but cannot be activated; that state is
documented.

**Regression:** toggle `disabled` on active and inactive panels; keyboard and
click; `aria-selected`; all-disabled initial state; re-enable; policy tests in
0.4.0.

### 014 — One Escape closes both concurrent dialogs

**Disposition:** Confirmed defect.

Adopt stack semantics: Escape closes only the topmost overlay and emits
`sui-close` with `reason: 'escape'` for that element only. The remaining overlay
keeps its lock and stays open. This is documented as supported to two levels.

**Regression:** both open orders; same-type and mixed; remaining overlay state;
focus restoration to the correct previous element.

### 015 — Reassigning trigger slots retains old ARIA associations

**Disposition:** Unsupported scenario.

Moving `slot="trigger"` or `slot="content"` from one existing node to another
is not supported. It is documented as unsupported and tested as such. The
supported alternative is to replace the node, which works (010). The reconciler
may incidentally update some reassignment cases, but that is not a guarantee.

**Regression:** a negative test documents the unsupported behavior; supported
replacement tests cover the adapter use case.

### 016 — Earlier unslotted button wins over the named trigger

**Disposition:** Confirmed defect.

Resolution order: `[slot="trigger"]` first, then the component's documented
fallback hook (`[data-popover-trigger]` for the popover; none for the tooltip),
then the first focusable fallback (`button`, `a`, `input`, `[tabindex]`) outside
content. An explicit trigger always wins, regardless of document order. Nodes
inside the content slot never qualify.

**Regression:** explicit trigger before and after fallback buttons; both
components; activation and references.

### 017 — Toast rendering replaces caller-supplied classes

**Disposition:** Confirmed defect.

The component never assigns `className`. It adds and removes only its own
classes (`ui-toast`, `ui-toast--*`) and leaves caller classes in place. It never
calls `replaceChildren()` on consumer-supplied children; only the generated
subtree is replaced. This is the general rule for light-DOM components.

**Regression:** caller class on connection; class added later; variant change
and removal; reconnect; consumer children preserved; `SuiToast.show` output.

### 018 — Disabled tooltip trigger still shows on wrapper hover

**Disposition:** Confirmed defect against the documented contract.

The manifest wins. The tooltip is shown by trigger hover or trigger focus, not
by wrapper hover, and not for a trigger that is `disabled` or
`aria-disabled="true"`. The component marks the resolved trigger so CSS can
target it. Disabled controls need visible help or a wrapper with
`aria-describedby`; that guidance replaces the current recommendation wording.

**Regression:** pointer, keyboard, `disabled` and `aria-disabled`
independently; tooltip hidden on wrapper hover; focusable `aria-disabled`
trigger does not show it; enabled trigger still shows it.

### 019 — Tooltip overwrites an existing accessible description

**Disposition:** Confirmed defect.

Compose instead of overwrite. Preserve existing IDREF tokens in order, append
the generated ID, avoid duplicates, and remove only the generated token on
cleanup. The component tracks the trigger and token it owns. If the caller
already references the tooltip ID, it is not duplicated.

**Regression:** single and multiple caller tokens; duplicate IDs; update,
removal and replacement; computed accessible description; Laravel-style form
error describedby.

### 020 — Accordion change detail uses IDs that are never assigned

**Disposition:** Confirmed defect. Added during upstream review; not in the
original audit.

`upgradeItems()` assigns IDs to panels and triggers but not to
`.ui-accordion__item`; `sui-change` maps `entry.id` of the item, so items
without an ID produce `[""]`. Intended behavior: `sui-change` emits
`{ open: string[] }` with usable item IDs. The component assigns a generated ID
to an item when it has none. Generated item IDs are not stable across page
loads. The `multiple` listener and the single-open behavior are unchanged.

**Regression:** items with and without IDs; single and multiple; event detail
after click and after programmatic class changes.

### 021 — Toast announces twice

**Disposition:** Confirmed defect. Added during upstream review.

A toast inside `sui-toast-container` is announced through the container live
region; the toast host does not add `role="status"` or `aria-live` in that case.
A toast used without a container keeps its own `role="status"` so standalone
declarative usage still announces. `SuiToast.show` always provides the container.

**Regression:** container and standalone connection; attributes after
reconnect; one announcement source per stack (manual AT check separate).

### 022 — Generated IDs and SSR

**Disposition:** Metadata correction. Added during upstream review.

0.3.1 unifies ID generation in `src/components/internal/id.ts` so all
components use one source. 0.4.0 adds a consumer seed: an element `id` or
`data-sui-id` produces deterministic derived IDs (`<seed>-title`,
`<seed>-body`, and so on). `crypto.randomUUID()` is used when available and a
counter is the fallback. Intended contract: generated IDs are unique per
document and not stable across loads unless seeded. This is required before an
SSR adapter.

**Regression:** uniqueness across instances and bundles; seed stability; no
duplicate IDs when full and granular entrypoints are both loaded.

### 023 — Popover uses `role="dialog"` without a focus trap

**Disposition:** Intended behavior. Added during upstream review.

The popover is a **non-modal** dialog: it moves focus into the panel on open,
`Escape` closes it and restores focus, `Tab` leaving the panel closes it, and it
does not trap focus or set `aria-modal`. This is a valid APG non-modal dialog
pattern and matches the current implementation. The manifest and docs will say
"non-modal" explicitly so adapters do not assume modal semantics.

**Regression:** focus in, `Escape`, `Tab` out, no `aria-modal`, background
remains interactive.

### 024 — Toast `title` collides with the global HTML attribute

**Disposition:** Confirmed defect. Added during upstream review.

`title` on an HTML element is `HTMLElement.title`; browsers expose it as a
native tooltip and may use it as an accessible description. 0.4.0 adds
`heading` as the canonical toast heading attribute and property, and keeps
`title` as a deprecated alias through 0.4.x. `sui-toast` renders `heading` when
both are present. 0.3.1 documents the current conflict and keeps `title`
working.

**Regression:** heading only, title only, both; no native-tooltip side effect
with `heading`; deprecation path documented.

## Manifest schema change

0.3.1 makes the runtime match the current schema, so schema v1 stays valid:

- every declared config property is writable and reflected;
- `sui-tooltip.content` exists at runtime and in the declarations;
- drawer and modal entries are complete.

0.4.0 bumps the schema to version 2 and changes `properties` values from type
strings to objects:

```json
"properties": {
  "open": { "type": "boolean", "attribute": "open", "reflect": true, "writable": true },
  "label": { "type": "string", "attribute": "label", "reflect": true, "writable": true }
}
```

This is required for generated adapters to stop inferring attribute names,
reflection and writeability. It is intentionally deferred until 0.4.0 so 0.3.1
does not force a manifest parser migration in the Laravel adapter.

## Release contents

### 0.3.1 — adapter contract hardening

- Overlay ownership module: 005, 012, 014.
- ARIA and slot reconciliation module: 004, 007, 010, 011, 016, 019.
- Metadata and runtime alignment: 001, 002, 003, 006, 008, 009.
- Toast ownership, tooltip policy and live regions: 017, 018, 021, 024
  (documentation only for 024).
- Tabs observation: 013 (observation only).
- Accordion event detail: 020.
- Shared ID helper: 022 (unification only).
- Documentation: 015 and 023 stated explicitly, 018 corrected.
- New contract tests and the audit matrix converted to Playwright specs run
  against the packed package.

### 0.4.0 — adapter API decisions

- Toast `heading` with `title` deprecation: 024.
- Tabs disabled-selection policy and all-disabled state: 013.
- Manifest schema v2: 009 follow-up.
- Seeded, SSR-safe IDs: 022.
- Any remaining examples, docs and changelog updates for the above.

## Adapter guidance until 0.3.1 is published

The Laravel adapter should not encode permanent workarounds. Until 0.3.1:

- Prefer `setAttribute` over property assignment for plain `HTMLElement`
  components (tooltip, popover, toast, accordion).
- Use one dialog at a time, or open dialogs in the order that avoids closing the
  first one (012 depends on close order).
- Do not replace tooltip or popover nodes during an open interaction unless the
  reference loss is acceptable.
- Forward classes on a wrapper rather than on `sui-toast`.
- Treat `sui-accordion` `sui-change` item IDs as unreliable unless the markup
  supplies them.

Each of these expires with 0.3.1 and should be removed, not carried into later
adapters.

## Acceptance

The audit can be rerun against 0.3.1 with:

```bash
node audits/0.3.0/reproduce.mjs /path/to/install/node_modules/@luisrodonccs/simplest-ui
```

Acceptance is not a clean exit. It is: every finding that is marked **Confirmed
defect** or **Metadata correction** above no longer reproduces its recorded
observation, and every finding marked **Intended behavior** or **Unsupported
scenario** reproduces the documented behavior. The Laravel checks affected by
019, 012, 005 and 006 continue to pass against the published package.

## Open items

- Final wording of the 0.4.0 toast migration note (`title` to `heading`).
- Whether a third nested overlay level should ever be guaranteed; currently
  best effort.
- Screen-reader verification of 021 and the tooltip composition in 019; the
  audit was automated-only.
