import { getEpisodesBySeason } from "@/lib/feed";
import EpisodeCard from "@/components/EpisodeCard";
import type { Metadata } from "next";

export const revalidate = 7200;

export const metadata: Metadata = {
  title: "Episodes",
  description: "All episodes of The IT XP podcast, organized by season.",
  alternates: { canonical: "/episodes" },
};

export default async function EpisodesPage() {
  const bySeason = await getEpisodesBySeason();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="font-condensed font-bold text-4xl uppercase tracking-tight mb-10">All Episodes</h1>

      {[...bySeason.entries()].map(([season, episodes]) => (
        <section key={season} className="mb-12">
          <h2 className="text-xl font-bold font-condensed text-steel border-b border-slate pb-2 mb-5 uppercase tracking-wide">
            {season > 0 ? `Season ${season}` : "Episodes"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {episodes.map((ep) => (
              <EpisodeCard key={ep.guid} episode={ep} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
