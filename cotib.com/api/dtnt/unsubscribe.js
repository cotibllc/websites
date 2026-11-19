// /do-the-next-thing/free/unsubscribe?t=<token> (rewritten to /api/dtnt/unsubscribe).
// Same pattern as Earned Escape PR #16: GET shows a confirm button, so mail
// scanners that open links can't unsubscribe anyone; POST does the work.
// POST also serves RFC 8058 one-click requests (List-Unsubscribe-Post).
// The token never expires, so the link keeps working well past CAN-SPAM's
// 30 days, and it takes effect right away.
// Tips 2 and 3 are scheduled at Resend when someone confirms, and Resend does
// not hold back a scheduled email because a contact unsubscribed. So after the
// contact is flagged, this handler cancels any of those emails that have not
// gone out yet. If that cancel fails the person gets the error page (and a
// one-click request gets a 502) so the unsubscribe is retried; both steps are
// safe to repeat.
const { missingEnv } = require('../../lib/dtnt/config');
const { readToken, hashValue } = require('../../lib/dtnt/tokens');
const resend = require('../../lib/dtnt/resend');
const { states } = require('../../lib/dtnt/pages');
const http = require('../../lib/dtnt/http');

module.exports = async function handler(req, res) {
  const send = (status, html) => http.sendHtml(res, status, html, http.PRIVATE_HEADERS);
  const b = req.method === 'POST' ? http.body(req) : {};
  const token = b.t || http.query(req, 't');
  const oneClick = b['List-Unsubscribe'] === 'One-Click';

  const missing = missingEnv('unsubscribe');
  if (missing.length) {
    http.log('dtnt.unsubscribe.misconfigured', { missing });
    return send(503, states.paused());
  }

  const tok = readToken('unsubscribe', token);

  if (req.method === 'GET' || req.method === 'HEAD') {
    if (!tok.ok) return send(400, states.unsubscribeInvalid());
    return send(200, states.unsubscribeAsk({ email: tok.data.e, token }));
  }

  if (req.method !== 'POST') return send(405, states.unsubscribeInvalid());

  if (!tok.ok) {
    if (oneClick) { res.statusCode = 400; return res.end(); }
    return send(400, states.unsubscribeInvalid());
  }

  const email = tok.data.e;
  const emailHash = hashValue('email', email);
  try {
    await resend.unsubscribeContact(email);
    http.log('dtnt.unsubscribe', { emailHash });
    const stopped = await resend.cancelScheduledTips(email);
    http.log('dtnt.unsubscribe.tips_cancelled', { emailHash, ...stopped });
  } catch (err) {
    http.log('dtnt.unsubscribe.failed', { emailHash, error: err.message });
    if (oneClick) { res.statusCode = 502; return res.end(); }
    return send(502, states.unsubscribeError());
  }

  if (oneClick) {
    res.statusCode = 200;
    for (const [k, v] of Object.entries(http.PRIVATE_HEADERS)) res.setHeader(k, v);
    return res.end();
  }
  return send(200, states.unsubscribed({ email }));
};
