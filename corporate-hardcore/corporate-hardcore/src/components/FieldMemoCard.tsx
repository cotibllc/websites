import type { FieldMemoEntry } from "@/data/field-memos";
import type { EpisodeStatus } from "@/data/content";
import { formatPublishedDate } from "@/lib/youtube";
import Image from "next/image";

interface FieldMemoCardProps {
  memo: FieldMemoEntry;
  featured?: boolean;
}

const statusClass: Record<EpisodeStatus, string> = {
  FILED: "status-filed",
  "UNDER REVIEW": "status-review",
  "PENDING ACKNOWLEDGMENT": "status-pending",
};

export default function FieldMemoCard({ memo, featured = false }: FieldMemoCardProps) {
  const dateStr = formatPublishedDate(memo.published);
  const watchUrl = `https://www.youtube.com/watch?v=${memo.videoId}`;
  const thumbnail = `https://img.youtube.com/vi/${memo.videoId}/hqdefault.jpg`;

  return (
    <article className={`memo-card ${featured ? "p-6" : "p-4"} flex flex-col sm:flex-row gap-4`}>
      <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 block" aria-label={`Watch ${memo.title}`}>
        <div className={`relative overflow-hidden bg-synergy-gray border border-synergy-rule ${featured ? "w-full sm:w-40 h-40 sm:h-24" : "w-full sm:w-28 h-36 sm:h-16"}`}>
          <Image src={thumbnail} alt={memo.title} fill className="object-cover" sizes={featured ? "160px" : "112px"} />
          <div className="absolute inset-0 flex items-center justify-center bg-synergy-dark/30 opacity-0 hover:opacity-100 transition-opacity">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
        </div>
      </a>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] text-synergy-muted tracking-widest">{memo.fmCode}</span>
            <span className="font-mono text-[10px] text-synergy-muted/60">{dateStr}</span>
          </div>
          <span className={statusClass[memo.status]}>{memo.status}</span>
        </div>
        <h3 className={`font-sans font-semibold text-synergy-dark leading-snug line-clamp-2 ${featured ? "text-base" : "text-sm"}`}>{memo.title}</h3>
        {memo.rub && (<p className="mt-1 text-sm text-synergy-muted line-clamp-2 font-sans font-light">{memo.rub}</p>)}
        <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 font-mono text-[10px] tracking-widest uppercase text-synergy-navy hover:text-synergy-amber transition-colors">WATCH →</a>
      </div>
    </article>
  );
}
