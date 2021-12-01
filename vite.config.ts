import path from 'path';
import { UserConfig } from 'vite';
import svelte from '@sveltejs/vite-plugin-svelte';
import rewriteAll from 'vite-plugin-rewrite-all';

const config: UserConfig = {
  optimizeDeps: {
    exclude: ['svelte-routing', '@pedrouid/environment', '@pedrouid/iso-crypto']
  },
  base: "",
  plugins: [svelte(), rewriteAll()],
  resolve: {
    alias: {
      // This is needed for vite not to choke.
      "caip": path.resolve("./node_modules/caip/dist/umd/index.min.js"),
      '@app': path.resolve('./src'),
      // Polyfill for Node.js 'stream' library.
      'stream': path.resolve('./src/polyfills/stream.ts'),
      'typedarray-to-buffer': path.resolve('./src/polyfills/typedarray-to-buffer.js'),
      // "Buffer" is not defined in the published package..
      '@walletconnect/encoding': path.resolve('./src/polyfills/enc-utils.js'),
      'enc-utils': path.resolve('./src/polyfills/enc-utils.js'),
    },
  },
  define: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'process.env': { READABLE_STREAM: 'disable' }
  },
  build: {
    outDir: 'build',
    sourcemap: true
  }
};

export default config;
