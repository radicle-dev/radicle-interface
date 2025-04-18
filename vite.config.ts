import config from "config";
import path from "node:path";
import virtual from "vite-plugin-virtual";
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["tests/unit/**/*.test.ts"],
    reporters: "verbose",
  },
  plugins: [
    virtual({
      "virtual:config": config.util.toObject(),
    }),
    svelte({
      // Reference: https://github.com/sveltejs/vite-plugin-svelte/issues/270#issuecomment-1033190138
      dynamicCompileOptions({ filename }) {
        if (
          path.basename(filename) === "Clipboard.svelte" ||
          path.basename(filename) === "ExternalLink.svelte" ||
          path.basename(filename) === "Icon.svelte"
        ) {
          return { customElement: true };
        }
      },
      compilerOptions: { dev: process.env.NODE_ENV !== "production" },
    }),
    {
      name: "inject-config-loader",
      transformIndexHtml() {
        if (process.env.VITE_RUNTIME_CONFIG === "true") {
          return [
            {
              tag: "script",
              attrs: {
                type: "text/javascript",
              },
              children: `
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "/config.json", false);
        xhr.send(null);
        window.__CONFIG__ = JSON.parse(xhr.responseText);
      } catch {
        console.warn("Couldn't load config.json from the server, using built-in fallback config.");
      }
    `,
              injectTo: "head-prepend",
            },
          ];
        }
      },
    },
  ],
  server: {
    host: "localhost",
    port: 3000,
    watch: {
      // reference: https://stackoverflow.com/a/75238360
      useFsEvents: false,
    },
  },
  resolve: {
    alias: {
      "@app": path.resolve("./src"),
      "@public": path.resolve("./public"),
      "@http-client": path.resolve("./http-client"),
      "@tests": path.resolve("./tests"),
    },
  },
  build: {
    outDir: "build",
    rollupOptions: {
      output: {
        manualChunks: id => {
          if (id.includes("lodash")) {
            return "lodash";
          } else if (id.includes("katex")) {
            return "katex";
          } else if (id.includes("node_modules")) {
            return "vendor";
          } else if (id.includes("components")) {
            return "components";
          }
        },
      },
    },
  },
});
