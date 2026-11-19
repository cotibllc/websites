// GET /do-the-next-thing/free/confirm?t=<token> (rewritten to /api/dtnt/confirm).
// Double opt-in step 2: the click proves consent. Adds the contact to the
// DTNT free segment in Resend, records consent on the contact, then starts the
// three-tip series relative to this click: Tip 1 now, Tip 2 on day 3, Tip 3 on
// day 7. Tips 2 and 3 are scheduled at Resend (scheduled_at) right here, and
// their email ids are saved on the contact so unsubscribe.js can cancel them.
// A second click on a link that is still valid just shows the confirmed page
// again and sends nothing.
const { missingEnv } = require('../../lib/dtnt/config');
const { createToken, readToken, hashValue } = require('../../lib/dtnt/tokens');
const resend = require('../../lib/dtnt/resend');
const { tipEmail } = require('../../lib/dtnt/emails');
const { TIPS, sendAtMs } = require('../../lib/dtnt/tips');
const { states } = require('../../lib/dtnt/pages');
const http = require('../../lib/dtnt/http');
const { utmProperties } = require('../../lib/dtnt/utm');

module.exports = async function handler(req, res) {
  const send = (status, html) => http.sendHtml(res, status, html, http.PRIVATE_HEADERS);

  if (req.method !== 'GET' && req.method !== 'HEAD') return send(405, states.confirmExpired());

  const missing = missingEnv('confirm');
  if (missing.length) {
    http.log('dtnt.confirm.misconfigured', { missing });
    return send(503, states.paused());
  }

  const tok = readToken('confirm', http.query(req, 't'));
  if (!tok.ok) return send(400, states.confirmExpired());
  const d = tok.data;
  const email = d.e;
  const emailHash = hashValue('email', email);
  const base = http.baseUrl(req);

  let contact;
  try {
    contact = await resend.contactStatus(email);
  } catch (err) {
    http.log('dtnt.confirm.lookup_failed', { emailHash, error: err.message });
    contact = { status: 'unknown' };
  }

  // Unsubscribed contacts stay unsubscribed unless this link was issued by a
  // fresh signup after the unsubscribe (rs flag, set only by signup.js when
  // it saw the contact as unsubscribed). An older confirm link from before
  // the unsubscribe can't resubscribe anyone.
  if (contact.status === 'unsubscribed') {
    if (!d.rs) {
      http.log('dtnt.confirm.suppressed', { emailHash });
      return send(400, states.confirmExpired());
    }
    try {
      await resend.resubscribeContact(email);
      contact = { ...contact, status: 'resubscribed' };
      http.log('dtnt.confirm.resubscribed', { emailHash });
    } catch (err) {
      http.log('dtnt.confirm.resubscribe_failed', { emailHash, error: err.message });
      return send(502, states.unsubscribeError());
    }
  }

  if (contact.status === 'subscribed') {
    http.log('dtnt.confirm.repeat', { emailHash });
    return send(200, states.confirmed());
  }

  // New confirm: add to the segment. A failure here still delivers the file
  // (Worker addendum 21) and is logged so the list can be fixed by hand.
  try {
    if (contact.status === 'other' || contact.status === 'resubscribed') await resend.addToSegment(contact.id);
    else await resend.createContact(email);
  } catch (err) {
    http.log('dtnt.confirm.contact_failed', { emailHash, error: err.message });
  }

  try {
    await resend.setConsentProperties(email, {
      dtnt_consent_version: String(d.cv || ''),
      dtnt_signed_up_at: String(d.sa || ''),
      dtnt_confirmed_at: new Date().toISOString(),
      dtnt_ip_hash: String(d.ih || ''),
    });
  } catch (err) {
    http.log('dtnt.confirm.consent_properties_failed', { emailHash, error: err.message });
  }
  // Signup source, in its own call: if these three property keys don't exist
  // in Resend yet, only this call fails. Consent is already recorded and the
  // sampler still goes out.
  const utmProps = utmProperties(d);
  try {
    await resend.setContactProperties(email, utmProps);
  } catch (err) {
    http.log('dtnt.confirm.utm_properties_failed', { emailHash, error: err.message });
  }
  // Optional paid-products opt-in, in its own call so a missing property key
  // in Resend can't take the consent record or the signup source down with
  // it. The key dtnt_marketing_opt_in ('true' or 'false') has to be created in
  // Resend (Contacts, Properties) before live use. Until then this call fails,
  // is logged, and the sampler still goes out.
  const marketingOptIn = d.mc === 1;
  try {
    await resend.setContactProperties(email, { dtnt_marketing_opt_in: marketingOptIn ? 'true' : 'false' });
  } catch (err) {
    http.log('dtnt.confirm.marketing_property_failed', { emailHash, error: err.message });
  }
  // Consent record in the function log as well (hashes only, no raw email).
  http.log('dtnt.consent', { emailHash, consentVersion: d.cv, consentTextHash: d.ch, marketingOptIn, marketingConsentTextHash: d.mh, submittedAt: d.sa, confirmedAt: new Date().toISOString(), ipHash: d.ih, uaHash: d.uh, source: 'dtnt-free', ...utmProps });

  // The tip series. Consent gate: only a signup that carried the required
  // tips consent (consent version and text hash on the token, set by signup.js
  // only when the box was ticked) gets any tip.
  if (!d.cv || !d.ch) {
    http.log('dtnt.confirm.no_tips_consent', { emailHash });
    return send(200, states.confirmed());
  }

  const confirmedAtMs = Date.now();
  const tokHash = hashValue('tok', http.query(req, 't'));
  const unsubscribeUrl = `${base}/do-the-next-thing/free/unsubscribe?t=${createToken('unsubscribe', { e: email }, null)}`;
  // Same token, same idempotency key: a double click inside Resend's 24 hour
  // window can't send or schedule a tip twice.
  const tipMessage = (tip) => ({ to: email, ...tipEmail({ tip, unsubscribeUrl }), idempotencyKey: `dtnt-tip${tip.number}-${tokHash}` });

  // Tips 2 and 3 first, then Tip 1, so a reader who clicks unsubscribe in Tip 1
  // the moment it lands already has the scheduled ids saved on the contact.
  // If the ids can't be saved, the unsubscribe handler would have no way to
  // stop them, so they are cancelled again and not delivered (fail closed).
  const scheduled = {};
  try {
    for (const tip of TIPS.filter((t) => t.delayDays > 0)) {
      const sent = await resend.sendEmail({ ...tipMessage(tip), scheduledAt: new Date(sendAtMs(confirmedAtMs, tip)).toISOString() });
      scheduled[tip.number] = sent.id;
    }
    const props = {};
    for (const [n, id] of Object.entries(scheduled)) props[resend.TIP_ID_PROPERTIES[n]] = String(id);
    await resend.setContactProperties(email, props);
    http.log('dtnt.confirm.tips_scheduled', { emailHash, tips: Object.keys(scheduled).map(Number) });
  } catch (err) {
    http.log('dtnt.confirm.tips_schedule_failed', { emailHash, error: err.message, scheduledTips: Object.keys(scheduled).map(Number) });
    for (const id of Object.values(scheduled)) {
      try { await resend.cancelScheduledEmail(id); } catch (e) { http.log('dtnt.confirm.tips_cancel_failed', { emailHash, error: e.message }); }
    }
  }

  try {
    await resend.sendEmail(tipMessage(TIPS[0]));
    http.log('dtnt.confirm.tip1_sent', { emailHash });
  } catch (err) {
    http.log('dtnt.confirm.tip1_failed', { emailHash, error: err.message });
  }

  return send(200, states.confirmed());
};
