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
        <h1 className="text-4xl font-bold mb-4">The IT XP</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Pulling back the curtain on what it&apos;s really like to work in Information Technology.
          Career insights, real talk, and hard-won experience points for IT professionals.
        </p>
        <div className="mt-6 flex justify-center gap-4 flex-wrap text-sm">
          <a
            href="https://podcasts.apple.com/us/podcast/the-it-xp/id1330172385"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Apple Podcasts
          </a>
          <a
            href="https://theitxp.libsyn.com/rss"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-gray-500 transition-colors"
          >
            RSS Feed
          </a>
        </div>
      </section>

      {/* Latest Episodes */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Latest Episodes</h2>
          <Link href="/episodes" className="text-sm text-blue-600 hover:underline">
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
