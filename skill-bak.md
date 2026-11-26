---
name: verify-cotib
description: >-
  Drive and prove cotib.com: static Tailwind pages in websites/cotib.com/www
  plus Vercel functions /api/contact (consultation form) and /api/dtnt/* (Do the
  Next Thing free sampler: signup, confirm, download, unsubscribe). Holds the
  House Rule 36 feature map and the Monday end-to-end form test. Use when
  verifying cotib.com pages, nav, CTAs, the /contact form, the DTNT signup at
  /do-the-next-thing, its confirm and delivery emails, the sampler PDF download,
  unsubscribe, legal pages, redirects or 404 (local vercel dev or
  https://www.cotib.com).
---
# verify-cotib

Verification control for **COTIB LLC** (`www.cotib.com`). Surface is the static site in `www/` (Tailwind, no framework, `cleanUrls`) plus two serverless flows: the consultation form `api/contact.js` and the DTNT free sampler `api/dtnt/*.js` with shared code in `lib/dtnt/`. Agents read this cold and drive the live site like a visitor. The feature map below is the House Rule 36 map; Web Design keeps it current.

**Repo path (monorepo):** `websites/cotib.com/`
**BetaVR path:** `F:\Projects\githubprojects\websites\cotib.com\`
**macOS path:** `/Users/charlesbetancourt/Documents/Github_Projects/websites/cotib.com/`
**Box clone:** `/workspace/dtnt-turnstile/websites/cotib.com/` (`git pull` on `main` first)
**Production:** `https://www.cotib.com` (apex `cotib.com` redirects here)

## Interview summary

| Axis | Finding |
|---|---|
| Surface | Web UI: `/`, `/services`, `/ventures`, `/about`, `/contact`, `/do-the-next-thing`, `/do-the-next-thing/privacy`, QuickBooks app pages `/connect` `/disconnect` `/privacy` `/eula`. Functions: `POST /api/contact`; DTNT via `vercel.json` rewrites: `/do-the-next-thing/free` (signup), `/free/confirm`, `/free/dl/:token`, `/free/unsubscribe`. |
| Run | `npm install`, then `npm run dev` (Tailwind watch + `vercel dev`, needs `vercel login` and env vars pulled by Chuck). Static only: `python3 -m http.server 4173 --directory www` (no functions, no clean URLs). Tests: `npm test` (node:test, Resend and Turnstile mocked, 33 cases), `npm run check:syntax`. |
| Drive | `curl` GETs for doctor, page markers and DTNT error states. Real browser (box desktop, headed) for forms, because Turnstile must show **Success** before a submit. Stable handles below in each feature. |
| Observe | HTTP status, `<title>`, element ids, the JSON or HTML each function returns, the emails that arrive, Vercel function logs (Chuck or an agent with Vercel log access reads them; JSON lines with an `event` field). |
| Isolate | Production is shared. Only the Monday test (below) submits forms, only with the cotibhq address, only tagged as a test. Never submit a real-looking lead. Local `vercel dev` owns its port; never kill processes by name. |

### Known blockers and notes (2026-10-29)

- Cloudflare Email Address Obfuscation is on for cotib.com. Every visitor-facing email or mailto must be wrapped in `<!--email_off-->...<!--/email_off-->` (PR #35), or it ships as `[email protected]`. To check, `curl` the page and expect no `__cf_email__`.

- Box egress returns **500 from "Pingora" for every plain `http://` URL** (example.com too). That is the box network, not the site. Check `http://` to `https://` on a user machine.
- Box TLS to cotib.com intermittently fails with `curl: (35) ... unexpected eof`. Use `curl --retry 3 --retry-all-errors`; one failure is not a site failure.
- `customerservice@cotib.com` (where /contact mail lands) is **not** an alias of the connected cotib Gmail (`charles.betancourt@cotib.com`). Until Chuck says where that mailbox is read, the /contact delivery step needs Chuck to confirm receipt.
- Turnstile widget `0x4AAAAAAC2VHJDJh24KBJBW` is the same on `/contact` and `/do-the-next-thing`. A wrong `TURNSTILE_SECRET_KEY` breaks both forms at once (Oct 28 incident; may date back to Apr 8 for /contact).

## Launch

```bash
export CB_ROOT="${CB_ROOT:-/workspace/dtnt-turnstile/websites/cotib.com}"
# BetaVR: export CB_ROOT="F:/Projects/githubprojects/websites/cotib.com"
export CB_BASE_URL="${CB_BASE_URL:-https://www.cotib.com}"
export CB_RUN_ID="${CB_RUN_ID:-cb-$(date +%Y%m%d-%H%M%S)}"
export CB_EVIDENCE="${CB_EVIDENCE:-/home/box/agent-data/workflows/verify-cotib/artifacts/$CB_RUN_ID}"
mkdir -p "$CB_EVIDENCE"
```

**Production** (default): nothing to start. Ready when `curl -sf -o /dev/null -w "%{http_code}" "$CB_BASE_URL/"` prints `200`.

**Local with functions** (only when Vercel CLI is logged in and Chuck has pulled env): `cd "$CB_ROOT" && npm install && npm run dev >"$CB_EVIDENCE/launch.log" 2>&1 & echo $! >"$CB_EVIDENCE/launch.pid"`, then `CB_BASE_URL=http://127.0.0.1:3000`. Agents never pull, read or print env values.

**Unit tests** (no network, mocks only): `cd "$CB_ROOT" && npm ci && npm test && npm run check:syntax`.

## Doctor

Read-only GETs. Never POST in doctor.

```bash
C="curl -sS --retry 3 --retry-all-errors -m 20 -A verify-cotib"
st() { $C -o /tmp/cb.body -w "%{http_code} %{redirect_url}" "$1"; }
[ "$(st https://cotib.com/)" = "307 https://www.cotib.com/" ]                     # apex to www
for p in / /services /ventures /about /contact /privacy /eula /connect /disconnect \
         /do-the-next-thing /do-the-next-thing/privacy /robots.txt /sitemap.xml /llms.txt; do
  [ "$(st "$CB_BASE_URL$p" | cut -d' ' -f1)" = "200" ] || echo "FAIL $p"
done
$C "$CB_BASE_URL/contact" | grep -c 'data-sitekey="0x4AAAAAAC2VHJDJh24KBJBW"' >/dev/null
$C "$CB_BASE_URL/contact" | grep -c 'id="contact-form"' >/dev/null
$C "$CB_BASE_URL/do-the-next-thing" | grep -c 'id="free-form"' >/dev/null
$C "$CB_BASE_URL/do-the-next-thing" | grep -c 'data-sitekey="0x4AAAAAAC2VHJDJh24KBJBW"' >/dev/null
[ "$(st "$CB_BASE_URL/api/contact" | cut -d' ' -f1)" = "405" ]                     # GET refused, function alive
[ "$(st "$CB_BASE_URL/do-the-next-thing/free")" = "303 $CB_BASE_URL/do-the-next-thing#free" ]
[ "$(st "$CB_BASE_URL/do-the-next-thing/free/confirm?t=bogus" | cut -d' ' -f1)" = "400" ]  # 503 = env missing
[ "$(st "$CB_BASE_URL/do-the-next-thing/free/dl/bogus" | cut -d' ' -f1)" = "404" ]        # 503 = env missing
[ "$(st "$CB_BASE_URL/do-the-next-thing/free/unsubscribe" | cut -d' ' -f1)" = "400" ]     # 503 = env missing
[ "$(st "$CB_BASE_URL/no-such-page" | cut -d' ' -f1)" = "404" ]
echo "doctor: OK base=$CB_BASE_URL"
```

A `503` with title `Not available right now` on any `/do-the-next-thing/free/*` GET means a DTNT env var is missing in that deployment (`dtnt.*.misconfigured` in logs, which names the missing variable, never its value).

## Feature map (House Rule 36)

Ids below are the feature ids to name in evidence and reports. "Logs" are Vercel function log lines: JSON with `at`, `event` and the fields listed. No log line ever holds a raw email, IP, token or secret (emails and IPs are hashed).

### Pages, nav and CTAs

| Id | Reach it | Working looks like | Failure states |
|---|---|---|---|
| `nav-global` | Every main page header: logo to `/`, `Services`, `Ventures`, `About`, `Contact`. Under 768px: `#mobile-menu-btn` toggles `#mobile-menu`. DTNT pages use `.menu-btn` + `#site-nav` (`www/dtnt/menu.js`). | Each link 200. Mobile menu opens and closes on tap. On DTNT pages `aria-expanded` flips true/false. | Main pages never update `aria-expanded` on `#mobile-menu-btn` (stays `false`): a11y defect, see Open items. |
| `footer-global` | Footer on every page: Services list `/services#cto` `#ai` `#finops` `#security`; Company `/about` `/ventures` `/contact`; social LinkedIn, Substack, YouTube. | Anchors scroll to the matching section on `/services`. | **`/services#security` ("Cloud Security") has no target**: services sections are `#cto` `#ai` `#devops` `#finops`. Lands at page top. LinkedIn returns 999 to bots; check it in a browser. |
| `home` | `/` | 200, title contains `I Run Businesses Using AI`, H1 `I run businesses using AI.` CTAs: `Book Free Strategy Call` to `/contact`; `Explore Services`, `View Detailed Engagement Model` to `/services`; `See All Five Ventures`, `See the model`, `Venture Strategy`, `Explore Brand` to `/ventures`; `Read Philosophy & Path` to `/about`. | Any CTA not 200. |
| `services` | Nav `Services` or `/services` | 200, H1 `Fractional CTO & Advisory Services`, sections `#cto` `#ai` `#devops` `#finops`, CTA `Book Free Strategy Call` to `/contact`. | Missing section id. |
| `ventures` | Nav `Ventures` | 200, H1 `Five ventures. One operator. AI at the core.` Outbound: earnedescape.agency, stackapproved.com, techleadshift.com, theitxp.com, corphardcore.com, plus social. CTA `Get In Touch` to `/contact`. | Outbound link not 200 in a browser. |
| `about` | Nav `About` | 200, H1 `I run businesses using AI.` CTA `Book Free Strategy Call`. | `<title>` is identical to the homepage title (SEO nit). |
| `dtnt-page` | Direct URL `/do-the-next-thing` (listed in `sitemap.xml`). No other cotib.com page links to it. | 200, H1 `Do the Next Thing`, CTA `Start with 3 prompts, free` jumps to `#free`. Paid Pack `$24` and Setup Kit `$37` show `Coming soon`, no buy buttons ("Neither version is on sale yet."). | No product checkout exists yet; if a buy button appears, add a feature row before Monday. |
| `legal` | `/do-the-next-thing/privacy` (DTNT privacy notice, linked under the form); QuickBooks app pages `/privacy`, `/eula`, `/connect`, `/disconnect` (footer of those pages, sitemap). | Each 200 with H1 `Privacy notice: Do the Next Thing`, `Privacy Policy`, `End User License Agreement`, `Connect / Reconnect QuickBooks`, `Disconnect QuickBooks`. QuickBooks pages are static info, no forms. | |
| `redirects` | `https://cotib.com/<path>`; `/index.html`; trailing slash `/services/` | `307` to `https://www.cotib.com/<path>`; `308` to `/`; `308` to `/services`. `http://` should go to `https://` (check off box). | |
| `not-found` | Any unknown path, e.g. `/no-such-page` | `404`, Vercel default plain text `The page could not be found` / `NOT_FOUND`. | No branded 404 page exists (Open items). `/thanks`, `/blog`, `/do-the-next-thing/link`, `/do-the-next-thing/resend` all 404 today; none of them is a real route. |
| `seo-files` | `/robots.txt`, `/sitemap.xml`, `/llms.txt` | 200. Sitemap lists 11 apex URLs (`https://cotib.com/...`). | |

### Form: `contact` (consultation request)

- **Reach:** any `Contact` / `Book Free Strategy Call` CTA, or `/contact`. H1 `Book a Strategy Call`.
- **Fields:** `#f-name`* `#f-email`* `#f-organization` `#f-phone` `#f-service` (`Fractional CTO & Advisory`, `AI Platform Integration`, `FinOps & Cost Control`, `Platform Engineering & DevOps`, `Content Partnership`, `General Inquiry`) `#f-message`*, honeypot `#f-website` (`name=website`, never fill), Turnstile `.cf-turnstile`, button `#submit-btn` (`Book Free Consultation`, shows `Sending...` while busy).
- **Request:** browser JS posts JSON to `POST /api/contact`.
- **Working looks like:** HTTP 200 `{"success":true}`; `#form-success` shows `Message sent successfully! I will be in touch shortly.`; form clears; Turnstile resets. **Email:** one message from `COTIB LLC <no-reply@cotib.com>` to `customerservice@cotib.com`, reply-to the visitor, subject `[COTIB] Free Consultation: <service or General Inquiry> — <name>`, heading `New Free Consultation Request`. **The visitor gets no email.** No success log line.
- **Failure states (shown in `#form-error`):**

| Case | Status | Text | Log |
|---|---|---|---|
| No Turnstile token yet (client) | none | `Please complete the security check.` | none |
| Required field empty or no token | 400 | `Please fill in all required fields.` | none |
| siteverify unreachable | 500 | `Unable to complete security check. Please try again.` | `contact.turnstile_unreachable` `{error}` |
| Cloudflare refused token | 400 | `Security check failed. Please refresh the page and try again.` | `contact.turnstile_failed` `{errorCodes, hostname}`. No `reason` field here (unlike DTNT): read `errorCodes`. `invalid-input-secret` / `missing-input-secret` = wrong or missing secret; `timeout-or-duplicate` = reused or older than 300s; `invalid-input-response` = bad token. |
| Resend send error | 500 | `Failed to send your message. Please try again or use the contact information on this page.` | `console.error("Resend error:", ...)` (not JSON) |
| Network error (client) | none | `Network error. Please check your connection and try again.` | none |
| Honeypot filled | 200 | success shown, nothing sent | none |
| GET | 405 | `{"error":"Method not allowed"}` | none |

- **Dependencies:** Turnstile widget `0x4AAAAAAC2VHJDJh24KBJBW`; Resend sending domain cotib.com. Env names: `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`. No origin check, no rate limit.

### Form: `dtnt-signup` (free sampler, double opt-in step 1)

- **Reach:** `/do-the-next-thing`, CTA `Start with 3 prompts, free` or scroll to `#free` (section heading `Start with 3 prompts, free`, card `#free-card`).
- **Fields:** `#free-email` (`name=email`), `#free-consent` checkbox (required; text `Email me the free sampler and up to 3 short emails over the next week about the paid Do the Next Thing Pack ($24) and Setup Kit ($37). I can unsubscribe any time.`), honeypot `name=website`, Turnstile, button `Send me the 3 prompts`. Error box `#free-error`; done box `#free-done`.
- **Request:** `www/dtnt/signup.js` posts JSON (`Accept: application/json`) to `POST /do-the-next-thing/free`, rewritten to `/api/dtnt/signup`. With JS off the form posts urlencoded and gets an HTML state page instead.
- **Working looks like:** 200 `{"ok":true,"message":"Check your email. ..."}`; the form swaps to `#free-done`: `Check your email.` / `We sent a confirm link to the address you entered. Click it within 48 hours to get your 3 prompts. Not there in a few minutes? Check spam or promotions.` (No-JS: page titled `Check your email`.) This in-page state is the "thanks" step: **there is no `/thanks` route.** Log `dtnt.signup.confirm_sent {emailHash, afterUnsubscribe}`. If the address is already a confirmed contact, it gets a fresh delivery email instead: `dtnt.signup.resent_delivery`. Same reply either way, by design.
- **Email (confirm):** from `COTIB LLC <no-reply@cotib.com>`, reply-to `customerservice@cotib.com`, subject `Confirm your email for the free Do the Next Thing prompts`, button `Confirm my email` linking `https://www.cotib.com/do-the-next-thing/free/confirm?t=...` (48 hours), footer postal address + `Unsubscribe`, headers `List-Unsubscribe` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click`.
- **Failure states:** JSON `{error, code}`; text shown in `#free-error`. Client-only checks first: bad email, unchecked box, and no token yet (`Wait for the human check to say Success, then send.`). After any server refusal the widget resets for a fresh token.

| code | Status | Text | Log |
|---|---|---|---|
| `paused` | 503 | `The free sampler isn't available right now. ...` | `dtnt.signup.misconfigured {missing:[names]}` |
| `origin` | 403 | `This form only works on www.cotib.com. Open www.cotib.com/do-the-next-thing and try again.` | `dtnt.signup.bad_origin {origin, requestHost, host, forwardedHost}` (Origin header absent logs `(none)`) |
| `rate` | 429 + `Retry-After: 60` | `Too many tries from here. Wait a minute and try again.` | none (over 10 per minute per IP hash, per instance) |
| `email` | 400 | `That email address doesn't look right. Check it and try again.` | none |
| `consent` | 400 | `Check the box so we can email you the sampler.` | none |
| `turnstile_config` | 503 | `Signup isn't working on our end right now. Try again later, or email customerservice@cotib.com.` | `dtnt.signup.turnstile_failed reason=config` (errorCodes `invalid-input-secret` or `missing-input-secret`): secret wrong, Chuck re-copies it |
| `turnstile_unavailable` | 502 | `We couldn't reach the human check just now. Wait a minute and try again.` | `... reason=unreachable {error}` (8s timeout) |
| `turnstile_expired` | 400 | `The human check timed out. Wait for it to say Success again, then send.` | `... reason=expired` (`timeout-or-duplicate`) |
| `turnstile` | 400 | `We couldn't confirm you're human. Refresh the page and try again.` | `... reason=missing` (no token), `reason=hostname` (token from a host not in www.cotib.com, cotib.com or the request host), `reason=failed` (anything else, e.g. `invalid-input-response`). All carry `errorCodes, hostname, action, challengeAgeSec, requestHost`. |
| `send` | 502 | `We couldn't send the email just now. Wait a minute and try again.` | `dtnt.signup.send_failed {emailHash, error}` |
| honeypot | 200 | success shown, nothing sent | none |
| (lookup) | continues | normal success | `dtnt.signup.lookup_failed` (Resend contact lookup failed; falls back to a confirm email) |
| GET | 303 to `/do-the-next-thing#free` | | none |

- **Dependencies:** Turnstile `0x4AAAAAAC2VHJDJh24KBJBW`; Resend (send + contacts + DTNT free segment). Env names: `RESEND_API_KEY`, `RESEND_FULL_API_KEY`, `DTNT_FREE_SEGMENT_ID`, `DTNT_TOKEN_SECRET` (32+ chars), `TURNSTILE_SECRET_KEY`. Allowed hosts in `lib/dtnt/config.js` `PRODUCTION_HOSTS`. Consent version `dtnt-free-2026-10-07`.

### Flow: `dtnt-confirm` (double opt-in step 2)

- **Reach:** `Confirm my email` button in the confirm email: `GET /do-the-next-thing/free/confirm?t=<token>` (rewritten to `/api/dtnt/confirm`).
- **Working looks like:** 200 page titled `You're confirmed`, H1 `You're confirmed.`, `Your 3 prompts are ready:`, button `Download the free sampler` (`/do-the-next-thing/free/dl/<token>`), `We also emailed you the link. It works for 30 days.` Contact created in Resend with the DTNT free segment and consent properties `dtnt_consent_version`, `dtnt_signed_up_at`, `dtnt_confirmed_at`, `dtnt_ip_hash`. Logs `dtnt.consent`, `dtnt.confirm.delivery_sent`. A second click shows the same page and sends nothing (`dtnt.confirm.repeat`).
- **Email (delivery):** subject `Your 3 free Do the Next Thing prompts`, button `Download the free sampler` (30 days), tip paragraph, `If they help, the full Pack has all 28 prompts for $24. It's coming soon: cotib.com/do-the-next-thing`, footer + unsubscribe, List-Unsubscribe headers.
- **Failure states:** bad, expired (over 48h) or used-by-unsubscribed link: 400 `That confirm link has expired or was already used.` (`dtnt.confirm.suppressed` when the address unsubscribed and the link predates it). Env missing: 503 paused (`dtnt.confirm.misconfigured`). Resubscribe error: 502 `We couldn't finish that just now.` (`dtnt.confirm.resubscribe_failed`). Page still succeeds but list needs a hand fix on `dtnt.confirm.contact_failed`, `dtnt.confirm.consent_properties_failed` (property keys missing in Resend), `dtnt.confirm.lookup_failed`; delivery email missing on `dtnt.confirm.delivery_failed`. Non-GET: 405.

### Flow: `dtnt-download` (sampler PDF)

- **Reach:** `Download the free sampler` on the confirmed page or in the delivery email: `GET /do-the-next-thing/free/dl/<token>`.
- **Working looks like:** 200 `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="Do-the-Next-Thing-3-free-prompts.pdf"`, about 117 KB (file `private/dtnt/do-the-next-thing-free-sampler-v2.pdf`, not publicly addressable). Opens as a PDF with 3 prompts. Log `dtnt.download {emailHash}`.
- **Failure states:** expired token 410, invalid token 404, both `That download link has expired.`; env missing 503 (`dtnt.download.misconfigured`); PDF missing from the bundle 503 (`dtnt.download.file_missing`).

### Flow: `dtnt-unsubscribe`

- **Reach:** `Unsubscribe` link in either email footer: `GET /do-the-next-thing/free/unsubscribe?t=<token>`; mail clients may POST one-click.
- **Working looks like:** GET 200 `Unsubscribe from Do the Next Thing emails?` naming the address, button `Unsubscribe` (POST, so link scanners can't unsubscribe). POST 200 `You're unsubscribed.` Log `dtnt.unsubscribe`. Resend contact flips to unsubscribed (never deleted; a never-confirmed address is created as unsubscribed).
- **Failure states:** bad token 400 `That unsubscribe link doesn't work.`; Resend error 502 `We couldn't finish that just now.` (`dtnt.unsubscribe.failed`); env missing 503 (`dtnt.unsubscribe.misconfigured`).

## Drive

1. Pick one feature id above. Prefer route paths and element ids over coordinates.
2. Read-only proofs are curl GETs (doctor). Error states of confirm, download and unsubscribe are safe to prove with bogus tokens.
3. Never fill a honeypot. Never POST to `/api/contact` or `/do-the-next-thing/free` outside the Monday test.
4. Forms need a headed browser on the box desktop: wait for the Turnstile widget to show **Success** before clicking submit. Headless runs can be refused by Turnstile and prove nothing.
5. Capture 1440, 768 and 390 px screenshots of each form's idle, error and success states when a PR touches them (agent-coding-practices).

## Monday end-to-end test (Verification Engineer, House Rule 36)

Every Monday morning. Report PASS or FAIL per feature id to Primary CoS. Any FAIL goes to Web Design the same day; Web Design owes a fix or a dated next step within 24 hours.

**Test identity.** Address: `cotibhq@mail.grokbot.com` (the cotibhq Grok Bot inbox). Tag every submission as a test so it never counts as a lead:
- DTNT has only an email field, so the tag is the address. Use plus addressing `cotibhq+test-YYYYMMDD@mail.grokbot.com` so each week is a brand new contact and the first-time confirm path is what gets tested. **Prove on the first run that plus mail reaches the cotibhq inbox**; if it does not, use the plain address and see the reuse note under Cleanup.
- /contact: Name `TEST Rule36 YYYY-MM-DD`, Email the cotibhq address, Organization `TEST`, Service `General Inquiry`, Message `[TEST] Weekly Rule 36 form test YYYY-MM-DD by Verification Engineer. Not a lead. No reply needed.`

**Steps.**
1. `npm test` and `npm run check:syntax` on current `main` (record pass counts; 67 site tests expected since PR #83). Run Doctor; every line must pass.
2. `contact`: open `https://www.cotib.com/contact` in the headed browser, fill the test values, wait for Turnstile Success, click `Book Free Consultation`. PASS = `Message sent successfully! I will be in touch shortly.` shows, and the notification `[COTIB] Free Consultation: General Inquiry — TEST Rule36 YYYY-MM-DD` reaches `customerservice@cotib.com` within 5 minutes (confirm in that mailbox; until an agent can read it, ask Chuck through Primary). Any `#form-error` text = FAIL: record the exact text and ask for the `contact.turnstile_failed` errorCodes line.
3. `dtnt-signup`: open `https://www.cotib.com/do-the-next-thing`, click `Start with 3 prompts, free`, enter the test address, tick the box, wait for Success, click `Send me the 3 prompts`. PASS = `#free-done` text `Check your email.` shows. Record any `#free-error` text and map it to the code table.
4. Confirm email: within 5 minutes the cotibhq inbox (SearchEmailThreads `subject:"Confirm your email for the free Do the Next Thing prompts"`) has it, from `no-reply@cotib.com`, link host `www.cotib.com`, footer has the postal address and `Unsubscribe`. Check spam/promotions wording is honest.
5. `dtnt-confirm`: open the `Confirm my email` link. PASS = `You're confirmed.` with `Download the free sampler`.
6. Delivery email: `Your 3 free Do the Next Thing prompts` arrives in cotibhq within 5 minutes.
7. `dtnt-download`: open the download link from the email (and from the page). PASS = HTTP 200 PDF named `Do-the-Next-Thing-3-free-prompts.pdf`, opens, 3 prompts readable (`pdftotext` on the box).
8. Re-open the confirm link: same `You're confirmed.` page, no second delivery email (idempotent).
9. `dtnt-unsubscribe`: open `Unsubscribe` from the delivery email, click `Unsubscribe`. PASS = `You're unsubscribed.` This also stops the up-to-3 nurture emails going to the test contact.
10. Pages: Doctor covers status codes; click each nav link and footer link at 1440 and 390 in the browser and note any that do not land (known: `Cloud Security` anchor).
11. Report: one table, feature id, PASS/FAIL, evidence path, timestamps in America/New_York (label ET), exact error text on any FAIL.

**Cleanup of test contacts.**
- DTNT test contacts live in Resend Contacts (DTNT free segment). Agents have no Resend access and must not get it. Step 9 leaves each test contact **unsubscribed**, which already stops all email to it. Deleting contacts is irreversible, so it is Chuck's job in the Resend dashboard (Contacts, search `cotibhq`, delete the `+test-` rows), batched monthly or when he asks. Report the list of test addresses created that week so he can find them.
- If plus addressing does not work and the plain address is reused: after week 1 the contact is unsubscribed, so the next signup sends a confirm link that resubscribes on click (`dtnt.confirm.resubscribed`). That tests the resubscribe path, not the first-time path; say so in the report, or ask Chuck to delete the contact before the next Monday.
- /contact creates no contact anywhere; whoever reads `customerservice@cotib.com` archives the `TEST Rule36` notification.
- cotibhq inbox: leave the test emails as evidence; do not forward them.

## Evidence

- Directory: `$CB_EVIDENCE` (box: `/home/box/agent-data/workflows/verify-cotib/artifacts/<run-id>/`). Cleanup never deletes it.
- Required for a pass: status-code file from Doctor, screenshot of each form's success state, the email subjects and arrival times, the PDF's `pdfinfo`, and a JSON summary `{feature, verdict, at}` per feature id.
- Never save env values, tokens from links (redact `t=` values in saved URLs), or full email addresses other than the cotibhq test address.

## Cleanup

```bash
if [ -f "$CB_EVIDENCE/launch.pid" ]; then
  kill "$(cat "$CB_EVIDENCE/launch.pid")" 2>/dev/null || true
  rm -f "$CB_EVIDENCE/launch.pid"
fi
# Never pkill by process name. Never delete $CB_EVIDENCE.
ls "$CB_EVIDENCE"
```

**Live since PR #83 (squash `128a54a`, merged 2026-11-09, Rule 37 meta):** `/do-the-next-thing` title becomes `Do the Next Thing: 28 prompts | COTIB LLC`; home, /about and DTNT meta descriptions trimmed to 160 or fewer; `test/site-meta-limits.test.js` checks every sitemap page (site tests 67; `npm test` also runs DTNT tests, 30 pass and 1 skipped). `/privacy` (QuickBooks) unchanged.

## Open items (found 2026-10-29, owner Web Design unless noted)

1. Footer `Cloud Security` links to `/services#security`, which does not exist (sections are `#cto` `#ai` `#devops` `#finops`). Fix the link or add the section.
2. No branded 404 page; unknown paths show Vercel's plain text `NOT_FOUND`.
3. `#mobile-menu-btn` on the main pages never updates `aria-expanded`.
4. `/contact` has no origin check, no rate limit and no success log line; `contact.turnstile_failed` has errorCodes but no `reason`. The visitor gets no confirmation email, so Rule 36 "confirmation email" for /contact means the internal notification only.
5. `customerservice@cotib.com` is not readable by any connected agent mailbox (Chuck to say where it lands).
6. README is stale: lists `www/blog.html` (does not exist) and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (unused; the site key is in the HTML).
7. Em dashes in live copy: page titles on `/`, `/about`, `/services`, `/contact`, `/ventures`, QuickBooks pages, and the /contact notification subject. Candidate for the Rule 37 dash check.
8. `/about` reuses the homepage `<title>`.

After site changes, run `/maintain-verification-skill` to keep the feature map honest.
