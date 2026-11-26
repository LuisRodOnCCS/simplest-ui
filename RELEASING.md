# Pre-release review and release process

Operative guide for releasing `@luisrodonccs/simplest-ui` and
`@luisrodonccs/create-simplest-ui`. [`VERSIONING.md`](./VERSIONING.md) defines the
version policy; this document defines the review that must be complete before
anything is tagged or published, and the alignment required afterwards.

## Rules

- A release is a reviewed state of the repository, not a green CI result.
- Never: raise a timeout, skip a test, merge with `--admin`, publish without
  explicit authorization, edit generated artifacts by hand, or tag a commit whose
  checks are not green.
- Every change to the public surface ships in the same pull request as its
  documentation, manifest entry, tests and migration guidance.
- When a check fails, treat it as a defect until proven environmental.

## Phase 0 — Entry criteria

- [ ] The work for this release is merged into `dev`.
- [ ] The roadmap section for the version contains only finished work; anything
      pending is moved to `Backlog` before the review starts.
- [ ] The version type is agreed (patch, minor, major or pre-release) and the need
      for migration guidance is decided.
- [ ] Nothing that "must happen before the release" lives only outside the
      repository.

## Phase 1 — Version and scope

- Choose the version with the [`VERSIONING.md`](./VERSIONING.md) policy.
- Core `X.Y.Z` and generator `A.B.C` are independent; the generator declares
  `simplestUi.coreRange` pointing at the new core minor or patch.
- A `docs/migration-X.Y.Z.md` guide is required when the changelog has `Changed`
  or `Removed` entries, or when behavior changes for existing consumers.
- Pre-releases publish under a non-default dist-tag.

## Phase 2 — Alignment review (single source of truth)

| Where | What must match | Gate |
| --- | --- | --- |
| `package.json` | core `version` | source of truth |
| `package-lock.json` (root and `packages[""].version`) | core version | `npm test` |
| `components.manifest.json` | core version | `npm test` |
| `docs/contracts.json`, `docs/catalog.json`, `skills/simplest-ui/references/catalog.md` | regenerated | `npm run catalog:check` |
| `packages/create-simplest-ui/package.json` | generator version and `simplestUi.coreRange` | `npm test`, `npm run test:starter:package` |
| `CHANGELOG.md` | `## [X.Y.Z] - YYYY-MM-DD` as the first version heading, plus the migration link when one exists | `npm test` |
| `docs/migration-X.Y.Z.md` | exists, linked from the changelog section, listed in `package.json` `files` | `npm test` |
| `README.md` | `Repository version: vX.Y.Z` and process links | `npm test` |
| `ROADMAP.md` | current release line and a closed section for this version | `npm test` |
| `AGENTS.md` / `CLAUDE.md` | process references stay aligned | review |

Also required in this phase:

- [ ] Audit the history: `git log --oneline <last-tag>..dev` and confirm that
      every user-visible change appears in the changelog. A fix without an entry
      is a release blocker.
- [ ] Confirm the release notes will be written from the changelog section, not
      from an auto-generated commit list.
- [ ] Confirm nothing in the documentation or the manifest claims a version that
      this release does not ship.

## Phase 3 — Regenerate artifacts

```bash
npm run catalog:generate
git diff --stat
```

Review the diff: it must contain only artifacts regenerated from
`components.manifest.json`. Commit them together with the release metadata.

## Phase 4 — Local validation, in this order

| Gate | Command | Proves |
| --- | --- | --- |
| Types | `npm run typecheck` | libraries, docs and E2E type-check |
| Unit and coherence | `npm test` | behavior plus release metadata alignment |
| Catalogs | `npm run catalog:check` | generated artifacts are current |
| Package build | `npm run build` | entries, declarations and export list |
| Docs build | `npm run docs:build` | docs coverage, integrations and site build |
| Consumers | `npm run test:consumer` | host and SSR builds |
| Generator | `npm run test:starters` | starter generation |
| Packed generator | `npm run test:starter:package` | the generator creates an app from the packed core |
| Packed matrix | `npm run test:packed-matrix` | the published artifact in three browsers |
| Browser E2E | `npx playwright test` | behavior in chromium, firefox and webkit |
| Visual | `npm run test:visual` | baselines on Windows; update only intended changes |
| Pack contents | `npm pack --dry-run` and `--workspace @luisrodonccs/create-simplest-ui` | published file list |

## Phase 5 — CI gates

1. Push to `dev` and wait for `branch-sync`, `verify`, `packed-matrix`, `e2e` and
   `visual` on that exact commit.
2. Open the release pull request `dev` → `main` and wait for its checks. If GitHub
   reports that the branch is behind, merge `main` into `dev`, push, and wait
   again.
3. Merge with a merge commit; never with `--admin`. Wait for the `main` run.
4. Sync `dev` immediately after the merge so it contains the release commit:

   ```bash
   git switch dev
   git pull --ff-only
   git merge --no-edit origin/main
   git push origin dev
   ```

   The merge to `main` creates a commit that `dev` does not have. Without this
   step, GitHub blocks the next pull request as out of date and forces an extra CI
   cycle. The `branch-sync` job fails the next push to `dev` until it is done.

5. Record the merge commit on `main`. Tags point at exactly that commit.

## Phase 6 — Tags and GitHub releases

- Lightweight tags following the existing convention: `vX.Y.Z` for the core and
  `create-simplest-ui-vA.B.C` for the generator, both on the `main` merge commit.
- Release notes come from the changelog section, plus the
  `compare/<previous-tag>...<new-tag>` link and the install command.
- The core release is marked **Latest**.

```bash
gh release create vX.Y.Z --target <merge-sha> --title "Simplest UI vX.Y.Z" \
  --notes-file /path/to/core-notes.md
gh release create create-simplest-ui-vA.B.C --target <merge-sha> \
  --title "Create Simplest UI vA.B.C" --notes-file /path/to/generator-notes.md
gh release edit vX.Y.Z --latest
```

## Phase 7 — npm publication (manual, authorized)

Publish in dependency order, each package with its own one-time password:

```bash
git switch main && git pull && npm ci
npm publish --otp=<code>
npm publish --workspace @luisrodonccs/create-simplest-ui --otp=<code>
```

`prepublishOnly` re-runs typecheck, tests and build; if it fails, stop and fix the
release instead of bypassing it.

Verify from a clean directory, never from the workspace:

- [ ] `npm view @luisrodonccs/simplest-ui version` returns the new version.
- [ ] `npm view @luisrodonccs/create-simplest-ui version` returns the new version.
- [ ] `npm view <package> dist-tags` is correct.
- [ ] A fresh `npm create @luisrodonccs/simplest-ui` installs and builds.
- [ ] Installing the core in an empty project resolves the published tarball.

A bad published version is deprecated and superseded by a patch; a published
version is never republished.

## Phase 8 — Post-release alignment

- [ ] `ROADMAP.md`: current release line updated, section retitled and linked to
      the tag and the migration guide, pending work moved to `Backlog`.
- [ ] `CHANGELOG.md`: fresh empty `[Unreleased]` section.
- [ ] `README.md`: repository version and process links.
- [ ] The published documentation shows the released version.
- [ ] `main` is an ancestor of `dev`:

      git fetch origin
      git merge-base --is-ancestor origin/main origin/dev
      git log --oneline origin/main..origin/dev

  The log must contain only work intentionally started after the release.
- [ ] Local `dev` and `main` match their remotes; the workspace is clean.
- [ ] The release pull request is closed and `dev`/`main` are synchronized.

Definition of done: the tag, the release notes, the npm packages and the
repository documents all describe the same version.

## Flake policy

- A red test is a defect until proven otherwise; read the trace or artifact first.
- Distinguish a product bug from a test-harness limitation. When an engine needs a
  different input path, keep the assertions identical across browsers and document
  the reason next to the code.
- One re-run is allowed only for a proven infrastructure failure, and the run id
  plus the reason are recorded. Repeated re-runs hide regressions.
- Timeouts, skips and "flaky" markers are not remedies.

## Appendix A — Printable checklist

- [ ] Entry criteria met
- [ ] Version and migration scope decided
- [ ] Alignment table reviewed
- [ ] History audited against the changelog
- [ ] Artifacts regenerated and diff reviewed
- [ ] Local validation matrix green
- [ ] CI green on `dev`, on the pull request and on `main`
- [ ] `dev` synced with `main` after the merge
- [ ] Tags and GitHub releases created from the changelog
- [ ] npm publication done in order and verified from the registry
- [ ] Repository documents aligned after the release

## Appendix B — Failures this process prevents

- A fix shipped without a changelog entry: caught by the history audit in phase 2.
- A roadmap that still names an older release, or a release section with pending
  work: caught by the alignment test.
- A README pointing at a different version: caught by the alignment test.
- A migration guide that exists but is unreachable from the changelog: caught by
  the alignment test.
- `dev` falling behind `main` and blocking the next pull request: caught by the
  `branch-sync` job and the phase 5 sync step.
- A release blocked at the last minute by a test that never ran in a browser, or
  by a flake "fixed" with a re-run: caught by phases 4 and 5 and the flake policy.
