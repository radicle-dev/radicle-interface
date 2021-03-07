/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: '/',
    src: '/dist',
  },
  alias: {
    '@app': './src',
  },
  plugins: [
    '@snowpack/plugin-svelte'
  ],
  routes: [
    /* Enable an SPA Fallback in development: */
    {"match": "routes", "src": ".*", "dest": "/index.html"},
  ],
  optimize: {
    "bundle": true,
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
