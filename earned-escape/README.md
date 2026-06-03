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

- `CONSULTATION_URL` (defaults to internal `/plan` page)
- `RC_GUIDE_URL`
- `DISNEY_GUIDE_URL`
- `UNIVERSAL_PAGE_URL`
- `FACEBOOK_URL`
- `TIKTOK_URL`
- `RESEND_API_KEY` (for /plan form emails)
- `TURNSTILE_SECRET_KEY`
- `TURNSTILE_SITE_KEY` (public)

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
│   ├── pages/              ← index, plan, 404, destination pages
│   └── partials/           ← hero, about, destinations, guides, why, contact, cta-strip, process, trust
├── public/
│   ├── css/                ← main.css imports all partials (includes _plan.css)
│   ├── js/                 ← ES module scripts (includes plan form handler)
│   └── images/logo/        ← SVG + PNG logos (new star/compass design from selected Higgsfield generation)
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

---

## New Features (Phase 1)

- **Owned `/plan` consultation page**: Dedicated landing with explanation of support tiers (Full-Service vs Advisory/Light-Touch), detailed inquiry form (name, email, phone, dates, trip type, travelers, message, tier preference), Cloudflare Turnstile spam protection, Resend for notification + confirmation emails. Internal lead capture (replaces external Castle Dreams redirect for primary CTAs).
- **Premium logo redesign**: New star/compass + horizon icon design (selected from Higgsfield generations, ID 808601b3-3e79-4122-b232-5a353d426c69). Includes dark/light + lockup/horizontal variants as PNGs for better fidelity. Integrated into hero, nav, footer, favicon, 404 mark. Old placeholder SVGs retired in main usage.
- All CTAs now point to internal `/plan` (with affiliation note preserved).

See `views/pages/plan.njk`, form handler in `routes/index.js`, and logo assets in `public/images/logo/`.

---

## Backlog / Next Priorities

- Create Vercel staging environment (preview deployments) to share in-progress changes with family (who don't have access to local `npm run dev` or direct staging).
- Kit lead capture handoff for /plan form (after Resend confirmed).
- Full photo replacement + story refreshes on Disney World / Universal pages (Phase 2).
- Deeper `/about` ("The COTIB Story") page.
- Testimonials / social proof.
- Other Phase 2 items from EARNED_ESCAPE_GROWTH_PROPOSAL.md and PHASE_1_EXECUTION_PLAN.md.
