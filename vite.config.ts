import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    cssCodeSplit: true,
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        components: resolve(__dirname, "src/components/index.ts"),
        tokens: resolve(__dirname, "src/tokens/index.css"),
        styles: resolve(__dirname, "src/styles/index.css")
      },
      name: "SimplestUI",
      formats: ["es"]
    },
    rollupOptions: {
      external: ["lit"],
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "[name][extname]";
          }
          return "assets/[name]-[hash][extname]";
        }
      }
    }
  }
});