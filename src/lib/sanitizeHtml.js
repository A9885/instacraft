/**
 * sanitizeHtml.js — Lightweight HTML sanitizer for admin-authored content.
 * Allows ONLY safe formatting tags. Strips everything else (scripts, event handlers, iframes).
 */

const ALLOWED_TAGS = ['b', 'i', 'em', 'strong', 'span', 'br', 'u', 'small'];

/**
 * Strips all HTML tags except the explicitly allowed ones.
 * Also removes all attributes from allowed tags to prevent event handler injection.
 * @param {string} html - Raw HTML string to sanitize
 * @returns {string} - Sanitized HTML string
 */
export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') return '';

  // Build a regex that matches any HTML tag
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\/?>/gi, (match, tagName) => {
    const lower = tagName.toLowerCase();
    if (ALLOWED_TAGS.includes(lower)) {
      // Rebuild the tag WITHOUT any attributes (prevents onerror, onclick, style injection)
      if (match.startsWith('</')) {
        return `</${lower}>`;
      }
      // Self-closing tags like <br />
      if (lower === 'br') {
        return '<br/>';
      }
      return `<${lower}>`;
    }
    // Strip disallowed tags entirely
    return '';
  });
}
