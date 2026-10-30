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

### Episode data: RSS feed
Episodes are fetched at build time from `https://theitxp.libsyn.com/rss` via `lib/feed.ts`. ISR revalidates every 15 minutes, so new episodes appear without a redeploy, usually within about 15 minutes of going live on Libsyn.

- The feed fetch uses `FEED_REVALIDATE_SECONDS = 900` and cache tag `libsyn-feed` in `lib/feed.ts`.
- `/`, `/episodes`, `/[slug]` and `/sitemap.xml` each export `revalidate = 900`. Next needs a literal there, so if you change the interval, change `FEED_REVALIDATE_SECONDS` and all four files together.
- On-demand refresh: `POST /api/revalidate` with header `Authorization: Bearer $REVALIDATE_SECRET` expires the `libsyn-feed` tag right away. `REVALIDATE_SECRET` is set by Chuck in Vercel; while it is unset (or shorter than 32 characters) the route returns 503.
- YouTube videos on `/` (`lib/youtube.ts`) are a separate fetch that still revalidates every 2 hours.

- `getEpisodes()`: all episodes, newest first
- `getEpisodeBySlug(slug)`: lookup by slug
- `getEpisodesBySeason()`: `Map<season, Episode[]>` sorted by season descending
- Episode URL slug = last path segment of the Libsyn `<link>` URL (e.g. `season-12-is-here-my-ai-stack-china-and-whats-next`)

### YouTube videos
`lib/youtube.ts` reads the channel's public feed (`https://www.youtube.com/feeds/videos.xml?channel_id=...`) for the "Latest Videos" row on `/`. `getVideos()` returns `[]` on any fetch or parse error, and `/` hides the row when the list is empty. `CHANNEL_URL` is the channel link.

### Everything else is in the route files
There is no `content/` folder and no Markdown pipeline. `/about` copy is written directly in `app/about/page.tsx`, and the contact form is `app/contact/page.tsx`. There are no guest, host or blog pages.

### Routes

| Route | Source |
|---|---|
| `/` | `app/page.tsx`: latest 6 episodes from RSS, plus latest 6 YouTube videos |
| `/episodes` | `app/episodes/page.tsx`: all episodes grouped by season |
| `/[slug]` | `app/[slug]/page.tsx`: one episode (RSS-driven, `generateStaticParams`) |
| `/about` | `app/about/page.tsx`: static copy in the page file |
| `/contact` | `app/contact/page.tsx` (client form, Cloudflare Turnstile) with metadata in `app/contact/layout.tsx` |
| `/api/contact` | `app/api/contact/route.ts`: POST, checks the honeypot and Turnstile token, then sends the message with Resend |
| `/api/revalidate` | `app/api/revalidate/route.ts`: POST only, `Authorization: Bearer $REVALIDATE_SECRET`, expires the `libsyn-feed` tag; 503 while the secret is unset or under 32 characters |
| `/sitemap.xml` | `app/sitemap.ts`: home, `/episodes` and every episode URL |
| `/opengraph-image` | `app/opengraph-image.tsx`: generated share image (`next/og`) |
| `/icon.png`, `/apple-icon.png`, `/favicon.ico` | static files in `app/` |

Shared layout: `app/layout.tsx` (IBM Plex Sans, Sans Condensed and Mono via `next/font/google`) with `components/Nav.tsx` and `components/Footer.tsx`.

### Env vars
Set by Chuck in Vercel, never by an agent: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (contact form widget), `TURNSTILE_SECRET_KEY` and `RESEND_API_KEY` (`/api/contact`), and optional `REVALIDATE_SECRET` (`/api/revalidate`, 32+ characters).

### Static assets
`public/` holds `robots.txt`, `llms.txt` and `img/episode/theitxp_album.png`. Episode artwork comes from Libsyn (`static.libsyn.com`, `traffic.libsyn.com`) and video thumbnails from `i.ytimg.com` (and `i1` to `i4`); these hosts are allowed in `next.config.ts` `images.remotePatterns`.

## Key Conventions

- **`extractString(val)`** in `lib/feed.ts` (and its twin in `lib/youtube.ts`): handles fast-xml-parser CDATA objects; use it for any RSS field that might be wrapped in `{ "#cdata": "..." }`
- **Episode audio** uses a native `<audio>` element in `components/EpisodePlayer.tsx` (client component) with the `enclosure` MP3 URL from RSS
- **Episode and video cards** are `components/EpisodeCard.tsx` and `components/VideoCard.tsx`
- **Tailwind typography** (`prose prose-gray max-w-none`) renders the HTML episode description on `/[slug]` and the `/about` copy; `.prose` colors are set in `app/globals.css`
- **Copy rules**: no em or en dashes in visitor-facing text

## Adding Content

**New episodes** appear automatically via ISR (no code changes needed). Publish on Libsyn and the site picks it up on its next revalidation.

**About or contact copy:** edit the page file directly (`app/about/page.tsx`, `app/contact/page.tsx`).
