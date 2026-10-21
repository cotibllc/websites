// GET /do-the-next-thing/free/confirm?t=<token> (rewritten to /api/dtnt/confirm).
// Double opt-in step 2: the click proves consent. Adds the contact to the
// DTNT free segment in Resend, records consent on the contact, sends the
// delivery email and shows the download button. A second click on a link
// that is still valid just shows the download again and sends nothing.
const { DOWNLOAD_TTL_SECONDS, missingEnv } = require('../../lib/dtnt/config');
const { createToken, readToken, hashValue } = require('../../lib/dtnt/tokens');
const resend = require('../../lib/dtnt/resend');
const { deliveryEmail } = require('../../lib/dtnt/emails');
const { states } = require('../../lib/dtnt/pages');
const http = require('../../lib/dtnt/http');

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

  // Unsubscribed after asking: honor the unsubscribe, send nothing.
  if (contact.status === 'unsubscribed') {
    http.log('dtnt.confirm.suppressed', { emailHash });
    return send(400, states.confirmExpired());
  }

  const dl = createToken('download', { eh: emailHash }, DOWNLOAD_TTL_SECONDS);
  const downloadPath = `/do-the-next-thing/free/dl/${dl}`;

  if (contact.status === 'subscribed') {
    http.log('dtnt.confirm.repeat', { emailHash });
    return send(200, states.confirmed({ downloadPath }));
  }

  // New confirm: add to the segment. A failure here still delivers the file
  // (Worker addendum 21) and is logged so the list can be fixed by hand.
  try {
    if (contact.status === 'other') await resend.addToSegment(contact.id);
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
  // Consent record in the function log as well (hashes only, no raw email).
  http.log('dtnt.consent', { emailHash, consentVersion: d.cv, consentTextHash: d.ch, submittedAt: d.sa, confirmedAt: new Date().toISOString(), ipHash: d.ih, uaHash: d.uh, source: 'dtnt-free' });

  try {
    const unsubscribeUrl = `${base}/do-the-next-thing/free/unsubscribe?t=${createToken('unsubscribe', { e: email }, null)}`;
    const msg = deliveryEmail({ downloadUrl: base + downloadPath, unsubscribeUrl, pageUrl: `${base}/do-the-next-thing` });
    // Same token, same idempotency key: a double click inside Resend's
    // 24 hour window can't send the delivery email twice.
    await resend.sendEmail({ to: email, ...msg, idempotencyKey: `dtnt-delivery-${hashValue('tok', http.query(req, 't'))}` });
    http.log('dtnt.confirm.delivery_sent', { emailHash });
  } catch (err) {
    http.log('dtnt.confirm.delivery_failed', { emailHash, error: err.message });
  }

  return send(200, states.confirmed({ downloadPath }));
};
