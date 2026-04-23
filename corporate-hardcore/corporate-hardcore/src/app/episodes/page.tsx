import type { Metadata } from "next";
import { getVideos } from "@/lib/youtube";
import { getEpisodeStatus } from "@/data/content";
import EpisodeCard from "@/components/EpisodeCard";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Episode Archive",
  description: "All Corporate Hardcore episodes. Filed, under review, or pending acknowledgment.",
  alternates: { canonical: "/episodes" },
};

export default async function EpisodesPage() {
  const videos = await getVideos();

  return (
    <div className="mx-auto content-max px-4 py-8">
      {/* Page header */}
      <div className="intranet-card mb-6">
        <div className="intranet-header flex items-center justify-between">
          <span>Episode Archive — All Seasons</span>
          <span className="text-white/50">{videos.length} records</span>
        </div>
        {/* Fake filter bar */}
        <div className="px-4 py-3 bg-synergy-white border-t border-synergy-rule flex flex-wrap gap-3 items-center">
          <span className="dept-label">Filter by:</span>
          {(["SEASON", "DEPARTMENT", "STATUS"] as const).map((label) => (
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

      {/* Episode list */}
      {videos.length === 0 ? (
        <div className="intranet-card p-8 text-center">
          <p className="dept-label mb-2">No records found</p>
          <p className="font-sans text-sm text-synergy-muted">
            Episodes are retrieved from the field periodically. Check back later.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((video, i) => (
            <EpisodeCard
              key={video.videoId}
              video={video}
              episodeNumber={i + 1}
              status={getEpisodeStatus(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
