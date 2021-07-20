import path from "path";
import { UserConfig } from "vite";
import svelte from "@sveltejs/vite-plugin-svelte";
import rewriteAll from "vite-plugin-rewrite-all";

const config: UserConfig = {
  optimizeDeps: {
    exclude: ['svelte-routing']
  },
  plugins: [svelte(), rewriteAll()],
  resolve: {
    alias: {
      "@app": path.resolve("./src"),
      // Polyfill for Node.js "stream" library.
      "stream": path.resolve("./src/polyfills/stream.ts"),
    },
  },
  define: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "process.env": {
      READABLE_STREAM: "disable",
      RADICLE_ALCHEMY_API_KEY: process.env.RADICLE_ALCHEMY_API_KEY,
      RADICLE_HTTP_API: process.env.RADICLE_HTTP_API,
    },
  },
  build: {
    outDir: "build",
    sourcemap: true
  }
};

export default config;
