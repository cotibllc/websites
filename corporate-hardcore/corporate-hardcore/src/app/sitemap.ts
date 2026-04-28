import { MetadataRoute } from "next";
import { getSortedPostsData } from "@/lib/blog";
import { getSortedJargonData } from "@/lib/jargon";

const BASE = "https://www.corphardcore.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getSortedPostsData();
  const jargonPosts = getSortedJargonData();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/glossary`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/company`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const jargonPages: MetadataRoute.Sitemap = jargonPosts.map((post) => ({
    url: `${BASE}/blog/jargon/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [...staticPages, ...postPages, ...jargonPages];
}
