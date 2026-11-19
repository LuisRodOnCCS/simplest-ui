import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "../components.manifest.json";
import generatedContracts from "../docs/contracts.json";
import { buildContracts, validateManifest } from "../scripts/lib/manifest.mjs";

const clone = () => JSON.parse(JSON.stringify(manifest));

describe("components manifest", () => {
  it("passes the schema validation", () => {
    expect(validateManifest(manifest)).toEqual([]);
  });

  it("declares a contract and a default example for every documented entry", () => {
    for (const entry of [...manifest.cssComponents, ...manifest.layouts]) {
      expect(entry.contract, entry.name).toBeDefined();
      expect(entry.examples.some((example: { id: string }) => example.id === "default"), entry.name).toBe(true);
    }
  });

  it("keeps docs/contracts.json synchronized with the manifest", () => {
    expect(generatedContracts).toEqual(buildContracts(manifest));
  });

  it("rejects a documented entry without a contract", () => {
    const broken = clone();
    delete broken.cssComponents[0].contract;
    expect(validateManifest(broken)).toContainEqual(expect.stringContaining("must declare a contract"));
  });

  it("rejects a documented entry without a default example", () => {
    const broken = clone();
    broken.cssComponents[0].examples = broken.cssComponents[0].examples.filter(
      (example: { id: string }) => example.id !== "default"
    );
    expect(validateManifest(broken)).toContainEqual(expect.stringContaining('must declare an example with id "default"'));
  });

  it("rejects an example without markup", () => {
    const broken = clone();
    broken.cssComponents[0].examples[0].markup = "";
    expect(validateManifest(broken)).toContainEqual(expect.stringContaining("must have markup"));
  });

  it("rejects duplicate example ids", () => {
    const broken = clone();
    broken.cssComponents[0].examples.push({ ...broken.cssComponents[0].examples[0] });
    expect(validateManifest(broken)).toContainEqual(expect.stringContaining("duplicate example id"));
  });

  it("rejects undeclared ui classes", () => {
    const broken = clone();
    broken.cssComponents[0].examples[0].markup = '<button class="ui-button ui-invented" type="button">Save</button>';
    expect(validateManifest(broken)).toContainEqual(expect.stringContaining('uses undeclared class "ui-invented"'));
  });

  it("rejects a duplicate documentation id", () => {
    const broken = clone();
    broken.layouts.push({ ...broken.layouts[0] });
    expect(validateManifest(broken)).toContainEqual(expect.stringContaining("Duplicate documentationId"));
  });

  it("rejects an unsupported schema version", () => {
    const broken = clone();
    broken.schemaVersion = 2;
    expect(validateManifest(broken)).toContainEqual(expect.stringContaining('"schemaVersion": 1'));
  });

  it("keeps the generated contract artifact on disk", () => {
    const onDisk = JSON.parse(readFileSync(resolve(process.cwd(), "docs/contracts.json"), "utf8"));
    expect(onDisk).toEqual(buildContracts(manifest));
  });
});
