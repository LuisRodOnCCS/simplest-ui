import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageManifest = JSON.parse(readFileSync(resolve(packageDirectory, "package.json"), "utf8"));
const templateDirectory = resolve(packageDirectory, "templates");

const templates = {
  "vanilla-vite": {
    targetKind: "directory",
    nextSteps: ["cd {{TARGET}}", "npm install", "npm run dev"]
  },
  "laravel-vite": {
    targetKind: "laravel-app",
    nextSteps: ["npm install", "Add `@import \"./simplest-ui.css\";` to resources/css/app.css.", "Add `import \"./simplest-ui\";` to resources/js/app.js.", "npm run build"]
  },
  "laravel-package": {
    targetKind: "laravel-package",
    nextSteps: ["npm install", "Load workbench/resources/css/simplest-ui.css and workbench/resources/js/simplest-ui.js from the package workbench.", "Document that the host Laravel application owns the Simplest UI Vite imports."]
  }
};

export function parseArguments(argumentsList) {
  const args = [...argumentsList];
  const options = {
    template: "",
    target: "",
    force: false,
    dryRun: false,
    help: false,
    version: false,
    generatorVersion: packageManifest.version
  };

  while (args.length) {
    const argument = args.shift();
    if (argument === "--template") options.template = args.shift() ?? "";
    else if (argument === "--target") options.target = args.shift() ?? "";
    else if (argument === "--force") options.force = true;
    else if (argument === "--dry-run") options.dryRun = true;
    else if (argument === "--help" || argument === "-h") options.help = true;
    else if (argument === "--version" || argument === "-v") options.version = true;
    else if (argument?.startsWith("-")) throw new Error(`Unknown option: ${argument}`);
    else if (!options.target) options.target = argument;
    else throw new Error(`Unexpected argument: ${argument}`);
  }

  if (!options.help && !options.version) {
    if (!options.template) throw new Error("Pass --template vanilla-vite, laravel-vite, or laravel-package.");
    if (!templates[options.template]) throw new Error(`Unknown template "${options.template}".`);
    if (!options.target) throw new Error("Pass a destination directory or --target <path>.");
  }

  return options;
}

async function pathsIn(directory, base = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = [];
  for (const entry of entries) {
    const fullPath = resolve(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await pathsIn(fullPath, base));
    else paths.push(relative(base, fullPath));
  }
  return paths;
}

function inside(root, candidate) {
  const path = relative(root, candidate);
  return path === "" || (!path.startsWith(`..${sep}`) && path !== ".." && !path.includes(`${sep}..${sep}`));
}

function hasLaravelApplication(target) {
  return existsSync(resolve(target, "artisan"))
    && existsSync(resolve(target, "composer.json"))
    && existsSync(resolve(target, "resources"));
}

function hasLaravelPackage(target) {
  if (!existsSync(resolve(target, "composer.json"))) return false;
  try {
    const composer = JSON.parse(readFileSync(resolve(target, "composer.json"), "utf8"));
    return Boolean(composer?.autoload?.["psr-4"] || composer?.autoload?.classmap);
  } catch {
    return false;
  }
}

function assertTarget(template, target, force) {
  if (template.targetKind === "laravel-app" && !hasLaravelApplication(target) && !force) {
    throw new Error("laravel-vite requires an existing Laravel application (artisan, composer.json, and resources/). Use --force only when the target intentionally differs.");
  }
  if (template.targetKind === "laravel-package" && !hasLaravelPackage(target) && !force) {
    throw new Error("laravel-package requires a Composer package with an autoload section. Use --force only when the target intentionally differs.");
  }
}

function replaceTokens(contents) {
  return contents.replaceAll("{{SIMPLEST_UI_VERSION}}", packageManifest.simplestUi.coreRange);
}

export async function generateStarter(options) {
  const definition = templates[options.template];
  if (!definition) throw new Error(`Unknown template "${options.template}".`);

  const target = resolve(options.target);
  const source = resolve(templateDirectory, options.template);
  if (!inside(templateDirectory, source)) throw new Error("Invalid template path.");
  if (!existsSync(source)) throw new Error(`The ${options.template} template is not installed.`);

  assertTarget(definition, target, options.force);

  const sourceFiles = await pathsIn(source);
  const destinationFiles = sourceFiles.map((file) => resolve(target, file.replace(/^_gitignore$/, ".gitignore")));
  const unsafe = destinationFiles.find((file) => !inside(target, file));
  if (unsafe) throw new Error(`Refusing to write outside the target: ${unsafe}`);

  const conflicts = destinationFiles.filter(existsSync);
  if (conflicts.length && !options.force) {
    throw new Error(`Refusing to overwrite existing files:\n${conflicts.map((file) => `- ${relative(target, file)}`).join("\n")}\nUse --force to overwrite them.`);
  }

  if (!options.dryRun) {
    await mkdir(target, { recursive: true });
    for (let index = 0; index < sourceFiles.length; index += 1) {
      const sourceFile = resolve(source, sourceFiles[index]);
      const destinationFile = destinationFiles[index];
      const sourceInfo = await stat(sourceFile);
      if (!sourceInfo.isFile()) continue;
      await mkdir(dirname(destinationFile), { recursive: true });
      const contents = await readFile(sourceFile, "utf8");
      await writeFile(destinationFile, replaceTokens(contents), "utf8");
    }
  }

  const relativeTarget = relative(process.cwd(), target) || ".";
  return {
    files: destinationFiles.map((file) => relative(target, file).split(sep).join("/")),
    nextSteps: definition.nextSteps.map((step) => step.replace("{{TARGET}}", relativeTarget))
  };
}

export { templates };
