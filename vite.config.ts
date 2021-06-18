import path from "path";
import { UserConfig } from "vite";
import svelte from "@sveltejs/vite-plugin-svelte";

const config: UserConfig = {
  optimizeDeps:{
    exclude:['svelte-routing']
  },
  plugins: [svelte()],
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
