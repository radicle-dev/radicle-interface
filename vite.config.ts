///<reference types="vitest" />
import path from "path";
import type { UserConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import pluginRewriteAll from "vite-plugin-rewrite-all";

const config: UserConfig = {
  optimizeDeps: {
    exclude: ["@pedrouid/environment", "@pedrouid/iso-crypto"],
  },
  test: {
    deps: {
      inline: ["@ethersproject/signing-key", "@ethersproject/basex"],
    },
    environment: "happy-dom",
    include: ["**/*.test.ts"],
    reporters: "verbose",
  },
  plugins: [
    svelte({
      hot: !process.env.VITEST,
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
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "process.env": { READABLE_STREAM: "disable" },
  },
  build: {
    outDir: "build",
    sourcemap: true,
  },
};

// For Vitest to work we need to unset READABLE_STREAM.
if (process.env.VITEST || process.env.Cypress) {
  config.define = undefined;
}

export default config;
