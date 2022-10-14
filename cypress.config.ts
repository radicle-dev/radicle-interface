import { defineConfig } from "cypress";

export default defineConfig({
  video: false,
  defaultCommandTimeout: 10000,
  retries: {
    runMode: 0,
    openMode: 0,
  },
  e2e: {
    specPattern: "cypress/e2e/**/*spec.ts",
    baseUrl: "http://localhost:3000",
  },
  component: {
    devServer: {
      framework: "svelte",
      bundler: "vite",
    },
    specPattern: "src/**/*spec.ts",
  },
});
