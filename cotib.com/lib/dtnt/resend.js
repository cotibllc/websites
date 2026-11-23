// Resend REST calls for the free sampler.
// Sends use RESEND_API_KEY (the sending key /api/contact already uses).
// Contacts use RESEND_FULL_API_KEY, because contacts need a full-access key.
// Plain fetch keeps this independent of the SDK version in package.json.
const API = 'https://api.resend.com';

async function call(keyName, method, path, payload, extraHeaders = {}) {
  const res = await fetch(API + path, {
    method,
    headers: {
      Authorization: `Bearer ${process.env[keyName]}`,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { data = null; }
  return { ok: res.ok, status: res.status, data };
}

// scheduledAt (ISO 8601 string) holds the email at Resend until then. Resend
// accepts up to 30 days ahead; the tip series needs 7. Returns Resend's
// response, whose id is what cancelEmail needs later.
async function sendEmail({ to, subject, html, text, headers, idempotencyKey, scheduledAt }) {
  const r = await call('RESEND_API_KEY', 'POST', '/emails', {
    from: require('./config').FROM_EMAIL,
    to: [to],
    reply_to: require('./config').REPLY_TO,
    subject,
    html,
    text,
    headers,
    ...(scheduledAt ? { scheduled_at: scheduledAt } : {}),
  }, idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {});
  if (!r.ok) throw new Error(`Resend send failed (${r.status})`);
  return r.data;
}

// Returns 'none' | 'unsubscribed' | 'subscribed' | 'other' (contact exists,
// not unsubscribed, but not in the DTNT segment), plus the contact id.
async function contactStatus(email) {
  const r = await call('RESEND_FULL_API_KEY', 'GET', `/contacts/${encodeURIComponent(email)}`);
  if (r.status === 404) return { status: 'none' };
  if (!r.ok || !r.data) throw new Error(`Resend contact lookup failed (${r.status})`);
  const id = r.data.id;
  if (r.data.unsubscribed) return { status: 'unsubscribed', id };
  const s = await call('RESEND_FULL_API_KEY', 'GET', `/contacts/${encodeURIComponent(id)}/segments`);
  if (!s.ok) throw new Error(`Resend segment lookup failed (${s.status})`);
  const inSegment = (s.data?.data || []).some((seg) => seg.id === process.env.DTNT_FREE_SEGMENT_ID);
  return { status: inSegment ? 'subscribed' : 'other', id };
}

async function createContact(email) {
  const r = await call('RESEND_FULL_API_KEY', 'POST', '/contacts', {
    email,
    unsubscribed: false,
    segments: [{ id: process.env.DTNT_FREE_SEGMENT_ID }],
  });
  if (!r.ok) throw new Error(`Resend contact create failed (${r.status})`);
  return r.data;
}

async function addToSegment(contactId) {
  const r = await call('RESEND_FULL_API_KEY', 'POST',
    `/contacts/${encodeURIComponent(contactId)}/segments/${encodeURIComponent(process.env.DTNT_FREE_SEGMENT_ID)}`);
  if (!r.ok) throw new Error(`Resend add to segment failed (${r.status})`);
  return r.data;
}

// Consent record on the contact. These property keys have to exist in Resend
// first (Contacts, Properties). If they don't, Resend rejects the call; the
// caller logs it and carries on, so the sampler still goes out.
async function setConsentProperties(email, props) {
  const r = await call('RESEND_FULL_API_KEY', 'PATCH', `/contacts/${encodeURIComponent(email)}`, { properties: props });
  if (!r.ok) throw new Error(`Resend consent properties failed (${r.status})`);
  return r.data;
}

// Other contact properties (the signup source). Same rule: the keys must
// exist in Resend, and the caller treats a failure as non-fatal.
async function setContactProperties(email, props) {
  const r = await call('RESEND_FULL_API_KEY', 'PATCH', `/contacts/${encodeURIComponent(email)}`, { properties: props });
  if (!r.ok) throw new Error(`Resend contact properties failed (${r.status})`);
  return r.data;
}

// Only called from confirm, after a fresh double opt-in click on a link that
// was issued after the address unsubscribed. Contacts are never deleted.
async function resubscribeContact(email) {
  const r = await call('RESEND_FULL_API_KEY', 'PATCH', `/contacts/${encodeURIComponent(email)}`, { unsubscribed: false });
  if (!r.ok) throw new Error(`Resend resubscribe failed (${r.status})`);
  return r.data;
}

async function unsubscribeContact(email) {
  const r = await call('RESEND_FULL_API_KEY', 'PATCH', `/contacts/${encodeURIComponent(email)}`, { unsubscribed: true });
  if (r.status === 404) {
    // Never confirmed: create the contact as unsubscribed so later signups
    // from this address are suppressed.
    const c = await call('RESEND_FULL_API_KEY', 'POST', '/contacts', { email, unsubscribed: true });
    if (!c.ok) throw new Error(`Resend suppress create failed (${c.status})`);
    return c.data;
  }
  if (!r.ok) throw new Error(`Resend unsubscribe failed (${r.status})`);
  return r.data;
}

// Scheduled tips (Tips 2 and 3 and the bonus tip, number 4). Resend does not stop a scheduled email when a contact
// unsubscribes (unsubscribes only affect Broadcasts), so confirm.js saves each
// scheduled email id on the contact and the unsubscribe handler cancels them.
// Property keys, created by Chuck in Resend (Contacts, Properties, type string):
const TIP_ID_PROPERTIES = { 2: 'dtnt_tip2_email_id', 3: 'dtnt_tip3_email_id', 4: 'dtnt_tip4_email_id' };

// Last events after which an email can no longer be cancelled. Anything else
// (scheduled, queued, unknown) gets a cancel attempt.
const NOT_CANCELLABLE = new Set(['sent', 'delivered', 'delivery_delayed', 'opened', 'clicked', 'bounced', 'complained', 'failed', 'suppressed', 'canceled']);

// Cancel one scheduled email. Returns 'cancelled' or 'skipped' (already sent
// or already cancelled). Throws on anything unexpected, so the caller can
// tell the person it did not finish.
async function cancelScheduledEmail(emailId) {
  const got = await call('RESEND_FULL_API_KEY', 'GET', `/emails/${encodeURIComponent(emailId)}`);
  if (got.status === 404) return 'skipped';
  if (!got.ok || !got.data) throw new Error(`Resend email lookup failed (${got.status})`);
  if (NOT_CANCELLABLE.has(got.data.last_event)) return 'skipped';
  const r = await call('RESEND_FULL_API_KEY', 'POST', `/emails/${encodeURIComponent(emailId)}/cancel`);
  if (!r.ok) throw new Error(`Resend cancel failed (${r.status})`);
  return 'cancelled';
}

// Cancel the scheduled tips saved on a contact. Safe to repeat. A contact that
// does not exist, or has no saved ids, has nothing to cancel.
async function cancelScheduledTips(email) {
  const r = await call('RESEND_FULL_API_KEY', 'GET', `/contacts/${encodeURIComponent(email)}`);
  if (r.status === 404) return { cancelled: 0, skipped: 0 };
  if (!r.ok || !r.data) throw new Error(`Resend contact lookup failed (${r.status})`);
  const props = r.data.properties || {};
  const result = { cancelled: 0, skipped: 0 };
  for (const key of Object.values(TIP_ID_PROPERTIES)) {
    const raw = props[key];
    const id = raw && typeof raw === 'object' ? raw.value : raw;
    if (!id || typeof id !== 'string') continue;
    result[await cancelScheduledEmail(id) === 'cancelled' ? 'cancelled' : 'skipped'] += 1;
  }
  return result;
}

module.exports = {
  TIP_ID_PROPERTIES,
  cancelScheduledEmail,
  cancelScheduledTips,
  sendEmail,
  contactStatus,
  createContact,
  addToSegment,
  setConsentProperties,
  setContactProperties,
  resubscribeContact,
  unsubscribeContact,
};
