import type { Metadata } from "next";
import Link from "next/link";
import { getFieldMemos } from "@/data/field-memos";
import { platformLinks } from "@/data/content";
import FieldMemoCard from "@/components/FieldMemoCard";

export const metadata: Metadata = {
  title: "Field Memos — Media Library",
  description: "Synergy Corp Media Library. Curated Field Memos filed by Chuck Morrison.",
  alternates: { canonical: "/field-memos" },
};

export default function FieldMemosPage() {
  const memos = getFieldMemos();

  return (
    <div className="mx-auto content-max px-4 py-8">
      <div className="intranet-card mb-6">
        <div className="intranet-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <span>FIELD MEMOS — MEDIA LIBRARY</span>
          <span className="text-white/50">{memos.length} record{memos.length === 1 ? "" : "s"}</span>
        </div>
        <div className="px-4 py-3 bg-synergy-white border-t border-synergy-rule flex flex-wrap gap-3 items-center">
          <span className="dept-label">Filter by:</span>
          {(["STATUS", "YEAR", "CLEARANCE"] as const).map((label) => (
            <div key={label} className="flex items-center gap-1">
              <span className="dept-label">{label}</span>
              <div className="border border-synergy-rule bg-white px-2 py-1 font-mono text-[10px] text-synergy-muted flex items-center gap-2 cursor-default select-none">
                All
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden="true">
                  <path d="M1 1l3 4 3-4" stroke="#6b6b65" strokeWidth="1.2"/>
                </svg>
              </div>
            </div>
          ))}
          <span className="font-mono text-[9px] text-synergy-muted/60 ml-auto">
            Status: FILED · UNDER REVIEW · PENDING ACKNOWLEDGMENT
          </span>
        </div>
      </div>

      {memos.length === 0 ? (
        <div className="intranet-card p-8 text-center">
          <p className="dept-label mb-2">No memos on file</p>
          <p className="font-sans text-sm text-synergy-muted">
            Additional memos will appear when filed.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {memos.map((memo) => (
            <FieldMemoCard key={memo.videoId} memo={memo} />
          ))}
          {memos.length === 1 && (
            <p className="font-mono text-[10px] text-synergy-muted tracking-wider text-center pt-4">
              Additional memos will appear when filed.
            </p>
          )}
        </div>
      )}

      <div className="mt-10 intranet-card p-5">
        <p className="dept-label mb-3">Follow Channels</p>
        <div className="flex flex-wrap gap-3">
          {platformLinks.map((p) => (
            <a
              key={p.id}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost font-mono text-[10px] tracking-widest uppercase"
            >
              {p.label}
            </a>
          ))}
        </div>
        <Link href="/blog" className="inline-block mt-4 font-mono text-[10px] tracking-widest uppercase text-synergy-navy hover:text-synergy-amber transition-colors">
          Read the Field Notes →
        </Link>
      </div>
    </div>
  );
}
