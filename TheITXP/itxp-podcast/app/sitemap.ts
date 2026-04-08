import type { MetadataRoute } from "next";
import { getEpisodes } from "@/lib/feed";
import { getContentSlugs } from "@/lib/content";

const BASE = "https://www.theitxp.com";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const episodes = await getEpisodes();
  const blogSlugs = getContentSlugs("blog");

  const episodeUrls = episodes.map((ep) => ({
    url: `${BASE}/${ep.slug}`,
    lastModified: new Date(ep.pubDate),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const blogUrls = blogSlugs.map((slug) => ({
    url: `${BASE}/blog/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    { url: BASE, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/episodes`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/about`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}/contact`, changeFrequency: "yearly", priority: 0.4 },
    ...episodeUrls,
    ...blogUrls,
  ];
}
