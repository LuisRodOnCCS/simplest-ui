# Integration audit findings

This is an upstream review queue from the Laravel adapter audit, not a list of
confirmed runtime bugs. Evidence refers to the **published npm package
`@luisrodonccs/simplest-ui@0.3.0`**, not necessarily the current source checkout.
Reproduce against the published package and compare current source before fixing.
No changes to the core are implied by this report.

Portable browser and static probes for these findings, plus the eight-case
dynamic matrix, are in [`audits/0.3.0/`](audits/0.3.0/README.md); start with
[`audits/0.3.0/HANDOFF.md`](audits/0.3.0/HANDOFF.md) for the classification and
review order. See that directory for exact scope, coverage limits and npm
installation instructions.

## SUI-AUDIT-001 — Drawer metadata omits a supported option

- **Classification:** confirmed manifest/type inconsistency; impact on runtime
  behavior not established. **Status:** awaiting upstream review.
- **Evidence:** the `sui-drawer` entry of `components.manifest.json` omits
  `hide-close-button` and `hideCloseButton`, while its own contract mentions the
  attribute. Published `dist/components/drawer.d.ts` exposes the boolean property
  and `dist/drawer.js` includes the attribute.
- **Reproduction:** compare the drawer entry's `attributes` and `properties`
  against the declaration and the published implementation.
- **Impact:** manifest-driven Laravel, React and Vue adapters may omit an
  available option. Hiding the default close button requires an accessible
  replacement; the audit does not recommend changing that responsibility.
- **Suggested regression:** validate that documented public options agree across
  manifest, declarations and implementation; test accessible custom dismissal.

## SUI-AUDIT-002 — Dropdown toggle event detail is missing from metadata

- **Classification:** confirmed metadata omission for the tested transition;
  event ordering is an observation, not an asserted guarantee.
  **Status:** awaiting upstream review.
- **Evidence/reproduction:** using the full 0.3.0 bundle in Chromium, Firefox
  and WebKit, create a `sui-dropdown`, await its initial render, listen for
  `sui-toggle`, then assign `element.open = true` and `false`. Events contain
  `detail: { open: true }` and `{ open: false }`; the manifest lists the event
  but its `eventDetails` contains only `sui-select`.
- **Impact:** generated or typed framework adapters cannot discover the detail
  shape from the manifest.
- **Suggested regression:** validate the detail for both transitions and decide
  whether event flags and ordering are public guarantees before documenting them.

## SUI-AUDIT-003 — Toast properties and message-only API need reconciliation

- **Classification:** confirmed contract/runtime and metadata/type discrepancy
  in Chromium, Firefox and WebKit. **Status:** awaiting upstream review.
- **Evidence:** the manifest lists `title`, `message`, `variant` and `duration`
  as properties. Published `dist/components/toast.d.ts` declares a `duration`
  getter but no corresponding custom `message` or `variant` properties;
  `title` is inherited from `HTMLElement`. Published `dist/toast.js` reads
  attributes. The manifest contract says `SuiToast.show` accepts title **or**
  message, but `ToastOptions` requires `title`, and `show` sets the title
  attribute unconditionally.
- **Reproduction:** load the published 0.3.0 full bundle in a browser. Create a
  `sui-toast` with `title="Title"` and `duration="0"`, append it, then assign
  `element.message = 'Property message'` and `element.variant = 'success'`.
  Neither attribute nor rendered output changes. Setting those attributes with
  `setAttribute` does update the content and class. Calling
  `customElements.get('sui-toast').show({message: 'Only message', duration: 0})`
  renders the literal title `undefined` followed by `Only message`. All three
  engines produced these results. This raw JavaScript call is intentionally
  outside the published TypeScript signature.
- **Impact:** framework wrappers may assign JS properties that do not update
  observed attributes; typed consumers cannot express the documented message-only
  call, and untyped consumers see an unintended `undefined` title. The intended
  public API needs an upstream decision.
- **Suggested regression:** cover attribute/property mapping, TypeScript
  signatures, title-only, message-only, both and neither; align manifest,
  implementation and types to the decided contract.

## Integration note — HTML boolean attributes

This is **expected HTML behavior**, not a bug: `open="false"` still means true.
With published 0.3.0 modal, drawer, dropdown and popover, the three browser
engines tested all opened when that attribute was present. Adapters should omit
the attribute for false or assign the boolean property. Consider documenting
this explicitly for framework authors.

## SUI-AUDIT-004 — Tooltip content attribute does not update generated text

- **Classification:** confirmed dynamic attribute/rendering inconsistency in
  published 0.3.0. **Status:** awaiting upstream review.
- **Reproduction:** load the full published bundle; append
  `<sui-tooltip content="Original"><button>Focus</button></sui-tooltip>`, then
  call `element.setAttribute('content', 'Updated')`. The attribute becomes
  `Updated` but the generated `[role=tooltip]` text remains `Original`.
  Reproduced in Chromium, Firefox and WebKit; the initial trigger
  `aria-describedby` did reference the generated tooltip ID.
- **Impact:** reactive framework adapters can update the documented `content`
  attribute without updating visible or assistive-technology text.
- **Evidence:** the published tooltip observes `content` and reruns `upgrade()`,
  which reuses an existing generated content node without replacing its text.
- **Suggested regression:** change and remove `content` after connection, test
  repeated updates and reconnect, and distinguish generated content from
  consumer-supplied `slot="content"` before choosing the intended precedence.

## SUI-AUDIT-005 — Reconnected open dialog does not reacquire scroll lock

- **Classification:** confirmed runtime behavior in published 0.3.0, Chromium,
  Firefox and WebKit. **Status:** awaiting upstream review.
- **Reproduction:** append a `sui-modal` or `sui-drawer` with a label, await its
  initial update, set `open = true` and await the update. The body inline
  overflow becomes `hidden`. Remove the still-open element: the body overflow
  is restored. Reappend the same element and await its update: `open` remains
  true and the dialog is present, but the body overflow remains unlocked.
- **Impact:** frameworks that move or reconnect an open custom element can leave
  a modal dialog displayed while the background page scrolls.
- **Suggested regression:** exercise disconnect/reconnect while open and closed,
  multiple overlapping dialogs, restoration of a pre-existing overflow value,
  and cleanup after final close. Confirm focus and event behavior separately;
  this probe did not establish a focus defect.

## SUI-AUDIT-006 — Modal advertises but does not implement hide-close-button

- **Classification:** confirmed mismatch between the published 0.3.0 manifest
  and runtime; **status:** awaiting upstream review.
- **Reproduction:** render an open `sui-modal` and add `hide-close-button`, then
  await its update. The shadow root still contains its `.close` button.
  Reproduced in Chromium, Firefox and WebKit. The same test on `sui-drawer`
  removes its close button. Published `dist/modal.js` contains neither
  `hide-close-button` nor `hideCloseButton`.
- **Contract:** the modal manifest lists the attribute and property and requires
  an accessible custom close control when used. The published modal type
  declaration also lacks the advertised property.
- **Impact:** framework consumers cannot rely on the advertised modal option.
  The built-in close button remaining present is not by itself an accessibility
  failure; applications may nevertheless present duplicate close controls.
- **Suggested regression:** choose whether modal should implement or stop
  advertising the option; align implementation, declarations, manifest and
  examples. If implemented, test a labeled custom close control, Escape, focus
  restoration and boolean attribute/property behavior.

## SUI-AUDIT-007 — Dynamic popover label leaves a stale accessible name

- **Classification:** confirmed dynamic attribute/accessibility inconsistency
  in published 0.3.0. **Status:** awaiting upstream review.
- **Reproduction:** load the 0.3.0 full bundle and append a `sui-popover`
  with `label="Menu"`, a `slot="trigger"` button and a `slot="content"` panel.
  After connection call `element.setAttribute('label', 'Updated')`. The host
  attribute reads `Updated`, but the content panel's `aria-label` remains
  `Menu`. Reproduced in Chromium, Firefox and WebKit.
- **Impact:** reactive adapters can change the visible or configured label while
  assistive technology receives the old dialog name.
- **Evidence:** published `dist/popover.js` observes `label`; its attribute
  callback calls `sync()`, while the panel name is set by `upgrade()`.
- **Suggested regression:** update and remove the label after connection, test
  fallback to trigger text, and verify the accessible name in both open and
  closed states. Decide whether the manifest's `label` property should be
  writable: the published declaration exposes a getter only.

## SUI-AUDIT-008 — Tooltip manifest declares an undeclared content property

- **Classification:** confirmed metadata/declaration/implementation mismatch
  in published 0.3.0, including property assignment behavior in Chromium,
  Firefox and WebKit.
  **Status:** awaiting upstream review.
- **Evidence:** the `sui-tooltip` manifest declares `content: string` under
  properties. Published `dist/components/tooltip.d.ts` declares no `content`
  property, and `dist/tooltip.js` observes/reads the `content` attribute but
  does not define a getter or setter for the property.
- **Impact:** typed or manifest-driven adapters may expect a property-based API
  that the published declaration and implementation do not establish. In all
  three tested engines, setting `element.content` created an own property and
  did not set the `content` attribute.
- **Suggested regression:** decide whether `content` is an attribute-only API
  or a writable reflected property; align manifest and types and test property
  assignment separately from attribute changes (see SUI-AUDIT-004).

## SUI-AUDIT-009 — Manifest property metadata does not express read-only APIs

- **Classification:** confirmed declaration/runtime behavior; the intended
  writeability contract remains an upstream decision. **Status:** awaiting
  upstream review.
- **Evidence:** in the published 0.3.0 declarations and runtime,
  `sui-popover.label`, `sui-accordion.multiple`, and `sui-toast.duration` have
  getters without setters, while manifest `properties` lists their types
  without a read-only indicator. Runtime probes in Chromium, Firefox and WebKit
  confirmed that `Reflect.set` does not update their values or attributes.
  These are distinct from modal/drawer boolean properties that have setters.
- **Impact:** an adapter generator interpreting all manifest properties as
  writable may silently fail or throw in strict mode.
- **Suggested regression:** agree whether these are attribute-only inputs,
  read-only properties, or writable reflected properties; document this
  explicitly and test framework-like property assignment and attribute updates.

## SUI-AUDIT-010 — Replacing tooltip content leaves a dangling ARIA reference

- **Classification:** confirmed behavior in published 0.3.0; the required
  dynamic-content policy needs upstream review. **Status:** awaiting review.
- **Reproduction:** append `<sui-tooltip><button slot="trigger">Help</button>
  <span slot="content">Old</span></sui-tooltip>` and allow connection. Replace
  the content span with a new `span slot="content"` containing `New`, then wait
  an animation frame. In Chromium, Firefox and WebKit the new span has no
  generated ID or tooltip role and the trigger retains `aria-describedby`
  pointing to the removed node. Removing the new span likewise leaves the
  reference. This is distinct from stale attribute-generated text in 004.
- **Impact:** reactive rendering that replaces a content node may break the
  trigger's accessible description.
- **Additional trigger case:** replacing `slot="trigger"` with a new button
  and waiting one animation frame leaves the replacement without
  `aria-describedby`; removing and reappending that same replacement did not
  add it. Reproduced in Chromium, Firefox and WebKit with 0.3.0. This probe did
  not test replacing a focused trigger or focus recovery.
- **Same-node reinsertion:** removing and reinserting the *same* previously
  initialized tooltip content node restores a valid reference because the node
  retains its existing ID and role; the reference is dangling during removal.
  This does not resolve replacement with a new node.
- **Suggested regression:** test adding, replacing and removing both trigger and
  content after connection, preserving caller-supplied IDs and descriptions;
  decide and document supported dynamic slot behavior.

## SUI-AUDIT-011 — Popover content removal leaves aria-controls pointing to it

- **Classification:** confirmed dangling-reference behavior after removal of
  required content in published 0.3.0; severity and supported missing-content
  policy remain to be decided. **Status:** awaiting review.
- **Reproduction:** append a popover with trigger and content slots; remove the
  content node and wait an animation frame. The trigger retains `aria-controls`
  pointing at the removed node in Chromium, Firefox and WebKit. Replacing the
  content instead correctly assigned the new content a dialog role and matching
  ID in the tested case.
- **Impact:** transient reactive updates can leave an invalid ARIA reference;
  the documented contract requires content, so this does not prove normal static
  markup fails.
- **Suggested regression:** test content removal, replacement and readdition,
  including open state and ARIA cleanup, before deciding how to handle absent
  required content.
- **Same-node reinsertion:** the tested original content node retained its ID
  and role, and `aria-controls` matched it again after reinsertion in all three
  engines; the reference was dangling while the node was absent.
- **Open and focused case:** removing the content while a descendant was focused
  left the popover open, moved focus to `BODY` and emitted no close event.
  Reinserting the same content made it visible again with the existing matching
  `aria-controls`, still without another transition event. Reproduced in all
  three engines; expected immediate focus behavior remains unspecified.

## SUI-AUDIT-012 — Mixed modal and drawer scroll locks interfere

- **Classification:** confirmed runtime defect in published 0.3.0 when mixed
  dialog types overlap. **Status:** awaiting upstream review.
- **Reproduction:** in a document with `body.style.overflow = 'scroll'`, append
  one labeled modal and one labeled drawer. Open modal then drawer, awaiting
  each update. Close modal while drawer remains open, then close drawer.
  In Chromium, Firefox and WebKit overflow was `hidden` with both open,
  `scroll` after the first closed (background unlocked while drawer open), and
  `hidden` after both closed (original value not restored). Reversing which
  type opens first produced the same sequence.
- **Control:** the same sequence with two modals or two drawers kept overflow
  `hidden` until both closed and restored `scroll` afterward.
- **Reverse close order:** closing the most recently opened mixed dialog first
  kept `hidden` until the remaining dialog closed, then restored `scroll`.
  Verified in Chromium, Firefox and WebKit; the defect depends on close order.
- **Disconnect case:** with either type opened first and `overflow: scroll`,
  removing the first-opened element unlocked the body while the other remained
  open; closing the other left `overflow: hidden`. Only the remaining element
  emitted a close event. Reproduced in all three engines using the Laravel
  workbench full bundle built from the npm 0.3.0 package.
- **Impact:** nested or overlapping adapters may unlock the background while a
  dialog remains open and leave the document locked after both close.
- **Suggested regression:** test mixed and same-type nesting in both close orders,
  disconnect/reconnect, existing inline overflow values, and error cleanup.
  Resolve scroll ownership centrally only if consistent with the core design.

## SUI-AUDIT-013 — Dynamically disabling a tab panel is not reflected

- **Classification:** confirmed runtime behavior in published 0.3.0;
  expected handling of a currently selected disabled tab needs a product
  decision. **Status:** awaiting upstream review.
- **Reproduction:** append `sui-tabs` with `data-tab="a"` and `data-tab="b"`
  panels, select `b`, then add `disabled` to the `b` panel. After two animation
  frames and the component update, the corresponding shadow tab button remains
  enabled. Changing its `label` afterwards causes a refresh: the button becomes
  disabled but remains selected with `value="b"`. Removing that panel selects
  `a`. Reproduced in Chromium, Firefox and WebKit.
- **Evidence:** published `dist/tabs.js` observes panel attribute changes using
  `attributeFilter: ["label"]`; a separate label mutation refreshes the cached
  disabled state.
- **Impact:** reactive consumers can make panel markup and interactive tab
  controls disagree, allowing interaction with a newly disabled tab.
- **Suggested regression:** dynamically toggle disabled on active and inactive
  panels, verify keyboard/click behavior and `aria-selected`, and define
  selection/focus policy when the active tab becomes disabled. Also test
  re-enabling and all-disabled states.
- **Initial-state comparison:** with the first tab disabled but another enabled,
  0.3.0 selected the enabled tab; likewise an explicitly selected disabled tab
  fell back to an enabled tab. When *all* tabs were disabled, the first remained
  selected and its panel visible, while all buttons had `tabindex="-1"`.
  Observed in Chromium, Firefox and WebKit. The intended all-disabled behavior
  needs a contract decision; this observation alone does not establish a defect.
- **Focused inactive tab:** focus the B tab while A is selected, set `disabled`
  on B's panel, then press Enter. In all three engines B was selected and
  emitted `sui-change` with `{value:"b"}`, consistent with its cached disabled
  state not being refreshed. Removing `disabled` and pressing Enter again
  emitted no additional change; replacing its panel retained B, and removing
  that panel selected A. The tested shadow tab buttons had no `aria-controls`;
  assess the deliberate cross-shadow accessibility design separately.

## SUI-AUDIT-014 — One Escape closes both concurrently open dialog types

- **Classification:** confirmed runtime behavior in published 0.3.0; expected
  stacking semantics for concurrent dialogs require an upstream decision.
  **Status:** awaiting review.
- **Reproduction:** append a labeled modal and a labeled drawer, open the modal
  followed by the drawer, then send one Escape keydown. In Chromium, Firefox
  and WebKit both close and each emits `sui-close` with reason `escape`.
- **Impact:** if nested/overlapping dialogs are intended to behave as a stack,
  one key press dismisses more than the topmost dialog. Do not assume overlapping
  dialogs are supported without an explicit upstream contract.
- **Suggested regression:** establish whether simultaneous dialogs are
  supported; if so test Escape, focus restoration, scroll locks, open/close and
  disconnect in both orders for same-type and mixed-type pairs.

## SUI-AUDIT-015 — Reassigning trigger slots retains old ARIA associations

- **Classification:** confirmed dynamic behavior in published 0.3.0; whether
  trigger slot reassignment is supported requires an upstream decision.
  **Status:** awaiting review.
- **Reproduction:** append a popover or tooltip with a button marked
  `slot="trigger"`, a second unmarked button and a `slot="content"` node.
  Remove `slot` from the first button, set `slot="trigger"` on the second,
  and wait two animation frames. In Chromium, Firefox and WebKit, the former
  trigger retains its `aria-controls` or `aria-describedby`, and the newly
  marked trigger receives neither.
- **Impact:** frameworks changing existing slot attributes can leave semantics
  attached to the previous trigger. In the tested DOM order, clicking the new
  marked popover trigger did not open it; clicking the former trigger did, in
  all three engines. Cleanup after subsequent child mutations was not tested.
- **Suggested regression:** define trigger precedence and dynamic slot support;
  test reassignment in both DOM orders, mutation while open, removing old ARIA
  associations without deleting consumer-supplied values, and listener behavior.

## SUI-AUDIT-016 — Earlier unslotted button wins over named trigger

- **Classification:** confirmed selector/markup behavior in published 0.3.0;
  contract intent for additional buttons outside content remains to be reviewed.
  **Status:** awaiting review.
- **Reproduction:** append `sui-popover` or `sui-tooltip` with an unmarked
  button first, then a button with `slot="trigger"`, then a content-slot node.
  In Chromium, Firefox and WebKit, the first button receives the trigger ARIA
  reference; the explicitly slotted second button does not. With popover, the
  first button responds as trigger in the tested interaction.
- **Evidence:** the published implementations use a combined `querySelector`
  containing both `[slot='trigger']` and `button`; the first matching node in
  document order wins rather than the first selector having precedence.
- **Impact:** integrations that include additional buttons may associate the
  wrong trigger. The published examples do not include this arrangement, so
  confirm whether it is intended to be supported.
- **Suggested regression:** test explicit trigger before/after fallback buttons,
  dynamic slot reassignment, and references/behavior of both elements.

## SUI-AUDIT-017 — Toast rendering replaces caller-supplied classes

- **Classification:** confirmed runtime behavior in published 0.3.0; whether
  preserving arbitrary host classes is a supported public contract needs
  upstream review. **Status:** awaiting review.
- **Reproduction:** append `<sui-toast class="consumer-class" title="Example"
  duration="0"></sui-toast>`. After connection its class is `ui-toast`, and
  `consumer-class` is absent. Add `second-consumer-class` with `classList`, then
  set `variant="success"`: the class becomes `ui-toast ui-toast--success` and
  the added class disappears. Reproduced in Chromium, Firefox and WebKit.
- **Evidence:** published `dist/toast.js` assigns `this.className` in `render`
  on connection and on observed attribute changes.
- **Impact:** consumers and framework wrappers that forward classes cannot rely
  on host classes surviving toast rendering or variant updates.
- **Suggested regression:** define host class ownership and, if caller classes
  should be supported, test preserving them while changing/removing variants,
  including repeated updates and reconnect.

## SUI-AUDIT-018 — Disabled tooltip trigger still shows on wrapper hover

- **Classification:** confirmed mismatch with a manifest recommendation in
  published 0.3.0; intended UX needs upstream review. **Status:** awaiting review.
- **Reproduction:** render `<sui-tooltip content="Help"><button disabled>
  Disabled</button></sui-tooltip>` with the full published CSS and JS, hover the
  tooltip host and wait for its opacity transition. In Chromium, Firefox and
  WebKit computed tooltip opacity changes from `0` to `1`. The manifest says
  “Disabled triggers do not show the tooltip” under recommendations.
- **Evidence:** published tooltip CSS uses `.ui-tooltip:hover
  .ui-tooltip__content`, which depends on the wrapper hover state.
- **Impact:** visual behavior differs from the documented recommendation.
  A disabled trigger cannot normally receive keyboard focus; hover behavior alone
  does not establish the appropriate accessibility or product policy.
- **Additional `aria-disabled` case:** with an otherwise focusable button marked
  `aria-disabled="true"`, computed tooltip opacity changed from `0` to `1` on
  programmatic focus and on wrapper hover in Chromium, Firefox and WebKit.
  Unlike native `disabled`, `aria-disabled` does not itself suppress focus.
- **Suggested regression:** decide whether disabled controls should show
  contextual help and align contract, CSS and examples; test pointer, keyboard,
  `disabled` and `aria-disabled` independently.

## SUI-AUDIT-019 — Tooltip overwrites an existing accessible description

- **Classification:** confirmed runtime behavior in published 0.3.0;
  preservation policy requires upstream review. **Status:** awaiting review.
- **Reproduction:** render a node with `id="prior"` and a tooltip whose trigger
  has `aria-describedby="prior"`. On connection, the trigger's attribute
  contains only the generated tooltip ID; `prior` is lost. Reproduced in
  Chromium, Firefox and WebKit with the full bundle.
- **Impact:** existing instructions or error descriptions associated with the
  trigger may be omitted from its computed description. This affects framework
  integrations that compose tooltip help with form descriptions.
- **Suggested regression:** preserve existing IDREF tokens when associating a
  tooltip; test multiple IDs, duplicate IDs, updates and removal/replacement
  without deleting caller-owned references. Confirm computed accessible
  descriptions, not just the attribute string.
- **Computed-description follow-up:** Playwright role locators using their
  `description` filter matched the tooltip description but not the preexisting
  description after initialization. After replacing the tooltip content node,
  neither old nor new description matched. Observed in Chromium, Firefox and
  WebKit; this complements, but does not replace, assistive-technology testing.
