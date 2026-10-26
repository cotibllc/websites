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
  const subject = 'Confirm your email for the free Do the Next Thing prompts';
  const why = "You're getting this because someone entered this address at cotib.com.";
  const html = shell('Confirm here to get your 3 free prompts.', `
<p style="${P}">Someone (hopefully you) asked for the free Do the Next Thing sampler at cotib.com with this address.</p>
<p style="${P}">Confirm here to get it:</p>
<p style="margin:0 0 20px;"><a href="${esc(confirmUrl)}" style="${BTN}">Confirm my email</a></p>
<p style="${P}font-size:13px;color:#475569;">Or paste this link into your browser: <a href="${esc(confirmUrl)}" style="color:#2563eb;word-break:break-all;">${esc(confirmUrl)}</a></p>
<p style="${P}">The link works for 48 hours. If you didn't ask for this, ignore this email. You won't hear from us again.</p>
${footerHtml(unsubscribeUrl, why)}`);
  const text = `Someone (hopefully you) asked for the free Do the Next Thing sampler at cotib.com with this address.

Confirm here to get it: ${confirmUrl}

The link works for 48 hours. If you didn't ask for this, ignore this email. You won't hear from us again.${footerText(unsubscribeUrl, why)}`;
  return { subject, html, text, headers: listUnsubscribeHeaders(unsubscribeUrl) };
}

// Section 5: delivery email (transactional, offer only at the end).
function deliveryEmail({ downloadUrl, unsubscribeUrl, pageUrl }) {
  const subject = 'Your 3 free Do the Next Thing prompts';
  const why = "You're getting this because you asked for the free sampler at cotib.com.";
  const html = shell('Your 3 free prompts are here. The link works for 30 days.', `
<p style="${P}">Here are your 3 free prompts:</p>
<p style="margin:0 0 20px;"><a href="${esc(downloadUrl)}" style="${BTN}">Download the free sampler</a></p>
<p style="${P}font-size:13px;color:#475569;">Or paste this link into your browser: <a href="${esc(downloadUrl)}" style="color:#2563eb;word-break:break-all;">${esc(downloadUrl)}</a></p>
<p style="${P}">The link works for 30 days.</p>
<p style="${P}">Start with whichever one matches today. Paste it into any AI chat app, fill in the [brackets], and start a 10-minute timer. If the answer comes back too big, reply: "Too big. Smaller. One move, under 10 minutes, no research."</p>
<p style="${P}">If they help, the full Pack has all 28 prompts for $24. It's coming soon: <a href="${esc(pageUrl)}" style="color:#2563eb;">cotib.com/do-the-next-thing</a></p>
<p style="margin:0;">COTIB LLC</p>
${footerHtml(unsubscribeUrl, why)}`);
  const text = `Here are your 3 free prompts: ${downloadUrl}

The link works for 30 days.

Start with whichever one matches today. Paste it into any AI chat app, fill in the [brackets], and start a 10-minute timer. If the answer comes back too big, reply: "Too big. Smaller. One move, under 10 minutes, no research."

If they help, the full Pack has all 28 prompts for $24. It's coming soon: cotib.com/do-the-next-thing

COTIB LLC${footerText(unsubscribeUrl, why)}`;
  return { subject, html, text, headers: listUnsubscribeHeaders(unsubscribeUrl) };
}

module.exports = { confirmEmail, deliveryEmail, listUnsubscribeHeaders, esc };
