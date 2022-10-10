///<reference types="vitest" />
import path from "path";
import type { UserConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import pluginRewriteAll from "vite-plugin-rewrite-all";

const config: UserConfig = {
  optimizeDeps: {
    exclude: [
      "svelte-routing",
      "@pedrouid/environment",
      "@pedrouid/iso-crypto",
    ],
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
    port: 3000,
  },
  resolve: {
    alias: {
      "@public": path.resolve("./public"),
      "@app": path.resolve("./src"),
      "typedarray-to-buffer": path.resolve(
        "./src/polyfills/typedarray-to-buffer.js",
      ),
      // "Buffer" is not defined in the published package..
      "@walletconnect/encoding": path.resolve("./src/polyfills/enc-utils.js"),
      "enc-utils": path.resolve("./src/polyfills/enc-utils.js"),
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
