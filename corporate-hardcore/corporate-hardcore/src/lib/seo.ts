// Meta length limits for every page title and description (House Rule 37
// site audit). Long Field Note and Field Memo headlines stay as the page H1;
// only the <title> and meta description are fitted here.

export const TITLE_LIMIT = 60;
export const DESCRIPTION_LIMIT = 160;
export const BRAND_SUFFIX = " | Corporate Hardcore";

function sentences(text: string): string[] {
  return text.trim().split(/(?<=[.!?])\s+/).filter(Boolean);
}

function trimToWords(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit + 1);
  const space = cut.lastIndexOf(" ");
  return (space > 0 ? cut.slice(0, space) : text.slice(0, limit)).replace(/[\s,:;|(&-]+$/, "");
}

/**
 * The full <title> for a Field Note, Field Memo or other content page,
 * always 60 characters or fewer. Order of preference:
 * 1. the headline plus " | Corporate Hardcore"
 * 2. the headline alone
 * 3. the headline without a trailing "(...)" aside
 * 4. the first sentence of the headline, with the suffix if it fits
 * 5. a word boundary trim
 * A frontmatter `seoTitle` replaces the headline when the first sentence
 * would drop the punchline.
 */
export function pageTitle(headline: string, seoTitle?: string): string {
  const base = (seoTitle ?? headline).trim();
  if ((base + BRAND_SUFFIX).length <= TITLE_LIMIT) return base + BRAND_SUFFIX;
  if (base.length <= TITLE_LIMIT) return base;
  const noAside = base.replace(/\s*\([^)]*\)\s*$/, "");
  if (noAside.length <= TITLE_LIMIT) return noAside;
  const first = sentences(noAside)[0].replace(/[.!?]$/, "");
  if ((first + BRAND_SUFFIX).length <= TITLE_LIMIT) return first + BRAND_SUFFIX;
  if (first.length <= TITLE_LIMIT) return first;
  return trimToWords(first, TITLE_LIMIT);
}

/**
 * A meta description of 160 characters or fewer, cut from the page's own
 * description: whole sentences only, keeping the first and the last (the
 * setup and the punchline), then as many middle sentences, in order, as fit.
 */
export function metaDescription(text: string): string {
  const clean = text.trim();
  if (clean.length <= DESCRIPTION_LIMIT) return clean;
  const parts = sentences(clean);
  const first = parts[0];
  if (first.length > DESCRIPTION_LIMIT) return trimToWords(first, DESCRIPTION_LIMIT);
  const last = parts.length > 1 ? parts[parts.length - 1] : undefined;
  const keep = new Set<number>([0]);
  const len = (set: Set<number>) =>
    [...set].sort((a, b) => a - b).map((i) => parts[i]).join(" ").length;
  if (last && len(new Set([0, parts.length - 1])) <= DESCRIPTION_LIMIT) keep.add(parts.length - 1);
  for (let i = 1; i < parts.length - 1; i++) {
    const next = new Set(keep).add(i);
    if (len(next) <= DESCRIPTION_LIMIT) keep.add(i);
  }
  return [...keep].sort((a, b) => a - b).map((i) => parts[i]).join(" ");
}
