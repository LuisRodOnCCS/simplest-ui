import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const manifest = JSON.parse(readFileSync(resolve(root, "components.manifest.json"), "utf8"));
const catalog = JSON.parse(readFileSync(resolve(root, "docs/catalog.json"), "utf8"));
const documented = new Set(catalog.groups.flatMap((group) => group.items.map((item) => item.id)));
const entries = [
  ...(manifest.webComponents ?? []),
  ...(manifest.cssComponents ?? []),
  ...(manifest.layouts ?? []),
  ...(manifest.pages ?? [])
];
const missing = entries.filter((entry) => !documented.has(entry.documentationId)).map((entry) => entry.documentationId);
if (missing.length) {
  console.error(`Missing documentation catalog entries:\n${missing.map((id) => `- ${id}`).join("\n")}`);
  process.exit(1);
}
const missingPages = (manifest.pages ?? []).filter((page) => !existsSync(resolve(root, page.path))).map((page) => page.path);
if (missingPages.length) {
  console.error(`Missing documentation pages:\n${missingPages.map((path) => `- ${path}`).join("\n")}`);
  process.exit(1);
}
console.log(`Verified documentation coverage for ${entries.length} catalog entries.`);
