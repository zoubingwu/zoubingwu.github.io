import { defineConfig } from 'astro/config';
import remarkGfm from 'remark-gfm';

export default defineConfig({
  site: 'https://zoubingwu.com',
  output: 'static',
  build: {
    format: 'directory',
  },
  markdown: {
    remarkPlugins: [remarkGfm],
    smartypants: false,
    shikiConfig: {
      theme: 'one-dark-pro',
    },
  },
});
