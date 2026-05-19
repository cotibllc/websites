# Earned Escape Copilot Instructions

## Commands

```bash
npm install
npm run dev      # local development with nodemon on http://localhost:3000
npm start        # production-style local server
npm run build    # regenerates public/sitemap.xml from scripts/generate-sitemap.js
```

## Architecture

- This is a server-rendered Express app with Nunjucks templates. `server.js` starts the local server, `app.js` wires middleware, static assets, Nunjucks, redirect handling, page routes, and the 404/500 fallbacks.
- Vercel deploys the same Express app through `api/index.js`, which re-exports `app.js`. `vercel.json` rewrites every request to `/api/index` and explicitly includes `views/**` and `linktree/**` in the function bundle.
- Site-wide content and outbound URLs are centralized in `config/site.js`. Routes pass the `site` object into templates, and the layout files (`views/layout/*.njk`) use it for SEO metadata, navigation, footer links, and branding.
- The main landing page is assembled from Nunjucks partials in `views/pages/index.njk`. Destination-specific pages (`views/pages/royal-caribbean.njk`, `disney-world.njk`, `disney-cruise-line.njk`, `universal.njk`) are standalone long-form pages that still inherit the shared base layout.
- Front-end assets are plain static files served from `public/`. `public/js/main.js` is the browser entrypoint and imports the individual behavior modules; `public/css/main.css` composes the stylesheet with `@import` statements instead of a bundler.
- `linktree/index.html` is a separate static page served from `app.js` for `/linktree`; it does not go through the Nunjucks layout pipeline.

## Conventions

- Keep new branding, domain, social, and CTA changes in `config/site.js` first. That file is the source of truth for placeholder replacement, env overrides, and feature availability.
- Preserve the redirect/domain model in `routes/redirect.js`: alternate hostnames (`earnedescape.co`, `.voyage`, `.vacations`, `cotib.link`) are first-class behavior, and local testing uses `?domain=voyage|vacations|co|linktree`.
- When adding a new rendered page, follow the existing route pattern: define the route in `routes/index.js`, render a `views/pages/*.njk` template, and pass `site`, `title`, and `description` so `views/layout/head.njk` can build canonical and social metadata correctly.
- This repo does not have a front-end build step. JavaScript should remain browser-native ES modules under `public/js`, and CSS changes should usually land in the existing partial files imported by `public/css/main.css`.
- Keep homepage section anchors synchronized across files. `views/pages/index.njk` currently includes only `hero`, `about`, `destinations`, and `cta-strip`, but `views/partials/hero.njk`, `linktree/index.html`, and `scripts/generate-sitemap.js` still reference `#guides`, `#why`, and `#contact`.
- Optional guide and social links are intentionally conditional. Follow the existing `site.links.*` / `site.social.*` checks in templates rather than hardcoding fallback URLs into markup.
