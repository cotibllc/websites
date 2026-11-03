// Publish dates for dated content (CH Glossary entries).
//
// An entry dated "YYYY-MM-DD" goes live at 00:00 on that calendar day in
// New York, whatever the UTC offset is that day (EST or EDT). The check runs
// at request time, so pages that call it must also set a short ISR
// `revalidate` window; no deploy is needed for an entry to go live.

export const PUBLISH_TIME_ZONE = "America/New_York";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const newYorkDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: PUBLISH_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Throws unless `value` is a real calendar date written as YYYY-MM-DD. */
export function assertPublishDate(value: unknown, label: string): string {
  const text = typeof value === "string" ? value : "";
  const m = ISO_DATE.exec(text);
  if (m) {
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const check = new Date(Date.UTC(y, mo - 1, d));
    if (check.getUTCFullYear() === y && check.getUTCMonth() === mo - 1 && check.getUTCDate() === d) {
      return text;
    }
  }
  throw new Error(`${label}: date must be a quoted "YYYY-MM-DD" string, got ${JSON.stringify(value)}`);
}

/** Today's calendar date in New York as YYYY-MM-DD. */
export function newYorkToday(now: Date): string {
  if (Number.isNaN(now.getTime())) throw new Error("newYorkToday: invalid Date");
  return newYorkDate.format(now);
}

/** True once `now` has reached 00:00 New York time on `publishDate`. */
export function isPublished(publishDate: string, now: Date): boolean {
  assertPublishDate(publishDate, "isPublished");
  return publishDate <= newYorkToday(now);
}
