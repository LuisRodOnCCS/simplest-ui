import { defineConfig } from "vite";
import { resolve } from "node:path";

// Mirrors the Vite pipeline Laravel uses: resources/css/app.css and
// resources/js/app.js are bundled from the package exports.
export default defineConfig({
  root: __dirname,
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true
  }
});
