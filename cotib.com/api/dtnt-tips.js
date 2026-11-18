// GET /do-the-next-thing/tips (rewritten to /api/dtnt-tips).
// The public archive of past coaching tips. It shows only the tips whose
// publishAt in lib/dtnt/tips.js has passed, so a tip is never visible before
// its dated send. No env vars, no Resend, no cookies: a read-only page.
const { publishedTips } = require('../lib/dtnt/tips');
const { tipsPage } = require('../lib/dtnt/pages');
const http = require('../lib/dtnt/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    return res.end();
  }
  // Short edge cache: a tip appears within about five minutes of its date.
  return http.sendHtml(res, 200, tipsPage({ published: publishedTips(Date.now()) }), {
    'Cache-Control': 'public, max-age=0, s-maxage=300, must-revalidate',
  });
};
