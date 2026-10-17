// Signed, stateless unsubscribe tokens: base64url(JSON payload) + "." + HMAC.
// The payload carries the lead email, guide type and any scheduled Resend
// email IDs known when the email was built, so unsubscribe can cancel them
// even when no lead store is available (for example on Vercel).
const crypto = require('crypto');

function getSecret() {
  if (process.env.UNSUBSCRIBE_SECRET) return process.env.UNSUBSCRIBE_SECRET;
  if (process.env.RESEND_API_KEY) {
    // Fallback so links still work before UNSUBSCRIBE_SECRET is set: derive a
    // separate key from the Resend key (the API key itself is never exposed).
    return crypto.createHash('sha256').update('ee-unsubscribe:' + process.env.RESEND_API_KEY).digest('hex');
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('UNSUBSCRIBE_SECRET (or RESEND_API_KEY) must be set in production');
  }
  return 'dev-only-unsubscribe-secret';
}

const b64url = (buf) => Buffer.from(buf).toString('base64url');

function sign(data) {
  return crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
}

function createToken({ email, guideType, scheduledIds = [] }) {
  const payload = b64url(JSON.stringify({
    e: String(email).trim().toLowerCase(),
    g: guideType,
    s: scheduledIds.filter(Boolean),
    t: Math.floor(Date.now() / 1000),
  }));
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string' || token.length > 2000) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.e) return null;
    return { email: data.e, guideType: data.g, scheduledIds: Array.isArray(data.s) ? data.s : [], issuedAt: data.t };
  } catch {
    return null;
  }
}

module.exports = { createToken, verifyToken };
