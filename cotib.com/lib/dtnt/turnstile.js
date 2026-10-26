// Cloudflare Turnstile check, same call /api/contact makes, plus remoteip and
// a hostname check (setup addendum F6). Tokens are single use, 300 seconds.
const { PRODUCTION_HOSTS } = require('./config');

async function verifyTurnstile(token, { ip, host }) {
  if (!token || typeof token !== 'string' || token.length > 2048) return { ok: false, reason: 'missing' };
  let data;
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip || undefined }),
    });
    data = await r.json();
  } catch {
    return { ok: false, reason: 'unreachable' };
  }
  if (!data || data.success !== true) return { ok: false, reason: 'failed' };
  const allowed = new Set([...PRODUCTION_HOSTS, (host || '').split(':')[0]]);
  if (data.hostname && !allowed.has(String(data.hostname).toLowerCase())) return { ok: false, reason: 'hostname' };
  return { ok: true };
}

module.exports = { verifyTurnstile };
