import { START_HERE_SLUGS } from "./core-series";
import type { Post } from "./feed";

export const RECENT_COUNT = 3;

/**
 * Split newest-first posts into the lead and the Recent rows. Recent leaves out
 * the lead and every post already on the Start here shelf, so no title shows twice.
 */
export function selectHome(
  posts: readonly Post[],
  shelfSlugs: readonly string[] = START_HERE_SLUGS,
  recentCount: number = RECENT_COUNT
): { lead: Post | undefined; recent: Post[] } {
  const [lead, ...rest] = posts;
  const onShelf = new Set(shelfSlugs);
  return { lead, recent: rest.filter((p) => !onShelf.has(p.slug)).slice(0, recentCount) };
}
