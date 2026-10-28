// Local stand-in for Vercel, for tests and screenshots only (never deployed).
// Serves www/ with cleanUrls, applies the rewrites and headers from
// vercel.json, and runs the api/ handlers with Vercel-style req.query and
// req.body. Outbound fetch calls (Resend, Turnstile) are replaced by a mock
// that records every call, so nothing leaves the machine.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const WWW = path.join(ROOT, 'www');
const VERCEL = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.xml': 'application/xml', '.txt': 'text/plain' };

function toRegex(source) {
  const keys = [];
  const re = source.replace(/:([a-zA-Z]+)/g, (_, k) => { keys.push(k); return '([^/]+)'; });
  return { re: new RegExp(`^${re}$`), keys };
}

function rewrite(pathname) {
  for (const r of VERCEL.rewrites || []) {
    const { re, keys } = toRegex(r.source);
    const m = pathname.match(re);
    if (m) {
      let dest = r.destination;
      keys.forEach((k, i) => { dest = dest.replace(`:${k}`, encodeURIComponent(m[i + 1])); });
      return dest;
    }
  }
  return null;
}

function applyHeaders(pathname, res) {
  for (const h of VERCEL.headers || []) {
    if (new RegExp(`^${h.source}$`).test(pathname)) for (const { key, value } of h.headers) res.setHeader(key, value);
  }
}

// Mock outbound world. state.contacts: email -> { id, unsubscribed, segments:Set, properties }
function createMockWorld({ turnstile = 'pass', failSend = false } = {}) {
  const world = { calls: [], emails: [], contacts: new Map(), turnstile, failSend, propertiesExist: true };
  let n = 0;
  world.fetch = async (url, opts = {}) => {
    const u = new URL(url);
    const body = opts.body ? JSON.parse(opts.body) : null;
    const method = opts.method || 'GET';
    world.calls.push({ host: u.host, method, path: u.pathname, body, headers: opts.headers || {} });
    const reply = (status, data) => ({ ok: status < 400, status, json: async () => data });
    if (u.host === 'challenges.cloudflare.com') {
      if (world.turnstile === 'pass' && !String(body.response).startsWith('not-a-real')) return reply(200, { success: true, hostname: '127.0.0.1' });
      if (world.turnstile === 'badhost') return reply(200, { success: true, hostname: 'evil.example' });
      if (world.turnstile === 'badsecret') return reply(200, { success: false, 'error-codes': ['invalid-input-secret'] });
      if (world.turnstile === 'expired') return reply(200, { success: false, 'error-codes': ['timeout-or-duplicate'] });
      if (world.turnstile === 'down') throw new Error('mock siteverify down');
      return reply(200, { success: false, 'error-codes': ['invalid-input-response'] });
    }
    if (u.host !== 'api.resend.com') throw new Error(`unexpected fetch ${url}`);
    const parts = u.pathname.split('/').filter(Boolean).map(decodeURIComponent);
    if (parts[0] === 'emails' && method === 'POST') {
      if (world.failSend) return reply(500, { message: 'mock failure' });
      const id = `email_${++n}`;
      world.emails.push({ id, ...body, idempotencyKey: opts.headers?.['Idempotency-Key'] });
      return reply(200, { id });
    }
    if (parts[0] === 'contacts') {
      const find = (k) => world.contacts.get(k) || [...world.contacts.values()].find((c) => c.id === k);
      if (parts.length === 1 && method === 'POST') {
        if (world.contacts.has(body.email)) return reply(409, { message: 'exists' });
        const c = { id: `contact_${++n}`, email: body.email, unsubscribed: !!body.unsubscribed, segments: new Set((body.segments || []).map((s) => s.id)), properties: {} };
        world.contacts.set(body.email, c);
        return reply(201, { object: 'contact', id: c.id });
      }
      const c = find(parts[1]);
      if (parts.length === 2 && method === 'GET') return c ? reply(200, { object: 'contact', id: c.id, email: c.email, unsubscribed: c.unsubscribed }) : reply(404, { message: 'not found' });
      if (parts.length === 2 && method === 'PATCH') {
        if (!c) return reply(404, { message: 'not found' });
        if (body.properties && !world.propertiesExist) return reply(422, { message: 'property does not exist' });
        if (body.unsubscribed !== undefined) c.unsubscribed = body.unsubscribed;
        if (body.properties) Object.assign(c.properties, body.properties);
        return reply(200, { object: 'contact', id: c.id });
      }
      if (parts[2] === 'segments' && method === 'GET') return c ? reply(200, { object: 'list', data: [...c.segments].map((id) => ({ id })) }) : reply(404, {});
      if (parts[2] === 'segments' && method === 'POST') { if (!c) return reply(404, {}); c.segments.add(parts[3]); return reply(200, { id: parts[3] }); }
    }
    return reply(404, { message: `mock has no route for ${method} ${u.pathname}` });
  };
  return world;
}

function loadHandler(name) {
  const p = path.join(ROOT, 'api', `${name}.js`);
  return require(p);
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => { data += c; });
    req.on('end', () => resolve(data));
  });
}

function startServer({ port = 0 } = {}) {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let pathname = url.pathname;
    applyHeaders(pathname, res);
    const rw = rewrite(pathname);
    let target = rw ? new URL(rw, 'http://localhost') : url;
    if (rw) for (const [k, v] of url.searchParams) if (!target.searchParams.has(k)) target.searchParams.set(k, v);
    if (target.pathname.startsWith('/api/')) {
      applyHeaders(target.pathname, res);
      const raw = await readBody(req);
      const ct = req.headers['content-type'] || '';
      req.body = !raw ? undefined : ct.includes('application/json') ? JSON.parse(raw) : ct.includes('urlencoded') ? Object.fromEntries(new URLSearchParams(raw)) : raw;
      req.query = Object.fromEntries(target.searchParams);
      try {
        await loadHandler(target.pathname.replace(/^\/api\//, ''))(req, res);
      } catch (err) {
        res.statusCode = 500; res.end(String(err.stack || err));
      }
      return;
    }
    // Static with cleanUrls: /x -> www/x.html, / -> index.html
    let file = path.join(WWW, pathname);
    if (!file.startsWith(WWW)) { res.statusCode = 400; return res.end(); }
    const candidates = pathname.endsWith('/') ? [path.join(file, 'index.html')] : [file, `${file}.html`, path.join(file, 'index.html')];
    const hit = candidates.find((f) => fs.existsSync(f) && fs.statSync(f).isFile());
    if (!hit || pathname.endsWith('.html')) { res.statusCode = 404; return res.end('Not found'); }
    res.setHeader('Content-Type', TYPES[path.extname(hit)] || 'application/octet-stream');
    res.end(fs.readFileSync(hit));
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)));
}

module.exports = { startServer, createMockWorld };

if (require.main === module) {
  // Manual run for screenshots: node test/harness.js 8787
  process.env.DTNT_TOKEN_SECRET ||= 'local-test-secret-0123456789abcdef0123456789';
  for (const k of ['RESEND_API_KEY', 'RESEND_FULL_API_KEY', 'TURNSTILE_SECRET_KEY']) process.env[k] ||= `mock-${k}`;
  process.env.DTNT_FREE_SEGMENT_ID ||= 'seg_mock_dtnt_free';
  const world = createMockWorld();
  globalThis.fetch = world.fetch;
  startServer({ port: Number(process.argv[2] || 8787) }).then((s) => console.log(`harness on http://127.0.0.1:${s.address().port}`));
}
