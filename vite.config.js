import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { seoPlugin } from './scripts/seo-plugin.js';

export default defineConfig({
  plugins: [seoPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        narxlar: resolve(import.meta.dirname, 'narxlar/index.html'),
      },
    },
  },
});
