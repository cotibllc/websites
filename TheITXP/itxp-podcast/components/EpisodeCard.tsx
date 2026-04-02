import Link from "next/link";
import type { Episode } from "@/lib/feed";

interface Props {
  episode: Episode;
}

export default function EpisodeCard({ episode }: Props) {
  const date = new Date(episode.pubDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <article className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        {episode.season > 0 && (
          <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            S{episode.season} · E{episode.episodeNumber}
          </span>
        )}
        <span className="text-xs text-gray-500">{date}</span>
        {episode.duration && (
          <span className="text-xs text-gray-500 ml-auto">{episode.duration}</span>
        )}
      </div>
      <h2 className="font-semibold text-gray-900 leading-snug">
        <Link href={`/${episode.slug}`} className="hover:text-blue-600 transition-colors">
          {episode.title}
        </Link>
      </h2>
    </article>
  );
}
