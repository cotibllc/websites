# Phase 1 Execution Plan — Earned Escape
**Status:** Approved to proceed  
**Focus:** High-impact foundation for client acquisition  
**Timeline Target:** 2–3 weeks (iterative reviews)

---

## Goals for Phase 1

1. Make the site tell Chuck’s real story with authority and warmth.
2. Launch an **owned consultation experience** (`/plan`) with proper lead capture.
3. Establish the technical foundation for **Resend → Kit** lead flow.
4. Replace the most damaging placeholders with real photography (starting with available high-value images).
5. Create measurable improvement in trust and conversion intent.

---

## Scope — What’s Included in Phase 1

### Included
- Major refresh of the **Homepage** (hero, About, story integration, CTAs)
- New dedicated page: **`/plan`** (owned consultation landing page + inquiry form)
- Lighter but meaningful refresh of the **Royal Caribbean** page (strongest conversion page)
- Form infrastructure: Cloudflare Turnstile + Resend (notification + confirmation) + handoff to Kit
- Photo integration for Tier 1 images we currently have visibility on (China + Alaska glacier + key supporting shots)
- Navigation, footer, and config updates as needed
- Basic analytics/event tracking hooks for the new form

### Explicitly Out of Scope for Phase 1
- Full redesign of Disney Cruise Line, Disney World, and Universal pages
- New `/about` page (will be part of Phase 2)
- Major visual design system overhaul
- Email nurture sequences in Kit (we’ll set up the handoff; sequences come later)
- Testimonials / social proof system (Phase 2)
- Full photography replacement across all pages

---

## Key Pages & Changes

### 1. Homepage (Highest Priority)

**Structural Changes:**
- Keep existing premium visual language (navy + gold + starfield)
- New hero with stronger, more personal headline options
- Significantly expanded “About / Why Me” section that properly introduces:
  - Lifetime travel since age 6 (solo + wife + family)
  - January 2026 China trip (Beijing → Xi’an → Chongqing) — a major personal bucket list achievement
  - Deep Royal Caribbean loyalty (5th & 6th cruises in 2026, why he returns)
  - 30 years corporate IT precision mindset applied to travel planning
  - COTIB Adventures LLC as the family legacy company
  - Flexible support model (“I can hold your hand or be a lighter advisor”)
- Updated “How It Works” if needed to reinforce the two support tiers
- Stronger, clearer CTAs driving to `/plan`

**Copy Tone:** Premium advisor who is warm, authentic, and confident — not salesy.

### 2. New Page: `/plan` (Owned Consultation Experience)

This is the biggest new deliverable.

**Page Goals:**
- Clearly explain what happens on a planning call
- Present the two support models transparently:
  - Full-Service Planning
  - Advisory / Light-Touch Support
- Capture qualified leads with the right information
- Feel premium and low-pressure

**Form Requirements:**
- Fields (minimum):
  - Name
  - Email
  - Phone (optional but recommended)
  - Preferred travel window / dates
  - Type of trip (Royal Caribbean, Disney Cruise, Disney World, Universal, Other)
  - Number of travelers + ages (if known)
  - Message / What matters most to you on this trip
- Support tier preference (radio or checkboxes)
- Cloudflare Turnstile
- Clear privacy note + Castle Dreams affiliation language

**Backend Flow (Resend → Kit):**
1. User submits form
2. Verify Turnstile token server-side
3. Send formatted email via Resend to Chuck (customerservice@cotib.com or chosen address)
4. Send confirmation email to the lead via Resend
5. Add contact to Kit with appropriate tags (e.g. `earned-escape-lead`, `consultation-request`, trip type tags)
6. Trigger a welcome/sequence in Kit (to be configured)

**Technical Notes:**
- We will follow the same Turnstile + Resend pattern already used in `cotib.com`
- New route: `POST /api/plan` (or similar)
- We will need your Resend API key + Kit API key (public key + secret) when we reach implementation

### 3. Royal Caribbean Page (Targeted Refresh)

- Strengthen the personal story section with upcoming cruises + why Royal over Norwegian/Disney
- Integrate the Alaska glacier photo (you + wife) as a hero image
- Add any strong Oasis of the Seas family shots once available
- Keep and refine the existing insider tips (they’re already good)

---

## Photography Plan — Phase 1

### Currently Usable (High Value)
- China trip photos (Great Wall, Terracotta Warriors, Forbidden City)
- Alaska glacier shot with wife (`P1011236.JPG`)
- Resort pool/ocean view (`IMG_7505.JPG`)
- Pig swim family moment (`GOPR0559_2848090.jpg`)
- Aruba port shot with ship

### Critical Missing Piece
**Oasis of the Seas candid family shots (HEIC files)** — These are currently the highest-value photos for the Royal Caribbean page and overall credibility.

**Action Required from You:**
Please export the best Oasis shots as JPG into `photos-to-use/` as soon as convenient so we can map them properly before we start writing code.

### Enhancement Guidance
We will enhance the Tier 1 photos (color correction, cropping, light sharpening). You are in favor of this.

---

## Technical Architecture Notes

- **Framework remains Express + Nunjucks** on Vercel
- Form handling will follow the proven `cotib.com` pattern
- We will create a new `api/plan.js` (or route) for the consultation form
- Environment variables needed:
  - `RESEND_API_KEY`
  - `TURNSTILE_SECRET_KEY`
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (or equivalent)
  - Kit API credentials (when we wire the handoff)
- Castle Dreams affiliation language will remain visible and respectful

---

## Content & Copy Priorities

We will write new copy for:
- Homepage hero + new story section
- `/plan` page (including support tier descriptions)
- Updates to Royal Caribbean personal experience section

You will review copy in chunks before it goes live.

---

## Deliverables at End of Phase 1

- Fully updated homepage with your real story
- New working `/plan` page with functional form (Resend + Turnstile)
- Basic Kit lead capture handoff
- Royal Caribbean page meaningfully improved with real photography
- Updated navigation/footer/config as needed
- All changes deployed to Vercel (preview + production)

---

## What I Need From You

| Item | When Needed | Notes |
|------|-------------|-------|
| Oasis of the Seas HEIC → JPG exports | As soon as possible | Highest priority for photo mapping |
| Resend API key (if not already in Vercel) | Before form testing | |
| Cloudflare Turnstile keys (site + secret) | Before form testing | Reuse existing if you have them |
| Kit API credentials | Before wiring the handoff | Public key + secret key |
| Email address for lead notifications | Early | (currently using customerservice@cotib.com on other sites) |
| Any hard preferences on form fields or copy tone | During copy review | |

---

## Proposed Working Process

1. **You export** the best Oasis photos → I review + create detailed Photo Placement Map
2. I deliver **copy drafts** for homepage hero + story section + `/plan` page for your review
3. Once copy is approved, I implement the pages + form infrastructure in reviewable chunks
4. You test the form flow (including Kit handoff)
5. We iterate, then deploy

---

## Next Immediate Actions (This Week)

1. **You**: Export best Oasis of the Seas stills as JPG into `photos-to-use/`
2. **Me**: Create the HEIC → JPG Shortcut instructions + begin drafting the new homepage story section
3. **Me**: Start technical exploration of the Resend + Kit integration pattern that will work cleanly with your current Express setup

---

**Ready when you are.**

Once the Oasis photos are visible, I’ll produce the Photo Placement Map and the first round of copy for review.

Let me know when the JPGs are in the folder (or if you want the Shortcut instructions first).