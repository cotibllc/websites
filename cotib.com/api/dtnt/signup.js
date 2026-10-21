// POST /do-the-next-thing/free (rewritten to /api/dtnt/signup).
// Free sampler signup with double opt-in. Checks run in the order of the
// Worker addendum section 14.1, minus the KV pieces (no KV on Vercel):
// origin, rate limit, email, consent box, Turnstile, then the Resend contact
// state stands in for the suppression list.
// The reply is the same for new, pending, confirmed and unsubscribed emails,
// so nobody can tell whether an address is already on the list.
const { CONSENT_VERSION, CONSENT_TEXT_HASH, CONFIRM_TTL_SECONDS, DOWNLOAD_TTL_SECONDS, PRODUCTION_HOSTS, missingEnv } = require('../../lib/dtnt/config');
const { createToken, hashValue } = require('../../lib/dtnt/tokens');
const { verifyTurnstile } = require('../../lib/dtnt/turnstile');
const resend = require('../../lib/dtnt/resend');
const { confirmEmail, deliveryEmail } = require('../../lib/dtnt/emails');
const { states } = require('../../lib/dtnt/pages');
const http = require('../../lib/dtnt/http');

const MSG = {
  ok: "Check your email. We sent a confirm link to the address you entered. Click it within 48 hours to get your 3 prompts. Not there in a few minutes? Check spam or promotions.",
  email: "That email address doesn't look right. Check it and try again.",
  consent: 'Check the box so we can email you the sampler.',
  turnstile: "We couldn't confirm you're human. Refresh the page and try again.",
  rate: 'Too many tries from here. Wait a minute and try again.',
  send: "We couldn't send the email just now. Wait a minute and try again.",
  paused: "The free sampler isn't available right now. Try again later, or email customerservice@cotib.com.",
};

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

function validEmail(e) {
  return typeof e === 'string' && e.length <= 254 && EMAIL_RE.test(e);
}

function originAllowed(req) {
  const origin = http.header(req, 'origin');
  if (!origin) return false;
  let host;
  try { host = new URL(origin).host.toLowerCase(); } catch { return false; }
  return host === http.requestHost(req) || PRODUCTION_HOSTS.includes(host);
}

module.exports = async function handler(req, res) {
  const json = http.wantsJson(req);
  const reply = (status, key, extra = {}) => {
    if (json) return http.sendJson(res, status, key === 'ok' ? { ok: true, message: MSG.ok } : { error: MSG[key], code: key }, { ...http.PRIVATE_HEADERS, ...extra });
    const html = key === 'ok' ? states.checkEmail() : key === 'paused' ? states.paused() : states.formError({ message: MSG[key] });
    return http.sendHtml(res, status, html, { ...http.PRIVATE_HEADERS, ...extra });
  };

  if (req.method !== 'POST') {
    res.statusCode = 303;
    res.setHeader('Location', '/do-the-next-thing#free');
    return res.end();
  }

  const missing = missingEnv('signup');
  if (missing.length) {
    http.log('dtnt.signup.misconfigured', { missing });
    return reply(503, 'paused');
  }

  if (!originAllowed(req)) {
    http.log('dtnt.signup.bad_origin');
    return reply(403, 'turnstile');
  }

  const ip = http.clientIp(req);
  const ipHash = hashValue('ip', ip);
  if (http.rateLimited(ipHash)) return reply(429, 'rate', { 'Retry-After': '60' });

  const b = http.body(req);

  // Honeypot from the contact form: pretend success so bots learn nothing.
  if (b.website && String(b.website).trim()) return reply(200, 'ok');

  const email = String(b.email || '').trim().toLowerCase();
  if (!validEmail(email)) return reply(400, 'email');

  const consent = b.consent === true || b.consent === 'on' || b.consent === 'true';
  if (!consent) return reply(400, 'consent');

  const turnstileToken = b.turnstileToken || b['cf-turnstile-response'];
  const ts = await verifyTurnstile(turnstileToken, { ip, host: http.requestHost(req) });
  if (!ts.ok) {
    http.log('dtnt.signup.turnstile_failed', { reason: ts.reason });
    return reply(400, 'turnstile');
  }

  const base = http.baseUrl(req);
  const emailHash = hashValue('email', email);
  const unsubscribeUrl = `${base}/do-the-next-thing/free/unsubscribe?t=${createToken('unsubscribe', { e: email }, null)}`;

  // The Resend contact is the list of record: unsubscribed contacts get
  // nothing, confirmed ones get a fresh delivery email (Worker addendum 21),
  // everyone else gets a confirm link. If the lookup fails we fall back to a
  // confirm email, which is transactional and needs a click to do anything.
  let status = 'none';
  try {
    status = (await resend.contactStatus(email)).status;
  } catch (err) {
    http.log('dtnt.signup.lookup_failed', { emailHash, error: err.message });
  }

  try {
    if (status === 'unsubscribed') {
      http.log('dtnt.signup.suppressed', { emailHash });
    } else if (status === 'subscribed') {
      const dl = createToken('download', { eh: emailHash }, DOWNLOAD_TTL_SECONDS);
      const msg = deliveryEmail({ downloadUrl: `${base}/do-the-next-thing/free/dl/${dl}`, unsubscribeUrl, pageUrl: `${base}/do-the-next-thing` });
      await resend.sendEmail({ to: email, ...msg });
      http.log('dtnt.signup.resent_delivery', { emailHash });
    } else {
      const t = createToken('confirm', {
        e: email,
        cv: CONSENT_VERSION,
        ch: CONSENT_TEXT_HASH,
        sa: new Date().toISOString(),
        ih: ipHash,
        uh: hashValue('ua', http.header(req, 'user-agent')),
      }, CONFIRM_TTL_SECONDS);
      const msg = confirmEmail({ confirmUrl: `${base}/do-the-next-thing/free/confirm?t=${t}`, unsubscribeUrl });
      await resend.sendEmail({ to: email, ...msg });
      http.log('dtnt.signup.confirm_sent', { emailHash });
    }
  } catch (err) {
    http.log('dtnt.signup.send_failed', { emailHash, error: err.message });
    return reply(502, 'send');
  }

  return reply(200, 'ok');
};

module.exports.MSG = MSG;
