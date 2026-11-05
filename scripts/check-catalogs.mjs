import { execFileSync } from "node:child_process";

execFileSync(process.execPath, ["scripts/generate-catalogs.mjs", "--check"], { stdio: "inherit" });
