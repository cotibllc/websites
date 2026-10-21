// Small request helpers shared by the /api/dtnt handlers.

function header(req, name) {
  const v = req.headers?.[name.toLowerCase()];
  return Array.isArray(v) ? v[0] : v || '';
}

function requestHost(req) {
  return (header(req, 'x-forwarded-host') || header(req, 'host')).split(',')[0].trim().toLowerCase();
}

// Links in emails point back at the host that served the request, so preview
// deployments send preview links and production sends www.cotib.com links.
function baseUrl(req) {
  const host = requestHost(req);
  const local = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
  const proto = local ? (header(req, 'x-forwarded-proto') || 'http') : 'https';
  return `${proto}://${host}`;
}

function clientIp(req) {
  return (header(req, 'x-forwarded-for') || header(req, 'x-real-ip') || req.socket?.remoteAddress || '')
    .split(',')[0].trim();
}

function wantsJson(req) {
  return /application\/json/i.test(header(req, 'accept')) || /application\/json/i.test(header(req, 'content-type'));
}

// Vercel's Node runtime parses JSON and urlencoded bodies into req.body.
// This also accepts a raw string, for safety.
function body(req) {
  const b = req.body;
  if (!b) return {};
  if (typeof b === 'string') {
    try { return JSON.parse(b); } catch { return Object.fromEntries(new URLSearchParams(b)); }
  }
  return b;
}

function query(req, key) {
  if (req.query && req.query[key] !== undefined) {
    const v = req.query[key];
    return Array.isArray(v) ? v[0] : v;
  }
  try { return new URL(req.url, 'http://x').searchParams.get(key) || ''; } catch { return ''; }
}

function sendHtml(res, status, html, extraHeaders = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  for (const [k, v] of Object.entries(extraHeaders)) res.setHeader(k, v);
  res.end(html);
}

function sendJson(res, status, obj, extraHeaders = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  for (const [k, v] of Object.entries(extraHeaders)) res.setHeader(k, v);
  res.end(JSON.stringify(obj));
}

// Every response that carries a token or an email address.
const PRIVATE_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
};

// Best effort, per function instance: stops a burst from one address.
// Turnstile is the real gate (Worker addendum section 15 said the same).
const hits = new Map();
function rateLimited(key, limit = 10, windowMs = 60_000) {
  const t = Date.now();
  const list = (hits.get(key) || []).filter((x) => t - x < windowMs);
  list.push(t);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return list.length > limit;
}

// Log lines never carry a raw email or IP address.
function log(event, fields = {}) {
  console.log(JSON.stringify({ at: new Date().toISOString(), event, ...fields }));
}

module.exports = { header, requestHost, baseUrl, clientIp, wantsJson, body, query, sendHtml, sendJson, PRIVATE_HEADERS, rateLimited, log };
