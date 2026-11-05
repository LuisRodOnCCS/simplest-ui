# Skill evaluation protocol

The prompts in `evals.json` evaluate the three decisions the skill must make: compose existing primitives, select an existing interactive component, and justify a new component only when composition is insufficient.

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

Record the date, agent/version, fixture revision, prompt, output, and pass/fail result in a release or pull-request discussion, or in a versioned results file such as [RESULTS.md](./RESULTS.md). Do not mark the roadmap evaluation item complete until all three prompts have been reviewed successfully.
