// What a crawler sees: every sitemap URL, every internal link and asset on
// every page, the redirects for removed URLs, and robots.txt. Search Console
// reported 404s and a 5xx on cotib.com (2026-10-30); these keep them fixed.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { startServer, createMockWorld } = require('./harness');

const ROOT = path.join(__dirname, '..');
const WWW = path.join(ROOT, 'www');
const VERCEL = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
const SKIP_DIRS = new Set(['css', 'fontawesome', 'img', 'js']);

// The DTNT handlers call Resend and Turnstile through globalThis.fetch; the
// mock catches those, and requests to the local server use the real fetch.
const realFetch = globalThis.fetch;
let server, base;
test.before(async () => {
  process.env.DTNT_TOKEN_SECRET ||= 'local-test-secret-0123456789abcdef0123456789';
  for (const k of ['RESEND_API_KEY', 'RESEND_FULL_API_KEY', 'TURNSTILE_SECRET_KEY']) process.env[k] ||= `mock-${k}`;
  process.env.DTNT_FREE_SEGMENT_ID ||= 'seg_mock_dtnt_free';
  const world = createMockWorld();
  globalThis.fetch = world.fetch;
  server = await startServer();
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => server.close());

const get = (p) => realFetch(base + p, { redirect: 'manual' });

function pages(dir = WWW) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return SKIP_DIRS.has(e.name) ? [] : pages(p);
    return e.name.endsWith('.html') ? [p] : [];
  });
}

// The URL path a page is served at with cleanUrls.
function urlPath(file) {
  const rel = '/' + path.relative(WWW, file).split(path.sep).join('/').replace(/\.html$/, '');
  return rel === '/index' ? '/' : rel;
}

test('every sitemap URL is a cotib.com page that answers 200', async () => {
  const xml = fs.readFileSync(path.join(WWW, 'sitemap.xml'), 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]));
  assert.ok(locs.length >= 11, `sitemap has ${locs.length} URLs`);
  const bad = [];
  for (const u of locs) {
    if (!/^(www\.)?cotib\.com$/.test(u.host)) bad.push(`${u.href}: wrong host`);
    const r = await get(u.pathname);
    if (r.status !== 200) bad.push(`${u.href}: ${r.status}`);
  }
  assert.deepEqual(bad, []);
});

test('removed or moved URLs 301 to a live page', async () => {
  const expected = { '/blog': '/ventures', '/blog.html': '/ventures', '/favicon.ico': '/favicon.svg' };
  for (const [from, to] of Object.entries(expected)) {
    const r = await get(from);
    assert.equal(r.status, 301, from);
    assert.equal(r.headers.get('location'), to, from);
    assert.equal((await get(to)).status, 200, `${from} -> ${to} lands on a live page`);
  }
});

test('every redirect in vercel.json lands on a live page and shadows no real file', async () => {
  for (const r of VERCEL.redirects || []) {
    assert.equal((await get(r.destination)).status, 200, `${r.source} -> ${r.destination}`);
    const shadowed = [path.join(WWW, r.source), path.join(WWW, `${r.source}.html`)].filter((f) => fs.existsSync(f) && fs.statSync(f).isFile());
    assert.deepEqual(shadowed, [], `${r.source} would hide a real file`);
  }
});

test('every internal link and asset on every page answers 200 or a redirect to one', async () => {
  const bad = [];
  for (const file of pages()) {
    const from = urlPath(file);
    const html = fs.readFileSync(file, 'utf8');
    for (const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const raw = m[1];
      if (/^(mailto:|tel:|data:|javascript:|#)/.test(raw)) continue;
      const u = new URL(raw, `https://www.cotib.com${from}`);
      if (!/^(www\.)?cotib\.com$/.test(u.host)) continue;
      let r = await get(u.pathname);
      if (r.status >= 300 && r.status < 400) r = await get(new URL(r.headers.get('location'), base).pathname);
      // The signup form action only takes POST; a GET is a 303 back to the form.
      if (r.status !== 200 && !(u.pathname === '/do-the-next-thing/free' && r.status === 303)) bad.push(`${from}: ${raw} -> ${r.status}`);
    }
  }
  assert.deepEqual(bad, []);
});

test('robots.txt keeps crawlers out of /cdn-cgi/ and names the sitemap', () => {
  const txt = fs.readFileSync(path.join(WWW, 'robots.txt'), 'utf8');
  const lastStar = txt.slice(txt.lastIndexOf('User-agent: *'));
  assert.match(lastStar, /^Disallow: \/cdn-cgi\/$/m);
  assert.match(txt, /^Sitemap: https:\/\/cotib\.com\/sitemap\.xml$/m);
});

test('bad, empty or garbled DTNT links get a 4xx page, never a 5xx', async () => {
  const urls = [
    '/do-the-next-thing/free/confirm', '/do-the-next-thing/free/confirm?t=', '/do-the-next-thing/free/confirm?t=bogus',
    '/do-the-next-thing/free/confirm?t=a.b.c', '/do-the-next-thing/free/confirm?t=%E0%A4',
    '/do-the-next-thing/free/dl/bogus', '/do-the-next-thing/free/dl/a.b', '/do-the-next-thing/free/dl/%25',
    '/do-the-next-thing/free/unsubscribe', '/do-the-next-thing/free/unsubscribe?t=bogus', '/do-the-next-thing/free/unsubscribe?t=%E0%A4',
  ];
  for (const p of urls) {
    const r = await get(p);
    assert.ok(r.status >= 400 && r.status < 500, `${p} -> ${r.status}`);
    assert.match(r.headers.get('content-type') || '', /text\/html/, p);
  }
});
