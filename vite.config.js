import { defineConfig } from 'vite';
import { seoPlugin } from './scripts/seo-plugin.js';

export default defineConfig({
  plugins: [seoPlugin()],
});
