# Diagnostic workflow evaluation — 2026-11-19

These are actual runs of prompts 9–15 in `evals.json` after adding
`references/core-feedback.md` and the markup contracts. They are not historical
results and not predictions.

## Protocol and limitations

- **Date:** 2026-11-19.
- **Skill sources:** `skills/simplest-ui/SKILL.md`, `references/catalog.md`,
  `references/core-feedback.md`, `references/integrations.md`, and the repository
  `components.manifest.json` at version `0.2.1`.
- **Agent:** independent general subagents from the same harness, instructed to
  read the skill sources before answering. The evaluator did not select a model;
  the harness default applied. Each run started from a fresh context.
- **Fixture:** the connected Simplest UI repository at `R:\Laragon\www\simplest-ui`
  was treated as the installed 0.2.1 package. No consumer project was modified.
  No files changed during the runs.
- **Scope:** the runs test diagnosis and classification after the skill is loaded.
  They do **not** test automatic skill selection or invocation, and they do not
  replace a packaged-tarball replay.

## Summary

| ID | Scenario | Result | Classification reached |
| --- | --- | --- | --- |
| 9 | Blade wrapper omits documented table attributes | Pass | Consumer-owned wrapper defect; core unchanged |
| 10 | Missing focus indicator with only `styles.css` | Pass after prompt correction | Consumer configuration: `tokens.css` not loaded |
| 11 | Forced two-column grid overflows at 320px | Pass | Consumer composition; use `ui-grid--auto` |
| 12 | Runtime correct but integration guidance missing | Pass | Missing/inconsistent documentation and metadata |
| 13 | Vendored 0.1.0 plus npm 0.2.1 assets | Pass | Version drift and duplicate assets |
| 14 | Auth screens and demo widths requested in core | Pass with note | Consumer/demo composition; no core primitive |
| 15 | WebKit Tab skips the skip link | Pass | Environment/tooling; no universal `tabindex="0"` |

## Case 9 — wrapper omits documented table attributes

**Prompt:** "Our Blade wrapper renders `<div class="ui-table-wrap"><table
class="ui-table">...</table></div>`. QA says the scrolling table is not reachable
with the keyboard. We installed `@luisrodonccs/simplest-ui` 0.2.1 from npm. What
should we change?"

**Result:** Pass.

**Response:**

> ## Finding
> The `ui-table-wrap` scroll container is missing the documented `tabindex="0"`
> (plus its region role and accessible name), so it never enters the Tab order.
>
> **Versions and source**
> - Installed: `@luisrodonccs/simplest-ui` **0.2.1**, from the npm registry.
> - Asset owner: the host Laravel application (Vite imports in `resources/css` /
>   `resources/js`).
> - Table is a **CSS component only** (`ui-table-wrap`, `ui-table`); there is no
>   `sui-table`, so no Web Component import is involved. Nothing new needs
>   importing.
>
> **Reproduction**
> Render the current wrapper with only `tokens.css`/`styles.css` (or `base.css` +
> `components.css`) loaded, then press Tab from the content above the table.
> Focus skips the table entirely. I could not reproduce a focus-style problem in
> this environment, and no engine was named — if QA's report came from a single
> browser, treat the exact engine behavior as unconfirmed until re-checked.
>
> **Observed behavior**
> Your markup supplies `class`, and nothing else, on the scroll container.
> `ui-table-wrap` sets `overflow-x`, which creates a scrollable box; a scroll
> container with no `tabindex` and no focusable children is not keyboard-
> reachable, so its scrolled content cannot be reached by keyboard users.
>
> **Expected contract (0.2.1)**
> Per `components.manifest.json` → `table`:
>
> ```html
> <div class="ui-table-wrap" role="region" aria-label="Users" tabindex="0">
>   <table class="ui-table">
>     <caption class="sr-only">Users</caption>
>     ...
>   </table>
> </div>
> ```
>
> Required: region role + accessible name on the scroll container;
> `tabindex="0"` for keyboard reachability; an accessible name on the table
> (caption preferred). Recommended: keep caption and region label consistent.
>
> **Classification and confidence**
> - Consumer misuse — **high confidence**. The wrapper is consumer-owned and
>   omits all three required attributes.
> - Not a core defect: the documented markup is already correct for 0.2.1.
> - Missing evidence: which engine QA used, and whether the wrapper drops
>   attributes when rendering.
>
> **Owning repository**
> Your Laravel application (the Blade wrapper). Do not change the core package.
>
> **Proposed action**
> Pass a label into the wrapper and emit the required attributes in the Blade
> file:
>
> ```blade
> @props(['label' => 'Users'])
>
> <div class="ui-table-wrap" role="region"
>      aria-label="{{ $label }}" tabindex="0">
>     <table class="ui-table">
>         <caption class="sr-only">{{ $label }}</caption>
>         {{ $slot }}
>     </table>
> </div>
> ```
>
> Two things to check in your app:
> 1. `sr-only` must exist in your loaded CSS. Bootstrap calls it
>    `visually-hidden`; Tailwind ships `sr-only`. Use whichever the host provides
>    — don't invent a `ui-` class for it.
> 2. Verify the wrapper doesn't strip unknown attributes, since Blade components
>    drop non-prop attributes unless you forward them.
>
> **Regression tests**
> - Markup assertion: rendered wrapper contains `role="region"`, a non-empty
>   `aria-label`, and `tabindex="0"`; the `<table>` has an accessible name.
> - Keyboard test: sequential Tab reaches the wrapper and shows a visible focus
>   ring (not programmatic `.focus()`), then Tab continues to the next control.
> - Optional manifest check that pins the 0.2.1 table contract so a future
>   upgrade surfaces contract changes.

**Assessment:** Correctly quoted the installed table contract, kept the fix in
the consumer-owned wrapper, and did not propose core CSS. The "consumer misuse"
label is accurate for a consumer-owned wrapper; the expected adapter-defect
category would apply when the wrapper belongs to an adapter package.

## Case 10 — missing focus indicator with only `styles.css`

**Prompt (revised):** "Static HTML using the exact 0.2.1 documented table wrapper
with `role=region`, `aria-label`, `tabindex=0` and a caption shows no visible
focus when tabbed. Only the installed public `styles.css` is loaded;
`tokens.css` is not loaded and there are no duplicate assets. Determine the
cause."

**Result:** Pass after the prompt correction described below.

**Response:**

> ## Finding
> The table wrapper is reachable and focused, but its focus indicator is
> invisible because `styles.css` uses the token `--sui-focus-ring`, and that
> token only exists in `tokens.css`, which the page does not load.
>
> ## Versions and source
> - Installed: `@luisrodonccs/simplest-ui` 0.2.1 (manifest `version`).
> - Source: connected repository `R:\Laragon\www\simplest-ui`, matching the
>   published `dist/` artifacts (inspected `dist/styles.css` and
>   `dist/tokens.css`).
> - Asset owner: you (static page, own `<link>` tags), loading the public
>   `styles.css` export only. No adapter, CDN, duplicate copies, or `dist`
>   override is involved.
>
> ## Reproduction
> Markup matches the 0.2.1 contract exactly (`components.manifest.json` →
> `cssComponents.table.markup`): `.ui-table-wrap` with `role="region"`,
> `aria-label`, `tabindex="0"`, containing `.ui-table` and
> `<caption class="sr-only">`. Only `styles.css` is linked. I compared the
> shipped CSS rather than running a browser; the browser engine used and the
> exact `<link>` order are the only unverified details.
>
> ## Observed behavior
> - `dist/styles.css` bundles `@layer sui.reset, sui.base, sui.components`
>   (reset, base, components) and contains **no `:root` block** and **no
>   `--sui-focus-ring:` definition**.
> - `dist/styles.css` reset layer: `:focus-visible { outline: none;
>   box-shadow: var(--sui-focus-ring); }`
> - `dist/styles.css` components layer: `.ui-table-wrap:focus-visible {
>   outline: none; box-shadow: var(--sui-focus-ring); }`
> - `dist/tokens.css`: `:root { … --sui-focus-ring: 0 0 0 3px #6366f126; … }`
>   plus the dark-theme override.
> - With the custom property undefined and no fallback, `box-shadow:
>   var(--sui-focus-ring)` is invalid at computed-value time and falls back to
>   the initial value `none`, while `outline: none` still applies. Net effect: no
>   visible focus. Same behavior in every engine, not one browser.
>
> ## Expected contract
> 0.2.1 requires two entrypoints, in order: `tokens.css` **then** `styles.css`
> (`README.md` line 37: "Import `tokens.css` first"; `styles.css` is the
> complete ordered bundle of reset/base/components, not a bundle that includes
> token values). Focus is also expected to be visible, per the table's
> keyboard-reachability requirement for `tabindex="0"`.
>
> ## Classification and confidence
> - Primary: **consumer misuse or configuration** — the required token
>   entrypoint is missing. High confidence.
> - Secondary (optional, upstream): **missing or inconsistent core
>   robustness/metadata** — a token-only focus treatment with no fallback makes
>   the failure silent, and nothing in `styles.css` signals that tokens are
>   mandatory. Medium confidence; no evidence yet that any doc claims
>   `styles.css` alone is sufficient.
> - Not implicated: wrapper markup, duplication, version drift, adapter,
>   environment.
>
> ## Owning repository
> Consumer page — asset loading. No core or adapter change is required to fix
> this report.
>
> ## Proposed action
> Add the token stylesheet once, before the existing one:
>
> ```html
> <link rel="stylesheet" href="/node_modules/@luisrodonccs/simplest-ui/dist/tokens.css">
> <link rel="stylesheet" href="/node_modules/@luisrodonccs/simplest-ui/dist/styles.css">
> ```
>
> Point both at the package's public exports rather than copied files, and keep
> this the only Simplest UI load per document. No markup or class changes. Only
> if the upstream project authorizes a core change, consider a fallback such as
> an explicit focus ring color in the focus rule so a missing token degrades to a
> visible outline instead of none; that is an enhancement, not the fix for this
> report.
>
> ## Regression tests
> 1. Playwright keyboard test: Tab to the documented table wrapper with only
>    documented entrypoints loaded; assert `getComputedStyle(el).boxShadow !==
>    "none"` or a nonzero outline.
> 2. Bundle assertion: `styles.css` contains no `:root` token definitions, so
>    docs/tests treat `tokens.css` as mandatory.
> 3. A docs example check that every snippet linking `styles.css` also links
>    `tokens.css` first.

**Correction note:** the first wording of this prompt said the page loaded "only
the installed public `styles.css`" and the expected output demanded a core
implementation defect. The first run showed that `styles.css` never contained the
token layer by design, so the premise contradicted the documented install
contract. The prompt was made explicit about the missing `tokens.css`, the
expected output was corrected, and the case was rerun. The response above is from
the rerun. Both runs independently rejected a core defect.

## Case 11 — forced two-column grid overflows

**Prompt:** "Our Laravel dashboard uses `<div class="ui-grid"
style="grid-template-columns: 1fr 1fr">` and overflows horizontally at 320px.
Simplest UI 0.2.1 is installed through the host application. Fix the layout."

**Result:** Pass.

**Response:**

> ## Finding
> The dashboard overflows at 320px because a fixed two-column grid is forced with
> an inline style; Simplest UI's adaptive grid primitive is not being used.
>
> ## Versions and source
> - `@luisrodonccs/simplest-ui` **0.2.1**, installed from the registry into the
>   host Laravel application.
> - Asset owner: **the host application** (`laravel-vite` workflow). The app owns
>   `resources/css` / `resources/js` and loads Simplest UI once via Vite — nothing
>   to change in the package.
>
> ## Reproduction
> Reduce to static HTML with the public assets: `tokens.css` + `base.css` +
> `components.css` (or the full `styles.css`) plus the `<div class="ui-grid"
> style="grid-template-columns: 1fr 1fr">` markup, then viewport-test at 320px.
> Not reproduced in-browser here, so the specific overflowing child (long token,
> table, or fixed-width widget) is unconfirmed.
>
> ## Observed behavior
> `ui-grid` applies a grid container, but the inline `grid-template-columns`
> overrides any responsive behavior and pins two tracks. Two `1fr` tracks still
> honor each item's min-content width, so wide children push the container past
> 320px.
>
> ## Expected contract
> The 0.2.1 manifest documents the grid as `ui-grid` + `ui-grid--auto`, with
> **required**: "Use `ui-grid--auto` when the column count must adapt to the
> viewport", and **recommended**: "Do not force a fixed column count for content
> that must reflow on narrow screens". `ui-grid--auto` is the supported
> primitive; no responsive column modifier is published in 0.2.1.
>
> ## Classification and confidence
> - **Consumer misuse / configuration** — high confidence (inline style
>   contradicts the documented contract; no core defect implied).
> - Secondary possibility: an individual child with intrinsic min-width — low
>   confidence, needs evidence.
>
> ## Owning repository
> **Consumer (your Laravel app).** No core or adapter change is warranted.
>
> ## Proposed action
> Remove the inline style and use the adaptive primitive:
>
> ```blade
> <div class="ui-grid ui-grid--auto">
>     ...
> </div>
> ```
>
> If a strict two-up layout is still wanted at wider viewports, add a host-level
> media query scoped to your own class or a container — do **not** invent
> `ui-grid--two` or any `ui-*` modifier. If a child still overflows, give that
> child `min-width: 0` (grid items) and wrap any table in `ui-table-wrap` with
> `role="region"`, an accessible name, and `tabindex="0"`.
>
> Confirm the page loads `tokens.css` before `base.css` + `components.css` (or
> `styles.css`); layout primitives require `base.css`. Plain Blade + `ui-*`
> classes need no JavaScript import.
>
> ## Regression tests
> - Markup assertion / Blade snapshot: no `ui-grid` element carries an inline
>   `grid-template-columns`; grid containers use `ui-grid--auto`.
> - Browser check at 320px: `document.documentElement.scrollWidth <=
>   clientWidth` (no horizontal overflow) for the dashboard route.
> - If tables are present, a test asserting the `ui-table-wrap` region
>   attributes.

**Assessment:** Correct classification and smallest fix. It did not add a
primitive or blame the core.

## Case 12 — correct runtime, missing integration guidance

**Prompt:** "Our direct Blade usage renders and behaves correctly with Simplest
UI 0.2.1 from npm, but our team cannot find whether `x-sui::*` exists or which
asset mode applies. Improve the situation."

**Result:** Pass.

**Response:**

> **Finding** — Your direct Blade usage is correct for what you installed, but
> the two questions you're stuck on ("does `x-sui::*` exist?" and "which asset
> mode applies?") are answered in different places and are not discoverable from
> the npm package alone.
>
> **Versions and source** — `@luisrodonccs/simplest-ui` 0.2.1, installed from the
> npm registry. Compiled assets are loaded from your Laravel app's Vite build
> (`resources/css` + `resources/js`). No Composer adapter package is reported as
> installed, and there is no separate public `dist` copy in use.
>
> **Reproduction** — Not required to reproduce: the finding is discoverability,
> not a rendering defect. You confirm render and behavior already match. What I
> could not verify: your exact `resources/css`/`resources/js` import list, and
> whether any `assets` vendor directory or Composer adapter provider is present.
>
> **Observed behavior** — Rendered output is correct with `ui-*` classes and
> `sui-*` elements. There is no namespace resolution for `x-sui::*` because
> nothing registers it. The 0.2.1 catalog lists 8 registered Custom Elements
> (`sui-modal`, `sui-drawer`, `sui-dropdown`, `sui-tabs`, `sui-accordion`,
> `sui-popover`, `sui-tooltip`, `sui-toast`) and a large CSS-only surface.
>
> **Expected contract** — Two distinct things:
> 1. **`x-sui::*` is not part of the npm package.** It is provided only by the
>    separate Composer adapter `luisrodonccs/laravel-simplest-ui`, when installed
>    *and* its provider is registered. Installing npm alone does not register
>    that namespace; the `laravel-package` starter's `x-sui-drawer` is a separate
>    example wrapper that requires registration too. So for your app: `x-sui::*`
>    does not exist today, and that is expected.
> 2. **Asset mode.** For a Laravel application, the stable workflow is
>    `laravel-vite`: the host app owns the assets. Default is `tokens.css` then
>    `styles.css`, plus `components.js` (or per-component imports such as
>    `components/modal`). If Tailwind/another reset owns the page foundation,
>    replace `styles.css` with `tokens.css` + `base.css` + `components.css`.
>    "Package-assets mode" only applies to a Laravel *Composer package* that
>    ships prebuilt artifacts; it does not apply to a plain Laravel application,
>    and it must never be `vendor/simplest-ui` or a copied `dist`.
>
> **Classification and confidence** — Missing or inconsistent
> documentation/metadata (high confidence), with consumer configuration unclear
> (medium). No core defect indicated: render and behavior already match the
> contract.
>
> **Owning repository** — Primary fix belongs to the Simplest UI core docs/README
> surface (make "is there a Blade adapter?" and "which asset mode for a Laravel
> app?" answerable without cross-reading two packages). Secondary, in your app:
> record your chosen entrypoints.
>
> **Proposed action**
> - In your app: state explicitly that you use `laravel-vite` host-owned assets,
>   list the exact CSS and JS imported once per document, and note that
>   `x-sui::*` is unavailable unless you add
>   `luisrodonccs/laravel-simplest-ui`.
> - In the Simplest UI repo: add a short decision table to the README/docs —
>   npm-only vs Composer adapter, and app vs Composer package asset ownership —
>   so this question is answered in one place.
>
> **Regression tests** — A docs/README assertion that the README names the
> adapter package and states the `laravel-vite` asset owner; a check that no
> starter registers `x-sui::*`; and a bundle inspection confirming one Simplest
> UI CSS/JS load per document.

**Assessment:** Correctly separated adapter namespace from npm assets and did not
invent `x-sui::*`.

## Case 13 — mixed 0.1.0 and 0.2.1 assets

**Prompt:** "An app loads a vendored Simplest UI 0.1.0 stylesheet and also imports
tokens and components from `@luisrodonccs/simplest-ui` 0.2.1. Table focus and
spacing differ between pages. Diagnose it."

**Result:** Pass.

**Response:**

> **Finding** — Table focus and cell spacing differ between pages because two
> Simplest UI versions are loaded in the same document: a vendored 0.1.0
> stylesheet plus the 0.2.1 `tokens.css` and `components.css` imports.
>
> **Versions and source**
> - Installed package: `@luisrodonccs/simplest-ui` 0.2.1
>   (`components.manifest.json` → `"version": "0.2.1"`).
> - Second copy: a vendored 0.1.0 stylesheet committed into the app, not resolved
>   from npm.
> - Asset owner: the host application — a mix of vendored and package assets,
>   where the contract is one Simplest UI load per document.
> - Entrypoints in play: 0.1.0 vendored `styles.css` (reset + `:root` tokens +
>   all components) plus 0.2.1 `tokens.css` and `components.css`.
>
> **Reproduction** — Reduce one page to the documented table markup and render
> it twice: once with only the vendored 0.1.0 `styles.css`, once with only 0.2.1
> `tokens.css` + `components.css`. Compare `getComputedStyle` on
> `.ui-table-wrap` (`box-shadow`, `outline`) and on `th`/`td` (`padding`). I
> could not reproduce the cross-page divergence itself: it depends on the real
> per-page load order, which the request doesn't include. That the difference is
> *per page* is the strongest signal it's cascade order, not a changed token
> value — the 0.1.0 → 0.2.1 source diff shows no change to
> `src/tokens/spacing.css` or `src/components/table.css`.
>
> **Observed behavior** — Both copies define the same document-wide surface:
> `:root` `--sui-*` tokens, the reset, and `.ui-table-wrap` / `.ui-table` rules.
> The 0.2.1 `dist` was rebuilt with Lightning CSS, which reorders declarations
> and adds `--lightningcss-light`/`--lightningcss-dark` to `:root` (CHANGELOG
> `[0.2.1]`). The sheets therefore aren't byte-identical even where source
> matches, and the later sheet wins per declaration. Spacing comes from
> `--sui-space-2-5` / `--sui-space-3-5` on `.ui-table th, td`; the focus
> indicator comes from `--sui-focus-ring` on `.ui-table-wrap:focus-visible`.
> Both are token-driven, so whichever `:root` lands last — differing per page —
> decides both symptoms.
>
> **Expected contract** — Table is a CSS component (`ui-table-wrap`, `ui-table`),
> never a `sui-*` element. Focus belongs on the scroll container via
> `box-shadow: var(--sui-focus-ring)` with `outline: none`; cells use the spacing
> tokens. Integration rules: import `tokens.css` before the component sheet,
> load Simplest UI once per document, and keep package and host asset loading
> mutually exclusive. The current setup breaks both.
>
> **Classification and confidence** — *Version drift / duplicate assets*: high
> confidence, primary cause. *Consumer misuse or configuration* (two copies plus
> per-page import-order drift): high. *Missing or inconsistent core
> documentation*: plausible but secondary — the skill forbids duplicate loads
> but never names the mixed 0.1.0/0.2.x symptom. Not a core defect: no evidence
> the documented 0.2.1 markup fails standalone. Missing evidence: actual
> per-page load order, whether a page stylesheet also sets `--sui-space-*`, and
> the 0.1.0 dist bytes (only the tag's source was inspected).
>
> **Owning repository** — The consumer app. No Simplest UI core change is
> warranted.
>
> **Proposed action** — In the consumer: remove the vendored 0.1.0 stylesheet
> and its `<link>`; load Simplest UI once from 0.2.1 — `tokens.css` first, then
> `styles.css`, or `base.css` + `components.css` when another reset owns the
> page. Keep one import site so every page shares a single cascade order, and
> drop any page-level overrides of `--sui-space-*` or `--sui-focus-ring`. If Web
> Components render, add the matching `components.js` or per-component imports;
> any vendored 0.1.0 JS must go too.
>
> **Regression tests** — A build assertion that Simplest UI CSS appears exactly
> once and only one version resolves; a Playwright check that computed
> `box-shadow` on `.ui-table-wrap:focus-visible` and `padding` on `th`/`td`
> match across two representative pages; and a lockfile-vs-vendored version
> check.

**Assessment:** Correctly identified version drift and duplicate ownership
without inventing a core regression.

## Case 14 — auth screens and demo widths in core

**Prompt:** "Add authentication screens and the fixed panel widths from our
Laravel workbench demo to Simplest UI core so other consumers get them."

**Result:** Pass with note.

**Response:**

> **Finding** — The requested auth screens and "fixed panel widths" are already
> expressible with existing core primitives; promoting them verbatim would add
> demo-only sizing and a page pattern to the public core surface without a
> missing primitive to justify it.
>
> **Versions and source** — `@luisrodonccs/simplest-ui` 0.2.1, evaluated from the
> upstream source checkout, not an installed consumer bundle. Manifest reports
> `ui-`/`sui-`/`--sui-` prefixes and `pages: [dashboard]` only.
>
> **Reproduction**
> 1. Open `workbench/resources/views/auth-sign-in.blade.php` and
>    `auth-register.blade.php`.
> 2. Read `workbench/resources/css/simplest-ui.css` lines 8–14 and
>    `resources/views/partials/shell.blade.php` lines 1–14.
> 3. Compare `src/tokens/spacing.css` and `src/styles/base.css`.
> Could not reproduce a runtime core defect because this is a source-extension
> request, not a rendering mismatch.
>
> **Observed behavior** — Both screens compose `ui-container` + `ui-stack`
> (adapter auth shell), then `ui-card`, `ui-field`, `ui-input`, `ui-checkbox`,
> and `ui-button`. The only panel sizing is `.workbench-auth-example`:
> `width: 100%; max-width: var(--sui-container-sm); margin-inline: auto;
> padding-block: var(--sui-space-6)`, explicitly commented as workbench-only.
> Core already ships `--sui-container-sm: 640px` and `--sui-sidebar-width:
> 240px`; `ui-app-shell` consumes the sidebar token. No fixed widths exist
> outside those tokens.
>
> **Expected contract** — Authoring requires semantic `--sui-*` tokens, not
> literal visual values, and new components only when composition cannot
> express a reusable pattern. The catalog provides every primitive the auth
> screens use. A page example belongs in documentation, not as new `ui-*`
> classes.
>
> **Classification and confidence** — Missing/inconsistent documentation and
> metadata (medium-high), plus consumer-demo scoping rather than a core defect.
> No core implementation defect. Evidence gap: no maintainer decision recorded
> on whether an auth page belongs in the visual catalog.
>
> **Owning repository** — Core, limited to documentation/catalog metadata. No
> adapter change: the Laravel `variant="auth"` shell is already adapter-owned
> and correctly consumes core primitives.
>
> **Proposed action**
> 1. Do **not** add a `ui-auth` class, `ui-panel` width, or literal pixel panel
>    widths. The "fixed widths" are demo sizing; public width changes should
>    remain semantic tokens.
> 2. Add `docs/pages/auth.html` as an example page using existing classes and
>    register it under `pages` in `components.manifest.json`; regenerate
>    `docs/catalog.json` via `npm run catalog:generate`.
> 3. If maintainers instead want a first-class auth layout, treat it as an
>    extension and state the composition gap before implementing. Required
>    surface work: manifest `layouts`/`pages`, catalog regeneration, README,
>    changelog, tests (markup and accessibility assertions), docs build,
>    `npm pack --dry-run`, and JSX declarations only if a new `sui-*` element
>    appears (none is warranted). No new behavior import is needed.
>
> **Asset ownership (Laravel Composer package)** — Workbench development assets
> are owned by the workbench Vite entrypoint (`workbench/resources/css/
> simplest-ui.css`, importing `tokens.css` then `styles.css`, plus the JS
> entry). Production assets default to the host application, loading Simplest
> UI once. Package-assets mode is valid only as separately selected, mutually
> exclusive compiled public exports with the upstream license and published
> package artifacts; it must not copy `dist`, and CSS alone is insufficient if
> Web Component behavior is rendered.
>
> **Regression tests** — Manifest/catalog check that the auth page exists and
> uses documented classes; grep/CSS assertion preventing literal panel widths
> from entering core; form-label and autocomplete assertions in the page
> fixture; `npm run docs:build` and `npm pack --dry-run` in CI.

**Assessment:** Pass on the required decision: it rejected core primitives and
fixed demo widths, and kept the auth shell adapter-owned. The optional
suggestion to add an upstream documentation page is a maintainer decision, not
a reusable-gap claim, and does not add public API.

## Case 15 — WebKit skips the skip link

**Prompt:** "In Playwright WebKit, pressing Tab after page load skips over our
`ui-skip-link`. Add `tabindex=0` to the required `ui-skip-link` markup
everywhere."

**Result:** Pass.

**Response:**

> Not as a universal contract change — this is a single-engine tab-order
> observation, and the existing contract already scopes it. Details below.
>
> **Finding** — In Playwright WebKit, sequential Tab after load does not reach
> the documented `ui-skip-link` anchor; a universal `tabindex="0"` is proposed as
> the fix.
>
> **Versions and source** — `@luisrodonccs/simplest-ui@0.2.1`, registry package
> (not a linked checkout). The skip link is a CSS-only layout primitive from
> `base.css`; no `sui-*` behavior is involved. In this Laravel Composer package,
> the workbench Vite entrypoints own demo assets, and the host application owns
> production CSS/JS; package-assets mode is irrelevant here because the skip
> link needs no Web Component JavaScript.
>
> **Reproduction** — Static fixture: the manifest markup plus
> `tokens.css`/`base.css`, loaded once, then `keyboard.press('Tab')` and read
> `document.activeElement`. I could not reproduce a core defect: the failure
> appears only under WebKit, and I have no evidence from Chromium, Firefox, or a
> real assistive-technology run.
>
> **Observed behavior** — WebKit applies its own link-tabbing preference; links
> are excluded from sequential Tab order in that configuration. Nothing in the
> rendered HTML or loaded CSS suppresses focus.
>
> **Expected contract** — For 0.2.1, `skip-link` *requires* only: first focusable
> element, `href` at the main landmark id, and `tabindex="-1"` on that target.
> `tabindex="0"` on the anchor is explicitly *recommended-conditional*: test
> whether the target engine needs it, "instead of treating it as a universal
> requirement."
>
> **Classification and confidence** — Environment/tooling behavior, high
> confidence; consumer test configuration is a contributing possibility. Core
> implementation defect: ruled out. Missing evidence: per-engine results and the
> exact WebKit preference used in CI. A single-engine observation stays a
> hypothesis.
>
> **Owning repository** — Consumer (test/fixture configuration). Upstream core
> gains, at most, a documentation clarification — and only in
> `R:\Laragon\www\simplest-ui` with authorization; an installed skill copy or
> this consumer repo must not become the permanent fix.
>
> **Proposed action** — Smallest correct fix, scoped to your app: keep the
> documented anchor markup unchanged, and in the WebKit project either enable
> link tabbing in the browser context or add `tabindex="0"` to that one fixture,
> labelled as an engine workaround. Verify it actually helps before relying on
> it — for engines that already tab links it is redundant. If your supported
> matrix genuinely requires it, propose a core doc note under `recommended`
> upstream, which means editing `components.manifest.json`, regenerating
> `references/catalog.md` (`npm run catalog:generate`), the visual catalog,
> changelog, and running typecheck/test/build/docs:build/pack checks. Do not
> hand-edit the generated catalog.
>
> **Regression tests** — A sequential-Tab keyboard test across Chromium, Firefox
> and WebKit asserting the skip link receives focus and that activation
> transfers focus to `#main-content`; a markup assertion that the target keeps
> `tabindex="-1"`; a manifest/catalog sync check so any `required` change is
> discoverable.

**Assessment:** Correctly refused the universal change, classified the
single-engine observation as environment/tooling, and required evidence before
any contract edit. This matches the recorded Playwright reproduction: WebKit's
default Tab order excluded the anchor, while an explicit `tabindex="0"` made it
reachable in that automation configuration.
