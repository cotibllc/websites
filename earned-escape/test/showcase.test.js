'use strict';
// Unlisted /showcase page: 200, noindex meta and header, kept out of the
// sitemap and other pages, video player markup, and range requests on the mp4.
process.env.NODE_ENV = 'production';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const app = require('../app');

const TITLE = 'A short hello from Earned Escape';
const DESCRIPTION = 'A 30-second look at how I plan trips.';
const VIDEO_PATH = '/videos/earned-escape-elevenlabs.mp4';
const POSTER_PATH = '/videos/earned-escape-elevenlabs-poster.jpg';

let server;
let base;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});

const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

const titleOf = (html) => decode((html.match(/<title>([^<]*)<\/title>/i) || [])[1] || '').trim();
const meta = (html, attr, name) => {
  const m = html.match(new RegExp(`<meta\\s+[^>]*${attr}="${name}"[^>]*content="([^"]*)"`, 'i'))
    || html.match(new RegExp(`<meta\\s+[^>]*content="([^"]*)"[^>]*${attr}="${name}"`, 'i'));
  return m ? decode(m[1]).trim() : null;
};

async function get(pathname, headers = {}) {
  const res = await fetch(base + pathname, { headers });
  const body = await res.text();
  return { res, body };
}

const INBOUND_HREF = /href\s*=\s*["'][^"']*\/showcase(?:\/|\?|#|["'])/i;
const SOURCE_LINK = /(?:href|to|loc|canonical)\s*[=:]\s*['"`][^'"`]*\/showcase(?:\/|\?|#|['"`])|earnedescape\.agency\/showcase\b/i;

test('GET /showcase returns 200 HTML with noindex meta and header', async () => {
  const { res, body } = await get('/showcase');
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type') || '', /text\/html/);
  const robotsHeader = (res.headers.get('x-robots-tag') || '').toLowerCase();
  assert.match(robotsHeader, /noindex/);
  assert.match(robotsHeader, /nofollow/);
  assert.equal(meta(body, 'name', 'robots'), 'noindex, nofollow');
  assert.equal(titleOf(body), TITLE);
  assert.ok(TITLE.length <= 60, String(TITLE.length));
  assert.equal(meta(body, 'name', 'description'), DESCRIPTION);
  assert.ok(DESCRIPTION.length <= 160, String(DESCRIPTION.length));
  assert.doesNotMatch(TITLE + DESCRIPTION + body, /[\u2013\u2014]/);
  assert.doesNotMatch(body, /\blands\b/i);
  assert.doesNotMatch(body, /costs nothing|zero planning fee/i);
  assert.doesNotMatch(body, /application\/ld\+json/);
  assert.match(body, /<h1[^>]*>A short hello from Earned Escape<\/h1>/);
  assert.match(body, /This is a 30-second look at how I plan trips\./);
  assert.match(body, /href="\/"/);
  assert.match(body, /Visit the Earned Escape homepage/);
  assert.match(body, /class="site-footer"/);
  assert.match(body, /COTIB Adventures LLC/);
  assert.match(body, /Castle Dreams Travel/);
});

test('showcase player is a native video with poster, controls, and a file fallback', async () => {
  const { res, body } = await get('/showcase');
  assert.equal(res.status, 200);
  assert.match(body, /<video[\s\S]*?<\/video>/i);
  const video = body.match(/<video\b[^>]*>[\s\S]*?<\/video>/i)[0];
  assert.match(video, /\bcontrols\b/i);
  assert.match(video, /\bplaysinline\b/i);
  assert.match(video, /preload="metadata"/i);
  assert.match(video, new RegExp(`poster="${POSTER_PATH.replace(/\./g, '\\.')}[^"]*"`, 'i'));
  assert.doesNotMatch(video, /\bautoplay\b/i);
  assert.match(video, new RegExp(`src="${VIDEO_PATH.replace(/\./g, '\\.')}"`));
  assert.match(body, new RegExp(`href="${VIDEO_PATH.replace(/\./g, '\\.')}"`));
  assert.doesNotMatch(body, /youtube|youtu\.be|vimeo/i);
});

test('sitemap.xml and the sitemap generator keep /showcase out', () => {
  const sitemap = fs.readFileSync(path.join(__dirname, '../public/sitemap.xml'), 'utf8');
  assert.doesNotMatch(sitemap, /\/showcase\b/);
  const generator = fs.readFileSync(path.join(__dirname, '../scripts/generate-sitemap.js'), 'utf8');
  assert.doesNotMatch(generator, /loc:\s*['"]\/showcase['"]/);
});

test('robots.txt does not block /showcase, and llms.txt does not list it', async () => {
  const { res, body } = await get('/robots.txt');
  assert.equal(res.status, 200);
  assert.doesNotMatch(body, /disallow:\s*\/showcase\b/i);
  const llms = fs.readFileSync(path.join(__dirname, '../public/llms.txt'), 'utf8');
  assert.doesNotMatch(llms, /\/showcase\b/);
});

test('no other rendered page links to /showcase', async () => {
  const paths = [
    '/', '/about', '/plan', '/guide', '/china', '/royal-caribbean',
    '/disney-world', '/disney-cruise-line', '/theme-parks', '/universal',
    '/sports', '/compliance', '/privacy', '/links', '/unsubscribe',
    '/this-page-does-not-exist', '/llms.txt', '/robots.txt', '/sitemap.xml',
  ];
  const hits = [];
  for (const p of paths) {
    const { body } = await get(p);
    if (INBOUND_HREF.test(body) || /earnedescape\.agency\/showcase\b/i.test(body)) {
      hits.push(p);
    }
  }
  assert.deepEqual(hits, [], `inbound /showcase links on: ${hits.join(', ')}`);
});

test('no other site source file links to /showcase', () => {
  const siteRoot = path.join(__dirname, '..');
  const skipNames = new Set(['node_modules', '.data', 'test']);
  const hits = [];
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      const rel = path.relative(siteRoot, full);
      if (ent.isDirectory()) {
        if (skipNames.has(ent.name)) continue;
        walk(full);
        continue;
      }
      if (!/\.(njk|js|mjs|txt|html|xml|md|json|css)$/i.test(ent.name)) continue;
      if (rel === path.join('views', 'pages', 'showcase.njk')) continue;
      if (rel === path.join('routes', 'index.js')) continue;
      if (rel === path.join('scripts', 'generate-sitemap.js')) continue;
      const src = fs.readFileSync(full, 'utf8');
      if (SOURCE_LINK.test(src) || INBOUND_HREF.test(src)) hits.push(rel);
    }
  }
  walk(siteRoot);
  assert.deepEqual(hits, [], `inbound /showcase links in: ${hits.join(', ')}`);
});

test('mp4 is served with byte-range support', async () => {
  const headish = await fetch(base + VIDEO_PATH, { method: 'GET' });
  assert.equal(headish.status, 200);
  const acceptRanges = (headish.headers.get('accept-ranges') || '').toLowerCase();
  assert.match(acceptRanges, /bytes/);
  const length = Number(headish.headers.get('content-length') || 0);
  assert.ok(length > 1000, String(length));
  await headish.arrayBuffer();

  const ranged = await fetch(base + VIDEO_PATH, { headers: { Range: 'bytes=0-1023' } });
  assert.equal(ranged.status, 206);
  assert.match((ranged.headers.get('accept-ranges') || '').toLowerCase(), /bytes/);
  assert.match(ranged.headers.get('content-range') || '', /bytes 0-1023\//);
  const chunk = Buffer.from(await ranged.arrayBuffer());
  assert.equal(chunk.length, 1024);
});

test('poster jpg is served as 200', async () => {
  const { res } = await get(POSTER_PATH);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type') || '', /image\/jpeg/);
});
