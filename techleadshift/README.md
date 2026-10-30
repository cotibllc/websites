# Tech Lead Shift

Website for **Tech Lead Shift**: articles on what it takes to manage hybrid teams of human workers and autonomous AI agents.

Live at [techleadshift.com](https://techleadshift.com). Published on [Substack](https://techleadshift.substack.com).

A brand of [COTIB LLC](https://cotib.com). Written by Charles Betancourt, Director of Cloud Engineering with 25+ years of technology leadership.

---

## What the site is

An ongoing publication: new articles twice a month, on Wednesdays, on Substack. The homepage leads with the newest article (read from the Substack RSS feed), shows the next approved Wednesday, three recent articles, and a "Start here" shelf for the Core Series (a prologue plus Articles 1 to 10, which is finished). `/archive` lists every article by date and marks the Core Series with a gold rule.

### Where the data comes from

| Data | Source | How to change it |
|---|---|---|
| Latest, Recent, Archive | Substack RSS, `https://techleadshift.substack.com/feed`, revalidated hourly | Publish on Substack. No code edit. |
| Core Series membership and the Start here picks | `lib/core-series.ts` (matched by slug, because the feed has no categories) | Edit the list. The list also holds an offline snapshot used if the feed is down. |
| "Next: Wed ..." line | `lib/schedule.ts`, `APPROVED_WEDNESDAYS` | Add new approved dates. When none is left the line is hidden. |
| Feed URL override (testing only) | `TLS_FEED_URL` env var, server side, unset in production | Point at a local mock to test the failure, empty and no-cover states. |

If the feed fails or is empty, the pages still render: the lead area points to Substack, and the shelf and archive use the local snapshot with a notice.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Contact Form**: Cloudflare Turnstile + Resend
- **Deployment**: Vercel

---

## Development

```bash
npm install
cp .env.example .env.local   # fill in required keys
npm run dev                  # http://localhost:3000
```

### Required environment variables

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Resend API key for contact/speaking inquiry emails |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile public site key |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile server-side secret |

---

## Tests and checks

```bash
npm ci
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # unit tests (feed, Core Series, schedule, components), then the smoke build
```


## Project Structure

```
techleadshift/
├── app/
│   ├── layout.tsx          ← root layout, fonts, metadata (apex host)
│   ├── page.tsx            ← home: nameplate, lead, recent, Start here, subscribe, about
│   ├── archive/page.tsx    ← every article by date, Core Series marked
│   ├── work/page.tsx       ← consulting and speaking inquiry
│   ├── opengraph-image.tsx ← OG image generation
│   └── sitemap.ts          ← sitemap (/, /archive, /work)
├── components/             ← Lead, PostRow, StartHere, FeedNotice, Nav, Footer, ContactForm
├── lib/                    ← feed.ts (RSS), core-series.ts, schedule.ts, site.ts, and the unit tests
├── public/                 ← robots.txt, llms.txt
└── vercel.json
```

---

## Deployment

Push to GitHub and connect to Vercel. Add environment variables in the Vercel dashboard.

---

## Contact

- [Substack](https://techleadshift.substack.com)
- [LinkedIn](https://www.linkedin.com/in/charles-b-technologist/)
