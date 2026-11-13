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

## Pending v0.2.0 integration evaluation

Prompts 4 and 5 were added with the Vanilla and Laravel integration workflows.
They have not yet been formally evaluated. Run all five prompts against a fixture
that includes a Laravel application and a Composer package workbench before
publishing the updated skill.

The original checks in [README.md](./README.md) passed. Re-run the full set after
material changes to the skill, manifest, or public API.
