import type { Post } from "./feed";

export const RECENT_COUNT = 3;

/**
 * Split newest-first posts into the lead and the Recent rows. Recent is the next
 * three newest posts after the lead, in date order, whatever else is on the page.
 */
export function selectHome(posts: readonly Post[], recentCount: number = RECENT_COUNT): { lead: Post | undefined; recent: Post[] } {
  const [lead, ...rest] = posts;
  return { lead, recent: rest.slice(0, recentCount) };
}
