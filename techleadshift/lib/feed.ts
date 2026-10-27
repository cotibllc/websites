import { DEFAULT_FEED_URL, REVALIDATE_SECONDS } from "./site";

export type Post = {
  slug: string;
  title: string;
  link: string;
  /** Plain-text subtitle from the feed. Empty when the post has none. */
  dek: string;
  /** ISO 8601, UTC. */
  publishedAt: string;
  coverUrl?: string;
};

/** The feed fetch never throws. The status says what the page should show. */
export type FeedResult =
  | { status: "ok"; posts: Post[] }
  | { status: "empty"; posts: [] }
  | { status: "unavailable"; posts: [] };

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, body: string) => {
    if (body[0] === "#") {
      const code = body[1].toLowerCase() === "x" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : whole;
    }
    return ENTITIES[body.toLowerCase()] ?? whole;
  });
}

function tagText(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>\\s*(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))\\s*</${tag}>`));
  if (!m) return "";
  return m[1] !== undefined ? m[1].trim() : decodeEntities(m[2] ?? "").trim();
}

function stripTags(text: string): string {
  return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function slugFromUrl(url: string): string {
  const m = url.match(/\/p\/([^/?#]+)/);
  return m ? m[1] : "";
}

function httpsOnly(url: string): string | undefined {
  try {
    const u = new URL(url);
    return u.protocol === "https:" ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

/** Parse Substack RSS into posts, newest first. Items missing a title, link or valid date are skipped. */
export function parseFeed(xml: string): Post[] {
  const posts: Post[] = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const block = m[1];
    const title = stripTags(tagText(block, "title"));
    const link = tagText(block, "link");
    const slug = slugFromUrl(link);
    const time = Date.parse(tagText(block, "pubDate"));
    if (!title || !slug || Number.isNaN(time) || !httpsOnly(link)) continue;
    const enclosure = block.match(/<enclosure\s[^>]*url="([^"]+)"/);
    const coverUrl = enclosure ? httpsOnly(decodeEntities(enclosure[1])) : undefined;
    posts.push({
      slug,
      title,
      link,
      dek: stripTags(tagText(block, "description")),
      publishedAt: new Date(time).toISOString(),
      ...(coverUrl ? { coverUrl } : {}),
    });
  }
  return posts.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

/** The feed URL. TLS_FEED_URL is a server-side test override and is unset in production. */
export function feedUrl(env: Record<string, string | undefined> = process.env): string {
  const override = env.TLS_FEED_URL;
  if (override && /^https?:\/\//.test(override)) return override;
  return DEFAULT_FEED_URL;
}

type FetchLike = (url: string, init?: RequestInit & { next?: { revalidate: number } }) => Promise<Response>;

export async function fetchFeed(fetchImpl: FetchLike = fetch as FetchLike, url: string = feedUrl()): Promise<FeedResult> {
  try {
    const res = await fetchImpl(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(8000),
      headers: { accept: "application/rss+xml, application/xml, text/xml" },
    });
    if (!res.ok) return { status: "unavailable", posts: [] };
    const posts = parseFeed(await res.text());
    return posts.length > 0 ? { status: "ok", posts } : { status: "empty", posts: [] };
  } catch {
    return { status: "unavailable", posts: [] };
  }
}
