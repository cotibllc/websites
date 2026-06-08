import { XMLParser } from "fast-xml-parser";

// The IT XP YouTube channel (@theitxp). YouTube publishes a free, key-less
// RSS feed of the most recent ~15 uploads per channel — no API quota needed.
const CHANNEL_ID = "UCaHtxKdXJIFCu-Tjsv1B8Mg";
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

export const CHANNEL_URL = "https://www.youtube.com/@theitxp";

export interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  published: string;
}

function extractString(val: unknown): string {
  if (typeof val === "string") return val;
  if (val && typeof val === "object") {
    const obj = val as Record<string, unknown>;
    if (typeof obj["#text"] === "string") return obj["#text"];
  }
  return String(val ?? "");
}

interface RawEntry {
  "yt:videoId"?: unknown;
  title?: unknown;
  published?: unknown;
  link?: { "@_href"?: string } | { "@_href"?: string }[];
  "media:group"?: {
    "media:thumbnail"?: { "@_url"?: string };
  };
}

function parseEntry(entry: RawEntry): Video {
  const id = extractString(entry["yt:videoId"]);
  const linkRaw = entry["link"];
  const link = Array.isArray(linkRaw) ? linkRaw[0] : linkRaw;
  const url = link?.["@_href"] ?? `https://www.youtube.com/watch?v=${id}`;
  const thumbnail =
    entry["media:group"]?.["media:thumbnail"]?.["@_url"] ??
    `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  return {
    id,
    title: extractString(entry["title"]),
    url,
    thumbnail,
    published: extractString(entry["published"]),
  };
}

let cachedVideos: Video[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in-process cache

export async function getVideos(): Promise<Video[]> {
  if (cachedVideos && Date.now() - cacheTime < CACHE_TTL) {
    return cachedVideos;
  }

  try {
    const res = await fetch(FEED_URL, { next: { revalidate: 86400 } });
    if (!res.ok) return cachedVideos ?? [];
    const xml = await res.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });

    const result = parser.parse(xml);
    const entriesRaw = result?.feed?.entry ?? [];
    const entries: RawEntry[] = Array.isArray(entriesRaw) ? entriesRaw : [entriesRaw];

    cachedVideos = entries.map(parseEntry).filter((v) => v.id);
    cacheTime = Date.now();
    return cachedVideos;
  } catch {
    // Network/parse failure: serve stale cache if we have it, else empty.
    return cachedVideos ?? [];
  }
}
