import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildContracts, validateManifest } from "./lib/manifest.mjs";

const root = process.cwd();
const manifest = JSON.parse(readFileSync(resolve(root, "components.manifest.json"), "utf8"));
const integrations = JSON.parse(readFileSync(resolve(root, "integrations.manifest.json"), "utf8"));

const errors = validateManifest(manifest);
if (errors.length) {
  console.error(`components.manifest.json is invalid:\n${errors.map((error) => `- ${error}`).join("\n")}`);
  process.exit(1);
}

const documentedEntries = [...manifest.cssComponents, ...manifest.layouts];

const catalog = {
  groups: [
    {
      id: "foundations",
      label: "Foundations",
      items: [
        { id: "overview", label: "Overview", kind: "foundation" },
        { id: "installation", label: "Installation", kind: "foundation" },
        { id: "tokens", label: "Tokens", kind: "foundation" },
        { id: "support", label: "Support", kind: "foundation" }
      ]
    },
    {
      id: "agents",
      label: "Agents",
      items: [{ id: "agent-skill", label: "Simplest UI skill", kind: "agent" }]
    },
    {
      id: "integrations",
      label: "Integrations",
      items: integrations.starters.map((entry) => ({
        id: entry.documentationId,
        label: entry.label,
        kind: "integration"
      }))
    },
    {
      id: "css-components",
      label: "CSS components",
      items: manifest.cssComponents.map((entry) => ({ id: entry.documentationId, label: title(entry.name), kind: "css" }))
    },
    {
      id: "web-components",
      label: "Web Components",
      items: manifest.webComponents.map((entry) => ({ id: entry.documentationId, label: title(entry.tag.replace(/^sui-/, "")), kind: "web-component" }))
    },
    {
      id: "layouts",
      label: "Layouts",
      items: manifest.layouts.map((entry) => ({ id: entry.documentationId, label: title(entry.name), kind: "layout" }))
    },
    {
      id: "pages",
      label: "Pages",
      items: manifest.pages.map((entry) => ({ id: entry.documentationId, label: title(entry.name), kind: "page", href: `./${entry.path.replace(/^docs\//, "")}` }))
    }
  ]
};

const markdown = [
  "# Simplest UI catalog",
  "",
  "Generated from `components.manifest.json` by `npm run catalog:generate`. Do not edit manually.",
  "",
  "Read `components.manifest.json` in the repository root first; it is the machine-readable source of truth.",
  "",
  "## Registered Web Components",
  "",
  "| Element | Import | Keyboard |",
  "| --- | --- | --- |",
  ...manifest.webComponents.map((entry) => `| \`${entry.tag}\` | \`${entry.import}\` | ${entry.keyboard.join(", ") || "None"} |`),
  "",
  "## CSS components",
  "",
  ...manifest.cssComponents.map((entry) => `- **${title(entry.name)}**: ${entry.classes.map((name) => `\`${name}\``).join(", ")}`),
  "",
  "## Layouts",
  "",
  ...manifest.layouts.map((entry) => `- **${title(entry.name)}**: ${entry.classes.map((name) => `\`${name}\``).join(", ")}`),
  "",
  "## Markup contracts",
  "",
  "Each documented entry declares a contract and one or more examples. Start with the `default` example.",
  "",
  ...documentedEntries.flatMap((entry) => [
    `### ${title(entry.name)}`,
    "",
    ...(entry.contract.required.length ? ["Required:", ...entry.contract.required.map((item) => `- ${item}`), ""] : []),
    ...(entry.contract.recommended.length ? ["Recommended:", ...entry.contract.recommended.map((item) => `- ${item}`), ""] : []),
    ...entry.examples.flatMap((example) => [
      `#### ${example.label} (\`${example.id}\`)`,
      "",
      "```html",
      example.markup,
      "```",
      "",
      ...(example.required.length ? ["Required for this example:", ...example.required.map((item) => `- ${item}`), ""] : []),
      ...(example.recommended.length ? ["Recommended for this example:", ...example.recommended.map((item) => `- ${item}`), ""] : [])
    ])
  ]),
  "## Integrations",
  "",
  ...integrations.starters.map((entry) => `- **${entry.label}** (${entry.status}): \`${entry.id}\``)
].join("\n") + "\n";

const outputs = new Map([
  [resolve(root, "docs/catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`],
  [resolve(root, "docs/contracts.json"), `${JSON.stringify(buildContracts(manifest), null, 2)}\n`],
  [resolve(root, "skills/simplest-ui/references/catalog.md"), markdown]
]);

if (process.argv.includes("--check")) {
  const normalize = (value) => value.replace(/\r\n/g, "\n");
  const stale = [...outputs]
    .filter(([path, content]) => normalize(readFileSync(path, "utf8")) !== normalize(content))
    .map(([path]) => path);
  if (stale.length) {
    console.error(`Generated catalogs are stale:\n${stale.map((path) => `- ${path}`).join("\n")}`);
    process.exit(1);
  }
} else {
  for (const [path, content] of outputs) writeFileSync(path, content);
}

function title(value) {
  return value.split("-").map((word) => word === "ui" ? "UI" : word[0].toUpperCase() + word.slice(1)).join(" ");
}
