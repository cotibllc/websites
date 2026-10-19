// Guide email templates: delivery (sent right away), day 3 and day 7.
// Copy from EE Marketing (lead emails, 2026-10-17). Every email shares the
// CAN-SPAM footer: business identity, postal address and a working
// unsubscribe link.
const site = require('../config/site');
const chinaChecklist = require('./china-checklist');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function publicBaseUrl() {
  return (process.env.PUBLIC_BASE_URL || site.siteUrl).replace(/\/$/, '');
}

function unsubscribeUrl(token) {
  return `${publicBaseUrl()}/unsubscribe?t=${encodeURIComponent(token)}`;
}

const DISCLOSURE = {
  short: `Earned Escape is an affiliate of ${site.brand.parentAgency} through Charles Betancourt, Independent Advisor.`,
  operated: `Earned Escape is operated by ${site.brand.business} and is an affiliate of ${site.brand.parentAgency} through Charles Betancourt, Independent Advisor.`,
};

// CAN-SPAM footer: disclosure, postal address and a working unsubscribe link
// (the reply option from the EE Marketing copy is kept as a fallback).
function footerHtml(token, disclosure) {
  return `
  <hr style="margin: 32px 0 16px; border: none; border-top: 1px solid #eee;">
  <p style="font-size: 13px; color: #555; margin: 0 0 4px;">${escapeHtml(disclosure)}</p>
  <p style="font-size: 12px; color: #777; margin: 0 0 4px;">${escapeHtml(site.brand.mailingAddress)}</p>
  <p style="font-size: 12px; color: #777; margin: 0;">Rather not get emails from Earned Escape? <a href="${unsubscribeUrl(token)}" style="color: #555; text-decoration: underline;">Unsubscribe here</a>, or just reply "unsubscribe" and I'll take you off the list.</p>`;
}

// RFC 2369 and RFC 8058 one-click unsubscribe headers for Resend.
function listUnsubscribeHeaders(token) {
  return {
    'List-Unsubscribe': `<${unsubscribeUrl(token)}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
}

const P = 'margin: 0 0 16px;';
const BTN = 'display:inline-block; padding:12px 24px; background:#2A164E; color:#fff; text-decoration:none; border-radius:4px;';

// Preview text goes in a hidden preheader span at the top of the body.
const shell = (preview, inner) => `<!DOCTYPE html>
<html>
<body style="font-family: system-ui, -apple-system, sans-serif; color: #222; max-width: 560px; margin: 0 auto; padding: 32px 24px; line-height: 1.6;">
<span style="display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; max-height:0; max-width:0; overflow:hidden; mso-hide:all;">${escapeHtml(preview)}</span>
${inner}
</body>
</html>`;

// Copy source: EE Marketing lead emails (2026-10-17).
const TEMPLATES = {
  rc: {
    delivery: {
      subject: 'Your cruise guide is here (start with Mistake #2)',
      preview: 'The 5 mistakes I see first-time cruisers make, and the one to read first.',
      html({ name, guide, token }) {
        return shell(this.preview, `
  <p style="${P}">Hi ${escapeHtml(name)},</p>
  <p style="${P}">Thanks for requesting the guide. Here's your copy of <strong>${escapeHtml(guide.fullTitle)}</strong>:</p>
  <p style="margin: 24px 0;"><a href="${publicBaseUrl()}${guide.pdfPath}" style="${BTN}">Download The Guide</a></p>
  <p style="${P}">If you only read one section, make it Mistake #2. Dining is the single biggest money-waster I see on family sailings. By the time most first-timers board, the 6:00 to 7:30 PM main dining times are booked and the specialty restaurants are sold out for the week.</p>
  <p style="${P}">The fix is simple: log into your cruise planner 45 to 60 days before you sail (it depends on the cruise line) and lock in your dining times. Then dinner is settled before you ever pack a bag.</p>
  <p style="${P}">On a cruise, the plan starts before you board.</p>
  <p style="${P}">Questions about anything in the guide? Just reply. I read every email.</p>
  <p style="margin: 20px 0 0;">Talk soon,<br>Chuck Betancourt<br>Earned Escape by COTIB Adventures LLC</p>
${footerHtml(token, DISCLOSURE.short)}`);
      },
    },
    day3: {
      subject: 'Quick question about your cruise plans',
      preview: 'Pick the ship before the port. Here\'s why.',
      html({ name, token }) {
        return shell(this.preview, `
  <p style="${P} color: #0D0821;">Hi ${escapeHtml(name)},</p>
  <p style="${P}">Most first-time cruisers start with the port: the Bahamas, or the Western Caribbean.</p>
  <p style="${P}">That's backwards. An older, smaller ship and a massive Oasis-class ship give you two completely different vacations, even when they sail to the exact same ports.</p>
  <p style="${P}">So make the ship your first decision. On Royal Caribbean especially, the ship is the destination. Search by ship class first, then look at where it sails.</p>
  <p style="${P}">Do it in that order and you end up on a ship built for the trip you actually want.</p>
  <p style="${P}">Choose the ship, then the ports.</p>
  <p style="${P}">Are you leaning toward a specific cruise line yet, or still wide open? Hit reply and tell me. I read every email.</p>
  <p style="margin: 20px 0 0; color: #0D0821;">Warmly,<br>Chuck<br><span style="font-size: 13px; color: #666;">Earned Escape by COTIB Adventures LLC</span></p>
${footerHtml(token, DISCLOSURE.operated)}`);
      },
    },
    day7: {
      subject: "Let's get the logistics out of the way",
      preview: 'A free 30-minute planning call. No fee, no pressure.',
      html({ name, token }) {
        return shell(this.preview, `
  <p style="${P} color: #0D0821;">Hi ${escapeHtml(name)},</p>
  <p style="${P}">By now you might be deep in deck plans, the Deluxe Beverage Package, and dining reservations.</p>
  <p style="${P}">That's usually where planning stops being fun. You shouldn't need a spreadsheet just to figure out how to feed your family on vacation.</p>
  <p style="${P}">I built Earned Escape to take that mental load off families. If you're feeling stuck, or want a second set of eyes on a sailing you're considering, let's talk on a free 30-minute planning call. No fee, no pressure.</p>
  <p style="margin: 24px 0;"><a href="${publicBaseUrl()}/plan" style="${BTN}">Reserve My Planning Call</a></p>
  <p style="${P}">You'll come away with clear guidance on the ship, the cabin, and your next booking step.</p>
  <p style="${P}">Either way, I hope you have an incredible trip. You've earned it.</p>
  <p style="margin: 20px 0 0; color: #0D0821;">Best,<br>Chuck<br><span style="font-size: 13px; color: #666;">Earned Escape by COTIB Adventures LLC</span></p>
${footerHtml(token, DISCLOSURE.operated)}`);
      },
    },
  },
  // China entry checklist. Delivery only. The checklist itself is EE
  // Marketing's checklist.md verbatim (lib/china-checklist.js). The subject,
  // preview and the one intro line are Web Design placeholders for EE
  // Marketing to confirm. Footer is the shared CAN-SPAM footer.
  china: {
    delivery: {
      subject: 'Your China Entry Checklist',
      preview: 'Printable: visa or 240-hour transit, payments, phone and arrival, each with the official link.',
      html({ guide, token }) {
        return shell(this.preview, `
  <p style="${P}">Here's your ${escapeHtml(guide.fullTitle)}. The printable PDF is below, and the full list is in this email too.</p>
  <p style="margin: 24px 0;"><a href="${publicBaseUrl()}${guide.pdfPath}" style="${BTN}">Download The Checklist</a></p>
  ${chinaChecklist.emailHtml()}
  <p style="margin: 24px 0;"><a href="${publicBaseUrl()}/plan" style="${BTN}">Plan your China trip</a></p>
  <p style="margin: 20px 0 0; color: #0D0821;">Chuck<br><span style="font-size: 13px; color: #666;">Earned Escape by COTIB Adventures LLC</span></p>
${footerHtml(token, DISCLOSURE.operated)}`);
      },
    },
  },
};

function getTemplates(guideType) {
  return TEMPLATES[guideType] || null;
}

module.exports = { getTemplates, listUnsubscribeHeaders, unsubscribeUrl, escapeHtml };
