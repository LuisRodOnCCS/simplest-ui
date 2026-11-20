# Skill evaluation protocol

The prompts in `evals.json` evaluate decisions the skill must make: compose
existing primitives, select an existing interactive component, justify a new
component only when composition is insufficient, integrate a Laravel application,
develop a Laravel Composer package without duplicating assets, distinguish direct
usage and local wrappers from the optional Laravel adapter, supply JavaScript
in a package build when interactive components require it, and diagnose
integration findings without automatically blaming the core or the adapter.

## Run an evaluation

1. Use a clean fixture project with Simplest UI installed and `components.manifest.json` available.
2. Run each prompt with the `simplest-ui` skill enabled and record the complete response and changed files.
3. Review the response against its `expected_output` and the checks below.
4. Repeat after material changes to `SKILL.md`, the manifest, or the public API.

## Checks

- Existing UI requests select documented `ui-*` classes and registered `sui-*` elements.
- The response does not invent an unregistered Custom Element such as `sui-card`.
- Interactive patterns use the documented entrypoint rather than recreating keyboard or ARIA behavior.
- New component proposals explain why composition is insufficient and include tokens, accessibility, tests, manifest, visual catalog, and changelog updates.
- The response names the selected primitive and any required import.
- Laravel application requests select `laravel-vite`; the application owns the
  Vite imports for `tokens.css`, either `styles.css` or the required base and
  component styles, and Web Component JavaScript.
- Laravel Composer package requests select `laravel-package`; package views render
  compatible markup without copying `dist`. Package assets are exclusive with
  host assets and include the CSS and JavaScript required by rendered elements,
  together with the upstream license.
- Direct Laravel usage does not assume `x-sui::*` exists. Existing local Blade
  wrappers retain their registered names; the optional Laravel adapter uses its
  own documented namespace and currently implemented asset contract.
- Diagnostic responses identify the installed version and asset source, compare
  against that version's contract, and inspect rendered HTML and loaded assets.
- Diagnostic responses classify the cause, state confidence and missing evidence,
  and name the repository that owns the smallest appropriate fix.
- Missing documented attributes in a wrapper are not treated as a core defect, and
  a reproducible failure of correct documented markup is not blamed on the
  consumer.
- Browser-specific observations are not promoted to universal requirements
  without reproduction across the supported engines.

Record the date, agent/version, fixture revision, prompt, output, and pass/fail result in a release or pull-request discussion, or in a versioned results file such as [RESULTS.md](./RESULTS.md). Historical results do not constitute a run of newly added or revised prompts.
