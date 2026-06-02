# Earned Escape — Photo Enhancement Guide (Top 5 Priority Photos)

**Goal:** Make the strongest photos look premium and web-ready while keeping them authentic.

**Recommended Tools (in order of preference):**
- **Topaz Photo AI** (best overall quality for sharpening + noise reduction)
- **Luminar Neo** (easy, good AI tools)
- **Adobe Lightroom + Photoshop** (most control)
- **Photoshop Generative Fill** (for removing distractions)
- Free alternatives: Darktable + Upscayl, or the Mac Photos app + manual tweaks

---

## Photo 1: Great Wall Smiling Portrait (Highest Priority)

**File:** `PXL_20260114_053452512_Original.JPG`

**Current Strengths:**
- Excellent genuine smile and eye contact
- Strong personal connection
- Good Great Wall context in background

**Issues to Fix:**
- Slightly cool/blue color cast (typical phone photo in winter)
- Minor skin texture / shine on forehead
- Background is a bit busy and can compete with you
- Could use a touch more warmth and contrast

**Recommended Enhancements:**

1. **Color & Tone**
   - Warm up the overall temperature (+300 to +600 Kelvin)
   - Add a touch of orange/magenta in the midtones for skin
   - Increase contrast slightly (+15–25)

2. **Sharpening & Detail**
   - Run through Topaz Photo AI with “Standard” or “Portrait” model
   - Sharpen face and eyes selectively
   - Reduce noise if any

3. **Background Treatment (Optional but Recommended)**
   - Slightly darken and soften the background (use Lightroom Mask or Photoshop)
   - Or use a very light vignette
   - Goal: Keep the Great Wall recognizable but make *you* the clear focal point

4. **Retouching**
   - Light skin smoothing (avoid plastic look)
   - Remove any small distractions in the background if needed
   - Whiten eyes very subtly

**Target Look:** Warm, confident, approachable premium advisor. Think “successful person who still travels like a real human.”

**Export variants:** See **`photos-to-use/enhanced/photo-inventory.md`** (Photo 1 row).  
**Phase 1 minimum:** `great-wall-smiling-story.jpg` at 1600×1200.

---

## Photo 2: Alaska Glacier with Wife (Highest Credibility Shot)

**File:** `P1011236.JPG`

**Current Strengths:**
- Extremely powerful story image (you + wife on actual glacier)
- Beautiful blue ice and scale
- Life jackets make it feel real and adventurous

**Issues to Fix:**
- Quite flat / low contrast (typical of overcast glacier days)
- Colors are muted
- You and your wife are a bit small in the frame
- Some sensor dust / spots possible

**Recommended Enhancements:**

1. **Color & Contrast**
   - Increase contrast significantly
   - Boost blues in the ice (carefully — don’t make it cartoonish)
   - Warm up skin tones on both of you
   - Add clarity / texture to the ice and snow

2. **Composition**
   - Consider a tighter crop that brings you and your wife more prominent while still showing the dramatic glacier behind you.
   - Alternative: Keep wider for impact on Royal Caribbean page.

3. **Sharpening**
   - Strong sharpening on the ice texture and your faces
   - Topaz Photo AI “Landscape” or “Standard” model works well here

4. **Retouching**
   - Remove any sensor spots on the snow/ice
   - Light dodge & burn to make the ice “pop”

**Target Look:** Epic but real. This photo should make people think “this guy has actually been to the serious places.”

**Best Use:** Hero image on Royal Caribbean page (Alaska section).

---

## Photo 3: Great Wall Landscape

**File:** `PXL_20260114_052719256_Original.JPG`

**Current Strengths:**
- Beautiful atmospheric shot of the wall
- Good sense of scale and history
- Works well as a supporting “journey” image

**Issues to Fix:**
- Very flat, hazy, low contrast (winter pollution + overcast)
- Colors are dull
- Sky is blown out / uninteresting

**Recommended Enhancements:**

1. **Color & Contrast**
   - Strong contrast boost
   - Add dehaze / clarity (this photo needs it badly)
   - Slightly cool the overall tone (it should feel atmospheric and slightly dramatic)
   - Bring out the stone texture of the wall

2. **Sky Treatment**
   - Either darken the sky significantly, or
   - Use Generative Fill / AI sky replacement for a more dramatic (but still believable) sky
   - Recommendation: Subtle sky replacement usually looks better than trying to recover the flat original.

3. **Sharpening**
   - Heavy sharpening on the wall structure and mountains

**Target Look:** Cinematic and inspiring. This should feel like a bucket-list achievement photo.

**Best Use:** Large supporting image in the homepage story section or dedicated China block.

---

## Photo 4: Snorkeling Shot (Oasis)

**File:** `IMG_6395.jpeg`

**Current Strengths:**
- Authentic adventure moment
- Beautiful water color
- You look strong and happy

**Issues to Fix:**
- Slight blue cast
- Foreground water can be distracting
- Your face and mask could be sharper
- Some minor skin shine

**Recommended Enhancements:**

1. **Color**
   - Warm up skin tones
   - Slightly increase saturation in the water (teal/blue balance)
   - Reduce any harsh reflections on the water surface

2. **Sharpening & Detail**
   - Run Topaz on the face and mask area
   - Light sharpening on the water texture

3. **Composition (Optional)**
   - Consider a crop that removes some of the busy water in the lower right if it feels distracting.

**Target Look:** Real, capable traveler having an amazing experience.

**Best Use:** Royal Caribbean page or “Firsthand Experience” section on homepage.

---

## Photo 5: Dining with Daughter on Oasis

**File:** `IMG_9326.jpeg`

**Current Strengths:**
- Warm, genuine family moment
- Shows real ship dining environment
- Good connection between you two

**Issues to Fix:**
- Strong overhead lighting creating harsh shadows on faces
- Color cast from ship lighting (often yellow/green)
- You and your daughter are a bit small in the frame
- Background can be busy

**Recommended Enhancements:**

1. **Color Correction**
   - Fix the skin tones (remove yellow/green cast)
   - Add warmth back into skin
   - Slightly cool the background to separate you from the environment

2. **Lighting**
   - Use dodge & burn or AI lighting tools to soften harsh shadows on faces
   - Brighten eyes

3. **Composition**
   - Tighter crop is highly recommended. Bring you and your daughter much more prominent in the frame.
   - This photo will work much better when cropped closer.

4. **Sharpening**
   - Face sharpening after color correction

**Target Look:** Warm, happy family moment on a beautiful ship.

**Best Use:** Homepage story section (family travel proof) or Royal Caribbean page.

---

## General Enhancement Workflow Recommendation

For all five photos:

1. **First pass** — Color correction + contrast + dehaze in Lightroom or equivalent.
2. **Second pass** — AI sharpening + noise reduction (Topaz Photo AI is worth it here).
3. **Third pass** — Targeted retouching (skin, eyes, distractions).
4. **Final pass** — Crop + export at correct web sizes with proper filenames (e.g. `great-wall-smiling-hero.jpg`).

**Final chosen structure (confirmed):**

- Working enhanced files live in: `photos-to-use/enhanced/[hero|story|card]/`
- Production files (what the site actually uses) live in: `public/images/photos/`

**Recommended filename convention:**
`[subject]-[trip]-[variant].jpg`

Examples:
- `great-wall-smiling-hero.jpg`
- `alaska-glacier-story.jpg`
- `oasis-dining-family-card.jpg`

See `photos-to-use/enhanced/photo-inventory.md` and `photos-to-use/enhanced/README.md` for the full system.

---

**Next:** Once you enhance these five, we can decide on the next batch (there are a few more good ones in Tier 2). 

Let me know when you’ve enhanced any of them and want a second opinion on the results.