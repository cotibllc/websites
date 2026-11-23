/**
 * Memo header for every Field Note (/blog/<slug>) and Field Memo
 * (/field-memos/<slug>): MEMO number, DEPARTMENT, CLASSIFICATION, DATE.
 *
 * Pure functions only (no fs), so the rules are unit tested in
 * memo-header.test.ts.
 *
 * Number rule: chronological position in its own collection, oldest = 1,
 * zero padded to 3 digits, ties broken by slug. A new post with a later date
 * gets the next number and leaves every existing number alone. Back dating a
 * new post before older ones would renumber the later ones, so don't.
 */

export type MemoCollection = "field-notes" | "field-memos";

/**
 * Defaults used when frontmatter has no `department` or `classification`.
 * Chuck can change these here, or override one page with frontmatter.
 */
export const MEMO_DEFAULTS: Record<
  MemoCollection,
  { prefix: string; department: string; classification: string }
> = {
  "field-notes": {
    prefix: "FN",
    department: "Information Technology",
    classification: "Internal Use Only",
  },
  "field-memos": {
    prefix: "FM",
    department: "Corporate Communications",
    classification: "All Staff",
  },
};

export interface DatedItem {
  /** Stable id: the slug for posts and memos (videoId when a memo has no slug). */
  id: string;
  /** YYYY-MM-DD, or a full ISO timestamp. */
  date: string;
}

export interface MemoHeader {
  /** e.g. "FN 025" */
  number: string;
  department: string;
  classification: string;
  /** e.g. "November 2, 2026" */
  date: string;
  /** e.g. "2026-11-02", for <time dateTime>. */
  isoDate: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2026-11-02" or "2026-11-03T00:00:00.000Z" to "November 2, 2026". Reads the
 * calendar date as written, so no time zone can move it a day. */
export function formatMemoDate(raw: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw.trim());
  if (!m) throw new Error(`Memo date must start with YYYY-MM-DD, got "${raw}"`);
  const [, y, mo, d] = m;
  const month = MONTHS[Number(mo) - 1];
  if (!month || Number(d) < 1 || Number(d) > 31) {
    throw new Error(`Memo date is not a real date: "${raw}"`);
  }
  return `${month} ${Number(d)}, ${y}`;
}

/** Oldest first; same day sorts by id so the order never depends on file order. */
export function chronological<T extends DatedItem>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => {
    const da = a.date.slice(0, 10);
    const db = b.date.slice(0, 10);
    if (da !== db) return da < db ? -1 : 1;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}

/** 1 based chronological index of `id` in `items`. Throws if it isn't there. */
export function memoIndex(items: readonly DatedItem[], id: string): number {
  const i = chronological(items).findIndex((it) => it.id === id);
  if (i === -1) throw new Error(`No memo with id "${id}" in this collection`);
  return i + 1;
}

export function formatMemoNumber(collection: MemoCollection, index: number): string {
  if (!Number.isInteger(index) || index < 1) {
    throw new Error(`Memo index must be a positive integer, got ${index}`);
  }
  return `${MEMO_DEFAULTS[collection].prefix} ${String(index).padStart(3, "0")}`;
}

function nonEmpty(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

export function buildMemoHeader(args: {
  collection: MemoCollection;
  items: readonly DatedItem[];
  id: string;
  date: string;
  /** Optional frontmatter overrides; blank or non string values fall back to the defaults. */
  frontmatter?: { department?: unknown; classification?: unknown };
}): MemoHeader {
  const defaults = MEMO_DEFAULTS[args.collection];
  return {
    number: formatMemoNumber(args.collection, memoIndex(args.items, args.id)),
    department: nonEmpty(args.frontmatter?.department) ?? defaults.department,
    classification: nonEmpty(args.frontmatter?.classification) ?? defaults.classification,
    date: formatMemoDate(args.date),
    isoDate: args.date.trim().slice(0, 10),
  };
}

/** Newest item by date (ties: the larger id), or null when the list is empty. */
export function pickLatest<T extends DatedItem>(items: readonly T[]): T | null {
  const sorted = chronological(items);
  return sorted[sorted.length - 1] ?? null;
}
