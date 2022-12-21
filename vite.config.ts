/// <reference types="vitest" />

import type { Connect, ViteDevServer } from "vite";
import type http from "node:http";

import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

function defineConstants() {
  const constants = {
    VITEST: process.env.VITEST !== undefined,
    PLAYWRIGHT: process.env.PLAYWRIGHT_TEST_BASE_URL !== undefined,
  };

  // Don't overwrite HASH_ROUTING in Playwright tests, so we can control it
  // from within the tests.
  if (process.env.PLAYWRIGHT_TEST_BASE_URL !== undefined) {
    return constants;
  } else {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return { ...constants, HASH_ROUTING: Boolean(process.env.HASH_ROUTING) };
  }
}

export default defineConfig({
  optimizeDeps: {
    exclude: ["@pedrouid/environment", "@pedrouid/iso-crypto"],
  },
  test: {
    deps: {
      inline: ["@ethersproject/signing-key", "@ethersproject/basex"],
    },
    setupFiles: "./tests/support/setupVitest",
    environment: "happy-dom",
    include: ["tests/unit/**/*.test.ts"],
    reporters: "verbose",
  },
  plugins: [
    svelte({
      compilerOptions: {
        dev: process.env.NODE_ENV !== "production",
      },
    }),
    configureDevServer(),
    configurePreviewServer(),
  ],
  server: {
    // We have to set host here, otherwise CI binds to the ipv6 address and
    // e2e tests don't work.
    host: "127.0.0.1",
    port: 3000,
  },
  resolve: {
    alias: {
      "@app": path.resolve("./src"),
      "@public": path.resolve("./public"),
    },
  },
  build: {
    outDir: "build",
    rollupOptions: {
      output: {
        manualChunks: {
          ethereum: [
            "ethers",
            "@ethersproject/abstract-provider",
            "@walletconnect/client",
          ],
          cache: ["lru-cache", "@stardazed/streams"],
          markdown: ["katex", "dompurify", "marked", "@radicle/gray-matter"],
          syntax: ["@wooorm/starry-night"],
          grammarsTsx: [
            "@wooorm/starry-night/lang/source.ts.js",
            "@wooorm/starry-night/lang/source.tsx.js",
          ],
          grammars: [
            "@wooorm/starry-night/lang/source.python.js",
            "@wooorm/starry-night/lang/source.js.js",
            "@wooorm/starry-night/lang/source.perl.js",
            "@wooorm/starry-night/lang/source.haskell.js",
            "@wooorm/starry-night/lang/source.ruby.js",
            "@wooorm/starry-night/lang/source.css.js",
            "@wooorm/starry-night/lang/source.solidity.js",
            "@wooorm/starry-night/lang/source.cs.js",
            "@wooorm/starry-night/lang/source.swift.js",
          ],
          dom: ["svelte", "pure-svg-code", "twemoji"],
        },
      },
    },
  },

  define: defineConstants(),
});

function configureDevServer() {
  return {
    name: "configure-dev-server",
    configureServer(server: ViteDevServer) {
      return () => {
        server.middlewares.use((req, _res, next) => {
          req.url = "/index.html";
          next();
        });
      };
    },
  };
}

function configurePreviewServer() {
  return {
    name: "configure-preview-server",
    configurePreviewServer(server: {
      middlewares: Connect.Server;
      httpServer: http.Server;
    }) {
      server.middlewares.use((req, _res, next) => {
        if (
          fs.existsSync(`./public${req.url}`) ||
          req.url?.startsWith("/assets")
        ) {
          return next();
        }
        req.url = "/index.html";
        next();
      });
    },
  };
}
