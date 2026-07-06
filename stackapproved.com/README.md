# stackapproved.com

StackApproved — UGC-style video ads for B2B SaaS & AI brands. A COTIB LLC brand.
Static one-pager + Vercel serverless contact API, mirroring the cotib.com stack.

## Stack

- Tailwind CSS v4 (CLI build, theme in `www/css/input.css`)
- Vercel static hosting (`www/` output) + serverless function (`api/contact.js`)
- Resend for email dispatch, Cloudflare Turnstile (fail-closed) + honeypot on the brief form

## Local dev

```bash
npm install
npm run dev        # watches CSS + runs `vercel dev`
```

## Deploy

```bash
npm run deploy     # builds CSS + `vercel --prod`
```

## Required setup before the form works

1. **Turnstile:** create a widget for `stackapproved.com` in the Cloudflare dashboard, then
   replace `TURNSTILE_SITE_KEY_PLACEHOLDER` in `www/index.html` with the site key and set
   `TURNSTILE_SECRET_KEY` in Vercel env (production). The API fails closed — a missing
   secret rejects all submissions.
2. **Resend:** set `RESEND_API_KEY` in Vercel env. `FROM_EMAIL` currently uses the verified
   `cotib.com` domain; after verifying `stackapproved.com` in Resend, switch `FROM_EMAIL`
   in `api/contact.js` to `no-reply@stackapproved.com`.
3. **DNS (Route 53):** point `stackapproved.com` at Vercel — either `A 216.198.79.1` +
   `CNAME www → cname.vercel-dns.com`, or use the exact records Vercel shows when adding
   the domain to the project (Project → Settings → Domains).

## Post-launch checklist (per repo conventions)

- Submit `sitemap.xml` to Google Search Console + Bing Webmaster Tools.
- Verify Cloudflare AI Crawl Control allows agents (site follows the 2026-07-05 AI crawler
  policy: search + AI search + agents allowed, training blocked — see `robots.txt` / `llms.txt`).
- Replace portfolio placeholder cards in `index.html` with `<video>` embeds as spec ads ship.
