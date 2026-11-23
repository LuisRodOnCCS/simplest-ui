# Published 0.3.0 integration audit reproductions

This directory is an independent starting point for upstream review of
[`../../DEBUGGING.md`](../../DEBUGGING.md). Start with
[`HANDOFF.md`](HANDOFF.md), which classifies the findings, lists the decisions
needed and suggests a review order. It does not use the Laravel
workbench or the current source checkout's `dist`. It is not part of the
normal test suite, and an observed historical defect is not a desired result.

## Prerequisites

- Install this repository's development dependencies, including Vite and
  `@playwright/test`, using the project's normal setup.
- Install Playwright's Chromium, Firefox and WebKit browsers.
- Install **the published npm release**, including its runtime dependencies,
  into a separate disposable directory:

  ```bash
  npm install --prefix /path/to/audit-install --no-save --ignore-scripts @luisrodonccs/simplest-ui@0.3.0
  ```

  Use an appropriate local path on Windows. Do not point at a linked checkout
  or assume this repository's current source has the same behavior.

## Run

From this repository's root:

```bash
node audits/0.3.0/reproduce.mjs /path/to/audit-install/node_modules/@luisrodonccs/simplest-ui
```

The script verifies package name/version, starts a local ephemeral Vite server
to resolve the package's `lit` imports, loads the published full CSS and JS,
and outputs one JSON record per browser, including browser and package versions.
Vite and Playwright come from this repository; the loaded assets and their
runtime dependencies must come from the supplied npm installation.

It reproduces evidence for **all 19 entries** in `DEBUGGING.md`, with a static
section comparing the published manifest, type declarations and exports, and a
browser section run in Chromium, Firefox and WebKit. Coverage is representative,
not exhaustive: for example, `SUI-AUDIT-013` covers one dynamic direction and the
all-disabled initial state, `SUI-AUDIT-017` covers connection-time class
replacement but not a later variant update, and `SUI-AUDIT-018` covers wrapper
hover with a native `disabled` button but not `aria-disabled`.

It records observations rather than asserting that historical bugs are correct,
so a successful exit is **not** a compatibility or accessibility pass. Compare
results with `DEBUGGING.md`; unexpected changes may mean a corrected package, an
environmental difference, or a broken probe.

It also includes the eight-case dynamic matrix from the Laravel adapter's
`ROADMAP.md`, reported as `MATRIX-1` through `MATRIX-8`: trigger removal and
reinsertion, focused content removal in a drawer with a custom close control,
slot reassignment in an open popover, computed description before and after
content replacement, focused tab and accordion mutation, two-instance popover
isolation and mixed-dialog disconnection in both open orders. Some entries still
represent one case rather than every variant; for example, matrix 1 does not
hover the replacement tooltip trigger, and matrix 8 does not cover reverse close
order (`SUI-AUDIT-012` does).

Generated accordion panel IDs differ per run and per browser. Normalize those
IDs before comparing output mechanically. Everything here records observations
rather than asserting that historical bugs are correct, so a successful exit is
**not** a compatibility or accessibility pass. Compare results with
`DEBUGGING.md`; unexpected changes may mean a corrected package, an
environmental difference, or a broken probe.

These probes remain a maintained reproduction set, not upstream regression
coverage. Convert individual reproductions to normal tests after reviewing the
intended contract, including negative cases, accessible names and
browser-specific behavior.

## Initial run

On 2026-11-21 the script was executed against an independent npm registry
installation of 0.3.0 using Chromium 156.0.8078.4, Firefox 157.0 and WebKit 27.2. All three
reported the historical observations described in all 19 entries and the eight
matrix cases, with the coverage limits noted above; the static section found no
missing export targets. No screen reader was used; no claim of accessibility
compliance is implied.
