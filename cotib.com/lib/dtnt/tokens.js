// Stateless tokens for the free sampler: confirm, download and unsubscribe.
// Same idea as the Earned Escape unsubscribe token (PR #16): the token carries
// its own data and a server-side key proves it is ours. Here the payload is
// also encrypted (AES-256-GCM), so the email address never shows in a URL,
// a browser history entry or a request log. GCM's auth tag is the signature:
// any change to the token makes it fail.
//
// Format: "d1." + base64url(iv[12] | ciphertext | tag[16])
// Each purpose gets its own key derived from DTNT_TOKEN_SECRET, so a download
// token can never be used as an unsubscribe token or the other way round.
const crypto = require('crypto');

const PREFIX = 'd1.';
const PURPOSES = ['confirm', 'download', 'unsubscribe'];
const MAX_TOKEN_LENGTH = 1500;

function secret() {
  const s = process.env.DTNT_TOKEN_SECRET;
  if (!s || s.length < 32) throw new Error('DTNT_TOKEN_SECRET is missing or too short');
  return s;
}

function keyFor(purpose) {
  if (!PURPOSES.includes(purpose)) throw new Error(`Unknown token purpose: ${purpose}`);
  return Buffer.from(crypto.hkdfSync('sha256', secret(), Buffer.from('cotib-dtnt-free'), Buffer.from(`token:${purpose}`), 32));
}

const now = () => Math.floor(Date.now() / 1000);

// ttlSeconds = null means the token never expires (unsubscribe links must keep
// working long after the email was sent).
function createToken(purpose, data, ttlSeconds) {
  const iat = now();
  const payload = { ...data, p: purpose, iat };
  if (ttlSeconds) payload.exp = iat + ttlSeconds;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyFor(purpose), iv);
  cipher.setAAD(Buffer.from(purpose));
  const ct = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()]);
  return PREFIX + Buffer.concat([iv, ct, cipher.getAuthTag()]).toString('base64url');
}

// Returns { ok: true, data } or { ok: false, reason: 'invalid' | 'expired' }.
function readToken(purpose, token) {
  if (typeof token !== 'string' || !token.startsWith(PREFIX) || token.length > MAX_TOKEN_LENGTH) {
    return { ok: false, reason: 'invalid' };
  }
  try {
    const raw = Buffer.from(token.slice(PREFIX.length), 'base64url');
    if (raw.length < 12 + 16 + 2) return { ok: false, reason: 'invalid' };
    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(raw.length - 16);
    const ct = raw.subarray(12, raw.length - 16);
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyFor(purpose), iv);
    decipher.setAAD(Buffer.from(purpose));
    decipher.setAuthTag(tag);
    const data = JSON.parse(Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8'));
    if (data.p !== purpose) return { ok: false, reason: 'invalid' };
    if (data.exp && now() > data.exp) return { ok: false, reason: 'expired', data };
    return { ok: true, data };
  } catch {
    return { ok: false, reason: 'invalid' };
  }
}

// One-way code for an IP address or user agent (never stored raw).
function hashValue(kind, value) {
  if (!value) return '';
  return crypto.createHmac('sha256', secret()).update(`${kind}:${value}`).digest('hex').slice(0, 32);
}

module.exports = { createToken, readToken, hashValue, PURPOSES };
