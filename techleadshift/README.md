# Tech Lead Shift

Website for **Tech Lead Shift** — a research-backed leadership series examining what it takes to manage hybrid teams of human workers and autonomous AI agents.

Live at [techleadshift.com](https://www.techleadshift.com). Published on [Substack](https://techleadshift.substack.com).

A brand of [COTIB LLC](https://cotib.com). Written by Charles Betancourt, Director of Cloud Engineering with 18+ years of technology leadership.

---

## The Series

Ten articles. One argument: current leadership frameworks were built for an all-human workforce — that assumption is already broken.

**Act I — The Diagnosis (Articles 1–6)**
1. The First Leadership Crisis of AI Won't Be Technical. It Will Be Cultural. *(Live)*
2. Managing the Invisible Worker *(Live)*
3. Delegation Drift *(Live)*
4. Why AI Will Expose Bad Management Faster Than Ever *(Live)*
5. The new leadership skill: systems thinking *(Scheduled)*
6. The end of productivity theater *(Scheduled)*

**Act II — The Transformation (Articles 7–10)**
7. Middle management in the age of AI
8. Why culture matters more when machines work for you
9. The accountability problem no one is ready for
10. The future leader is a system architect

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

## Project Structure

```
techleadshift/
├── app/
│   ├── layout.tsx          ← root layout, fonts, metadata
│   ├── page.tsx            ← homepage (hero, about, series, newsletter, contact)
│   ├── opengraph-image.tsx ← OG image generation
│   ├── robots.ts           ← robots.txt
│   └── sitemap.ts          ← dynamic sitemap
├── components/
│   ├── ContactForm.tsx     ← speaking/consulting inquiry form
│   ├── Footer.tsx
│   └── Nav.tsx
└── vercel.json
```

---

## Deployment

Push to GitHub and connect to Vercel. Add environment variables in the Vercel dashboard.

---

## Contact

- [Substack](https://techleadshift.substack.com)
- [LinkedIn](https://www.linkedin.com/in/charles-b-technologist/)
