# Copilot Instructions

## Project Overview

Next.js 16 (App Router, TypeScript, Tailwind CSS) podcast website for **The IT XP** (theitxp.com), deployed on Vercel.

## Commands

```bash
npm run dev      # Local dev server (http://localhost:3000)
npm run build    # Production build (fetches live RSS feed)
npm run lint     # ESLint
npm run typecheck  # tsc --noEmit
npm test         # smoke test (runs next build)
```

## Architecture

### Episode data — RSS feed
Episodes are fetched at build time from `https://theitxp.libsyn.com/rss` via `lib/feed.ts`. ISR revalidates every 15 minutes, so new episodes appear without a redeploy, usually within about 15 minutes of going live on Libsyn.

- The feed fetch uses `FEED_REVALIDATE_SECONDS = 900` and cache tag `libsyn-feed` in `lib/feed.ts`.
- `/`, `/episodes`, `/[slug]` and `/sitemap.xml` each export `revalidate = 900`. Next needs a literal there, so if you change the interval, change `FEED_REVALIDATE_SECONDS` and all four files together.
- On-demand refresh: `POST /api/revalidate` with header `Authorization: Bearer $REVALIDATE_SECRET` expires the `libsyn-feed` tag right away. `REVALIDATE_SECRET` is set by Chuck in Vercel; while it is unset (or shorter than 32 characters) the route returns 503.
- YouTube videos on `/` (`lib/youtube.ts`) are a separate fetch that still revalidates every 2 hours.

- `getEpisodes()` — all episodes, newest first
- `getEpisodeBySlug(slug)` — lookup by slug
- `getEpisodesBySeason()` — `Map<season, Episode[]>` sorted by season descending
- Episode URL slug = last path segment of the Libsyn `<link>` URL (e.g. `season-12-is-here-my-ai-stack-china-and-whats-next`)

### Other content — Markdown files
Guests, hosts, and blog posts live in `content/` as Markdown with Hugo-style TOML (`+++`) front matter. `lib/content.ts` handles parsing with `gray-matter` + `remark`.

- `getAllContent(type)` — all items in `content/<type>/`
- `getContentItem(type, slug)` — single item
- `getSinglePage(filename)` — top-level pages like `content/about/about.md`
- Front matter keys are title-cased in guest/host files (`Title`, `Thumbnail`, `Twitter`, `GitHub`, `Linkedin`, etc.)

### Routes

| Route | Source |
|---|---|
| `/` | Latest 6 episodes from RSS |
| `/episodes` | All episodes grouped by season |
| `/[slug]` | Individual episode (RSS-driven, `generateStaticParams`) |
| `/guest`, `/guest/[slug]` | `content/guest/*.md` |
| `/host`, `/host/[slug]` | `content/host/*.md` |
| `/blog`, `/blog/[slug]` | `content/blog/*.md` |
| `/about` | `content/about/about.md` |
| `/contact` | `content/contact.md` |

### Static assets
Images live in `public/img/` organized as `guest/`, `host/`, `episode/`, `sponsors/`. Reference them as `/img/<type>/<filename>` in front matter (e.g. `Thumbnail = "img/guest/jsmith.jpg"`).

## Key Conventions

- **`FrontMatterValue`** type (`string | number | boolean | string[] | null | undefined`) — always cast front matter values with `String()` before rendering or passing to props
- **`extractString(val)`** in `lib/feed.ts` — handles fast-xml-parser CDATA objects; use it for any RSS field that might be wrapped in `{ "#cdata": "..." }`
- **Episode audio** uses a native `<audio>` element in `components/EpisodePlayer.tsx` (client component) with the `enclosure` MP3 URL from RSS
- **Tailwind typography** (`prose prose-gray max-w-none`) for rendering HTML episode descriptions and markdown content bodies

## Adding Content

**New guest/host:** create `content/guest/<slug>.md` with TOML front matter, add photo to `public/img/guest/<slug>.jpg`.

**New blog post:** create `content/blog/<slug>.md` with `title` and `date` in front matter.

**New episodes** appear automatically via ISR (no code changes needed).
