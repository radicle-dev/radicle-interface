import path from "path";
import { UserConfig } from "vite";
import svelte from "@sveltejs/vite-plugin-svelte";
import rewriteAll from "vite-plugin-rewrite-all";

const config: UserConfig = {
  optimizeDeps:{
    exclude:['svelte-routing']
  },
  plugins: [svelte(), rewriteAll()],
  resolve: {
    alias: {
      "@app": path.resolve("./src"),
    },
  },
  build: {
    outDir: "build",
    sourcemap: true
  }
};

export default config;
