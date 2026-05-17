# Corporate Hardcore — Next.js App

Next.js application for [corphardcore.com](https://www.corphardcore.com) — observational satire documenting the absurdity of corporate culture. Not a rebellion. An observation.

A brand of [COTIB LLC](https://cotib.com).

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3 + `@tailwindcss/typography`
- **Content**: Markdown blog posts via `gray-matter` + `remark`
- **Contact/Forms**: Cloudflare Turnstile + Resend
- **Icons**: lucide-react
- **Date formatting**: date-fns
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
| `RESEND_API_KEY` | Resend API key for contact form emails |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile public site key |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile server-side secret |

---

## Project Structure

```
corporate-hardcore/
├── src/
│   ├── app/
│   │   ├── layout.tsx          ← root layout, metadata
│   │   ├── page.tsx            ← homepage
│   │   ├── blog/
│   │   │   ├── page.tsx        ← blog listing
│   │   │   └── [slug]/page.tsx ← individual post
│   │   └── about/page.tsx
│   ├── components/             ← shared UI components
│   ├── content/posts/          ← Markdown files (gray-matter frontmatter)
│   └── styles/globals.css      ← Tailwind entry point
└── public/                     ← static assets, manifest.json
```

---

## Adding Blog Posts

Create a `.md` file in `src/content/posts/` with gray-matter frontmatter:

```markdown
---
title: "Post Title"
date: "2026-01-01"
excerpt: "Brief summary shown on listing page."
---

Post content here.
```

---

## Deployment

Connect the repo to Vercel. Set the project root to `corporate-hardcore/corporate-hardcore`. Add environment variables in the Vercel dashboard.

---

## Social

| Platform | Handle |
|---|---|
| YouTube | [@corphardcore](https://www.youtube.com/@corphardcore) |
| Instagram | [@corphardcore](https://www.instagram.com/corphardcore/) |
| TikTok | [@corphardcore](https://www.tiktok.com/@corphardcore) |
