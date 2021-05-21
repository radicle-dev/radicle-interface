/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  env: {
    RADICLE_ALCHEMY_API_KEY: process.env.RADICLE_ALCHEMY_API_KEY,
  },
  mount: {
    public: '/',
    src: '/dist',
  },
  alias: {
    '@app': './src',
  },
  plugins: [
    '@snowpack/plugin-svelte',
    '@snowpack/plugin-typescript',
  ],
  routes: [
    /* Enable an SPA Fallback in development: */
    {"match": "routes", "src": ".*", "dest": "/index.html"},
  ],
  optimize: {
    /* Setting `bundle: true` breaks .json imports in snowpack 3.5.0 */
    "bundle": false,
  },
  packageOptions: {
    polyfillNode: true,
  },
  devOptions: {
    open: "none",
    output: "dashboard"
  },
  buildOptions: {
    /* ... */
  },
};
