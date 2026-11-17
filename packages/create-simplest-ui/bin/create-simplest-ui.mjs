#!/usr/bin/env node
import { generateStarter, parseArguments } from "../src/generate.mjs";

try {
  const options = parseArguments(process.argv.slice(2));

  if (options.help) {
    console.log(`Usage:
  npm create @luisrodonccs/simplest-ui@latest <directory> -- --template <template>
  npx @luisrodonccs/create-simplest-ui@latest <directory> --template <template>

Templates:
  vanilla-vite     Create a Vanilla + Vite application.
  laravel-vite     Add Simplest UI files to an existing Laravel application.
  laravel-package  Add workbench assets and Blade examples to a Laravel package.

Options:
  --template <id>  Required starter template.
  --target <path>  Destination directory (alternative to <directory>).
  --force          Allow a Laravel target check to be bypassed and overwrite conflicts.
  --dry-run        Print files without writing them.
  --help           Show this message.
  --version        Show the generator version.`);
    process.exit(0);
  }

  if (options.version) {
    console.log(options.generatorVersion);
    process.exit(0);
  }

  const result = await generateStarter(options);
  console.log(`${options.dryRun ? "Would create" : "Created"} ${result.files.length} file(s) using ${options.template}.`);
  result.files.forEach((file) => console.log(`  ${file}`));
  console.log(`\nNext steps:\n${result.nextSteps.map((step) => `  ${step}`).join("\n")}`);
} catch (error) {
  console.error(`\nSimplest UI starter failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
