// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Deployed to GitHub Pages as a user site, served from the domain root.
// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://bradleyng.github.io',
  vite: {
    plugins: [tailwindcss()],
  },
});
