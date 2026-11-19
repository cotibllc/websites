// GET /do-the-next-thing/tips (rewritten to /api/dtnt-tips).
// The public page with all three coaching tips. It does not depend on a date:
// the email series is timed per reader (see lib/dtnt/tips.js), and this page
// is the same for everyone. No env vars, no Resend, no cookies: a read-only page.
const { tipsPage } = require('../lib/dtnt/pages');
const http = require('../lib/dtnt/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    return res.end();
  }
  return http.sendHtml(res, 200, tipsPage(), {
    'Cache-Control': 'public, max-age=0, s-maxage=300, must-revalidate',
  });
};
