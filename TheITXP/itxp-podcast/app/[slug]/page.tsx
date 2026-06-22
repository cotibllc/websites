import { getEpisodes, getEpisodeBySlug } from "@/lib/feed";
import EpisodePlayer from "@/components/EpisodePlayer";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 7200;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const episodes = await getEpisodes();
  return episodes.map((ep) => ({ slug: ep.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const episode = await getEpisodeBySlug(slug);
  if (!episode) return {};
  return {
    title: episode.title,
    description: episode.description.replace(/<[^>]*>/g, "").slice(0, 160),
  };
}

export default async function EpisodePage({ params }: Props) {
  const { slug } = await params;
  const episode = await getEpisodeBySlug(slug);
  if (!episode) notFound();

  const date = new Date(episode.pubDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      {/* Meta badges */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {episode.season > 0 && (
          <span className="bg-amber/5 border border-amber/20 text-amber px-2.5 py-0.5 rounded font-mono font-semibold text-xs tracking-wider uppercase">
            S{episode.season} · E{episode.episodeNumber}
          </span>
        )}
        <span className="text-steel font-mono text-xs">{date}</span>
        {episode.duration && (
          <span className="text-steel font-mono text-xs">· {episode.duration}</span>
        )}
      </div>

      <h1 className="font-condensed font-bold text-4xl md:text-5xl text-white uppercase tracking-tight mb-6 leading-tight">
        {episode.title}
      </h1>

      <EpisodePlayer src={episode.enclosureUrl} title={episode.title} />

      <div
        className="prose prose-gray max-w-none mt-6"
        dangerouslySetInnerHTML={{ __html: episode.description }}
      />
    </article>
  );
}
