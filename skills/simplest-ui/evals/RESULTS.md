# OpenCode evaluation results

These are historical results for earlier skill guidance, not evaluations of the
current asset contract, the integration diagnostics, or the newer Laravel
integration prompts.

## Diagnostic workflow run — 2026-11-19

Prompts 9–15 were executed on 2026-11-19 with independent general subagents that
loaded the current skill sources. The full prompts, responses and assessments are
in [runs/2026-11-19-diagnostics.md](./runs/2026-11-19-diagnostics.md).

| ID | Scenario | Result |
| --- | --- | --- |
| 9 | Blade wrapper omits documented table attributes | Pass |
| 10 | Missing focus indicator with only `styles.css` | Pass after prompt correction |
| 11 | Forced two-column grid overflows at 320px | Pass |
| 12 | Runtime correct but integration guidance missing | Pass |
| 13 | Vendored 0.1.0 plus npm 0.2.1 assets | Pass |
| 14 | Auth screens and demo widths requested in core | Pass with note |
| 15 | WebKit Tab skips the skip link | Pass |

The run tested diagnosis after the skill was loaded; it did not test automatic
skill selection or a packaged-tarball replay. Prompt 10 originally implied that
`styles.css` was a complete bundle. That contradicted the documented install
contract, so the prompt and expected output were corrected and the case rerun;
both runs rejected a core defect.

The evaluations below predate these changes.

Evaluated on 2026-11-05 with OpenCode v2.2.5 and `openai/gpt-5.6-terra`.

## Fixture

A clean temporary project installed the locally packed `@luisrodonccs/simplest-ui@0.1.0` tarball and loaded the package skill through `opencode.jsonc`:

```jsonc
{ "skills": ["./node_modules/@luisrodonccs/simplest-ui/skills"] }
```

The evaluation prompts ran without changing fixture files. Each explicit invocation loaded `simplest-ui`; the export-menu prompt was also run without an explicit invocation and OpenCode selected the skill automatically.

## Results

| ID | Scenario | Result | Evidence |
| --- | --- | --- | --- |
| 1 | Billing summary | Pass | Selected `ui-card`, `ui-stat`, `ui-badge`, and `ui-button`; used semantic `article`, `header`, and `footer`; proposed `styles.css`; did not invent `sui-card`. |
| 2 | Export actions | Pass | Selected `sui-dropdown`, imported `@luisrodonccs/simplest-ui/components/dropdown`, used its `sui-select` event, and delegated keyboard behavior to the component. Automatic skill selection also selected `simplest-ui`. |
| 3 | Date range picker | Pass | Determined that no date picker exists, justified a new `sui-date-range-picker`, and covered tokens, accessibility, keyboard behavior, tests, manifest generation, visual documentation, exports, and changelog work. |

## v0.2.0 Laravel integration validation

The Laravel decisions represented by prompts 4 and 5 were validated on
2026-11-13 with a packed `@luisrodonccs/simplest-ui@0.2.0` tarball:

| ID | Scenario | Result | Evidence |
| --- | --- | --- | --- |
| 4 | Laravel host assets | Pass | `quotepdf-sandbox` loaded `tokens.css`, `base.css`, and `components.css` through its production Vite manifest. It rendered Folios with no published-package request or console errors. |
| 5 | Composer package assets | Pass | `laravel-folios` compiled public CSS exports into its own licensed stylesheet for package mode. The package has no Simplest UI Web Component JavaScript, so its mutually exclusive no-Node mode is valid. |

Package mode and host mode each loaded exactly one asset source. The host-mode
Folios page scored 100/100 in Lighthouse accessibility and best practices.

## Formal v0.2.0 prompt replay

Evaluated on 2026-11-17 with OpenCode CLI and
`openai/gpt-5.6-terra`. Each literal prompt ran in a separate temporary Laravel
fixture with the freshly packed `@luisrodonccs/simplest-ui@0.2.0` tarball
installed and the packaged skill loaded through `opencode.jsonc`. The fixture
changes are confined to the temporary evaluation directory.

### Prompt 4 — Laravel host assets

**Result: Pass**

**Agent response:**

> Integrated Simplest UI using the Laravel + Vite workflow.
>
> - Added Vite CSS entrypoint: `resources/css/simplest-ui.css`
> - Added drawer behavior entrypoint: `resources/js/simplest-ui.js`
> - Updated `resources/views/welcome.blade.php` to load assets via `@vite(...)`
> - Used the registered `sui-drawer` component for accessible drawer behavior,
>   with Simplest UI layout, navigation, button, card, and topbar primitives.
>
> The JavaScript imports only the drawer component and restores focus to the
> opener when closed.

**Changed fixture files:**

- `resources/css/simplest-ui.css`
- `resources/js/simplest-ui.js`
- `resources/views/welcome.blade.php`

The response selected `laravel-vite`, used public CSS exports through
application Vite entrypoints, imported
`@luisrodonccs/simplest-ui/components/drawer`, and rendered `sui-drawer`
markup. It did not copy `dist` or use `vendor/simplest-ui` assets. The generated
JavaScript passed `node --check`.

### Prompt 5 — Composer package assets

**Result: Fail**

**Agent response:**

> Implemented a functional workbench drawer demo using registered `sui-drawer`.
>
> - Updated `workbench/resources/views/welcome.blade.php`
> - Added Vite assets:
>   - `workbench/resources/css/simplest-ui.css`
>   - `workbench/resources/js/simplest-ui.js`
>
> The demo imports Simplest UI’s styles and drawer behavior, opens via an
> accessible trigger, updates `aria-expanded`, and relies on the component for
> focus trapping and Escape dismissal.

**Changed fixture files:**

- `workbench/resources/css/simplest-ui.css`
- `workbench/resources/js/simplest-ui.js`
- `workbench/resources/views/welcome.blade.php`

The response correctly selected the registered `sui-drawer` and kept Vite assets
within the workbench for development. However, it did not state or document the
required production contract: host-owned CSS and JavaScript for a drawer, because
the Web Component JavaScript makes CSS-only package-assets mode inapplicable.
It therefore does not satisfy the full expected output for prompt 5. The
generated JavaScript passed `node --check`; it did not copy `dist` or add a
`vendor/simplest-ui` reference.

## Complete v0.2.0 replay after skill updates

The five literal prompts were replayed with `openai/gpt-5.6-terra` and freshly
packed `@luisrodonccs/simplest-ui@0.2.0` tarballs in separate temporary
fixtures. The fixtures loaded the packaged skill through `opencode.jsonc`.

| ID | Result | Evidence |
| --- | --- | --- |
| 1 | Pass | Composed the billing summary from CSS primitives. |
| 2 | Pass | Selected `sui-dropdown` and delegated keyboard behavior to it. |
| 3 | Pass | Proposed an upstream date-range picker instead of creating a consumer-local custom element. |
| 4 | Pass | Applied host-owned Laravel Vite CSS, drawer behavior, and Blade markup. |
| 5 | Pass | Distinguished workbench assets from the mandatory host-owned production assets. |

### Prompt 1 — Billing summary

**Result: Pass**

> Added the billing summary card in `src/views/account.html`.
>
> It uses Simplest UI’s existing `ui-card`, `ui-stat`, `ui-badge`, and ghost
> button primitives, showing a `$0.00` balance, `Paid` status, and “View billing
> details” secondary action.

Changed fixture file: `src/views/account.html`. The response composed registered
CSS primitives and did not invent a `sui-card` element.

### Prompt 2 — Export actions

**Result: Pass**

> Implemented the export menu in `src/main.js`.
>
> - Uses Simplest UI’s accessible `sui-dropdown` primitive.
> - Includes CSV, Excel, and PDF actions.
> - Supports keyboard navigation, Escape, arrow keys, Home/End, and focus
>   handling through the component.
> - Announces the selected export format via a live status message.
> - Imports required Simplest UI styles and dropdown behavior.
>
> Validated with `node --check src/main.js`.

Changed fixture file: `src/main.js`. It imports
`@luisrodonccs/simplest-ui/components/dropdown` and uses `sui-select`, without
recreating the dropdown's ARIA or keyboard behavior.

### Prompt 3 — Date-range picker

**Initial replay: Fail.** The agent created a consumer-local
`sui-date-range-picker` implementation without the required upstream tests,
manifest, catalog, and changelog work. The attempted TypeScript check also could
not run because the fixture intentionally has no TypeScript compiler.

**Retry result: Pass**

> A date-range picker is not in Simplest UI’s catalog. `sui-popover` can supply
> the popup, but calendar range selection requires a new upstream
> `sui-date-range-picker` Web Component—not a local consumer-defined `sui-*`
> tag.
>
> Required upstream work:
> - Component behavior: range selection, month navigation, min/max/disabled
>   dates, form association, `sui-change` events.
> - Accessibility: calendar grid semantics, roving focus, arrow/Page/Home/End
>   keys, Escape, focus restoration, live announcements.
> - Styling: `ui-date-range-picker*` classes using existing `--sui-*` tokens.
> - Public surface: component export, manifest/catalog/README/JSX declarations,
>   changelog.
> - Tests: selection flows, keyboard/focus behavior, popup dismissal, validation
>   and date boundaries.
>
> Consumers would import:
>
> ```ts
> import "@luisrodonccs/simplest-ui/components/date-range-picker";
> ```
>
> No local `sui-*` component was added because this workspace is a Simplest UI
> consumer rather than the upstream source repository.

No fixture files changed on the successful retry.

### Prompt 4 — Laravel host assets

**Result: Pass**

> Implemented Simplest UI’s Laravel + Vite integration.
>
> - Added Vite CSS/JS entrypoints in `resources/css/simplest-ui.css` and
>   `resources/js/simplest-ui.js`.
> - Registered the documented `sui-drawer` behavior only.
> - Added an accessible drawer trigger and settings drawer to
>   `resources/views/welcome.blade.php`.
> - Configured `vite.config.js` for both entrypoints.
> - Added `vite` and `laravel-vite-plugin` dev dependencies.
> - Verified with `npx vite build`.
>
> Selected primitive: `sui-drawer`, because it provides the required accessible
> side panel behavior, including focus handling and Escape-to-close.

Changed fixture files: `resources/css/simplest-ui.css`,
`resources/js/simplest-ui.js`, `resources/views/welcome.blade.php`, and
`vite.config.js`. The fixture used public package exports and did not copy
`dist` or use `vendor/simplest-ui` assets.

### Prompt 5 retry — Composer package assets

**Result: Pass**

After clarifying the workbench-versus-production asset rule in the packaged
skill, the same literal prompt was replayed in a new temporary fixture from a
freshly packed tarball.

**Agent response:**

> Implemented the workbench drawer demo.
>
> - Uses the registered `sui-drawer` primitive via the package Blade component.
> - Added workbench Vite assets:
>   - `workbench/resources/css/simplest-ui.css`
>   - `workbench/resources/js/simplest-ui.js`
> - Updated `workbench/resources/views/welcome.blade.php` with an accessible
>   trigger, drawer content, and close action.
> - Verified the JavaScript syntax.
>
> Asset ownership: the workbench Vite entrypoints own demo CSS and drawer JS. In
> production, the host app must import Simplest UI CSS plus
> `@luisrodonccs/simplest-ui/components/drawer`. Package-assets mode is invalid
> because this package renders a Web Component requiring JavaScript.

**Changed fixture files:**

- `workbench/resources/css/simplest-ui.css`
- `workbench/resources/js/simplest-ui.js`
- `workbench/resources/views/welcome.blade.php`

The response satisfies the required workbench and production asset distinction,
selects the correct registered primitive and entrypoint, and rejects CSS-only
package-assets mode for a package that renders a Web Component. The generated
JavaScript passed `node --check`.

Re-run the full set after material changes to the skill, manifest, or public API.
