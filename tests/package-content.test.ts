import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("package content", () => {
  it("declares the manifest, schema and skill in package files", () => {
    const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
    expect(packageJson.files).toContain("components.manifest.json");
    expect(packageJson.files).toContain("docs/manifest-schema.md");
    expect(packageJson.files).toContain("skills");
  });

  it("ships the manifest, schema and skill on disk", () => {
    expect(existsSync(resolve(root, "components.manifest.json"))).toBe(true);
    expect(existsSync(resolve(root, "docs/manifest-schema.md"))).toBe(true);
    expect(existsSync(resolve(root, "skills/simplest-ui/SKILL.md"))).toBe(true);
    expect(existsSync(resolve(root, "skills/simplest-ui/references/catalog.md"))).toBe(true);
  });

  it("keeps contracts.json and catalog.md synchronized with the manifest", async () => {
    const { validateManifest, buildContracts } = await import("../scripts/lib/manifest.mjs");
    const manifest = JSON.parse(readFileSync(resolve(root, "components.manifest.json"), "utf8"));
    expect(validateManifest(manifest)).toEqual([]);
    const contracts = JSON.parse(readFileSync(resolve(root, "docs/contracts.json"), "utf8"));
    expect(contracts).toEqual(buildContracts(manifest));
  });

  it("does not keep manual snippet dictionaries in docs.ts", () => {
    const docsSource = readFileSync(resolve(root, "docs/assets/docs.ts"), "utf8");
    expect(docsSource).not.toMatch(/const\s+\w*Snippets\s*:/);
    expect(docsSource).not.toMatch(/elementSnippets/);
  });

  it("aligns AGENTS.md and CLAUDE.md", () => {
    const agents = readFileSync(resolve(root, "AGENTS.md"), "utf8");
    const claude = readFileSync(resolve(root, "CLAUDE.md"), "utf8");
    expect(agents).toBe(claude);
  });
});
