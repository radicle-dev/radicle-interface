import path from 'path';
import { UserConfig } from 'vite';
import svelte from '@sveltejs/vite-plugin-svelte';
import rewriteAll from 'vite-plugin-rewrite-all';
import IstanbulPlugin from 'vite-plugin-istanbul';


const config: UserConfig = {
  optimizeDeps: {
    exclude: ['svelte-routing', '@pedrouid/environment', '@pedrouid/iso-crypto']
  },
  plugins: [svelte({ hot: !process.env.VITEST }), rewriteAll(), IstanbulPlugin(
    {
      include: "src/*",
      exclude: ["node_modules"],
      extension: [".ts", ".svelte"]
    }
  )],
  test: {
    global: false,
    environment: 'jsdom',
    deps: {
      inline: [
        "@ethersproject/signing-key",
        "@ethersproject/basex"
      ]
    }
  },
  resolve: {
    alias: {
      // This is needed for vite not to choke.
      "caip": path.resolve("./node_modules/caip/dist/umd/index.min.js"),
      '@app': path.resolve('./src'),
      '@test': path.resolve('./cypress'),
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
