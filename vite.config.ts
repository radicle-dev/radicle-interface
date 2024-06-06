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
          path.basename(filename) === "IconSmall.svelte"
        ) {
          return { customElement: true };
        }
      },
      compilerOptions: { dev: process.env.NODE_ENV !== "production" },
    }),
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
