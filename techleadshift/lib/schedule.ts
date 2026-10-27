import { TIME_ZONE } from "./site";

/**
 * Approved publish Wednesdays (calendar dates, New York). Add the next ones
 * here when Chuck approves them. When none is left the "Next" line is hidden.
 */
export const APPROVED_WEDNESDAYS: readonly string[] = ["2026-11-04", "2026-11-18", "2026-12-02", "2026-12-16"];

/** Calendar date (YYYY-MM-DD) of an instant in New York. */
export function easternDate(instant: Date | string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(instant));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/**
 * The next approved Wednesday: the first listed date that is today or later
 * (New York) and that has no published post yet. So on publish day it reads
 * "today" until the post is out, then moves to the following date.
 * Returns undefined when none is left.
 */
export function nextWednesday(
  now: Date,
  published: readonly string[] = [],
  wednesdays: readonly string[] = APPROVED_WEDNESDAYS
): string | undefined {
  const today = easternDate(now);
  const out = new Set(published.map((p) => easternDate(p)));
  return [...wednesdays].sort().find((d) => d >= today && !out.has(d));
}

/** "Next: Wed Nov 4", or "Next: today, Wed Nov 4" on the day itself. */
export function nextLabel(date: string | undefined, now: Date): string | undefined {
  if (!date) return undefined;
  const [y, m, d] = date.split("-").map(Number);
  const text = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" })
    .format(new Date(Date.UTC(y, m - 1, d)))
    .replace(",", "");
  return date === easternDate(now) ? `Next: today, ${text}` : `Next: ${text}`;
}

/** "Oct 15, 2026" for a post date. */
export function formatPostDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, year: "numeric", month: "short", day: "numeric" }).format(new Date(iso));
}
