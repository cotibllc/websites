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

async function sendEmail({ to, subject, html, text, headers, idempotencyKey }) {
  const r = await call('RESEND_API_KEY', 'POST', '/emails', {
    from: require('./config').FROM_EMAIL,
    to: [to],
    reply_to: require('./config').REPLY_TO,
    subject,
    html,
    text,
    headers,
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

module.exports = { sendEmail, contactStatus, createContact, addToSegment, setConsentProperties, unsubscribeContact };
