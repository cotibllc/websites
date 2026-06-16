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
    bodyClass: 'dest-page',
    title: 'The COTIB Story | Earned Escape',
    description: 'After decades of exploring the world and 30 years in corporate IT, I built Earned Escape to help families plan the kind of trips they deserve.',
    canonical: '/about',
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
    description: 'Book a free 30-minute vacation planning call with Chuck. Personal, no-pressure guidance for Royal Caribbean, Disney Cruise Line, Walt Disney World, and Universal vacations.',
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
  } = req.body || {};

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  // Verify Cloudflare Turnstile only when secret is configured
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const hasTurnstile = !!secret;

  if (hasTurnstile && !turnstileToken) {
    return res.status(400).json({ error: 'Please complete the security check.' });
  }

  if (hasTurnstile) {
    let verifyData;
    try {
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret,
          response: turnstileToken,
        }),
      });
      verifyData = await verifyRes.json();
    } catch (err) {
      console.error('Turnstile verify error:', err);
      return res.status(500).json({ error: 'Unable to complete security check. Please try again.' });
    }

    if (!verifyData.success) {
      return res.status(400).json({ error: 'Security check failed. Please refresh the page and try again.' });
    }
  } else {
    console.warn('TURNSTILE_SECRET_KEY not set – skipping Turnstile verification (dev only)');
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
      subject: `[Earned Escape] Planning Call: ${tripType || 'General'} – ${name}`,
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
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (audienceId) {
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
    } else {
      console.log('RESEND_AUDIENCE_ID not set – skipping contact registration');
    }



    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Resend error (plan form):', err);
    return res.status(500).json({
      error: 'Something went wrong sending your request. Please try again or email cbetancourt@castledreamstravel.com directly.',
    });
  }
});

module.exports = router;
