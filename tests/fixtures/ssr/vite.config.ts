import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: import.meta.dirname,
  build: {
    ssr: "entry.js",
    outDir: resolve(import.meta.dirname, "dist"),
    emptyOutDir: true
  }
});
