import { XMLParser } from 'fast-xml-parser';

const CHANNEL_ID = 'UCzZEnFPu4K0yiXCt7cFHmIA';
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

export interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  published: string;
  thumbnail: string;
  watchUrl: string;
}

type RSSEntry = {
  videoId?: string;
  title?: string;
  published?: string;
  group?: {
    description?: string;
    thumbnail?: { '@_url'?: string };
  };
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
});

export async function getVideos(): Promise<YouTubeVideo[]> {
  try {
    const res = await fetch(RSS_URL, { next: { revalidate: 86400 } });
    if (!res.ok) {
      console.error(`YouTube RSS fetch failed: ${res.status}`);
      return [];
    }

    const xml = await res.text();
    const parsed = parser.parse(xml) as { feed?: { entry?: RSSEntry | RSSEntry[] } };
    const raw = parsed?.feed?.entry;
    if (!raw) return [];

    const entries: RSSEntry[] = Array.isArray(raw) ? raw : [raw];

    return entries.map((entry) => {
      const videoId = entry.videoId ?? '';
      return {
        videoId,
        title: entry.title ?? '',
        description: entry.group?.description ?? '',
        published: entry.published ?? '',
        thumbnail:
          entry.group?.thumbnail?.['@_url'] ??
          `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      };
    });
  } catch (err) {
    console.error('YouTube RSS parse error:', err);
    return [];
  }
}

export async function getLatestVideo(): Promise<YouTubeVideo | null> {
  const videos = await getVideos();
  return videos[0] ?? null;
}

export function formatPublishedDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}
