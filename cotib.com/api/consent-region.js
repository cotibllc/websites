// GET /api/consent-region: tells the cookie banner whether this visitor must
// be asked before Google Analytics loads. Per visitor, so never cached.
const { consentRegion } = require('../lib/consent');

module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }
  const raw = req.headers['x-vercel-ip-country'];
  const region = consentRegion(Array.isArray(raw) ? raw[0] : raw);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.end(req.method === 'HEAD' ? undefined : JSON.stringify({ region }));
};
