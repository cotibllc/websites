# The IT XP — Podcast Website

Website for **The IT XP** podcast — honest, unfiltered IT career and technology content for experienced sysadmins, engineers, and IT leaders. Hosted by Chuck Betancourt, 25+ years in the field.

Live at [theitxp.com](https://www.theitxp.com).

A brand of [COTIB LLC](https://cotib.com).

---

## Brand

> "Real IT. No filler."

The IT XP is built for IT professionals with real experience. The central thesis: the more experience you have, the more valuable AI makes you. AI amplifies human judgment — it does not replace it.

See `the-it-xp-brand-foundations-v1.1.md` for the complete brand guide (voice, tone, visual identity, color system, typography).

**Brand colors:**

| Role | Name | Hex |
|---|---|---|
| Primary | Deep Navy | `#0D1724` |
| Secondary | Electric Blue | `#1B7FFF` |
| Accent | Amber Gold | `#F5A623` |

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + `@tailwindcss/typography`
- **Podcast Feed**: Libsyn RSS via `fast-xml-parser` (images from `static.libsyn.com` / `traffic.libsyn.com`)
- **Content**: Markdown via `gray-matter` + `remark`
- **Contact Form**: Cloudflare Turnstile + Resend
- **Deployment**: Vercel

---

## Development

```bash
cd TheITXP/itxp-podcast
npm install
cp .env.example .env.local   # fill in required keys
npm run dev                  # http://localhost:3000
```

### Required environment variables

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Resend API key for contact form emails |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile public site key |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile server-side secret |

---

## Project Structure

```
itxp-podcast/
├── app/                           ← Next.js App Router
│   ├── layout.tsx                 ← root layout, metadata
│   ├── page.tsx                   ← homepage
│   └── ...                        ← episode and blog routes
├── components/                    ← shared UI components
├── public/                        ← static assets
├── the-it-xp-brand-foundations-v1.1.md  ← brand guide
├── the-it-xp-brand-preview-v1.1.jsx     ← brand preview component
├── next.config.ts                 ← Libsyn image domain allowlist
└── vercel.json
```

---

## Podcast Feed

Episodes are pulled from Libsyn via RSS. The `next.config.ts` allowlist enables Next.js `<Image>` to load episode artwork from:
- `static.libsyn.com`
- `traffic.libsyn.com`

---

## Deployment

Push to GitHub and connect to Vercel. Set environment variables in the Vercel dashboard.

---

## Social

| Platform | Handle |
|---|---|
| YouTube | [@theitxp](https://www.youtube.com/@theitxp) |
| Twitter/X | [@theitxp](https://twitter.com/theitxp) |
