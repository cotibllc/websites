// House copy rule: no em or en dashes on the site. Libsyn episode titles and
// show notes can carry them, so the feed is cleaned once at parse time and
// every page (home, /episodes, episode pages, metadata, JSON-LD) gets the same text.

const EM = "\u2014";
const EN = "\u2013";

/**
 * Replace em and en dashes with plain punctuation.
 * - Titles: a dash between two phrases becomes a colon ("Down: Why DNS...").
 * - Body text: a dash becomes a comma ("in 2025, AI, Layoffs").
 * - A digit range like "3\u20135" becomes "3 to 5".
 */
export function removeDashes(text: string, kind: "title" | "body" = "body"): string {
  if (!text.includes(EM) && !text.includes(EN)) return text;
  const joiner = kind === "title" ? ": " : ", ";
  return text
    .replace(/(\d)\u2013(\d)/g, "$1 to $2")
    .replace(/[ \t]*,?[ \t]*[\u2014\u2013][ \t]*/g, joiner)
    .replace(/(^|>)(: |, )/g, "$1");
}

// Google shows about 60 characters of a <title>.
export const TITLE_LIMIT = 60;
export const SITE_SUFFIX = " | The IT XP";

// Episode titles longer than 60 characters on their own, trimmed by hand
// (same words, tail cut or shortened). Keyed by episode slug.
export const EPISODE_TITLE_OVERRIDES: Record<string, string> = {
  "the-first-leadership-crisis-of-ai-wont-be-technical-it-will-be-cultural":
    "The First Leadership Crisis of AI Will Be Cultural",
  "mastering-my-wgu-management-leadership-masters-in-6-months":
    "Mastering My WGU Management & Leadership MS in 6 Months",
  "been-laid-off-twice-join-the-club-but-lets-not-stay-there":
    "Been laid off? TWICE? Join the club (but let's not stay)",
  "get-smart-get-it-done-level-up-your-career-in-2024-with-playful-purpose":
    "Get SMART, Get IT Done: Level Up Your Career in 2024",
  "monday-morning-musings-an-it-guy-calls-comcast-technical-support":
    "Monday Morning Musings - An IT Guy calls Comcast Support",
  "episode-35-take-a-knee-and-the-consequences-that-come-with-it":
    "Episode 3.5 - Take a Knee and the consequences that follow",
  "episode-33-summer-is-over-get-back-to-achieving-your-yearly-goals":
    "Episode 3.3 - Summer is over, get back to your yearly goals",
};

/** Cut at the last word boundary that fits, dropping trailing punctuation. */
function trimToWords(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit + 1);
  const space = cut.lastIndexOf(" ");
  return (space > 0 ? cut.slice(0, space) : text.slice(0, limit)).replace(/[\s,:;\-|(&]+$/, "");
}

/**
 * The full <title> for an episode page, always 60 characters or fewer.
 * Keeps " | The IT XP" when it fits, drops it when it doesn't, and uses the
 * hand trim (or a word-boundary trim for new episodes) when the title alone is too long.
 */
export function episodePageTitle(slug: string, title: string): string {
  const base = EPISODE_TITLE_OVERRIDES[slug] ?? title;
  if ((base + SITE_SUFFIX).length <= TITLE_LIMIT) return base + SITE_SUFFIX;
  return trimToWords(base, TITLE_LIMIT);
}
