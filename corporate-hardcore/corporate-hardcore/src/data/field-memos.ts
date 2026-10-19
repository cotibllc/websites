import type { EpisodeStatus } from "@/data/content";

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

export function getLatestFieldMemo(): FieldMemoEntry | null {
  return getFieldMemos()[0] ?? null;
}
