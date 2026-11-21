'use strict';
// Asserts the Nov 21 EE wording refresh: new titles and descriptions,
// unchanged homepage H1, no twitter:site tag, and the locked supplier fee line
// in the in-scope surfaces. Does not rewrite or assert out-of-scope body copy.
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
  assert.match(body, /<h1 class="hero__headline" id="hero-heading">Royal Caribbean<br>Cruise Planning<\/h1>/);
  assert.match(body, /I plan family cruises, theme park trips, active travel, Europe and Asia around how you like to travel/);
  assert.match(body, new RegExp(SCHEMA_DESC.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(body, /"priceRange": "\$\$-\$\$\$\$"/);
  assert.equal(meta(body, 'name', 'twitter:site'), null);
  assert.doesNotMatch(body, /zero planning fee/i);
  assert.doesNotMatch(body, /costs nothing/i);
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
  assert.match(body, new RegExp(FEE_LINE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.doesNotMatch(body, /There is no planning fee\./);
});

test('llms.txt uses the repositioned description and supplier fee line', async () => {
  const { res, body } = await get('/llms.txt');
  assert.equal(res.status, 200);
  assert.match(body, /Trips planned around how you travel, including family cruises, theme parks, Europe and Asia/);
  assert.match(body, new RegExp(FEE_LINE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.doesNotMatch(body, /There is no planning fee/);
  assert.doesNotMatch(body, /No planning fee either way/);
  assert.doesNotMatch(body, /White-glove planning for elevated family vacations/);
  assert.doesNotMatch(body, /zero planning fee/i);
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
