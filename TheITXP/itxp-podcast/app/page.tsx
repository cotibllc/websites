import { getEpisodes } from "@/lib/feed";
import { getVideos, getPodcastVideoIds, CHANNEL_URL } from "@/lib/youtube";
import { excludePodcastVideos } from "@/lib/videoFilter";
import EpisodeCard from "@/components/EpisodeCard";
import VideoCard from "@/components/VideoCard";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 900; // 15 min, matches FEED_REVALIDATE_SECONDS in lib/feed.ts

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const podcastJsonLd = {
  "@context": "https://schema.org",
  "@type": "PodcastSeries",
  name: "The IT XP",
  url: "https://www.theitxp.com",
  description:
    "A podcast for IT professionals — pulling back the curtain on what it's really like to work in Information Technology.",
  webFeed: "https://theitxp.libsyn.com/rss",
  author: {
    "@type": "Person",
    name: "Chuck Betancourt",
  },
};

export default async function HomePage() {
  const [episodes, videos, podcastVideoIds] = await Promise.all([
    getEpisodes(),
    getVideos(),
    getPodcastVideoIds(),
  ]);
  const latest = episodes.slice(0, 6);
  // Podcast episodes are already listed above from Libsyn, so keep their
  // YouTube uploads out of Latest Videos. Shorts stay in.
  const latestVideos = excludePodcastVideos(
    videos,
    podcastVideoIds,
    episodes.map((e) => e.title),
  ).slice(0, 6);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(podcastJsonLd) }}
      />
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

      {/* Latest Videos */}
      {latestVideos.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center justify-between mb-6 border-b border-slate pb-4">
            <h2 className="font-condensed font-bold text-2xl uppercase tracking-tight">Latest Videos</h2>
            <a
              href={CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-blue hover:text-amber transition-colors"
            >
              YouTube channel →
            </a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
