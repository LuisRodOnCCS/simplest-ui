import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));

function collectExportTargets(value) {
  if (typeof value === "string") return [value];
  if (!value || typeof value !== "object") return [];
  return Object.values(value).flatMap(collectExportTargets);
}

const targets = [
  packageJson.main,
  packageJson.module,
  packageJson.types,
  ...collectExportTargets(packageJson.exports)
].filter((target) => target && target !== "./package.json");

const missing = [...new Set(targets)].filter((target) => !existsSync(resolve(root, target)));

if (missing.length) {
  console.error(`Missing package export files:\n${missing.map((target) => `- ${target}`).join("\n")}`);
  process.exit(1);
}

console.log(`Verified ${new Set(targets).size} package export files.`);
