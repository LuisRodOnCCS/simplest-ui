# Versioning and releases

Simplest UI follows [Semantic Versioning](https://semver.org/). Release versions use the form `MAJOR.MINOR.PATCH`.

## Version policy

- **Patch** (`0.1.1`) ships backward-compatible bug fixes, documentation corrections, and non-breaking accessibility or visual fixes.
- **Minor** (`0.2.0`) ships backward-compatible features. While the project is pre-1.0, a minor release may also contain intentional public API changes; these must be documented in the changelog and migration guidance must be provided when needed.
- **Major** (`1.0.0`) ships breaking public API changes after the project has reached a stable 1.x API.

The public API includes package entrypoints, CSS classes and tokens documented as public, Custom Element names, documented attributes, properties, methods, events, and accessibility behavior.

## Pre-releases

Pre-releases append an identifier such as `-rc.1` to their target release version.

- Use a release candidate only when a release is feature-complete but needs external validation before being declared stable.
- Increment the candidate when release-blocking fixes are needed: `0.1.0-rc.1`, then `0.1.0-rc.2`.
- Publish the final `0.1.0` directly when validation is complete; it supersedes its release candidates.

Pre-releases are not selected by default by normal npm version ranges. Publish them under a non-default dist-tag such as `next` when appropriate.

## Release checklist

1. Decide the release version according to this policy.
2. Keep changes under `## [Unreleased]` in [CHANGELOG.md](./CHANGELOG.md) until the release is cut.
3. Update `package.json` and move the unreleased changelog entries into a dated version heading.
4. Run `npm run typecheck`, `npm test`, `npm run build`, `npm run test:consumer`, `npm run docs:build`, `npm run test:e2e`, and `npm pack --dry-run`.
5. Verify the CI workflow is green.
6. Commit the release metadata, create the matching Git tag (for example, `v0.1.0`), publish the package, and create the release notes from the changelog.

Do not publish, push tags, or promote a release without explicit authorization.
