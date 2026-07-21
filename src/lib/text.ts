const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Renders content strings that support `**bold**` emphasis.
 * Everything is HTML-escaped first; only the double-asterisk marker becomes
 * a <strong> element, so data files can never inject markup.
 */
export const emphasize = (s: string): string =>
  escapeHtml(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
