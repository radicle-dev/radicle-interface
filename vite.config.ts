/// <reference types="vitest" />

import path from "path";
import pluginRewriteAll from "vite-plugin-rewrite-all";
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
    pluginRewriteAll(),
  ],
  server: {
    // We have to set host here, otherwise CI binds to the ipv6 address and
    // e2e tests don't work.
    host: "127.0.0.1",
    port: 3000,
  },
  resolve: {
    alias: {
      "@public": path.resolve("./public"),
      "@app": path.resolve("./src"),
    },
  },
  build: {
    outDir: "build",
    rollupOptions: {
      output: {
        manualChunks: {
          ethers: ["ethers", "@ethersproject/abstract-provider"],
          auth: ["siwe", "@walletconnect/client"],
          cache: ["lru-cache", "@stardazed/streams"],
          markdown: ["katex", "dompurify", "marked", "@radicle/gray-matter"],
          dom: ["svelte", "pure-svg-code", "twemoji"],
        },
      },
    },
  },

  define: defineConstants(),
});
