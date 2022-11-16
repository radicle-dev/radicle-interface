///<reference types="vitest" />
import type { UserConfig } from "vite";
import path from "path";
import pluginRewriteAll from "vite-plugin-rewrite-all";
import { svelte } from "@sveltejs/vite-plugin-svelte";

const config: UserConfig = {
  optimizeDeps: {
    exclude: ["@pedrouid/environment", "@pedrouid/iso-crypto"],
  },
  test: {
    deps: {
      inline: ["@ethersproject/signing-key", "@ethersproject/basex"],
    },
    setupFiles: "./vitest/setupVitest",
    environment: "happy-dom",
    include: ["**/*.test.ts"],
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
  define: {
    "process.env": {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      READABLE_STREAM: "disable",
      hashRouting: Boolean(process.env.HASH_ROUTING),
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
};

// For Vitest to work we need to unset READABLE_STREAM.
if (process.env.VITEST || process.env.Cypress) {
  config.define = undefined;
}

export default config;
