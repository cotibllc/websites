import type { YouTubeVideo } from "@/lib/youtube";
import type { EpisodeStatus } from "@/data/content";
import { formatPublishedDate } from "@/lib/youtube";
import Image from "next/image";

interface EpisodeCardProps {
  video: YouTubeVideo;
  episodeNumber: number;
  status: EpisodeStatus;
  featured?: boolean;
}

const statusClass: Record<EpisodeStatus, string> = {
  FILED:                   "status-filed",
  "UNDER REVIEW":          "status-review",
  "PENDING ACKNOWLEDGMENT": "status-pending",
};

export default function EpisodeCard({ video, episodeNumber, status, featured = false }: EpisodeCardProps) {
  const numStr = String(episodeNumber).padStart(3, "0");
  const dateStr = formatPublishedDate(video.published);

  return (
    <article className={`memo-card ${featured ? "p-6" : "p-4"} flex gap-4`}>
      {/* Thumbnail */}
      <a
        href={video.watchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 block"
        aria-label={`Watch ${video.title}`}
      >
        <div className={`relative overflow-hidden bg-synergy-gray border border-synergy-rule ${featured ? "w-40 h-24" : "w-28 h-16"}`}>
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover"
            sizes={featured ? "160px" : "112px"}
          />
          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-synergy-dark/30 opacity-0 hover:opacity-100 transition-opacity">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
        </div>
      </a>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-synergy-muted tracking-widest">
              EP-{numStr}
            </span>
            <span className="font-mono text-[10px] text-synergy-muted/60">
              {dateStr}
            </span>
          </div>
          <span className={statusClass[status]}>{status}</span>
        </div>

        <h3 className={`font-sans font-semibold text-synergy-dark leading-snug line-clamp-2 ${featured ? "text-base" : "text-sm"}`}>
          {video.title}
        </h3>

        {featured && video.description && (
          <p className="mt-1 text-sm text-synergy-muted line-clamp-2 font-sans font-light">
            {video.description}
          </p>
        )}

        <a
          href={video.watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 font-mono text-[10px] tracking-widest uppercase text-synergy-navy hover:text-synergy-amber transition-colors"
        >
          WATCH NOW →
        </a>
      </div>
    </article>
  );
}
