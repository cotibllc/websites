// Confirm, tip and already-subscribed emails for the free coaching tips. Copy source:
// Do-the-Next-Thing-Free-Tier-Copy-2026-10-07.md, sections 4 and 5, with the
// changes listed in the PR for Chuck's re-approval. Every email carries the
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
<p style="${P}">After you confirm, Tip 1 arrives right away, Tip 2 on day 3 and Tip 3 on day 7. Confirm here to join the list:</p>
<p style="margin:0 0 20px;"><a href="${esc(confirmUrl)}" style="${BTN}">Confirm my email</a></p>
<p style="${P}font-size:13px;color:#475569;">Or paste this link into your browser: <a href="${esc(confirmUrl)}" style="color:#2563eb;word-break:break-all;">${esc(confirmUrl)}</a></p>
<p style="${P}">The link works for 48 hours. If you didn't ask for this, ignore this email. You won't hear from us again.</p>
${footerHtml(unsubscribeUrl, why)}`);
  const text = `Someone (hopefully you) asked for the free Do the Next Thing coaching tips at cotib.com with this address.

After you confirm, Tip 1 arrives right away, Tip 2 on day 3 and Tip 3 on day 7. Confirm here to join the list: ${confirmUrl}

The link works for 48 hours. If you didn't ask for this, ignore this email. You won't hear from us again.${footerText(unsubscribeUrl, why)}`;
  return { subject, html, text, headers: listUnsubscribeHeaders(unsubscribeUrl) };
}

// Tip text is plain text with **bold** spans. Escape first, then add the tags.
function inline(text) {
  return esc(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}
const CODE = 'margin:0 0 16px;padding:12px 14px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;font-family:Menlo,Consolas,monospace;font-size:14px;line-height:1.5;white-space:pre-wrap;';

// One coaching tip, as an email. The tip text is word for word what Chuck
// approved (lib/dtnt/tips.js). The only additions are a short lead-in that says
// which tip this is and when the rest arrive, and the footer. Tip 1 goes out on
// the confirm click and doubles as the welcome; Tips 2 and 3 are scheduled by
// confirm.js for day 3 and day 7 after the click.
// Section 5 of the free-tier copy (welcome email) is replaced by this.
function tipEmail({ tip, unsubscribeUrl }) {
  const lead = {
    1: ["You're on the list. This is Tip 1 of 3.", 'Tip 2 arrives 3 days from now and Tip 3 arrives on day 7.'],
    2: ['Tip 2 of 3.', 'Tip 3 arrives in 4 days.'],
    3: ['Tip 3 of 3, the last one.', ''],
  }[tip.number];
  const why = "You're getting this because you confirmed your signup for the free coaching tips at cotib.com.";
  const body = tip.blocks.map(([kind, t]) => (kind === 'code'
    ? `<pre style="${CODE}">${esc(t)}</pre>`
    : `<p style="${P}">${inline(t)}</p>`)).join('\n');
  const html = shell(`Tip ${tip.number} of 3: ${tip.subject}`, `
<p style="${P}font-size:13px;color:#475569;">${esc(lead[0])}${lead[1] ? ` ${esc(lead[1])}` : ''}</p>
${body}
${footerHtml(unsubscribeUrl, why)}`);
  const text = `${lead[0]}${lead[1] ? ` ${lead[1]}` : ''}

${tip.blocks.map(([, t]) => t.replace(/\*\*/g, '')).join('\n\n')}${footerText(unsubscribeUrl, why)}`;
  return { subject: tip.subject, html, text, headers: listUnsubscribeHeaders(unsubscribeUrl) };
}

// Sent when someone who is already confirmed signs up again (signup.js). It
// carries no tip: re-sending Tip 1 would break the 3 and 7 day timing. It says
// when tips arrive and links the archive.
function welcomeEmail({ tipsUrl, unsubscribeUrl }) {
  const subject = "You're already on the list for the Do the Next Thing coaching tips";
  const why = "You're getting this because you asked for the free coaching tips at cotib.com.";
  const html = shell("You're already on the list. Tips arrive on confirm, day 3 and day 7.", `
<p style="${P}">You're already on the list, so there's nothing more to do.</p>
<p style="${P}">Three tips arrive in order: Tip 1 when you confirm, Tip 2 on day 3 and Tip 3 on day 7. Each tip names a stall you probably know, gives one technique and a line to paste into your AI chat, and ends with one small thing to do today.</p>
<p style="${P}">The titles of the three tips are here:</p>
<p style="margin:0 0 20px;"><a href="${esc(tipsUrl)}" style="${BTN}">See the three tip titles</a></p>
<p style="${P}font-size:13px;color:#475569;">Or paste this link into your browser: <a href="${esc(tipsUrl)}" style="color:#2563eb;word-break:break-all;">${esc(tipsUrl)}</a></p>
<p style="margin:0;">COTIB LLC</p>
${footerHtml(unsubscribeUrl, why)}`);
  const text = `You're already on the list, so there's nothing more to do.

Three tips arrive in order: Tip 1 when you confirm, Tip 2 on day 3 and Tip 3 on day 7. Each tip names a stall you probably know, gives one technique and a line to paste into your AI chat, and ends with one small thing to do today.

The titles of the three tips are here: ${tipsUrl}

COTIB LLC${footerText(unsubscribeUrl, why)}`;
  return { subject, html, text, headers: listUnsubscribeHeaders(unsubscribeUrl) };
}

module.exports = { confirmEmail, tipEmail, welcomeEmail, listUnsubscribeHeaders, esc };
