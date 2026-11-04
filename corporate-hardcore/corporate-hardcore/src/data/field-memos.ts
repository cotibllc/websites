import type { EpisodeStatus } from "@/data/content";
import { pickLatest, type DatedItem } from "../lib/memo-header";

/** Curated Field Memo allowlist only — never auto-ingest YouTube RSS shorts. */
export interface FieldMemoEntry {
  videoId: string;
  /** Detail page at /field-memos/<slug>; body lives in src/content/field-memos/<slug>.md */
  slug?: string;
  fmCode: string;
  status: EpisodeStatus;
  title: string;
  rub: string;
  published: string;
}

export const fieldMemos: FieldMemoEntry[] = [
  {
    videoId: "XbmOOahZxRQ",
    slug: "direct-report",
    fmCode: "FM-04",
    status: "FILED",
    title: "Direct Report · Annual Review | Synergy Corp Field Memo",
    rub: "Two hundred and twelve meetings created. None attended. Top accomplishment.",
    published: "2026-11-03T00:00:00.000Z",
  },
  {
    videoId: "Y9lxK46WAmA",
    slug: "growth-paths",
    fmCode: "FM-03",
    status: "FILED",
    title: "Growth Paths · The Pre-Read | Synergy Corp Field Memo",
    rub: "Synergy Assist wrote the pre-read. Dana organized the invite.",
    published: "2026-10-26T00:00:00.000Z",
  },
  {
    videoId: "4oPLzS-t4Wg",
    slug: "autominutes-confidence-94",
    fmCode: "FM-02",
    status: "FILED",
    title: "AutoMinutes · Confidence 94% | Synergy Corp Field Memo",
    rub: "Greg was not on the invite. Greg was not on the call. Greg is in the minutes.",
    published: "2026-10-19T00:00:00.000Z",
  },
  {
    videoId: "NK-V7YIE2U0",
    slug: "circle-back-never-return",
    fmCode: "FM-01",
    status: "FILED",
    title: "Circle Back. Never Return. | Synergy Corp Field Memo",
    rub: "Fourteen months old. Status: Waiting. Owner: the process.",
    published: "2026-08-29T00:00:00.000Z",
  },
];

export function getFieldMemos(): FieldMemoEntry[] {
  return [...fieldMemos].sort(
    (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime()
  );
}

export function getFieldMemoBySlug(slug: string): FieldMemoEntry | null {
  return fieldMemos.find((m) => m.slug === slug) ?? null;
}

export function getFieldMemoSlugs(): string[] {
  return fieldMemos.flatMap((m) => (m.slug ? [m.slug] : []));
}

/** Id and date per allowlist entry, the input for memo numbers and "latest". */
export function fieldMemoDatedItems(
  entries: readonly FieldMemoEntry[] = fieldMemos
): (DatedItem & { entry: FieldMemoEntry })[] {
  return entries.map((entry) => ({ id: entry.slug ?? entry.videoId, date: entry.published, entry }));
}

/** Newest allowlist entry by `published`. Used by the home card and /start-here. */
export function getLatestFieldMemo(
  entries: readonly FieldMemoEntry[] = fieldMemos
): FieldMemoEntry | null {
  return pickLatest(fieldMemoDatedItems(entries))?.entry ?? null;
}
