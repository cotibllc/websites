const express = require('express');
const router = express.Router();
const site = require('../config/site');

const { Resend } = require('resend');


const TO_EMAIL = 'cbetancourt@castledreamstravel.com';
const FROM_EMAIL = 'Chuck Betancourt <cbetancourt@castledreamstravel.com>';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Strips CR/LF so untrusted input can't inject extra headers when it's
// interpolated into an email `subject` or `replyTo`. Also caps length so a
// direct API caller (bypassing the browser forms) can't push arbitrarily
// large strings into outbound emails.
function sanitizeForHeader(str, maxLen = 200) {
  if (!str) return '';
  return String(str).replace(/[\r\n]+/g, ' ').slice(0, maxLen).trim();
}

// Verifies a Cloudflare Turnstile token. Fails closed in production when no
// secret is configured. Shared by /api/plan, /api/guide, and /api/quiz.
// Returns { ok: true } or { ok: false, status, error } for the route to
// return directly.
async function verifyTurnstile(turnstileToken) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('TURNSTILE_SECRET_KEY not set in production – rejecting submission');
      return { ok: false, status: 500, error: 'Unable to complete security check.' };
    }
    console.warn('TURNSTILE_SECRET_KEY not set – skipping Turnstile verification (dev only)');
    return { ok: true };
  }

  if (!turnstileToken) {
    return { ok: false, status: 400, error: 'Please complete the security check.' };
  }

  try {
    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: turnstileToken }),
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return { ok: false, status: 400, error: 'Security check failed. Please refresh the page and try again.' };
    }
    return { ok: true };
  } catch (err) {
    console.error('Turnstile verify error:', err);
    return { ok: false, status: 500, error: 'Unable to complete security check.' };
  }
}

// Adds a contact to the Resend Audience if RESEND_AUDIENCE_ID is configured.
// Shared by /api/plan, /api/guide, and /api/quiz so every lead capture point
// feeds the same list.
async function addToResendAudience(resend, name, email) {
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    console.log('RESEND_AUDIENCE_ID not set – skipping contact registration');
    return;
  }
  try {
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    await resend.contacts.create({
      email: email.trim(),
      firstName,
      lastName,
      unsubscribed: false,
      audienceId,
    });
  } catch (contactErr) {
    console.error('Failed to add contact to Resend Audience:', contactErr);
  }
}

// Guide nurture sequence, emails 2 and 3 (email 1 is the immediate PDF
// delivery already sent from POST /api/guide). Copy source: vault
// Earned-Escape/Website/Copy/Lead_Magnet_5_Mistakes.md.
function guideNurtureEmail2Html(name) {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, -apple-system, sans-serif; color: #222; max-width: 560px; margin: 0 auto; padding: 32px 24px; line-height: 1.6;">
  <p style="margin: 0 0 16px; color: #0D0821;">Hi ${escapeHtml(name)},</p>
  <p style="margin: 0 0 16px;">I hope you found the cruiser's guide helpful! Since you're likely still in the research phase, here's a piece of advice that usually surprises first-time cruisers.</p>
  <p style="margin: 0 0 16px;">A lot of people think their first decision should be picking a destination, like "the Bahamas" or "the Western Caribbean." In reality, <strong>your first decision should be the ship.</strong> On modern cruise lines like Royal Caribbean, the ship <em>is</em> the destination. The experience on an older, smaller ship is fundamentally different from a massive Oasis-class ship, even sailing to the exact same ports.</p>
  <p style="margin: 0 0 16px;">Are you currently leaning toward a specific cruise line, or still wide open? Just reply, I read every email.</p>
  <p style="margin: 20px 0 0; color: #0D0821;">Warmly,<br>Chuck<br><span style="font-size: 13px; color: #666;">Earned Escape by COTIB Adventures LLC</span></p>
  <hr style="margin: 32px 0 16px; border: none; border-top: 1px solid #eee;">
  <p style="font-size: 11px; color: #999; margin: 0 0 4px;">Earned Escape is operated by COTIB Adventures LLC and is an affiliate of Castle Dreams Travel.</p>
  <p style="font-size: 11px; color: #999; margin: 0;">Rather not get these follow-up emails? Just reply "unsubscribe" and I'll take you off the list.</p>
</body>
</html>`;
}

function guideNurtureEmail3Html(name) {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, -apple-system, sans-serif; color: #222; max-width: 560px; margin: 0 auto; padding: 32px 24px; line-height: 1.6;">
  <p style="margin: 0 0 16px; color: #0D0821;">Hi ${escapeHtml(name)},</p>
  <p style="margin: 0 0 16px;">Planning a cruise can quickly turn from exciting to overwhelming once you start looking at deck plans, beverage packages, and dining reservations.</p>
  <p style="margin: 0 0 16px;">I built Earned Escape specifically to take that mental load off of families. You shouldn't need a spreadsheet just to figure out how to feed your family on vacation.</p>
  <p style="margin: 0 0 16px;">If you're starting to feel stuck, or just want a second set of eyes on an itinerary you're considering, let's hop on a quick 30-minute planning call. Zero pressure, no fee.</p>
  <p style="margin: 24px 0;"><a href="https://earnedescape.agency/plan" style="display:inline-block; padding:12px 24px; background:#2A164E; color:#fff; text-decoration:none; border-radius:4px;">Reserve My Planning Call</a></p>
  <p style="margin: 0 0 16px;">Either way, I hope you have an incredible trip. You've earned it.</p>
  <p style="margin: 20px 0 0; color: #0D0821;">Best,<br>Chuck<br><span style="font-size: 13px; color: #666;">Earned Escape by COTIB Adventures LLC</span></p>
  <hr style="margin: 32px 0 16px; border: none; border-top: 1px solid #eee;">
  <p style="font-size: 11px; color: #999; margin: 0 0 4px;">Earned Escape is operated by COTIB Adventures LLC and is an affiliate of Castle Dreams Travel.</p>
  <p style="font-size: 11px; color: #999; margin: 0;">Rather not get these follow-up emails? Just reply "unsubscribe" and I'll take you off the list.</p>
</body>
</html>`;
}

router.get('/', (req, res) => {
  res.render('pages/index.njk', {
    site,
    bodyClass: 'home',
    title: site.seo.title,
    description: site.seo.description,
    canonical: '/',
  });
});

router.get('/about', (req, res) => {
  res.render('pages/about.njk', {
    site,
    bodyClass: 'dest-page about-page',
    title: 'Meet Chuck | Family & Luxury Travel Advisor | Earned Escape',
    description: 'After decades of exploring the world and 30 years in corporate IT, Chuck Betancourt built Earned Escape to plan elevated family vacations and luxury escapes with the same precision.',
    canonical: '/about',
    ogImage: '/images/photos/chuck-betancourt-headshot-square.jpg',
  });
});

router.get('/disney-world', (req, res) => {
  res.render('pages/disney-world.njk', {
    site,
    bodyClass: 'dest-page',
    destination: 'disney-world',
    title: 'Walt Disney World Planning | Earned Escape',
    description: 'Thoughtful Walt Disney World planning for families who want a smoother, more elevated vacation with the right resort, rhythm, and strategy.',
    canonical: '/disney-world',
  });
});

router.get('/royal-caribbean', (req, res) => {
  res.render('pages/royal-caribbean.njk', {
    site,
    bodyClass: 'dest-page',
    destination: 'royal-caribbean',
    title: 'Royal Caribbean Cruises | Earned Escape',
    description: 'Royal Caribbean cruise planning shaped by firsthand travel experience, with help choosing the right ship, stateroom, and itinerary.',
    canonical: '/royal-caribbean',
  });
});

router.get('/disney-cruise-line', (req, res) => {
  res.render('pages/disney-cruise-line.njk', {
    site,
    bodyClass: 'dest-page',
    destination: 'disney-cruise-line',
    title: 'Disney Cruise Line Planning | Earned Escape',
    description: 'Disney Cruise Line planning for families who want thoughtful guidance on ships, itineraries, and the kind of details that make the experience feel special.',
    canonical: '/disney-cruise-line',
  });
});

router.get('/universal', (req, res) => {
  res.render('pages/universal.njk', {
    site,
    bodyClass: 'dest-page',
    destination: 'universal',
    title: 'Universal Orlando & Epic Universe | Earned Escape',
    description: 'Universal Orlando and Epic Universe planning with practical strategy for hotels, park days, and a trip that feels exciting without the overwhelm.',
    canonical: '/universal',
  });
});

router.get('/plan', (req, res) => {
  res.render('pages/plan.njk', {
    site,
    title: 'Vacation Planning Call | Earned Escape',
    description: 'Book a free 30-minute planning call with Chuck. Personal, no-pressure guidance for elevated family vacations and luxury escapes - Royal Caribbean, Disney Cruise Line, Walt Disney World, and Universal.',
    canonical: '/plan',
  });
});

router.get('/compliance', (req, res) => {
  res.render('pages/compliance.njk', {
    site,
    bodyClass: 'dest-page',
    title: 'Compliance & Disclosures | Earned Escape',
    description: 'Affiliate disclosure, business registration, and transparency about how Earned Escape operates as an affiliate of Castle Dreams Travel.',
    canonical: '/compliance',
  });
});

router.get('/guide', (req, res) => {
  res.render('pages/guide.njk', {
    site,
    bodyClass: 'dest-page',
    title: '5 Mistakes First-Time Cruisers Make | Earned Escape',
    description: 'Get the free guide on how to avoid the hidden failure points that ruin family vacations.',
    canonical: '/guide',
    ogImage: '/images/photos/guide-cover.png',
  });
});

router.get('/links', (req, res) => {
  // Use a minimal layout without the global header/footer
  res.render('pages/links.njk', {
    site,
    title: 'Links | Earned Escape',
    description: 'Helpful links and resources from Chuck Betancourt, Travel Advisor at Earned Escape.',
    canonical: '/links',
    ogImage: '/images/photos/great-wall-smiling-story.jpg',
  });
});

// POST /api/guide – handles the free guide lead capture
router.post('/api/guide', async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, turnstileToken, website } = req.body || {};

  // Honeypot: real users never fill this hidden field. Pretend success so
  // bots don't learn they were caught. Trim first so autofill/extensions that
  // leave only whitespace in the hidden field don't false-positive a real user.
  if (website?.trim()) {
    return res.status(200).json({ success: true });
  }

  if (!name?.trim() || !email?.trim()) {
    return res.status(400).json({ error: 'Please provide both your name and email address.' });
  }

  const turnstileResult = await verifyTurnstile(turnstileToken);
  if (!turnstileResult.ok) {
    return res.status(turnstileResult.status).json({ error: turnstileResult.error });
  }

  const notifyHtml = `
  <div style="font-family: sans-serif; padding: 20px;">
    <h2>New Guide Download</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><em>They requested the "5 Mistakes" guide via earnedescape.agency/guide</em></p>
  </div>`;

  const deliverHtml = `
  <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
    <p>Hi ${escapeHtml(name)},</p>
    <p>Thanks for requesting the guide! As promised, here is the direct link to download <strong>5 Mistakes First-Time Cruisers Make (And How to Avoid Them)</strong>:</p>
    <p><a href="https://earnedescape.agency/downloads/5-mistakes-first-time-cruisers-make.pdf" style="display:inline-block; padding:12px 24px; background:#2A164E; color:#fff; text-decoration:none; border-radius:4px;">Download The Guide</a></p>
    <p>If you only take one thing away from the guide, pay close attention to <strong>Mistake #2</strong>. It is the single biggest money-waster I see on family sailings.</p>
    <p>Give it a read, and if you have any questions, just reply to this email.</p>
    <p>Talk soon,<br>Chuck Betancourt<br>Earned Escape by COTIB Adventures LLC</p>
    <p style="font-size: 11px; color: #999; margin-top: 40px;">Earned Escape is an affiliate of Castle Dreams Travel.</p>
  </div>`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    // 1. Notify Chuck
    await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: '[Earned Escape] Guide Downloaded: ' + sanitizeForHeader(name),
      html: notifyHtml,
    });

    // 2. Deliver PDF to lead
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Here's your guide! (Plus the one mistake that drives me crazy)",
      html: deliverHtml,
    });

    // 3. Add to the Resend Audience so this lead is reachable for future sends
    await addToResendAudience(resend, name, email);

    // 4. Schedule the rest of the guide nurture sequence (day 3 + day 7).
    // Independent sends, run in parallel. Skipped in dev/preview if
    // RESEND_API_KEY isn't a live key, but scheduling failures should never
    // block the guide delivery above.
    try {
      const day3 = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      const day7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      await Promise.all([
        resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: 'Quick question about your cruise plans...',
          html: guideNurtureEmail2Html(name),
          scheduledAt: day3,
        }),
        resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: "Let's get the logistics out of the way",
          html: guideNurtureEmail3Html(name),
          scheduledAt: day7,
        }),
      ]);
    } catch (scheduleErr) {
      console.error('Failed to schedule guide nurture emails:', scheduleErr);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Guide API error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// Setting-specific planning tips for quiz results email. Keys match
// data-value on the homepage quiz (cruise | parks | adventure | resort).
const QUIZ_TIPS = {
  cruise: {
    heading: '3 cruise-planning tips tailored to you',
    tips: [
      'Pick the ship before the itinerary. On modern Royal Caribbean ships especially, the vessel is the vacation.',
      'Stateroom location matters as much as category. Mid-ship, higher decks usually ride smoother and cut walk time to venues.',
      'Lock dining and must-do reservations early. Specialty dining and popular excursions sell out well before sailing day.',
    ],
    moreUrl: 'https://earnedescape.agency/royal-caribbean',
    moreLabel: 'Explore Royal Caribbean planning',
  },
  parks: {
    heading: '3 park-planning tips tailored to you',
    tips: [
      'Choose the resort first, then the park days. Where you sleep shapes transportation, rest, and how early you can start.',
      'Protect your mornings. Rope drop (or a smart first-hour plan) still beats buying your way out of every line.',
      'Be selective with paid line-skipping. Lightning Lane / Express works best on a few high-demand attractions, not every ride.',
    ],
    moreUrl: 'https://earnedescape.agency/disney-world',
    moreLabel: 'Explore Disney World planning',
  },
  adventure: {
    heading: '3 adventure-planning tips tailored to you',
    tips: [
      'Build one "must-see" block per day and protect recovery time. Bucket-list trips fall apart when every hour is packed.',
      'Treat multi-city logistics like a project plan: flights, transfers, and hotel check-in windows are where stress hides.',
      'Leave white space for the unexpected. The best moments on China-style itineraries are often the ones you did not schedule.',
    ],
    moreUrl: 'https://earnedescape.agency/about',
    moreLabel: 'See how I plan complex trips',
  },
  resort: {
    heading: '3 resort-planning tips tailored to you',
    tips: [
      'Room category and location change the whole stay. Ocean view, quiet wing, or near the adult pool is often worth more than an upgrade label.',
      'Decide early what "all-inclusive" means for you: drinks, a la carte dining, kids clubs, and transfer packages vary widely.',
      'Seasonality drives price and vibe. Shoulder seasons often deliver the same resort with fewer crowds and better value.',
    ],
    moreUrl: 'https://earnedescape.agency/plan',
    moreLabel: 'Plan a resort escape with me',
  },
};

function quizTipsForSetting(setting) {
  return QUIZ_TIPS[setting] || QUIZ_TIPS.cruise;
}

function quizResultsEmailHtml({
  name,
  safeTitle,
  safeDesc,
  paceLabel,
  partyLabel,
  supportTier,
  tripType,
  setting,
}) {
  const tipPack = quizTipsForSetting(setting);
  const tipItems = tipPack.tips
    .map(
      (tip) =>
        `<li style="margin: 0 0 10px; padding-left: 4px;">${escapeHtml(tip)}</li>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, -apple-system, sans-serif; color: #222; max-width: 560px; margin: 0 auto; padding: 32px 24px; line-height: 1.6;">
  <p style="margin: 0 0 16px; color: #0D0821;">Hi ${escapeHtml(name)},</p>
  <p style="margin: 0 0 16px;">Here's what your answers pointed to, plus a few planning tips so you can keep the momentum going.</p>
  <div style="background: #f8f7f2; padding: 18px; border-top: 4px solid #C9A84C; margin: 0 0 20px;">
    <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; font-weight: 600;">${escapeHtml(safeTitle)}</p>
    <p style="margin: 0; color: #222;">${escapeHtml(safeDesc)}</p>
  </div>
  <p style="margin: 0 0 8px;"><strong>Your snapshot</strong></p>
  <ul style="margin: 0 0 20px; padding-left: 18px; color: #333;">
    <li style="margin: 0 0 6px;">Preferred pace: <strong>${escapeHtml(paceLabel) || 'Not set'}</strong></li>
    <li style="margin: 0 0 6px;">Travel party: <strong>${escapeHtml(partyLabel) || 'Not set'}</strong></li>
    <li style="margin: 0 0 6px;">Trip focus: <strong>${escapeHtml(tripType) || 'Not set'}</strong></li>
    <li style="margin: 0 0 6px;">Support style: <strong>${escapeHtml(supportTier) || 'Not set'}</strong></li>
  </ul>
  <p style="margin: 0 0 8px;"><strong>${escapeHtml(tipPack.heading)}</strong></p>
  <ol style="margin: 0 0 20px; padding-left: 18px; color: #333;">
    ${tipItems}
  </ol>
  <p style="margin: 0 0 12px;"><a href="${tipPack.moreUrl}" style="color: #2A164E; font-weight: 600;">${escapeHtml(tipPack.moreLabel)} &rarr;</a></p>
  <p style="margin: 0 0 16px;">Want to turn this into an actual itinerary? Let's hop on a free 30-minute planning call. Zero pressure, no planning fee.</p>
  <p style="margin: 24px 0;"><a href="https://earnedescape.agency/plan" style="display:inline-block; padding:12px 24px; background:#2A164E; color:#fff; text-decoration:none; border-radius:4px;">Reserve My Planning Call</a></p>
  <p style="margin: 20px 0 0; color: #0D0821;">Talk soon,<br>Chuck<br><span style="font-size: 13px; color: #666;">Earned Escape by COTIB Adventures LLC</span></p>
  <hr style="margin: 32px 0 16px; border: none; border-top: 1px solid #eee;">
  <p style="font-size: 11px; color: #999; margin: 0 0 4px;">Earned Escape is operated by COTIB Adventures LLC and is an affiliate of Castle Dreams Travel.</p>
  <p style="font-size: 11px; color: #999; margin: 0;">Rather not get follow-up emails? Just reply "unsubscribe" and I'll take you off the list.</p>
</body>
</html>`;
}

function quizNurtureEmailHtml(name, safeTitle) {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, -apple-system, sans-serif; color: #222; max-width: 560px; margin: 0 auto; padding: 32px 24px; line-height: 1.6;">
  <p style="margin: 0 0 16px; color: #0D0821;">Hi ${escapeHtml(name)},</p>
  <p style="margin: 0 0 16px;">A few days ago you took the Design My Escape quiz and landed on <strong>${escapeHtml(safeTitle)}</strong>.</p>
  <p style="margin: 0 0 16px;">Most people get stuck right after that moment, comparing options in too many tabs and second-guessing dates, ships, or resorts. That is exactly when a short planning call helps: we narrow the field, map a realistic pace, and decide what is worth booking now versus later.</p>
  <p style="margin: 0 0 16px;">If you want a second set of eyes, grab a free 30-minute call. Zero pressure, no planning fee.</p>
  <p style="margin: 24px 0;"><a href="https://earnedescape.agency/plan" style="display:inline-block; padding:12px 24px; background:#2A164E; color:#fff; text-decoration:none; border-radius:4px;">Reserve My Planning Call</a></p>
  <p style="margin: 0 0 16px;">Either way, keep the tips from your results email handy when you research. You've earned a trip that actually feels easy.</p>
  <p style="margin: 20px 0 0; color: #0D0821;">Best,<br>Chuck<br><span style="font-size: 13px; color: #666;">Earned Escape by COTIB Adventures LLC</span></p>
  <hr style="margin: 32px 0 16px; border: none; border-top: 1px solid #eee;">
  <p style="font-size: 11px; color: #999; margin: 0 0 4px;">Earned Escape is operated by COTIB Adventures LLC and is an affiliate of Castle Dreams Travel.</p>
  <p style="font-size: 11px; color: #999; margin: 0;">Rather not get these follow-up emails? Just reply "unsubscribe" and I'll take you off the list.</p>
</body>
</html>`;
}

// POST /api/quiz – emails the "Help Me Design My Escape" quiz results to the
// lead and registers them as a contact. The quiz is scored client-side
// (public/js/quiz.js) and normally only sends the fixed set of option-button
// labels, but this endpoint is a public URL, so free-text fields are still
// length-capped and header-sanitized below in case it's called directly.
router.post('/api/quiz', async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name,
    email,
    turnstileToken,
    website,
    resultTitle,
    resultDesc,
    paceLabel,
    partyLabel,
    tripType,
    supportTier,
    setting,
  } = req.body || {};

  // Honeypot: real users never fill this hidden field. Pretend success so
  // bots don't learn they were caught. Trim first so autofill/extensions that
  // leave only whitespace in the hidden field don't false-positive a real user.
  if (website?.trim()) {
    return res.status(200).json({ success: true });
  }

  if (!name?.trim() || !email?.trim()) {
    return res.status(400).json({ error: 'Please provide both your name and email address.' });
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  if (!emailOk) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const turnstileResult = await verifyTurnstile(turnstileToken);
  if (!turnstileResult.ok) {
    return res.status(turnstileResult.status).json({ error: turnstileResult.error });
  }

  const safeTitle = sanitizeForHeader(resultTitle) || 'Your Custom Escape';
  const safeDesc = (resultDesc || '').trim().slice(0, 600);
  const safePace = sanitizeForHeader(paceLabel, 120);
  const safeParty = sanitizeForHeader(partyLabel, 120);
  const safeTrip = sanitizeForHeader(tripType, 160);
  const safeTier = sanitizeForHeader(supportTier, 120);
  const safeSetting = ['cruise', 'parks', 'adventure', 'resort'].includes(setting)
    ? setting
    : 'cruise';

  const notifyHtml = `
  <div style="font-family: sans-serif; padding: 20px;">
    <h2>New Quiz Result</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Result:</strong> ${escapeHtml(safeTitle)}</p>
    <p><strong>Setting:</strong> ${escapeHtml(safeSetting)}</p>
    <p><strong>Trip type:</strong> ${escapeHtml(safeTrip) || '<em>Not set</em>'}</p>
    <p><strong>Pace:</strong> ${escapeHtml(safePace) || '<em>Not set</em>'}</p>
    <p><strong>Party:</strong> ${escapeHtml(safeParty) || '<em>Not set</em>'}</p>
    <p><strong>Support tier:</strong> ${escapeHtml(safeTier) || '<em>Not set</em>'}</p>
    <p><em>Submitted via the homepage "Design My Escape" quiz.</em></p>
  </div>`;

  const resultsHtml = quizResultsEmailHtml({
    name: name.trim(),
    safeTitle,
    safeDesc,
    paceLabel: safePace,
    partyLabel: safeParty,
    supportTier: safeTier,
    tripType: safeTrip,
    setting: safeSetting,
  });

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not set – cannot send quiz results');
      return res.status(500).json({
        error: 'Something went wrong sending your results. Please try again.',
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // 1 & 2. Notify Chuck and send results to the lead — independent sends, run in parallel.
    await Promise.all([
      resend.emails.send({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        replyTo: email.trim(),
        subject: `[Earned Escape] Quiz Result: ${safeTitle} – ${sanitizeForHeader(name)}`,
        html: notifyHtml,
      }),
      resend.emails.send({
        from: FROM_EMAIL,
        to: email.trim(),
        subject: `Your custom escape: ${safeTitle}`,
        html: resultsHtml,
      }),
    ]);

    // 3. Add to the Resend Audience so this lead is reachable for future sends
    await addToResendAudience(resend, name, email);

    // 4. Day-3 nurture: soft planning-call CTA referencing their result.
    // Scheduling failures must not fail the immediate results delivery.
    try {
      const day3 = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email.trim(),
        subject: 'Still thinking about that escape?',
        html: quizNurtureEmailHtml(name.trim(), safeTitle),
        scheduledAt: day3,
      });
    } catch (scheduleErr) {
      console.error('Failed to schedule quiz nurture email:', scheduleErr);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Resend error (quiz):', err);
    return res.status(500).json({
      error: 'Something went wrong sending your results. Please try again.',
    });
  }
});

// POST /api/plan – handles the consultation request form (Turnstile + Resend)
router.post('/api/plan', async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name,
    email,
    phone,
    dates,
    tripType,
    travelers,
    message,
    supportTier,
    turnstileToken,
    website,
  } = req.body || {};

  // Honeypot: real users never fill this hidden field. Pretend success so
  // bots don't learn they were caught. Trim first so autofill/extensions that
  // leave only whitespace in the hidden field don't false-positive a real user.
  if (website?.trim()) {
    return res.status(200).json({ success: true });
  }

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  const turnstileResult = await verifyTurnstile(turnstileToken);
  if (!turnstileResult.ok) {
    return res.status(turnstileResult.status).json({ error: turnstileResult.error });
  }

  const htmlEmail = `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #222; max-width: 620px; margin: 0 auto; padding: 24px; line-height: 1.5;">
  <div style="border-left: 5px solid #C9A84C; padding-left: 18px; margin-bottom: 28px;">
    <h2 style="margin: 0 0 4px; color: #0D0821; font-size: 20px;">New Planning Call Request</h2>
    <p style="margin: 0; color: #666; font-size: 13px;">via earnedescape.agency/plan</p>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
    <tr style="background: #f8f7f2;">
      <td style="padding: 10px 14px; font-weight: 600; width: 170px; border-bottom: 1px solid #eee; color: #0D0821;">Name</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #eee;">${escapeHtml(name)}</td>
    </tr>
    <tr>
      <td style="padding: 10px 14px; font-weight: 600; border-bottom: 1px solid #eee; color: #0D0821;">Email</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #eee;">
        <a href="mailto:${escapeHtml(email)}" style="color: #9575CD;">${escapeHtml(email)}</a>
      </td>
    </tr>
    <tr style="background: #f8f7f2;">
      <td style="padding: 10px 14px; font-weight: 600; border-bottom: 1px solid #eee; color: #0D0821;">Phone</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #eee;">${escapeHtml(phone) || '<em style="color:#999">Not provided</em>'}</td>
    </tr>
    <tr>
      <td style="padding: 10px 14px; font-weight: 600; border-bottom: 1px solid #eee; color: #0D0821;">Travel Window</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #eee;">${escapeHtml(dates) || '<em style="color:#999">Not specified</em>'}</td>
    </tr>
    <tr style="background: #f8f7f2;">
      <td style="padding: 10px 14px; font-weight: 600; border-bottom: 1px solid #eee; color: #0D0821;">Trip Type</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #eee;">${escapeHtml(tripType) || '<em style="color:#999">Not selected</em>'}</td>
    </tr>
    <tr>
      <td style="padding: 10px 14px; font-weight: 600; border-bottom: 1px solid #eee; color: #0D0821;">Travelers</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #eee;">${escapeHtml(travelers) || '<em style="color:#999">Not specified</em>'}</td>
    </tr>
    <tr style="background: #f8f7f2;">
      <td style="padding: 10px 14px; font-weight: 600; border-bottom: 1px solid #eee; color: #0D0821;">Support Preference</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #eee;">${escapeHtml(supportTier) || '<em style="color:#999">Not specified</em>'}</td>
    </tr>
  </table>

  <div style="background: #f8f7f2; padding: 18px; border-top: 4px solid #C9A84C;">
    <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; font-weight: 600;">What matters most to them</p>
    <p style="margin: 0; white-space: pre-wrap; color: #222;">${escapeHtml(message)}</p>
  </div>

  <hr style="margin: 28px 0; border: none; border-top: 1px solid #eee;">
  <p style="font-size: 12px; color: #888; margin: 0;">
    Reply directly to this email to respond to ${escapeHtml(name)}. This request came from the owned /plan form on earnedescape.agency.
  </p>
</body>
</html>`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    // 1. Notify Chuck
    await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: `[Earned Escape] Planning Call: ${sanitizeForHeader(tripType) || 'General'} – ${sanitizeForHeader(name)}`,
      html: htmlEmail,
    });

    // 2. Confirmation to the lead (simple, warm)
    const confirmHtml = `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, -apple-system, sans-serif; color: #222; max-width: 560px; margin: 0 auto; padding: 32px 24px; line-height: 1.6;">
  <p style="margin: 0 0 16px; color: #0D0821; font-size: 15px;">Hi ${escapeHtml(name)},</p>

  <p style="margin: 0 0 16px;">Thank you – I've received your planning call request. I'll personally review the details and reach out within one business day to find a time that works for you (video or phone, whatever you prefer).</p>

  <p style="margin: 0 0 16px;">In the meantime, if anything comes up or you want to add more context, just reply to this email.</p>

  <p style="margin: 24px 0 0;">Looking forward to helping you design the trip you've earned.</p>

  <p style="margin: 20px 0 0; color: #0D0821;"> –  Chuck<br>
  <span style="font-size: 13px; color: #666;">Earned Escape by COTIB Adventures LLC</span></p>

  <hr style="margin: 32px 0 16px; border: none; border-top: 1px solid #eee;">
  <p style="font-size: 11px; color: #999; margin: 0;">
    Earned Escape is operated by COTIB Adventures LLC and is an affiliate of Castle Dreams Travel.
  </p>
</body>
</html>`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your Earned Escape planning call request – received',
      html: confirmHtml,
    });

    // 3. Add contact to Resend Audience if configured
    await addToResendAudience(resend, name, email);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Resend error (plan form):', err);
    return res.status(500).json({
      error: 'Something went wrong sending your request. Please try again or email cbetancourt@castledreamstravel.com directly.',
    });
  }
});

module.exports = router;
