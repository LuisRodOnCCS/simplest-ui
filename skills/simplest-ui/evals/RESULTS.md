# OpenCode evaluation results

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
Re-run the full set after material changes to the skill, manifest, or public API.
