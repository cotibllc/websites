import { getEpisodes } from "@/lib/feed";
import EpisodeCard from "@/components/EpisodeCard";
import Link from "next/link";

export const revalidate = 86400;

export default async function HomePage() {
  const episodes = await getEpisodes();
  const latest = episodes.slice(0, 6);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <section className="mb-14 text-center">
        <h1 className="font-condensed font-bold text-5xl md:text-6xl tracking-tight uppercase leading-none mb-4">
          THE IT <span className="text-amber">XP</span>
        </h1>
        <p className="text-lg text-steel max-w-2xl mx-auto leading-relaxed">
          Pulling back the curtain on what it&apos;s really like to work in Information Technology.
          Career insights, real talk, and hard-won experience points for IT professionals.
        </p>
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <a
            href="https://podcasts.apple.com/us/podcast/the-it-xp/id1330172385"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-amber text-navy font-semibold px-5 py-2.5 rounded hover:opacity-90 transition-opacity uppercase tracking-wide text-xs"
          >
            Apple Podcasts
          </a>
          <a
            href="https://theitxp.libsyn.com/rss"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-blue text-blue px-5 py-2.5 rounded hover:bg-blue hover:text-white transition-colors uppercase tracking-wide text-xs"
          >
            RSS Feed
          </a>
        </div>
      </section>

      {/* Latest Episodes */}
      <section>
        <div className="flex items-center justify-between mb-6 border-b border-slate pb-4">
          <h2 className="font-condensed font-bold text-2xl uppercase tracking-tight">Latest Episodes</h2>
          <Link href="/episodes" className="font-mono text-sm text-blue hover:text-amber transition-colors">
            View all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((ep) => (
            <EpisodeCard key={ep.guid} episode={ep} />
          ))}
        </div>
      </section>
    </div>
  );
}
