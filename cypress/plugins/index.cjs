/* eslint-disable @typescript-eslint/no-var-requires */
const { startDevServer } = require('@cypress/vite-dev-server');
const path = require('path');

module.exports = (on, config) => {
  on('dev-server:start', (options) => {
    return startDevServer({
      options,
      viteConfig: {
        configFile: path.resolve(__dirname, '..', '..', 'vite.config.ts'),
      },
    });
  });

  return config;
};
