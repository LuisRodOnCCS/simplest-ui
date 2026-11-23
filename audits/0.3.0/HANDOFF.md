# Upstream handoff — 0.3.0 integration audit

This is the entry point for the Simplest UI agent reviewing the audit produced by
the `laravel-simplest-ui` adapter work. It consolidates
[`../../DEBUGGING.md`](../../DEBUGGING.md) and the reproductions in this
directory. Read this first, then the referenced entries.

**Upstream response:** [`DECISIONS.md`](DECISIONS.md) records one disposition per
finding, the intended behavior and the target release.

Audited package: **`@luisrodonccs/simplest-ui@0.3.0`**, installed independently
from npm, loaded from its published `dist` assets. Probes ran in Chromium
156.0.8078.4, Firefox 157.0 and WebKit 27.2 on 2026-11-21.

This audit does **not** modify upstream code and does **not** assert that current
behavior is wrong. Several findings are metadata omissions or contract questions,
not runtime bugs. No screen reader was used.

## How to reproduce

Follow [`README.md`](README.md), then from the repository root:

```bash
node audits/0.3.0/reproduce.mjs /path/to/audit-install/node_modules/@luisrodonccs/simplest-ui
```

The script prints one static record and one record per browser. Result keys map
to the tables below (`SUI-AUDIT-*` and `MATRIX-*`). It is observational: a clean
exit is not a pass. Generated accordion panel IDs differ per run.

## Classification

Legend:

- **Runtime** — observable behavior a consumer can hit.
- **Metadata** — manifest/declaration/implementation disagree.
- **Contract** — behavior may be intentional; an upstream decision is required.

| ID | Kind | Finding | Evidence key | Suggested disposition |
| --- | --- | --- | --- | --- |
| 001 | Metadata | Drawer manifest omits `hide-close-button` / `hideCloseButton` although the declaration and implementation expose it. | static `SUI-AUDIT-001` | Add the attribute and property to the drawer manifest; no runtime change. |
| 002 | Metadata | `sui-toggle` detail `{open}` is absent from dropdown `eventDetails`. | static `SUI-AUDIT-002`, browser `SUI-AUDIT-002` | Document the detail and decide whether ordering/flags are guaranteed. |
| 003 | Metadata + contract | Toast manifest lists `message`/`variant` properties that are not implemented; `show({message})` renders the literal `undefined` title; `ToastOptions` requires `title`. | `SUI-AUDIT-003` | Decide the message-only API, align manifest, types and implementation. |
| 004 | Runtime | Changing the `content` attribute updates the attribute but not the generated tooltip text. | `SUI-AUDIT-004` | Treat as defect or document as attribute-only-at-connection; add regression. |
| 005 | Runtime | Reconnecting an open modal/drawer leaves it visible without a body scroll lock. | `SUI-AUDIT-005` | Likely defect for frameworks that move nodes; test disconnect/reconnect. |
| 006 | Runtime vs manifest | Modal advertises `hide-close-button` but keeps its close button; drawer implements it. | static and browser `SUI-AUDIT-006` | Implement or stop advertising; align manifest, types and examples. |
| 007 | Runtime + a11y | Changing popover `label` leaves the panel's `aria-label` stale. | `SUI-AUDIT-007` | Likely defect; make the observed `label` refresh the panel name. |
| 008 | Metadata + types | Tooltip manifest declares a `content` property that the declaration and implementation do not define. | static and browser `SUI-AUDIT-008` | Choose attribute-only or reflected property; align all three surfaces. |
| 009 | Metadata | `popover.label`, `accordion.multiple` and `toast.duration` are getter-only but the manifest does not mark them read-only. | `SUI-AUDIT-009` | Mark read-only or make writable; typed generators need the signal. |
| 010 | Runtime + a11y | Replacing tooltip content leaves `aria-describedby` pointing at the removed node; the replacement is not upgraded. | `SUI-AUDIT-010`, `MATRIX-1`, `MATRIX-4` | Decide dynamic-content support; preserving a valid reference is the safer contract. |
| 011 | Runtime + a11y | Removing popover content leaves `aria-controls` pointing at the removed node. | `SUI-AUDIT-011`, `MATRIX-3` | Decide missing-required-content policy; clean the reference or document it. |
| 012 | Runtime defect | Mixed modal/drawer scroll locks unlock early and fail to restore; disconnect case leaves the body locked. | `SUI-AUDIT-012`, `MATRIX-8` | Confirmed defect when types overlap; centralize ownership or reject mixing. |
| 013 | Runtime + contract | Dynamic `disabled` on a tab panel is not reflected until another attribute changes; a focused tab can still be selected after disabling; all-disabled selects the first. | `SUI-AUDIT-013`, `SUI-AUDIT-013-all-disabled`, `MATRIX-5` | Fix attribute observation; define selection policy for disabled/all-disabled tabs. |
| 014 | Contract | One Escape closes both an open modal and an open drawer. | `SUI-AUDIT-014` | Decide whether overlapping dialogs are a supported stack. |
| 015 | Contract | Moving `slot="trigger"` leaves ARIA and activation on the old element; the new trigger does not open it. | `SUI-AUDIT-015` | Define trigger precedence and whether slot reassignment is supported. |
| 016 | Contract | With an unmarked button before a `slot="trigger"` button, the first button wins as trigger. | `SUI-AUDIT-016-*` | Confirm selector precedence; slotted trigger should probably win. |
| 017 | Contract | Toast rendering and variant changes replace caller-supplied classes. | `SUI-AUDIT-017` | Decide host-class ownership; preserve if wrappers may forward classes. |
| 018 | Contract + docs | A disabled trigger still shows the tooltip on wrapper hover, contradicting the manifest recommendation; `aria-disabled` behaved the same in the earlier workbench probe. | `SUI-AUDIT-018` (native `disabled` only) | Align CSS, manifest recommendation and examples; decide intended UX. |
| 019 | Runtime + a11y | Tooltip association overwrites an existing `aria-describedby` value. | `SUI-AUDIT-019`, `MATRIX-4` | Preserve existing IDREF tokens when composing the description. |

Expected behavior, **not** findings:

- `open="false"` on a boolean attribute opens the element; this is HTML, not a bug.
- Two open popovers stay isolated during a content mutation (`MATRIX-7`).
- Reinserting the *same* content node restores its existing ID and reference.
- Drawer `hide-close-button` works; only the modal does not honor it.

## Decisions needed before fixes

1. **Toast API (003):** is `message` a supported input, and must `show` accept it
   without `title`? The manifest, types and runtime currently disagree.
2. **Property model (008, 009):** which manifest `properties` are writable,
   read-only, or attribute-only? This affects generated adapters.
3. **Dynamic slots (010, 011, 015, 016):** are content/trigger replacement and
   slot reassignment supported after connection? If yes, what are the reference
   and focus guarantees?
4. **Overlapping dialogs (012, 014):** supported stack, or explicitly
   unsupported? Scroll locking and Escape currently assume different models.
5. **Disabled tooltips (018):** should disabled controls expose contextual help?
   The manifest recommendation and CSS disagree.
6. **Host classes on toast (017):** can wrappers forward classes, or does the
   component own `class`?
7. **Disabled tabs (013):** what happens when the active tab becomes disabled, or
   when all tabs are disabled?

## Review order

1. **Metadata-only, low risk:** 001, 002, 006, 008, 009. These can be aligned
   without behavior changes once the property model is decided.
2. **Confirmed runtime defects:** 012 (scroll locks), 004 and 007 (stale
   generated content/name), 005 (reconnect).
3. **Accessibility references:** 010, 011, 019 — decide the preservation policy,
   then fix composition rather than deleting caller-owned values.
4. **Contract decisions:** 003, 013–018 — decide first, then implement and
   document, because a fix may change public behavior.
5. **Convert to permanent tests:** start with the reproductions whose contract is
   settled. Keep negative cases and computed accessible names; add screen-reader
   checks separately.

## Limits of this handoff

- One representative case per finding; not every variant is covered (for example,
  `aria-disabled` tooltips, toast variant updates after connection, reverse close
  order for matrix 8).
- No assistive-technology session, no visual review and no React/Vue consumer
  test. Automated ARIA inspection is not an accessibility certification.
- Accordion panel IDs are generated per run; normalize before diffing output.
- The Laravel workbench probes that produced the original evidence are not a
  durable suite. This directory replaces them as the starting point.

## Expected response from upstream

For each finding, record one of: confirmed defect (with intended behavior),
metadata-only correction, intended behavior (document it), or unsupported
scenario (state it explicitly). Then publish or link the corrected version so the
adapter can rerun this script and the affected Laravel checks against it.
