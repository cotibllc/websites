# Earned Escape — Homepage Story Draft (Phase 1)

**Focus:** Major rewrite of the "About" section + supporting homepage story elements.

This is the highest-leverage copy change in Phase 1. The current About section is pleasant but generic. We have the opportunity to make it significantly more personal, credible, and differentiated.

---

## Recommended Approach for Phase 1

Instead of a small tweak, I recommend we **replace the current About section** with a more substantial, photo-supported story block that properly introduces you and your unique positioning.

**Structure I’m proposing:**

1. **Short, punchy intro** (keeps some of the current warmth)
2. **Your real story** (the meat — this is new)
3. **Your approach / why it matters** (ties in the IT precision mindset)
4. **Photo integration** throughout (using the Tier 1 & 2 photos we identified)
5. **Updated stats** (make them more specific and credible)

---

## Draft: New About / Story Section

**Suggested Section ID:** Keep `id="about"` for now (we can evolve it later).

```html
<section class="about" id="about">
  <div class="about__inner">

    <div class="about__text">
      <p class="section-eyebrow">My Story</p>
      
      <h2 class="about__headline">
        I've spent a lifetime<br>
        exploring the world.<br>
        Now I help families do it <em>right.</em>
      </h2>

      <p class="about__body">
        My name is Chuck Betancourt, and travel has been part of my life since I was six years old. I've done it solo, with my wife, and with my family. I've chased bucket-list trips and I've planned the complicated, multi-generational ones that require real coordination.
      </p>

      <p class="about__body">
        This January 2026 I checked off one of my biggest dreams — a 12-day journey through China, from Beijing to Xi'an to Chongqing. It was one of those trips that reminds you why we travel in the first place. That experience, and dozens like it, is why I started Earned Escape.
      </p>

      <p class="about__body">
        I run this as <strong>COTIB Adventures LLC</strong> — the company I'm building as a legacy for my family. After 30 years in corporate technology, I've learned that the difference between a good trip and an exceptional one almost always comes down to attention to detail. The same precision I used to architect complex systems is what I now bring to planning vacations.
      </p>

      <p class="about__body">
        I'm especially passionate about Royal Caribbean. I've sailed with them many times (my 5th and 6th cruises are coming up in July and August 2026), and I keep coming back. I've also cruised Norwegian and Disney Cruise Line. I always return to Royal for the service and the experiences that genuinely work for every age in the group.
      </p>

      <blockquote class="about__quote">
        "I can hold your hand through the entire process or serve as a lighter-touch advisor — whatever level of support you want. Either way, I'm in your corner to help you build the best possible experience."
      </blockquote>

      <p class="about__body">
        Whether you're planning your first cruise, a big family milestone, or a trip that needs to be perfect, I'll bring the same care I use for my own family's most important vacations.
      </p>
    </div>

    <!-- Photo placement recommendations are noted below in the implementation notes -->
    
    <div class="about__stats">
      <!-- Updated stats proposed below -->
    </div>

  </div>
</section>
```

---

## Photo Integration Recommendations (Homepage About Section)

Based on the Photo Placement Map, here’s how I suggest weaving in photography:

**Large / Hero image in the story block (recommended):**
- `PXL_20260114_053452512_Original.JPG` (Great Wall smiling portrait) — This should be the dominant photo in this section.

**Supporting images (2–3 smaller or medium):**
- Alaska glacier photo (`P1011236.JPG`) — excellent for Royal Caribbean credibility
- Dining with daughter on Oasis (`IMG_9326.jpeg`)
- Snorkeling shot (`IMG_6395.jpeg`) as a lighter adventure moment

**Layout suggestion:**
- Large portrait of you on the left or right (Great Wall smiling)
- Two smaller images below or in a grid showing real travel moments (glacier + family dining)

This combination tells the full story visually: lifetime traveler → recent major adventure → family cruising expert.

---

## Updated Stats Cards (More Credible Version)

Current stats are a bit generic. Here's a stronger version:

| Stat | New Text | Why It's Better |
|------|----------|-----------------|
| **4** → **Signature Specialties** | Keep or change to "Royal Caribbean Specialist" | More specific |
| **$0 Planning Fee** | Keep (this is a strong differentiator) | Strong |
| **3 Regions Sailed** | **"Multiple Royal Caribbean sailings"** + "Including Alaska with my family" | Much more credible |
| **1 Planning Standard** | Change to something like **"30+ years of precision planning"** | Ties in your real background |

**Proposed new stats block:**

```html
<div class="about-stat-card">
  <span class="about-stat-card__number">30+</span>
  <div class="about-stat-card__text">
    <strong>Years of Precision</strong>
    <span>Bringing systems thinking from corporate IT to travel planning</span>
  </div>
</div>

<div class="about-stat-card">
  <span class="about-stat-card__number">$0</span>
  <div class="about-stat-card__text">
    <strong>Planning Fee</strong>
    <span>White-glove support at no extra cost to you</span>
  </div>
</div>

<div class="about-stat-card">
  <span class="about-stat-card__number">Multiple</span>
  <div class="about-stat-card__text">
    <strong>Royal Caribbean Voyages</strong>
    <span>Including Alaska, Caribbean &amp; more with my own family</span>
  </div>
</div>

<div class="about-stat-card">
  <span class="about-stat-card__number">1</span>
  <div class="about-stat-card__text">
    <strong>Standard</strong>
    <span>Make it feel easy, elevated, and right for your travelers</span>
  </div>
</div>
```

---

## Hero Section — Light Recommendations

The current hero is visually strong. For Phase 1 I recommend only light copy tweaks:

**Current eyebrow:**
> Luxury cruises, Disney trips, and unforgettable escapes

**Suggested (more personal):**
> Real travel experience. Thoughtful planning. No shortcuts.

**Current subhead:**
> From Royal Caribbean sailings to Disney and Universal vacations, I help families book trips that feel effortless, elevated, and worth every minute.

**Suggested:**
> After a lifetime of traveling the world — solo, with my wife, and with my family — I help people plan trips that feel as good as they look.

We can also discuss swapping the hero background image later once we have enhanced photos.

---

## Implementation Notes for You (as the developer)

- The current `about.njk` is the main file to replace.
- We should keep the overall visual style (the stat cards, layout structure) but expand the text area to accommodate the richer story.
- Photos will need responsive treatment (different crops/sizes for mobile vs desktop).
- The quote at the bottom is a great place to land the "flexible advisor" positioning.

**Image paths (final confirmed structure):**
All production images live in `public/images/photos/` using the naming convention (e.g. `/images/photos/great-wall-smiling-story.jpg`).

See `photos-to-use/enhanced/photo-inventory.md` for the current mapping.

---

## Questions for You Before We Finalize

1. Do you like the overall tone and length of the draft above?
2. Any specific parts of your story you want emphasized more or toned down?
3. Are you comfortable with the level of personal detail (China trip, upcoming 2026 cruises, family references)?
4. Would you like a slightly shorter version as an alternative?

Once you give me feedback on this draft, I can refine it and then move into implementation (replacing the actual `about.njk` file + adding photo placeholders).

---

**Ready when you are.** Let me know what you think.