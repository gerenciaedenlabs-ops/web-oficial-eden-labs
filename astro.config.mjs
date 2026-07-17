// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://edenlabs.dev',
  // Páginas estáticas por defecto (rápidas, cacheables).
  // El endpoint /api/contact opta por render en servidor con `export const prerender = false`.
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    react(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
