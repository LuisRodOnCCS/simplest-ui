import { defineConfig } from "vite";
import { resolve } from "node:path";
import { writeFileSync } from "node:fs";

const outputDirectory = resolve(__dirname, "dist-docs");
const requestedBase = process.env.VITE_DOCS_BASE ?? "/";
const docsBase = requestedBase === "/" ? "/" : `/${requestedBase.replace(/^\/+|\/+$/g, "")}/`;

export default defineConfig({
  root: __dirname,
  base: docsBase,
  publicDir: false,
  server: {
    host: true,
    port: 5173,
    strictPort: true
  },
  build: {
    outDir: outputDirectory,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        documentation: resolve(__dirname, "docs/index.html"),
        dashboard: resolve(__dirname, "docs/pages/dashboard.html")
      }
    }
  },
  plugins: [{
    name: "docs-root-redirect",
    closeBundle() {
      writeFileSync(resolve(outputDirectory, "index.html"), `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0; url=./docs/" />
    <link rel="canonical" href="./docs/" />
    <title>Simplest UI documentation</title>
  </head>
  <body>
    <p><a href="./docs/">Open Simplest UI documentation</a></p>
  </body>
</html>
`);
    }
  }]
});
