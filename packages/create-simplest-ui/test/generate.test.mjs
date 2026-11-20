import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { generateStarter, parseArguments } from "../src/generate.mjs";

async function temporaryDirectory() {
  return mkdtemp(join(tmpdir(), "create-simplest-ui-"));
}

test("parses a Vanilla target and template", () => {
  const options = parseArguments(["demo", "--template", "vanilla-vite"]);
  assert.equal(options.target, "demo");
  assert.equal(options.template, "vanilla-vite");
});

test("rejects an unknown template", () => {
  assert.throws(
    () => parseArguments(["demo", "--template", "unknown"]),
    /Unknown template/
  );
});

test("generates a Vanilla starter using public package imports", async (context) => {
  const directory = await temporaryDirectory();
  context.after(() => rm(directory, { recursive: true, force: true }));

  const target = join(directory, "app");
  const result = await generateStarter({ template: "vanilla-vite", target, force: false, dryRun: false });

  assert.deepEqual(result.files.sort(), ["README.md", "index.html", "package.json", "src/main.js"]);
  assert.equal(existsSync(join(target, "index.html")), true);
  assert.match(await readFile(join(target, "src/main.js"), "utf8"), /@luisrodonccs\/simplest-ui\/tokens\.css/);
  assert.match(await readFile(join(target, "src/main.js"), "utf8"), /@luisrodonccs\/simplest-ui\/styles\.css/);
  assert.match(await readFile(join(target, "package.json"), "utf8"), /"\^0\.3\.0"/);
});

test("refuses conflicts unless force is passed", async (context) => {
  const target = await temporaryDirectory();
  context.after(() => rm(target, { recursive: true, force: true }));
  await writeFile(join(target, "package.json"), "{}", "utf8");

  await assert.rejects(
    () => generateStarter({ template: "vanilla-vite", target, force: false, dryRun: false }),
    /Refusing to overwrite/
  );
});

test("requires a Laravel application for the Laravel Vite overlay", async (context) => {
  const target = await temporaryDirectory();
  context.after(() => rm(target, { recursive: true, force: true }));

  await assert.rejects(
    () => generateStarter({ template: "laravel-vite", target, force: false, dryRun: false }),
    /requires an existing Laravel application/
  );
});

test("generates the Laravel Vite overlay for a Laravel application", async (context) => {
  const target = await temporaryDirectory();
  context.after(() => rm(target, { recursive: true, force: true }));
  await writeFile(join(target, "artisan"), "#!/usr/bin/env php", "utf8");
  await writeFile(join(target, "composer.json"), "{\"require\":{\"laravel/framework\":\"^11.0\"}}", "utf8");
  await (await import("node:fs/promises")).mkdir(join(target, "resources"), { recursive: true });

  const result = await generateStarter({ template: "laravel-vite", target, force: false, dryRun: false });
  assert.equal(result.files.includes("resources/js/simplest-ui.js"), true);
  assert.match(
    await readFile(join(target, "resources/css/simplest-ui.css"), "utf8"),
    /@luisrodonccs\/simplest-ui\/tokens\.css/
  );
  assert.match(
    await readFile(join(target, "resources/css/simplest-ui.css"), "utf8"),
    /@luisrodonccs\/simplest-ui\/styles\.css/
  );
});

test("generates Blade and workbench files for a Laravel package", async (context) => {
  const target = await temporaryDirectory();
  context.after(() => rm(target, { recursive: true, force: true }));
  await writeFile(
    join(target, "composer.json"),
    "{\"autoload\":{\"psr-4\":{\"Acme\\\\Package\\\\\":\"src/\"}}}",
    "utf8"
  );

  const result = await generateStarter({ template: "laravel-package", target, force: false, dryRun: false });
  assert.equal(result.files.includes("resources/views/components/sui-drawer.blade.php"), true);
  const blade = await readFile(join(target, "resources/views/components/sui-drawer.blade.php"), "utf8");
  assert.match(blade, /<sui-drawer/);
  assert.doesNotMatch(blade, /dist/);
  const workbenchCss = await readFile(join(target, "workbench/resources/css/simplest-ui.css"), "utf8");
  assert.match(workbenchCss, /@luisrodonccs\/simplest-ui\/tokens\.css/);
  assert.match(workbenchCss, /@luisrodonccs\/simplest-ui\/styles\.css/);
  const example = await readFile(join(target, "resources/views/examples/simplest-ui.blade.php"), "utf8");
  assert.match(example, /<x-sui-drawer\b/);
  const guide = await readFile(join(target, "README.md"), "utf8");
  assert.match(guide, /Register the package's anonymous component path/);
  assert.match(guide, /CSS and\s+JavaScript exports/);
  assert.match(guide, /not required by this\s+starter/);
});

test("does not write files during a dry run", async (context) => {
  const target = await temporaryDirectory();
  context.after(() => rm(target, { recursive: true, force: true }));

  const result = await generateStarter({ template: "vanilla-vite", target, force: false, dryRun: true });
  assert.equal(result.files.length, 4);
  assert.equal(existsSync(join(target, "package.json")), false);
});
