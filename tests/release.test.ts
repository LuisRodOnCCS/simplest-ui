import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import packageMetadata from "../package.json";
import generatorMetadata from "../packages/create-simplest-ui/package.json";

const root = resolve(import.meta.dirname, "..");
const path = (file: string) => resolve(root, file);
const read = (file: string) => readFileSync(path(file), "utf8");

const version = packageMetadata.version;
const migrationGuide = `docs/migration-${version}.md`;

const changelog = read("CHANGELOG.md");
const versionHeading = `## [${version}]`;

/** Changelog section for the current version, without the newer headings. */
const versionSection = () => {
  const start = changelog.indexOf(versionHeading);
  if (start === -1) return "";
  const end = changelog.indexOf("\n## ", start + versionHeading.length);
  return changelog.slice(start, end === -1 ? undefined : end);
};

describe("release alignment", () => {
  it("opens the changelog with a dated entry for the current version", () => {
    const headings = [...changelog.matchAll(/^## \[?([^\]]+?)\]?(?: - (.+))?$/gm)];
    const released = headings.filter(([, name]) => name !== "Unreleased");

    expect(released[0]?.[1]).toBe(version);
    expect(released[0]?.[2]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(released.filter(([, name]) => name === version)).toHaveLength(1);
  });

  it("keeps the readme repository version on the current release", () => {
    expect(read("README.md")).toContain(`Repository version: \`v${version}\``);
  });

  it("keeps the roadmap on the current release", () => {
    expect(read("ROADMAP.md")).toContain(`\`v${version}\` is the current release`);
  });

  it("closes every task in the current release section of the roadmap", () => {
    const roadmap = read("ROADMAP.md");
    const start = roadmap.search(new RegExp(`^## v?${version.replaceAll(".", "\\.")}\\b`, "m"));
    expect(start, `missing a roadmap section for ${version}`).toBeGreaterThan(-1);

    const rest = roadmap.slice(start + 1);
    const end = rest.search(/^## /m);
    const section = end === -1 ? rest : rest.slice(0, end);

    expect(section.match(/^- \[ \]/gm) ?? []).toEqual([]);
  });

  it("keeps the generator working against the current core range", () => {
    expect(generatorMetadata.simplestUi.coreRange).toBe(`^${version}`);
  });

  it("links the migration guide when the release changes behavior", () => {
    const section = versionSection();
    expect(section, `missing a changelog section for ${version}`).not.toBe("");
    const needsGuide = /^### (Changed|Removed)$/m.test(section);

    if (!needsGuide) {
      expect(existsSync(path(migrationGuide)), `${migrationGuide} is not linked from the changelog`).toBe(false);
      return;
    }

    expect(existsSync(path(migrationGuide))).toBe(true);
    expect(section).toContain(migrationGuide);
    expect(packageMetadata.files).toContain(migrationGuide);
  });

  it("ships only documentation files that exist", () => {
    const documents = packageMetadata.files.filter((file) => file.endsWith(".md") && !file.includes("*"));

    expect(documents.length).toBeGreaterThan(0);
    for (const document of documents) {
      expect(existsSync(path(document)), document).toBe(true);
    }
  });
});
