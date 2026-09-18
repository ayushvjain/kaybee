import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';

export default defineConfig({
  site: 'https://kaybeint.com',
  adapter: cloudflare({
    // Prerendered pages read content from disk via the Keystatic reader,
    // which needs Node APIs unavailable in workerd.
    prerenderEnvironment: 'node',
  }),
  integrations: [react(), keystatic(), sitemap()],
});
