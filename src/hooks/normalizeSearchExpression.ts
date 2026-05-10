/**
 * Normalizes common LLM mistakes in Cloudinary Admin API search expressions
 * (`POST .../resources/search`, Lucene-like syntax per
 * https://cloudinary.com/documentation/admin_api#search_for_resources).
 *
 * Valid queries use `field:value` with no space after the colon; values that
 * contain spaces, colons, or reserved characters must be double-quoted.
 * Visual search (`/resources/visual_search`) uses separate parameters — this
 * helper targets the `expression` string on asset search only.
 */

const FIELD_COLON_SPACE = /(\b\w+(?:\.\w+)*):\s+/g;

/** Bare ISO-8601 instant after date field comparison operators (needs quoting). */
const BARE_ISO_AFTER_DATE_FIELD =
  /((?:created|uploaded|taken|updated)_at\s*[><=!]+\s*)(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)/gi;

function normalizeUnquotedSegment(segment: string): string {
  let s = segment.replace(FIELD_COLON_SPACE, "$1:");
  s = s.replace(BARE_ISO_AFTER_DATE_FIELD, '$1"$2"');
  return s;
}

/**
 * Applies quote-safe fixes only outside double-quoted regions of `expression`.
 */
export function normalizeSearchExpression(expression: string): string {
  const parts = expression.split('"');
  for (let i = 0; i < parts.length; i += 2) {
    parts[i] = normalizeUnquotedSegment(parts[i]!);
  }
  return parts.join('"');
}
