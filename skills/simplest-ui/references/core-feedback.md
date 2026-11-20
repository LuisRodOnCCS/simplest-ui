# Diagnosing integration findings

Use this workflow when a consumer reports that Simplest UI markup, styles or
behavior does not match its documentation or expectations. The goal is an
evidence-based classification and the smallest fix in the repository that owns it,
not an immediate change to the core or to the consumer.

## 1. Identify what is installed

Record before reasoning about the fix:

- The installed `@luisrodonccs/simplest-ui` version.
- Where it came from: registry package, local tarball, linked or vendored checkout,
  or a build copied into the consumer.
- Who owns the loaded assets: the host application, a framework adapter, a package
  build, a CDN, or a mix.
- Which CSS entrypoints and Web Component imports the rendered page actually loads.

A linked checkout or the latest upstream source does not describe an older
installed package. Compare the consumer with the contract for its installed
version first, then state whether the current checkout differs.

## 2. Inspect the rendered surface

Read what the browser receives, not only the framework templates:

- Generated or rendered HTML, including attributes added or dropped by a wrapper.
- The CSS files and layers actually loaded, and whether more than one copy is
  present.
- The JavaScript entrypoints required by the rendered elements.
- The component manifest, official markup, documentation and tests for that
  version.

Duplicate assets, an outdated bundle, or a missing behavior import can reproduce a
defect that no source change would fix.

## 3. Reproduce independently

When feasible, reduce the finding to static HTML plus the public package assets.
Keep framework-specific behavior out of the reproduction. State what could not be
reproduced and why.

Do not substitute programmatic `.focus()` for sequential keyboard navigation when
the finding is about reachability. Distinguish:

- real keyboard navigation and visible focus;
- activation and focus transfer to the intended target;
- pointer focus;
- automation or browser configuration differences;
- an implementation defect.

Treat a single-engine observation as a hypothesis until evidence covers the
supported engines or the report names the exact configuration.

## 4. Classify the cause

Assign one or more of these categories and state confidence and missing evidence:

- consumer misuse or configuration;
- adapter implementation defect;
- core implementation defect;
- missing or inconsistent core documentation, metadata or tests;
- version drift, duplicate assets or build/distribution issue;
- environment or tooling behavior;
- inconclusive.

Multiple causes may contribute. A wrapper defect and missing upstream metadata can
coexist. Do not default to blaming either the core or the adapter.

## 5. Recommend the smallest fix

Name the repository that owns the fix and the smallest change that addresses the
classified cause:

- Consumer: correct usage, load the documented entrypoints once, remove duplicate
  assets.
- Adapter: fix the wrapper markup or behavior while consuming documented core APIs.
- Core: change behavior only when a framework-independent reproduction shows the
  documented markup itself failing.
- Documentation, metadata or tests: make an existing requirement discoverable or
  verifiable when runtime behavior is already correct.

Avoid inventing `ui-*` classes, `sui-*` elements or unsupported APIs. Do not modify
another repository, publish, or implement a speculative core extension without
authorization. Fix the upstream skill source rather than editing an installed copy;
synchronize copies afterward.

## Response format

Every diagnostic response includes:

1. **Finding** — the observed mismatch in one sentence.
2. **Versions and source** — installed version, package source, asset owner.
3. **Reproduction** — minimal steps or fixture, and what could not be reproduced.
4. **Observed behavior** — evidence from rendered HTML, loaded assets or tests.
5. **Expected contract** — the documented markup, metadata or behavior for that
   version.
6. **Classification and confidence** — categories, confidence, missing evidence.
7. **Owning repository** — consumer, adapter, core, distribution or tooling.
8. **Proposed action** — the smallest fix, explicitly scoped to that repository.
9. **Regression tests** — the check that would prevent recurrence, such as a
   keyboard test, a markup assertion, a manifest check or a bundle inspection.
