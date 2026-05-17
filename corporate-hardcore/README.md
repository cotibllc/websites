# Corporate Hardcore

Source code for **corphardcore.com** — observational satire for the corporate lifer. Not a rebellion. An observation. Content that documents the absurdity of office culture through a lens every nine-to-fiver will recognize.

A brand of [COTIB LLC](https://cotib.com).

---

## Project Structure

```
corporate-hardcore/
├── package-lock.json                  ← root-level lock file
└── corporate-hardcore/                ← Next.js application
    ├── src/
    │   ├── app/                       ← Next.js App Router pages
    │   │   ├── blog/[slug]/           ← individual post pages
    │   │   └── about/                 ← about page
    │   ├── components/                ← shared UI components
    │   ├── content/posts/             ← Markdown blog posts (gray-matter)
    │   └── styles/globals.css         ← Tailwind entry point
    └── public/                        ← static assets
```

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3 + `@tailwindcss/typography`
- **Content**: Markdown files via `gray-matter` + `remark`
- **Contact/Forms**: Cloudflare Turnstile + Resend
- **Date formatting**: date-fns
- **Deployment**: Vercel

---

## Development

```bash
cd corporate-hardcore/corporate-hardcore
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

## Content

Blog posts live in `src/content/posts/` as Markdown files with gray-matter frontmatter. The `[slug]` dynamic route renders individual posts.

---

## Deployment

Push to GitHub and connect the repo to Vercel. Set the root directory to `corporate-hardcore/corporate-hardcore` in Vercel project settings. Add environment variables in the Vercel dashboard.

---

## Brand

| Platform | Handle |
|---|---|
| YouTube | [@corphardcore](https://www.youtube.com/@corphardcore) |
| Instagram | [@corphardcore](https://www.instagram.com/corphardcore/) |
| TikTok | [@corphardcore](https://www.tiktok.com/@corphardcore) |
