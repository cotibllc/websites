import { getEpisodes, getEpisodeBySlug } from "@/lib/feed";
import EpisodePlayer from "@/components/EpisodePlayer";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 86400;

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
      <div className="flex flex-wrap gap-2 mb-4 text-sm">
        {episode.season > 0 && (
          <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">
            Season {episode.season} · Episode {episode.episodeNumber}
          </span>
        )}
        <span className="text-gray-500">{date}</span>
        {episode.duration && (
          <span className="text-gray-500">· {episode.duration}</span>
        )}
      </div>

      <h1 className="text-3xl font-bold mb-6 leading-snug">{episode.title}</h1>

      <EpisodePlayer src={episode.enclosureUrl} title={episode.title} />

      <div
        className="prose prose-gray max-w-none mt-6"
        dangerouslySetInnerHTML={{ __html: episode.description }}
      />
    </article>
  );
}
