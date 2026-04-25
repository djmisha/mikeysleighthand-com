import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  integrations: [
    react(), 
    sitemap({
      lastmod: new Date(),
      changefreq: 'monthly',
      priority: 1.0,
    })
  ],
  site: 'https://www.mikeysleighthand.com',
});
