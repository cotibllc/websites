import type { Post } from "./feed";

/**
 * The Core Series is a closed list: the prologue plus Articles 1 to 10.
 * Substack's feed has no categories, so membership lives here and is matched
 * by slug. `title` and `publishedOn` (a calendar date in New York) double as
 * the offline snapshot used when the live feed is unavailable.
 */
export type CoreSeriesEntry = {
  slug: string;
  /** null for the prologue. */
  number: number | null;
  title: string;
  publishedOn: string;
};

export const CORE_SERIES: readonly CoreSeriesEntry[] = [
  { slug: "the-leadership-gap-nobody-is-talking", number: null, title: "The Leadership Gap Nobody Is Talking About", publishedOn: "2026-03-18" },
  { slug: "the-first-leadership-crisis-of-ai", number: 1, title: "The First Leadership Crisis of AI Won't Be Technical. It Will Be Cultural.", publishedOn: "2026-04-01" },
  { slug: "managing-the-invisible-worker", number: 2, title: "Managing the Invisible Worker", publishedOn: "2026-04-15" },
  { slug: "delegation-drift", number: 3, title: "Delegation Drift", publishedOn: "2026-03-25" },
  { slug: "why-ai-will-expose-bad-management", number: 4, title: "Why AI Will Expose Bad Management Faster Than Ever", publishedOn: "2026-04-22" },
  { slug: "the-new-leadership-skill-systems", number: 5, title: "The New Leadership Skill: Systems Thinking", publishedOn: "2026-05-20" },
  { slug: "the-end-of-productivity-theater", number: 6, title: "The End of Productivity Theater", publishedOn: "2026-06-17" },
  { slug: "middle-management-in-the-age-of-ai", number: 7, title: "Middle Management in the Age of AI: The Empathy Premium", publishedOn: "2026-07-29" },
  { slug: "ai-will-scale-whatever-culture-you", number: 8, title: "AI Will Scale Whatever Culture You Already Have", publishedOn: "2026-08-20" },
  { slug: "you-still-own-what-you-ship", number: 9, title: "You Still Own What You Ship", publishedOn: "2026-09-16" },
  { slug: "the-future-leader-is-a-systems-architect", number: 10, title: "The future leader is a systems architect", publishedOn: "2026-10-15" },
];

/**
 * "Start here" shelf, in series order: the prologue, then Articles 1, 2 and 3.
 * Chuck chose to let a new reader start the series from its beginning.
 */
export const START_HERE_SLUGS: readonly string[] = [
  "the-leadership-gap-nobody-is-talking",
  "the-first-leadership-crisis-of-ai",
  "managing-the-invisible-worker",
  "delegation-drift",
];

/** When the snapshot below was last checked against the feed. Shown in the fallback notice. */
export const SNAPSHOT_DATE = "Oct 27, 2026";

export type SeriesMark = { label: string };

const BY_SLUG = new Map(CORE_SERIES.map((e) => [e.slug, e]));

export function seriesEntry(slug: string): CoreSeriesEntry | undefined {
  return BY_SLUG.get(slug);
}

/** Core Series label for a slug, or undefined for posts outside the series. */
export function seriesMark(slug: string): SeriesMark | undefined {
  const entry = BY_SLUG.get(slug);
  if (!entry) return undefined;
  return { label: entry.number === null ? "Core Series, prologue" : `Core Series, No. ${entry.number}` };
}

/** The local snapshot as posts, used when the live feed is unavailable. */
export function snapshotPosts(): Post[] {
  return CORE_SERIES.map((e) => ({
    slug: e.slug,
    title: e.title,
    link: `https://techleadshift.substack.com/p/${e.slug}`,
    dek: "",
    publishedAt: `${e.publishedOn}T12:00:00.000Z`,
  }));
}

/**
 * Archive list: every feed post, plus any Core Series post the feed did not
 * return (the feed only carries recent items). Newest first.
 */
export function mergeWithSnapshot(feedPosts: readonly Post[]): Post[] {
  const seen = new Set(feedPosts.map((p) => p.slug));
  const extra = snapshotPosts().filter((p) => !seen.has(p.slug));
  return [...feedPosts, ...extra].sort(byNewest);
}

export function byNewest(a: Post, b: Post): number {
  return Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
}
