import type { MetadataRoute } from "next";
import { getEpisodes } from "@/lib/feed";

const BASE = "https://www.theitxp.com";

export const revalidate = 7200;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const episodes = await getEpisodes();

  const episodeUrls = episodes.map((ep) => ({
    url: `${BASE}/${ep.slug}`,
    lastModified: new Date(ep.pubDate),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    { url: BASE, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/episodes`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/about`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}/contact`, changeFrequency: "yearly", priority: 0.4 },
    ...episodeUrls,
  ];
}
