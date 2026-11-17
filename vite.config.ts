import { defineConfig } from "vite";
import { resolve } from "node:path";

const cssComponentNames = [
  "accordion", "alert", "avatar", "badge", "button", "card", "checkbox",
  "empty-state", "input", "nav", "popover", "progress", "radio", "select",
  "skeleton", "spinner", "stat", "switch", "table", "textarea", "toast",
  "tooltip", "topbar"
];

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    headers: {
      "Cache-Control": "no-store"
    }
  },
  build: {
    cssCodeSplit: true,
    lib: {
      entry: {
        index: resolve(import.meta.dirname, "src/index.ts"),
        components: resolve(import.meta.dirname, "src/components/index.ts"),
        accordion: resolve(import.meta.dirname, "src/components/accordion.ts"),
        dropdown: resolve(import.meta.dirname, "src/components/dropdown.ts"),
        drawer: resolve(import.meta.dirname, "src/components/drawer.ts"),
        modal: resolve(import.meta.dirname, "src/components/modal.ts"),
        popover: resolve(import.meta.dirname, "src/components/popover.ts"),
        tabs: resolve(import.meta.dirname, "src/components/tabs.ts"),
        toast: resolve(import.meta.dirname, "src/components/toast.ts"),
        tooltip: resolve(import.meta.dirname, "src/components/tooltip.ts"),
        tokens: resolve(import.meta.dirname, "src/tokens/index.css"),
        styles: resolve(import.meta.dirname, "src/styles/index.css"),
        resetStyles: resolve(import.meta.dirname, "src/styles/reset.css"),
        baseStyles: resolve(import.meta.dirname, "src/styles/base.css"),
        componentStyles: resolve(import.meta.dirname, "src/styles/components.css"),
        ...Object.fromEntries(cssComponentNames.map((name) => [`${name}Styles`, resolve(import.meta.dirname, `src/components/${name}.css`)]))
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
            const componentName = assetInfo.name.replace(/Styles\.css$/, "");
            if (cssComponentNames.includes(componentName)) return `components/${componentName}.css`;
            return "[name][extname]";
          }
          return "assets/[name]-[hash][extname]";
        }
      }
    }
  }
});
