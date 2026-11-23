import { createRequire } from "node:module";
import { createServer } from "vite";

if (!process.env.SUI_PACKED_ROOT) throw new Error("SUI_PACKED_ROOT is required");
const require = createRequire(import.meta.url);
const server = await createServer({
  root: process.env.SUI_PACKED_ROOT,
  configFile: false,
  resolve: {
    alias: [
      { find: /^lit$/, replacement: require.resolve("lit") },
      { find: /^lit\/decorators\.js$/, replacement: require.resolve("lit/decorators.js") },
    ],
  },
  server: { host: "127.0.0.1", port: 5178, strictPort: true },
  plugins: [{
    name: "packed-matrix-page",
    configureServer(vite) {
      vite.middlewares.use((request, response, next) => {
        if (request.url !== "/") return next();
        response.setHeader("content-type", "text/html");
        response.end(`<!doctype html><html><head>
          <link rel="stylesheet" href="/dist/tokens.css">
          <link rel="stylesheet" href="/dist/styles.css">
          <script type="module" src="/dist/components.js"></script>
          </head><body></body></html>`);
      });
    },
  }],
});
await server.listen();
