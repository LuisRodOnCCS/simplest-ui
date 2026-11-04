import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  server: {
    headers: {
      "Cache-Control": "no-store"
    }
  },
  build: {
    cssCodeSplit: true,
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        components: resolve(__dirname, "src/components/index.ts"),
        accordion: resolve(__dirname, "src/components/accordion.ts"),
        dropdown: resolve(__dirname, "src/components/dropdown.ts"),
        drawer: resolve(__dirname, "src/components/drawer.ts"),
        modal: resolve(__dirname, "src/components/modal.ts"),
        popover: resolve(__dirname, "src/components/popover.ts"),
        tabs: resolve(__dirname, "src/components/tabs.ts"),
        toast: resolve(__dirname, "src/components/toast.ts"),
        tooltip: resolve(__dirname, "src/components/tooltip.ts"),
        tokens: resolve(__dirname, "src/tokens/index.css"),
        styles: resolve(__dirname, "src/styles/index.css"),
        resetStyles: resolve(__dirname, "src/styles/reset.css"),
        baseStyles: resolve(__dirname, "src/styles/base.css"),
        componentStyles: resolve(__dirname, "src/styles/components.css")
      },
      name: "SimplestUI",
      formats: ["es"]
    },
    rollupOptions: {
      external: (id) => id === "lit" || id.startsWith("lit/"),
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            const cssNames: Record<string, string> = {
              "resetStyles.css": "reset.css",
              "baseStyles.css": "base.css",
              "componentStyles.css": "components.css"
            };
            if (cssNames[assetInfo.name]) return cssNames[assetInfo.name];
            return "[name][extname]";
          }
          return "assets/[name]-[hash][extname]";
        }
      }
    }
  }
});
