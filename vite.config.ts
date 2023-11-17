import path from "node:path";
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["tests/unit/**/*.test.ts"],
    reporters: "verbose",
  },
  plugins: [
    svelte({
      // Reference: https://github.com/sveltejs/vite-plugin-svelte/issues/270#issuecomment-1033190138
      dynamicCompileOptions({ filename }) {
        if (path.basename(filename) === "Clipboard.svelte") {
          return {
            customElement: true,
          };
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
      "@httpd-client": path.resolve("./httpd-client"),
      "@tests": path.resolve("./tests"),
    },
  },
  build: {
    outDir: "build",
    rollupOptions: {
      output: {
        manualChunks: {
          markdown: [
            "@radicle/gray-matter",
            "dompurify",
            "hast-util-to-dom",
            "hast-util-to-html",
            "katex",
            "marked",
          ],
          syntax: ["@wooorm/starry-night"],
          grammarsTsx: [
            "@wooorm/starry-night/source.ts",
            "@wooorm/starry-night/source.tsx",
          ],
          grammars: [
            "@wooorm/starry-night/source.python",
            "@wooorm/starry-night/source.js",
            "@wooorm/starry-night/source.perl",
            "@wooorm/starry-night/source.haskell",
            "@wooorm/starry-night/source.ruby",
            "@wooorm/starry-night/source.css",
            "@wooorm/starry-night/source.solidity",
            "@wooorm/starry-night/source.cs",
            "@wooorm/starry-night/source.swift",
          ],
          dom: ["svelte", "twemoji"],
        },
      },
    },
  },

  define: {
    VITEST: process.env.VITEST !== undefined,
    PLAYWRIGHT: process.env.PLAYWRIGHT_TEST_BASE_URL !== undefined,
  },
});
