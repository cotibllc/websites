# Earned Escape

Production-ready Node.js website for **Earned Escape**, the travel advisory brand of COTIB Adventures LLC, operated by Chuck Betancourt. Specializing in Royal Caribbean, Disney Cruise Line, Walt Disney World, and Universal Resorts.

---

## Setup

```bash
npm install
cp .env.example .env
npm run dev        # starts on http://localhost:3000
```

Production:
```bash
npm start
```

Generate sitemap:
```bash
npm run build
```

---

## Before Going Live — Update Placeholders

All placeholder values are isolated to **`config/site.js`**. Open that file and replace:

| Token | What to put there |
|---|---|
| `YOUR_CALENDLY_LINK_HERE` | Your Calendly booking URL |
| `YOUR_RC_GUIDE_GDRIVE_LINK_HERE` | Google Drive direct link for RC guide PDF |
| `YOUR_DISNEY_GUIDE_GDRIVE_LINK_HERE` | Google Drive direct link for Disney guide PDF |
| `YOUR_UNIVERSAL_PAGE_LINK_HERE` | URL for your Universal Resorts page |
| `YOUR_FACEBOOK_PAGE_URL_HERE` | Facebook page URL |
| `YOUR_TIKTOK_URL_HERE` | TikTok profile URL |

Also replace `public/images/og/og-default.png` with a real 1200×630 Open Graph image.

If you prefer environment variables instead of editing the config directly, this app also supports:

- `CONSULTATION_URL`
- `RC_GUIDE_URL`
- `DISNEY_GUIDE_URL`
- `UNIVERSAL_PAGE_URL`
- `FACEBOOK_URL`
- `TIKTOK_URL`

---

## Folder Structure

```
earned-escape/
├── config/site.js          ← ALL placeholders live here
├── server.js               ← Entry point
├── app.js                  ← Express + middleware setup
├── routes/                 ← Homepage + redirect routes
├── views/                  ← Nunjucks templates
│   ├── layout/             ← base, head, nav, footer
│   ├── pages/              ← index + 404
│   └── partials/           ← hero, about, destinations, guides, why, contact
├── public/
│   ├── css/                ← main.css imports all partials
│   ├── js/                 ← ES module scripts
│   └── images/logo/        ← All SVG logo files
├── linktree/index.html     ← Standalone page for cotib.link
└── scripts/generate-sitemap.js
```

---

## Deployment

Recommended platforms for Node.js hosting:

- **Railway** — `railway up`, zero config, free tier available
- **Render** — connect GitHub repo, auto-deploy on push
- **Fly.io** — `fly launch`, global edge deployment

Set environment variables on your host:
```
PORT=3000
NODE_ENV=production
SITE_URL=https://earnedescape.agency
```

---

## Domain Configuration

| Domain | Action |
|---|---|
| `earnedescape.agency` | Primary domain — point to your host |
| `earnedescape.co` | 301 redirect → earnedescape.agency |
| `earnedescape.voyage` | 301 redirect → earnedescape.agency/#destinations (cruise tab) |
| `earnedescape.vacations` | 301 redirect → earnedescape.agency/#destinations (parks tab) |
| `cotib.link` | Point to `linktree/index.html` (static host or same server) |

The redirect logic in `routes/redirect.js` handles `.voyage` and `.vacations` → correct anchor + tab automatically when deployed.
