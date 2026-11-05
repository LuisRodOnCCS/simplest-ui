import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: __dirname,
  build: {
    ssr: "entry.js",
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true
  }
});
