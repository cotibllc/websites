'use strict';
// Asserts the Nov 21 EE wording refresh, plus the follow-up H1, fee-line,
// and IT management body copy. Locks the new homepage H1, the approved
// supplier fee line, and the absence of the old fee phrases and
// "corporate IT" across the site source and rendered pages.
process.env.NODE_ENV = 'production';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const app = require('../app');

const HOME_TITLE = 'Earned Escape | Trips Planned Around How You Travel';
const HOME_META =
  'Trips planned around how you travel, including family cruises, theme parks, Europe and Asia. Trips booked through my suppliers are planned at no extra fee.';
const RC_TITLE = 'Royal Caribbean Cruise Planning for Families | Earned Escape';
const RC_META =
  'Royal Caribbean planning around how your family travels, from firsthand sailings. Trips booked through my suppliers are planned at no extra fee.';
const ABOUT_TITLE = 'Meet Chuck | Family Travel Advisor | Earned Escape';
const ABOUT_META =
  'Meet Chuck Betancourt of Earned Escape: trips planned around how you travel, with 25+ years in IT management, for family cruises, theme parks, Europe and Asia.';
const FEE_LINE = 'Trips booked through my suppliers are planned at no extra fee.';
const SCHEMA_DESC =
  'Trips planned around how you travel: family cruises, theme park vacations, active and outdoor trips, Europe and Asia. Every trip gets luxury-level care, whatever the style or budget. Trips booked through my suppliers are planned at no extra fee.';
const NEW_H1 = '<h1 class="hero__headline" id="hero-heading">Trips planned around how you travel</h1>';
const OLD_H1 = '<h1 class="hero__headline" id="hero-heading">Royal Caribbean<br>Cruise Planning</h1>';
const OLD_FEE = /No planning fee|no planning fee|There is no planning fee|without adding a separate planning fee|Zero pressure, no planning fee|zero planning fee|costs nothing/i;
const FEE_RE = new RegExp(FEE_LINE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

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
  const m = html.match(new RegExp(`<meta\\s+${attr}="${name}"\\s+content="([^"]*)"`, 'i'));
  return m ? decode(m[1]).trim() : null;
};

async function get(pathname) {
  const res = await fetch(base + pathname);
  const body = await res.text();
  return { res, body };
}

function assertDescriptions(html, expected) {
  assert.equal(meta(html, 'name', 'description'), expected);
  assert.equal(meta(html, 'property', 'og:description'), expected);
  assert.equal(meta(html, 'name', 'twitter:description'), expected);
}

test('homepage title, descriptions, schema, and H1', async () => {
  const { res, body } = await get('/');
  assert.equal(res.status, 200);
  assert.equal(titleOf(body), HOME_TITLE);
  assert.equal(meta(body, 'property', 'og:title'), HOME_TITLE);
  assert.equal(meta(body, 'name', 'twitter:title'), HOME_TITLE);
  assertDescriptions(body, HOME_META);
  assert.match(body, new RegExp(NEW_H1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.doesNotMatch(body, new RegExp(OLD_H1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(body, /I plan family cruises, theme park trips, active travel, Europe and Asia around how you like to travel/);
  assert.match(body, new RegExp(SCHEMA_DESC.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(body, /"priceRange": "\$\$-\$\$\$\$"/);
  assert.equal(meta(body, 'name', 'twitter:site'), null);
  assert.doesNotMatch(body, /zero planning fee/i);
  assert.doesNotMatch(body, /costs nothing/i);
  assert.match(body, FEE_RE);
  assert.doesNotMatch(body, OLD_FEE);
});

test('about title and meta use IT management', async () => {
  const { res, body } = await get('/about');
  assert.equal(res.status, 200);
  assert.equal(titleOf(body), ABOUT_TITLE);
  assertDescriptions(body, ABOUT_META);
  assert.match(ABOUT_META, /25\+ years in IT management/);
  assert.doesNotMatch(ABOUT_META, /corporate IT/);
  assert.equal(meta(body, 'name', 'twitter:site'), null);
});

test('royal-caribbean title and descriptions', async () => {
  const { res, body } = await get('/royal-caribbean');
  assert.equal(res.status, 200);
  assert.equal(titleOf(body), RC_TITLE);
  assert.equal(RC_TITLE.length, 60);
  assertDescriptions(body, RC_META);
  assert.equal(meta(body, 'name', 'twitter:site'), null);
  assert.doesNotMatch(titleOf(body) + RC_META, /Disney/i);
});

test('404 inherits the new homepage meta and has no twitter:site', async () => {
  const { res, body } = await get('/this-page-does-not-exist');
  assert.equal(res.status, 404);
  assertDescriptions(body, HOME_META);
  assert.equal(meta(body, 'name', 'twitter:site'), null);
  assert.doesNotMatch(body, /zero planning fee/i);
});

test('theme-parks body uses the supplier fee line', async () => {
  const { res, body } = await get('/theme-parks');
  assert.equal(res.status, 200);
  assert.match(body, FEE_RE);
  assert.doesNotMatch(body, /There is no planning fee\./);
});

test('llms.txt uses the repositioned description and supplier fee line', async () => {
  const { res, body } = await get('/llms.txt');
  assert.equal(res.status, 200);
  assert.match(body, /Trips planned around how you travel, including family cruises, theme parks, Europe and Asia/);
  assert.match(body, FEE_RE);
  assert.match(body, /25\+ years in IT management applied to travel/);
  assert.doesNotMatch(body, /There is no planning fee/);
  assert.doesNotMatch(body, /No planning fee either way/);
  assert.doesNotMatch(body, /White-glove planning for elevated family vacations/);
  assert.doesNotMatch(body, /zero planning fee/i);
  assert.doesNotMatch(body, /corporate IT/i);
  const onDisk = fs.readFileSync(path.join(__dirname, '../public/llms.txt'), 'utf8');
  assert.equal(body.replace(/\r\n/g, '\n').trim(), onDisk.replace(/\r\n/g, '\n').trim());
});

test('proposed title and meta lengths stay within House Rule 37 limits', () => {
  assert.ok(HOME_TITLE.length <= 60, String(HOME_TITLE.length));
  assert.ok(HOME_META.length <= 160, String(HOME_META.length));
  assert.ok(RC_TITLE.length <= 60, String(RC_TITLE.length));
  assert.ok(RC_META.length <= 160, String(RC_META.length));
  assert.ok(ABOUT_TITLE.length <= 60, String(ABOUT_TITLE.length));
  assert.ok(ABOUT_META.length <= 160, String(ABOUT_META.length));
  for (const s of [HOME_TITLE, HOME_META, RC_TITLE, RC_META, ABOUT_TITLE, ABOUT_META, FEE_LINE, SCHEMA_DESC]) {
    assert.doesNotMatch(s, /[\u2013\u2014]/);
  }
});

test('about body uses IT management and the approved fee line', async () => {
  const { res, body } = await get('/about');
  assert.equal(res.status, 200);
  assert.match(body, /<strong>25\+ years in IT management<\/strong>/);
  assert.doesNotMatch(body, /corporate IT/i);
  assert.match(body, FEE_RE);
  assert.doesNotMatch(body, OLD_FEE);
  assert.match(body, /at no extra fee to you/);
  assert.doesNotMatch(body, /all at no added cost to you/);
  assert.match(body, /25\+ years in IT management/);
});

test('royal-caribbean body and FAQ use the approved fee line', async () => {
  const { res, body } = await get('/royal-caribbean');
  assert.equal(res.status, 200);
  assert.match(body, FEE_RE);
  assert.doesNotMatch(body, OLD_FEE);
  assert.match(body, /Do you charge a planning fee\?/);
  assert.match(body, /Trips booked through my suppliers are planned at no extra fee\. You pay the cruise fare and any add-ons you choose\./);
  assert.match(body, /the same way I planned complex systems over 25\+ years in IT management\./);
  assert.doesNotMatch(body, /in corporate IT/);
  assert.doesNotMatch(body, /corporate IT/i);
  assert.match(body, /25\+ years in IT management/);
});

test('author-bio uses IT management, not corporate IT', () => {
  const src = fs.readFileSync(path.join(__dirname, '../views/partials/author-bio.njk'), 'utf8');
  assert.match(src, /with 25\+ years in IT management\./);
  assert.doesNotMatch(src, /corporate IT/i);
});

test('why.njk uses the approved fee line', () => {
  const src = fs.readFileSync(path.join(__dirname, '../views/partials/why.njk'), 'utf8');
  assert.match(src, FEE_RE);
  assert.doesNotMatch(src, OLD_FEE);
});

test('quiz email copy uses the approved fee line', () => {
  const src = fs.readFileSync(path.join(__dirname, '../routes/index.js'), 'utf8');
  assert.match(src, /Want to turn this into an actual itinerary\? Let's hop on a free 30-minute planning call\. Zero pressure\. Trips booked through my suppliers are planned at no extra fee\./);
  assert.match(src, /If you want a second set of eyes, grab a free 30-minute call\. Zero pressure\. Trips booked through my suppliers are planned at no extra fee\./);
  assert.doesNotMatch(src, /Zero pressure, no planning fee/);
  assert.doesNotMatch(src, OLD_FEE);
});

const sitemap = fs.readFileSync(path.join(__dirname, '../public/sitemap.xml'), 'utf8');
const sitemapPaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => new URL(m[1]).pathname)
  .filter((p) => !p.endsWith('.pdf'));

test('rendered sitemap pages have no old fee phrases', async () => {
  for (const p of sitemapPaths) {
    const { res, body } = await get(p);
    assert.equal(res.status, 200, p);
    assert.doesNotMatch(body, OLD_FEE, p);
    assert.doesNotMatch(body, /costs nothing/i, p);
  }
});

test('rendered pages and EE site source have no corporate IT', async () => {
  const checked = ['/', '/about', '/theme-parks', '/universal', '/disney-world', '/disney-cruise-line', '/plan', '/royal-caribbean'];
  for (const p of checked) {
    const { res, body } = await get(p);
    assert.ok(res.status === 200 || res.status === 307, `${p} ${res.status}`);
    assert.doesNotMatch(body, /corporate IT/i, p);
  }
  const { body: about } = await get('/about');
  assert.match(about, /25\+ years in IT management/);
  const { body: rc } = await get('/royal-caribbean');
  assert.match(rc, /the same way I planned complex systems over 25\+ years in IT management\./);

  const siteRoot = path.join(__dirname, '..');
  const skipDirs = new Set(['node_modules', 'test', 'public/css']);
  const hits = [];
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = path.relative(siteRoot, path.join(dir, ent.name));
      if (ent.isDirectory()) {
        if (ent.name === 'node_modules' || ent.name === 'test' || rel === path.join('public', 'css')) continue;
        walk(path.join(dir, ent.name));
        continue;
      }
      if (!/\.(njk|js|txt|html|xml|md|json)$/i.test(ent.name)) continue;
      const src = fs.readFileSync(path.join(dir, ent.name), 'utf8');
      if (/corporate IT/i.test(src)) hits.push(rel);
    }
  }
  walk(siteRoot);
  assert.deepEqual(hits, [], `corporate IT still present in: ${hits.join(', ')}`);
});
