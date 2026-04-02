import { getEpisodesBySeason } from "@/lib/feed";
import EpisodeCard from "@/components/EpisodeCard";
import type { Metadata } from "next";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Episodes",
  description: "All episodes of The IT XP podcast, organized by season.",
};

export default async function EpisodesPage() {
  const bySeason = await getEpisodesBySeason();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-10">All Episodes</h1>

      {[...bySeason.entries()].map(([season, episodes]) => (
        <section key={season} className="mb-12">
          <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-5">
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
