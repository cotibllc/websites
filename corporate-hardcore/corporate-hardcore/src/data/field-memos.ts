import type { EpisodeStatus } from "@/data/content";

/** Curated Field Memo allowlist only — never auto-ingest YouTube RSS shorts. */
export interface FieldMemoEntry {
  videoId: string;
  fmCode: string;
  status: EpisodeStatus;
  title: string;
  rub: string;
  published: string;
}

export const fieldMemos: FieldMemoEntry[] = [
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

export function getLatestFieldMemo(): FieldMemoEntry | null {
  return getFieldMemos()[0] ?? null;
}
