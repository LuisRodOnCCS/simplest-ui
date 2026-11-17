import { defineConfig } from "vite";
import { resolve } from "node:path";

// Mirrors the Vite pipeline Laravel uses: resources/css/app.css and
// resources/js/app.js are bundled from the package exports.
export default defineConfig({
  root: import.meta.dirname,
  build: {
    outDir: resolve(import.meta.dirname, "dist"),
    emptyOutDir: true
  }
});
