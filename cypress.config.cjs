/* eslint-disable @typescript-eslint/no-var-requires */
const { defineConfig } = require("cypress");
const { startDevServer } = require('@cypress/vite-dev-server');

module.exports = defineConfig({
  video: false,
  e2e: {
    setupNodeEvents(on, config) {
      return require('@cypress/code-coverage/task')(on, config);
    },
    specPattern: 'cypress/e2e/**/*spec.ts',
    baseUrl: 'http://localhost:3000',
  },
  component: {
    devServer({ config, specs, devServerEvents }) {
      return startDevServer({
        options: {
          config,
          specs,
          devServerEvents,
        },
        viteConfig: {
          configFile: "./vite.config.ts",
          logLevel: "silent"
        },
      });

    },
    specPattern: 'src/**/*spec.ts',
  },
});
