// Confirm and delivery emails for the free sampler. Copy source:
// Do-the-Next-Thing-Free-Tier-Copy-2026-10-07.md, sections 4 and 5, with the
// changes listed in the PR for Chuck's re-approval. Both emails carry the
// CAN-SPAM footer: who we are, the postal address and a working unsubscribe
// link, plus List-Unsubscribe headers for one-click unsubscribe (RFC 8058).
const { POSTAL_ADDRESS } = require('./config');

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const P = 'margin:0 0 16px;';
const BTN = 'display:inline-block;padding:12px 22px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;';
const MUTED = 'font-size:12px;line-height:1.6;color:#64748b;margin:0 0 4px;';

function shell(preheader, inner) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;">
<span style="display:none !important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;max-height:0;max-width:0;overflow:hidden;mso-hide:all;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;">
<tr><td style="padding:28px 28px 8px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#0f172a;">
${inner}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function footerHtml(unsubscribeUrl, why) {
  return `<hr style="margin:28px 0 16px;border:none;border-top:1px solid #e2e8f0;">
<p style="${MUTED}">${esc(POSTAL_ADDRESS)}</p>
<p style="${MUTED}">${esc(why)} <a href="${esc(unsubscribeUrl)}" style="color:#475569;text-decoration:underline;">Unsubscribe</a></p>
<p style="${MUTED};margin-bottom:20px;">a COTIB LLC product</p>`;
}

function footerText(unsubscribeUrl, why) {
  return `\n\n--\n${POSTAL_ADDRESS}\n${why} Unsubscribe: ${unsubscribeUrl}\na COTIB LLC product\n`;
}

function listUnsubscribeHeaders(unsubscribeUrl) {
  return {
    'List-Unsubscribe': `<${unsubscribeUrl}>, <mailto:customerservice@cotib.com?subject=Unsubscribe>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
}

// Section 4: confirm email (transactional, no offer).
function confirmEmail({ confirmUrl, unsubscribeUrl }) {
  const subject = 'Confirm your email for the free Do the Next Thing coaching tips';
  const why = "You're getting this because someone entered this address at cotib.com.";
  const html = shell('Confirm here to join the list.', `
<p style="${P}">Someone (hopefully you) asked for the free Do the Next Thing coaching tips at cotib.com with this address.</p>
<p style="${P}">Confirm here to join the list:</p>
<p style="margin:0 0 20px;"><a href="${esc(confirmUrl)}" style="${BTN}">Confirm my email</a></p>
<p style="${P}font-size:13px;color:#475569;">Or paste this link into your browser: <a href="${esc(confirmUrl)}" style="color:#2563eb;word-break:break-all;">${esc(confirmUrl)}</a></p>
<p style="${P}">The link works for 48 hours. If you didn't ask for this, ignore this email. You won't hear from us again.</p>
${footerHtml(unsubscribeUrl, why)}`);
  const text = `Someone (hopefully you) asked for the free Do the Next Thing coaching tips at cotib.com with this address.

Confirm here to join the list: ${confirmUrl}

The link works for 48 hours. If you didn't ask for this, ignore this email. You won't hear from us again.${footerText(unsubscribeUrl, why)}`;
  return { subject, html, text, headers: listUnsubscribeHeaders(unsubscribeUrl) };
}

// Section 5: welcome email, sent right after the confirm click (transactional,
// no offer: the paid-products opt-in is optional, so this email can't carry one).
// It makes no promise of a date. The tips go out on dated sends that Chuck
// approves one at a time, and past tips are on the archive page.
function welcomeEmail({ tipsUrl, unsubscribeUrl }) {
  const subject = "You're on the list for the Do the Next Thing coaching tips";
  const why = "You're getting this because you asked for the free coaching tips at cotib.com.";
  const html = shell("You're on the list. Your first tip arrives with the next dated send.", `
<p style="${P}">You're on the list.</p>
<p style="${P}">Your first tip arrives with the next dated send. Each tip names a stall you probably know, gives one technique and a prompt to paste into your AI chat, and ends with one small thing to do today.</p>
<p style="${P}">To catch up on tips that have already gone out, they're all here:</p>
<p style="margin:0 0 20px;"><a href="${esc(tipsUrl)}" style="${BTN}">Read the tips so far</a></p>
<p style="${P}font-size:13px;color:#475569;">Or paste this link into your browser: <a href="${esc(tipsUrl)}" style="color:#2563eb;word-break:break-all;">${esc(tipsUrl)}</a></p>
<p style="margin:0;">COTIB LLC</p>
${footerHtml(unsubscribeUrl, why)}`);
  const text = `You're on the list.

Your first tip arrives with the next dated send. Each tip names a stall you probably know, gives one technique and a prompt to paste into your AI chat, and ends with one small thing to do today.

To catch up on tips that have already gone out, they're all here: ${tipsUrl}

COTIB LLC${footerText(unsubscribeUrl, why)}`;
  return { subject, html, text, headers: listUnsubscribeHeaders(unsubscribeUrl) };
}

module.exports = { confirmEmail, welcomeEmail, listUnsubscribeHeaders, esc };
