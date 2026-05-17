# cotib.com

Corporate website for **COTIB LLC** — a New York City-based technology consulting and content creation company serving public and private sector organizations.

Live at [cotib.com](https://cotib.com).

---

## About COTIB LLC

COTIB LLC provides consulting services across cloud computing, cybersecurity, DevOps, and on-premises infrastructure. Beyond consulting, COTIB operates three content brands:

- **The IT XP** — podcast for experienced IT professionals ([theitxp.com](https://www.theitxp.com))
- **Corporate Hardcore** — observational satire for corporate lifers ([corphardcore.com](https://www.corphardcore.com))
- **Tech Lead Shift** — leadership research series on hybrid AI/human teams ([techleadshift.com](https://www.techleadshift.com))

---

## Tech Stack

- **Frontend**: Static HTML5, Bootstrap 4, FontAwesome 5, jQuery 3.4.1, Parallax.js
- **API**: Vercel serverless function (`api/contact.js`) — contact form using Resend
- **Security**: Cloudflare Turnstile (bot protection on contact form)
- **Deployment**: Vercel

---

## Project Structure

```
cotib.com/
├── api/
│   └── contact.js          ← Vercel serverless contact form handler
├── www/
│   ├── index.html          ← Homepage
│   ├── about.html          ← About page
│   ├── services.html       ← Services page
│   ├── blog.html           ← Blog page
│   ├── contact.html        ← Contact page
│   ├── css/                ← Bootstrap + custom styles
│   ├── js/                 ← Bootstrap, jQuery, Parallax
│   ├── fontawesome/        ← FontAwesome 5 (self-hosted)
│   ├── img/                ← Site images
│   ├── favicon.svg
│   ├── robots.txt
│   └── sitemap.xml
├── package.json
└── vercel.json
```

---

## Local Development

```bash
npm install
cp .env.example .env.local   # fill in required keys
npm run dev                  # starts Vercel dev server with API routes
```

Open `http://localhost:3000` to browse the site with the contact API working locally.

### Required environment variables

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Resend API key — sends contact form emails to customerservice@cotib.com |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile server-side secret for bot protection |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile public key (used in HTML form) |

---

## Deployment

```bash
npm run deploy   # vercel --prod
```

The site deploys to Vercel. Static files in `www/` are served as-is; `api/contact.js` becomes a serverless function at `/api/contact`.

---

## Contact Form Flow

1. User submits form on `contact.html` with Turnstile challenge
2. `api/contact.js` verifies the Turnstile token with Cloudflare
3. On success, sends a formatted HTML email via Resend to `customerservice@cotib.com`
4. Reply-To is set to the submitter's email for direct responses
