import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: __dirname,
  publicDir: false,
  server: {
    host: true,
    port: 5173,
    strictPort: true
  },
  build: {
    outDir: resolve(__dirname, "dist-docs"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        documentation: resolve(__dirname, "docs/index.html"),
        dashboard: resolve(__dirname, "docs/pages/dashboard.html")
      }
    }
  }
});
