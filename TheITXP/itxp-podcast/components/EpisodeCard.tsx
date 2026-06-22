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
    <article className="bg-slate border border-slate/50 rounded-xl p-5 hover:border-blue hover:shadow-lg hover:shadow-blue/5 transition-all flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap text-xs">
        {episode.season > 0 && (
          <span className="font-mono text-amber tracking-wider font-semibold uppercase">
            S{episode.season} · E{episode.episodeNumber}
          </span>
        )}
        <span className="text-steel font-mono">{date}</span>
        {episode.duration && (
          <span className="text-steel font-mono ml-auto">{episode.duration}</span>
        )}
      </div>
      <h2 className="font-semibold text-white leading-snug text-lg">
        <Link href={`/${episode.slug}`} className="hover:text-amber transition-colors">
          {episode.title}
        </Link>
      </h2>
    </article>
  );
}
