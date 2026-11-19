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
│   ├── contact.js          ← /contact form handler (Turnstile, Resend)
│   └── dtnt/               ← Do the Next Thing free sampler handlers
├── lib/dtnt/               ← shared helpers (http, Turnstile, tokens, Resend, emails)
├── private/dtnt/           ← sampler PDF, served only through a signed link
├── scripts/                ← DTNT page builder and preview test
├── test/                   ← node:test suites and the local harness
├── www/
│   ├── index.html          ← Homepage
│   ├── about.html          ← About page
│   ├── services.html       ← Services page
│   ├── ventures.html       ← Ventures page
│   ├── contact.html        ← Contact page
│   ├── do-the-next-thing.html, do-the-next-thing/privacy.html, dtnt/  ← coaching tips pages
│   ├── connect.html, disconnect.html, eula.html, privacy.html  ← QuickBooks app pages
│   ├── css/                ← Tailwind build output and legacy styles
│   ├── js/, fontawesome/, img/
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
| `RESEND_API_KEY` | Resend API key: sends contact form emails to customerservice@cotib.com |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret for widget `0x4AAAAAAC2VHJDJh24KBJBW` |

The Turnstile site key is public and is written into the HTML (`contact.html`, `do-the-next-thing.html`); there is no site key env var. The sampler adds three more vars, listed under Do the Next Thing below.

---

## Tests and checks

```bash
npm ci
npm test               # test:dtnt plus test/site-*.test.js (node:test, Resend and Turnstile mocked)
npm run check:syntax   # node --check on api/, lib/ and scripts/ (syntax only, no types)
```

One test is skipped on purpose (F11.5, paid plan only). Run `npm test` after each change.

## Deployment

```bash
npm run deploy   # vercel --prod
```

The site deploys to Vercel. Static files in `www/` are served as-is; `api/contact.js` becomes a serverless function at `/api/contact`.

---

## Contact Form Flow

1. User submits form on `contact.html` with Turnstile challenge
2. `api/contact.js` refuses another site's Origin (403, `contact.bad_origin`) and more than 5 posts a minute from one address (429, per instance, best effort)
3. It verifies the Turnstile token with Cloudflare; a refusal logs `contact.turnstile_failed` with `reason` and Cloudflare's `errorCodes`
4. On success, sends a formatted HTML email via Resend to `customerservice@cotib.com` (Reply-To is the submitter) and logs `contact.sent`; a Resend error returns 500 and logs `contact.send_failed`
5. No log line carries the email, the token or the secret

---

## Do the Next Thing free sampler

Sampler-first launch of the Do the Next Thing product page. Paid tiers show as "Coming soon" with no buy buttons.

| Path | What it does |
|---|---|
| `/do-the-next-thing` | Static page (`www/do-the-next-thing.html`), free coaching tips signup is the one action |
| `/do-the-next-thing/tips` | `api/dtnt-tips.js`: the public page that lists the three tip titles and when each arrives (no tip text). Text and timing (`delayDays`: 0, 3, 7) are in `lib/dtnt/tips.js` |
| `/do-the-next-thing/privacy` | Static privacy notice (`www/do-the-next-thing/privacy.html`) |
| `POST /do-the-next-thing/free` | `api/dtnt/signup.js`: Turnstile, then a confirm email (double opt-in) |
| `/do-the-next-thing/free/confirm?t=` | `api/dtnt/confirm.js`: adds the contact to the Resend segment, sends Tip 1 now, schedules Tips 2 and 3 at Resend for day 3 and day 7 after the click (saving their email ids on the contact), shows the confirmed page with the tips link |
| `/do-the-next-thing/free/dl/<token>` | `api/dtnt/download.js`: streams `private/dtnt/*.pdf` for a valid token (30 days). No page or email issues these links any more; it stays for links already sent |
| `/do-the-next-thing/free/unsubscribe?t=` | `api/dtnt/unsubscribe.js`: GET asks, POST (or one-click) unsubscribes and cancels any Tip 2 or Tip 3 still scheduled (a failed cancel returns 502 so it is retried) |

Env vars (set in Vercel by Chuck; the handlers fail closed if any is missing): `RESEND_API_KEY` and `TURNSTILE_SECRET_KEY` (existing), plus `RESEND_FULL_API_KEY`, `DTNT_FREE_SEGMENT_ID` and `DTNT_TOKEN_SECRET` (at least 32 characters).

Tip timing (Chuck, Nov 19, 2026): tips go out relative to each reader's confirm click, not on calendar dates. Resend's `scheduled_at` accepts up to 30 days ahead, so Tips 2 and 3 are scheduled at confirm time (idempotency keys `dtnt-tip<n>-<token hash>`). Resend does not stop a scheduled email when a contact unsubscribes, so each scheduled email id is saved on the contact and the unsubscribe handler cancels them. No new env vars. Before this ships, create these two contact properties in Resend (Contacts, Properties, type string): `dtnt_tip2_email_id`, `dtnt_tip3_email_id`. Also still needed: `dtnt_marketing_opt_in` and the "DTNT tips" segment (`DTNT_FREE_SEGMENT_ID`). If the two id properties are missing, confirm cancels the scheduled tips again and only Tip 1 is delivered (logged as `dtnt.confirm.tips_schedule_failed`).

- Edit page copy in `scripts/build-dtnt-pages.js`, then run `npm run build:dtnt`.
- Local tests (Resend and Turnstile mocked): `npm run test:dtnt`.
- Turnstile failures log `dtnt.signup.turnstile_failed` with `reason` and Cloudflare's `errorCodes`, `hostname`, `action` and `challengeAgeSec` (never the secret or token). `invalid-input-secret` or `missing-input-secret` (reason `config`) means `TURNSTILE_SECRET_KEY` in Vercel Production is not the secret of widget `0x4AAAAAAC2VHJDJh24KBJBW`. `invalid-input-response` on a fresh Success token usually means the same: a secret from a different widget. `timeout-or-duplicate` means an expired or reused token. A refused Origin logs `dtnt.signup.bad_origin` with the Origin and host it saw.
- Against a deployment: `node scripts/test-dtnt-preview.mjs <base-url>` (see the header of that file for the token and live levels).
