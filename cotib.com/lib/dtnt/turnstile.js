// Cloudflare Turnstile check, same call /api/contact makes, plus remoteip and
// a hostname check (setup addendum F6). Tokens are single use, 300 seconds.
// Every failure comes back with a reason and, when Cloudflare sent them, its
// error-codes, so the function log says which case it was. The secret and the
// token are never returned or logged.
const { PRODUCTION_HOSTS } = require('./config');

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TIMEOUT_MS = 8000;

// Cloudflare error-codes, grouped by what they mean for us.
// https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
const CONFIG_CODES = ['missing-input-secret', 'invalid-input-secret'];
const EXPIRED_CODES = ['timeout-or-duplicate'];

// reason: 'missing' (no token posted), 'config' (our secret is missing or
// wrong), 'expired' (token used already or older than 300s), 'unreachable'
// (siteverify did not answer), 'hostname' (token from another site),
// 'failed' (anything else Cloudflare refused, e.g. invalid-input-response).
async function verifyTurnstile(token, { ip, host }) {
  if (!token || typeof token !== 'string' || token.length > 2048) return { ok: false, reason: 'missing', errorCodes: [] };
  let data;
  try {
    const r = await fetch(SITEVERIFY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Trimmed: a pasted secret with a trailing newline or space fails as
      // invalid-input-secret.
      body: JSON.stringify({ secret: String(process.env.TURNSTILE_SECRET_KEY || '').trim(), response: token, remoteip: ip || undefined }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    data = await r.json();
  } catch (err) {
    return { ok: false, reason: 'unreachable', errorCodes: [], error: err && err.name };
  }
  const errorCodes = Array.isArray(data && data['error-codes']) ? data['error-codes'].map(String).slice(0, 5) : [];
  const detail = {
    errorCodes,
    hostname: data && data.hostname ? String(data.hostname).slice(0, 253) : undefined,
    action: data && data.action ? String(data.action).slice(0, 64) : undefined,
    challengeAgeSec: data && data.challenge_ts ? Math.round((Date.now() - Date.parse(data.challenge_ts)) / 1000) : undefined,
  };
  if (!data || data.success !== true) {
    const reason = errorCodes.some((c) => CONFIG_CODES.includes(c)) ? 'config'
      : errorCodes.some((c) => EXPIRED_CODES.includes(c)) ? 'expired'
        : 'failed';
    return { ok: false, reason, ...detail };
  }
  const allowed = new Set([...PRODUCTION_HOSTS, (host || '').split(':')[0]]);
  if (detail.hostname && !allowed.has(detail.hostname.toLowerCase())) return { ok: false, reason: 'hostname', ...detail };
  return { ok: true, ...detail };
}

module.exports = { verifyTurnstile };
