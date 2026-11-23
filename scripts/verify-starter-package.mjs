import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";

const root = process.cwd();
const coreMetadata = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
const generatorMetadata = JSON.parse(await readFile(resolve(root, "packages/create-simplest-ui/package.json"), "utf8"));
const temporaryDirectory = await mkdtemp(join(tmpdir(), "simplest-ui-starter-package-"));

function npm(argumentsList, cwd = root) {
  const options = {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"]
  };
  if (process.platform === "win32") {
    return execFileSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", `npm ${argumentsList.join(" ")}`], options);
  }
  return execFileSync("npm", argumentsList, options);
}

function pack(argumentsList) {
  const output = npm(["pack", "--json", "--pack-destination", temporaryDirectory, ...argumentsList]);
  const [result] = JSON.parse(output);
  return resolve(temporaryDirectory, result.filename);
}

try {
  const coreTarball = pack([]);
  const generatorTarball = pack(["--workspace", "@luisrodonccs/create-simplest-ui"]);
  const toolsDirectory = join(temporaryDirectory, "tools");
  const applicationDirectory = join(temporaryDirectory, "application");

  await writeFile(join(temporaryDirectory, "package.json"), "{\"private\":true}", "utf8");
  npm(["install", "--prefix", toolsDirectory, generatorTarball]);

  const generator = join(
    toolsDirectory,
    "node_modules",
    "@luisrodonccs",
    "create-simplest-ui",
    "bin",
    "create-simplest-ui.mjs"
  );
  assert.equal(execFileSync(process.execPath, [generator, "--version"], { encoding: "utf8" }).trim(), generatorMetadata.version);
  execFileSync(process.execPath, [generator, applicationDirectory, "--template", "vanilla-vite"], {
    cwd: temporaryDirectory,
    stdio: "inherit"
  });

  const manifestPath = join(applicationDirectory, "package.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  assert.equal(manifest.dependencies["@luisrodonccs/simplest-ui"], generatorMetadata.simplestUi.coreRange);
  assert.equal(generatorMetadata.simplestUi.coreRange, `^${coreMetadata.version}`);
  manifest.dependencies["@luisrodonccs/simplest-ui"] = `file:${relative(applicationDirectory, coreTarball).replaceAll("\\", "/")}`;
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  // Install by absolute tarball path before resolving other dependencies:
  // this release may not exist in the registry yet.
  npm(["install", "--save-exact", coreTarball], applicationDirectory);
  const installedCore = JSON.parse(await readFile(join(applicationDirectory, "node_modules/@luisrodonccs/simplest-ui/package.json"), "utf8"));
  assert.equal(installedCore.version, coreMetadata.version);
  npm(["run", "build"], applicationDirectory);
  console.log("Verified the packed generator creates a Vanilla Vite application from the packed core package.");
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
