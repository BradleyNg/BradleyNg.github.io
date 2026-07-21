# Personal Website

Steins;Gate themed personal portfolio website.

**Live at [bradleyng.github.io](https://bradleyng.github.io)**

A single-page portfolio for myself, built
as a fully static site. The visual system is an original homage to
Steins;Gate: a nixie-tube divergence meter, world-line diagrams, clockwork
and circuitry that shift as you move between sections, and a light/dark
theme modeled on the series' α and β world lines.

## Features

- **Static and dependency-light.** No client-side framework; the only
  JavaScript is the theme toggle, scroll reveals, and the meter animations.
- **Two world lines.** The theme toggle switches between α (daylight) and β
  (night) palettes, and the divergence meter re-reads to the matching value.
- **A living backdrop.** Each section crossfades to its own motif —
  clockwork, world-line fields, drafting schematics, circuit traces — drawn
  as original SVG geometry and visible through the translucent panels.
- **Content separated from presentation.** Every word on the site lives in
  schema-validated data files under `src/content/`; components contain no
  copy, so a bad edit fails the build instead of shipping broken.
- **Accessible by default.** Semantic landmarks, a skip link, AA contrast in
  every color context, visible focus states, and full
  `prefers-reduced-motion` support that disables all animation without
  hiding content.

## Tech stack

- [Astro 5](https://astro.build) — static site generation
- [Tailwind CSS v4](https://tailwindcss.com) — design tokens and styling
- Self-hosted fonts via Fontsource: Chakra Petch, Inter, IBM Plex Mono,
  Nixie One
- Deployed to GitHub Pages by GitHub Actions on every push to `main`

## Development

Requires Node 20+.

```bash
npm install
npm run dev      # local dev server at http://localhost:4321
npm run build    # production build to dist/
npm run preview  # serve the production build locally
```

## Project structure

```
src/
  content/     site content (JSON + markdown)
  lib/         content schemas, validation, and SVG geometry helpers
  components/  UI components
  layouts/     page shell
  pages/       routes
  styles/      design tokens and global CSS
public/        static assets served as-is
```

## Disclaimer

An unofficial fan homage. Steins;Gate © MAGES. / Nitroplus — no affiliation.
No franchise assets are used anywhere in this project; all artwork is
original.
