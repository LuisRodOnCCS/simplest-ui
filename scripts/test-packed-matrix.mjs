import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const directory = mkdtempSync(join(process.env.TEMP ?? tmpdir(), "sui-matrix-"));
try {
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  execFileSync(npm, ["run", "build"], { stdio: "inherit", shell: process.platform === "win32" });
  const output = execFileSync(npm, ["pack", "--json", "--pack-destination", directory], {
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  const [packed] = JSON.parse(output);
  execFileSync("tar", ["-xzf", packed.filename], { cwd: directory, stdio: "inherit" });
  const result = spawnSync(process.execPath, [
    resolve("node_modules/@playwright/test/cli.js"),
    "test",
    "--config=playwright.packed.config.ts",
    ...process.argv.slice(2),
  ], {
    stdio: "inherit",
    env: { ...process.env, SUI_PACKED_ROOT: join(directory, "package") },
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  rmSync(directory, { recursive: true, force: true });
}
