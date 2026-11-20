# Manifest schema

`components.manifest.json` is the machine-readable source of truth for the public
Simplest UI surface. It is published in the npm package and read by the agent
skill, so changes are additive unless `schemaVersion` is bumped.

## Top level

| Field | Type | Meaning |
| --- | --- | --- |
| `name` | string | Package name. |
| `version` | string | Version of the documented surface. |
| `schemaVersion` | integer | Version of this manifest schema. Current value: `1`. |
| `prefixes` | object | Reserved prefixes for Custom Elements, CSS classes and tokens. |
| `cssEntrypoints` | object | Public CSS entrypoints. |
| `webComponents` | array | Registered Custom Elements and their behavior. |
| `cssComponents` | array | CSS-only components. |
| `layouts` | array | Layout primitives. |
| `pages` | array | Full documentation pages. Pages do not declare contracts. |

## Documented CSS components and layouts

Every entry in `cssComponents` and `layouts` requires:

| Field | Type | Meaning |
| --- | --- | --- |
| `name` | string | Stable entry name. |
| `documentationId` | string | Unique id used by the documentation and catalog. |
| `classes` | string[] | Every `ui-*` class the entry owns. |
| `contract` | object | Requirements that apply to every example. |
| `examples` | array | At least one example, including `default`. |

`contract` has two string arrays:

- `required`: conditions without which the usage is incorrect.
- `recommended`: advice that improves the result but is not required.

Use the smallest honest statement. Do not invent requirements that the CSS,
tests or accessibility evidence do not support.

## Examples

Every entry must declare exactly one example with `id: "default"`.

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | string | Lowercase kebab-case, unique within the entry. |
| `label` | string | Short English fallback label. Translations stay in `docs/assets/docs.ts`. |
| `markup` | string | Copyable HTML. It must only use declared `ui-*` classes. |
| `preview` | string? | Optional HTML rendered in the visual documentation. Defaults to `markup`. |
| `required` | string[] | Requirements specific to this example. |
| `recommended` | string[] | Advice specific to this example. |

The `default` example uses the dedicated preview in `docs/assets/docs.ts`.
Every other example is rendered as a visual variant, so its preview must be
complete: replace placeholders such as `...` with concrete content, or provide a
`preview` with the full markup.

Add another example only when it changes markup, state, accessibility or
behavior. Do not add examples for isolated color, size or spacing variations
that do not change the contract. Put global requirements in `contract`, not in
every example.

The `default` example is the copyable snippet in the visual documentation.
Additional examples appear in the agent catalog and in the reference table.

## Scope

- `cssComponents` and `layouts` follow this schema and are validated.
- `webComponents` keep their existing structured fields: `tag`, `import`,
  `attributes`, `properties`, `slots`, `events` and `keyboard`.
- `pages` are documentation links only.

## Validation

`npm run catalog:generate` and `npm run catalog:check` fail when:

- `schemaVersion` is missing or not `1`;
- a documented entry has no `contract`;
- a documented entry has no `examples`, no `default` example, or duplicate ids;
- an example has no `label` or `markup`;
- a non-default example has no complete preview: its effective preview is empty or still contains `...`;
- an example uses a `ui-*` class that no entry declares;
- a `documentationId` is duplicated.

Generated artifacts, which must not be edited by hand:

- `docs/catalog.json`: navigation only.
- `docs/contracts.json`: contracts and examples for CSS components, layouts and Web Components.
- `skills/simplest-ui/references/catalog.md`: agent-facing catalog.

## Example

```json
{
  "name": "table",
  "documentationId": "table",
  "classes": ["ui-table-wrap", "ui-table"],
  "contract": {
    "required": [
      "Give every table an accessible name, preferably with a caption, visible or visually hidden."
    ],
    "recommended": []
  },
  "examples": [
    {
      "id": "default",
      "label": "Scrollable table",
      "markup": "<div class=\"ui-table-wrap\" role=\"region\" aria-label=\"Users\" tabindex=\"0\">...</div>",
      "required": [
        "Add tabindex=\"0\" to the scroll wrapper so it is reachable from the keyboard."
      ],
      "recommended": []
    }
  ]
}
```
