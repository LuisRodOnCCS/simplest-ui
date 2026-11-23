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
    for (const entry of [...manifest.cssComponents, ...manifest.layouts, ...manifest.webComponents]) {
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

  it("rejects a non-default example without a complete preview", () => {
    const broken = clone();
    broken.cssComponents[0].examples[1].markup = "<div>...</div>";
    expect(validateManifest(broken)).toContainEqual(expect.stringContaining("needs a complete preview"));
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

  it("rejects a duplicate web component tag", () => {
    const broken = clone();
    broken.webComponents.push({ ...broken.webComponents[0] });
    expect(validateManifest(broken)).toContainEqual(
      expect.stringContaining('Duplicate web component tag "sui-modal"')
    );
  });

  it("rejects a web component without a class name", () => {
    const broken = clone();
    delete broken.webComponents[0].className;
    expect(validateManifest(broken)).toContainEqual(expect.stringContaining("must declare className"));
  });

  it("rejects duplicate documented attributes", () => {
    const broken = clone();
    broken.webComponents[0].attributes.push(broken.webComponents[0].attributes[0]);
    expect(validateManifest(broken)).toContainEqual(
      expect.stringContaining("declares duplicate attributes")
    );
  });

  it("rejects event details for an undeclared event", () => {
    const broken = clone();
    broken.webComponents[0].eventDetails = { "sui-invented": "{ value: string }" };
    expect(validateManifest(broken)).toContainEqual(
      expect.stringContaining('eventDetails for undeclared event "sui-invented"')
    );
  });

  it("rejects an empty event detail", () => {
    const broken = clone();
    broken.webComponents[0].eventDetails["sui-close"] = "";
    expect(validateManifest(broken)).toContainEqual(
      expect.stringContaining('eventDetails.sui-close must be a non-empty string')
    );
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
