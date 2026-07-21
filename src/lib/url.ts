/**
 * Prefixes a public/ path with the site's base path, so links keep working
 * when the site is served from a sub-path (GitHub Pages project sites).
 * Content files always use plain root paths like "/resume.pdf" — this helper
 * is applied by components, never in the data.
 */
export const withBase = (path: string): string =>
  import.meta.env.BASE_URL.replace(/\/+$/, '') + path;
