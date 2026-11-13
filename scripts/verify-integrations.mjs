import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const integrations = JSON.parse(readFileSync(resolve(root, "integrations.manifest.json"), "utf8"));
const catalog = JSON.parse(readFileSync(resolve(root, "docs/catalog.json"), "utf8"));
const documented = new Set(catalog.groups.flatMap((group) => group.items.map((item) => item.id)));

const missingTemplates = integrations.starters
  .filter((starter) => !existsSync(resolve(root, starter.templatePath)))
  .map((starter) => starter.templatePath);
const missingDocumentation = integrations.starters
  .filter((starter) => !documented.has(starter.documentationId))
  .map((starter) => starter.documentationId);

if (missingTemplates.length || missingDocumentation.length) {
  if (missingTemplates.length) console.error(`Missing integration templates:\n${missingTemplates.map((path) => `- ${path}`).join("\n")}`);
  if (missingDocumentation.length) console.error(`Missing integration documentation:\n${missingDocumentation.map((id) => `- ${id}`).join("\n")}`);
  process.exit(1);
}

console.log(`Verified ${integrations.starters.length} integration starters.`);
