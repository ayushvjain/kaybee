import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';

/*
 * The Cloudflare adapter runs on-demand routes inside workerd during `astro
 * dev`, and Keystatic's API module is CommonJS, which workerd rejects with
 * "exports is not defined" - breaking the local admin entirely.
 *
 * So: Node adapter for development, Cloudflare for builds and previews. The
 * production bundle is unaffected, because only `astro dev` takes this branch.
 */
const isDev = process.argv.includes('dev');

export default defineConfig({
  site: 'https://kaybeint.com',
  adapter: isDev
    ? node({ mode: 'standalone' })
    : cloudflare({
        // Prerendered pages read content from disk through the Keystatic
        // reader, which needs Node APIs that workerd does not provide.
        prerenderEnvironment: 'node',
      }),
  integrations: [react(), keystatic(), sitemap()],
});
