import { XMLParser } from "fast-xml-parser";

const RSS_URL = "https://theitxp.libsyn.com/rss";

export interface Episode {
  title: string;
  slug: string;
  pubDate: string;
  description: string;
  enclosureUrl: string;
  enclosureLength: number;
  duration: string;
  season: number;
  episodeNumber: number;
  episodeType: string;
  guid: string;
  libsynUrl: string;
  explicit: boolean;
}

function extractString(val: unknown): string {
  if (typeof val === "string") return val;
  if (val && typeof val === "object") {
    const obj = val as Record<string, unknown>;
    // fast-xml-parser CDATA result
    if (typeof obj["#cdata"] === "string") return obj["#cdata"];
    if (typeof obj["#text"] === "string") return obj["#text"];
  }
  return String(val ?? "");
}

function slugFromUrl(url: string): string {
  try {
    return new URL(url).pathname.replace(/^\//, "").replace(/\/$/, "");
  } catch {
    // fallback: treat as path
    return url.replace(/^\//, "").replace(/\/$/, "");
  }
}

function parseEpisode(item: Record<string, unknown>): Episode {
  const enclosure = item["enclosure"] as Record<string, string> | undefined;
  const link = extractString(item["link"]);
  const description = extractString(item["content:encoded"] ?? item["description"] ?? "");
  const guid = item["guid"];
  const guidStr =
    typeof guid === "object" && guid !== null
      ? extractString((guid as Record<string, unknown>)["#text"] ?? guid)
      : String(guid ?? "");

  return {
    title: extractString(item["title"]),
    slug: slugFromUrl(link),
    pubDate: String(item["pubDate"] ?? ""),
    description,
    enclosureUrl: enclosure?.["@_url"] ?? "",
    enclosureLength: Number(enclosure?.["@_length"] ?? 0),
    duration: String(item["itunes:duration"] ?? ""),
    season: Number(item["itunes:season"] ?? 0),
    episodeNumber: Number(item["itunes:episode"] ?? 0),
    episodeType: String(item["itunes:episodeType"] ?? "full"),
    guid: guidStr,
    libsynUrl: link,
    explicit: String(item["itunes:explicit"]).toLowerCase() === "true",
  };
}

let cachedEpisodes: Episode[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in-process cache

export async function getEpisodes(): Promise<Episode[]> {
  if (cachedEpisodes && Date.now() - cacheTime < CACHE_TTL) {
    return cachedEpisodes;
  }

  const res = await fetch(RSS_URL, { next: { revalidate: 86400 } });
  const xml = await res.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    cdataPropName: "#cdata",
  });

  const result = parser.parse(xml);
  const items: Record<string, unknown>[] = result?.rss?.channel?.item ?? [];

  cachedEpisodes = items.map(parseEpisode);
  cacheTime = Date.now();
  return cachedEpisodes;
}

export async function getEpisodeBySlug(slug: string): Promise<Episode | undefined> {
  const episodes = await getEpisodes();
  return episodes.find((ep) => ep.slug === slug);
}

export async function getEpisodesBySeason(): Promise<Map<number, Episode[]>> {
  const episodes = await getEpisodes();
  const map = new Map<number, Episode[]>();
  for (const ep of episodes) {
    const s = ep.season || 0;
    if (!map.has(s)) map.set(s, []);
    map.get(s)!.push(ep);
  }
  // Sort seasons descending
  return new Map([...map.entries()].sort((a, b) => b[0] - a[0]));
}
