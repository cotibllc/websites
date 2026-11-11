'use strict';
// The /privacy page: each fact it states is checked against the code or
// config that makes it true, so the page and the site can't drift apart.
process.env.NODE_ENV = 'production';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const app = require('../app');
const { GA_MEASUREMENT_ID } = require('../lib/consent');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const ROUTES = read('routes/index.js');
const HEAD = read('views/layout/head.njk');
const VIEW = read('views/pages/privacy.njk');

let server, base, html;
test.before(async () => {
  await new Promise((resolve) => { server = app.listen(0, '127.0.0.1', resolve); });
  base = `http://127.0.0.1:${server.address().port}`;
  const res = await fetch(base + '/privacy');
  assert.equal(res.status, 200);
  html = await res.text();
});
test.after(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});

// Rendered text with tags removed and entities for the few we use decoded.
const text = () => html.replace(/<[^>]+>/g, ' ').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ');

test('the page renders with its title, canonical and operator', () => {
  assert.match(html, /<title>Privacy Policy \| Earned Escape<\/title>/);
  assert.match(html, /<link rel="canonical" href="https:\/\/earnedescape\.agency\/privacy">/);
  assert.match(text(), /operated by COTIB Adventures LLC/);
  assert.match(text(), /Effective October 30, 2026/);
  assert.match(text(), /155 Willowbrook Blvd, Ste 110 #8741, Wayne NJ 07470, United States/);
});

test('the contact address is the inbox the forms already send to, and the booking addresses are unchanged', () => {
  assert.match(ROUTES, /^const TO_EMAIL = 'cbetancourt@castledreamstravel\.com';$/m);
  assert.match(ROUTES, /^const FROM_EMAIL = 'Chuck Betancourt <cbetancourt@castledreamstravel\.com>';$/m);
  assert.equal((html.match(/href="mailto:cbetancourt@castledreamstravel\.com"/g) || []).length, 2);
});

test('GA4 facts: cookie names from the committed ID, 14 months, signals off, no Ads link, consent first in the EU and UK', () => {
  const t = text();
  assert.match(t, new RegExp(`_ga and _ga_${GA_MEASUREMENT_ID.slice(2)}`));
  assert.match(t, /Google keeps this analytics data for 14 months/);
  assert.match(t, /Google signals is turned off/);
  assert.match(t, /it is not linked to Google Ads/);
  assert.match(t, /European Union, the European Economic Area, the United Kingdom or Switzerland/);
  assert.match(t, /does not load, and sets no cookies, until you choose Accept/);
  assert.match(t, /Cookie choices at the bottom of every page/);
  assert.match(t, /never runs on unsubscribe pages/);
});

test('each named processor matches something the site really loads or calls', () => {
  const t = text();
  assert.match(HEAD, /fonts\.googleapis\.com/);
  assert.match(t, /Google Fonts: serves the fonts on every page/);
  assert.match(HEAD, /challenges\.cloudflare\.com\/turnstile/);
  assert.match(t, /Cloudflare Turnstile: loads on our pages/);
  const plan = JSON.parse(read('vercel.json')).redirects.find((r) => r.source === '/plan');
  assert.match(plan.destination, /^https:\/\/app\.tern\.travel\//);
  assert.match(t, /Tern: hosts the planning form that \/plan opens/);
  assert.match(ROUTES, /require\('resend'\)/);
  assert.match(t, /Resend: sends the guide, quiz and follow up emails/);
  assert.match(t, /Vercel: hosts the site/);
  assert.match(t, /Google Analytics: measures visits/);
});

test('the follow up email counts match the scheduled sends in the routes', () => {
  assert.match(ROUTES, /scheduledAt: day3At/);
  assert.match(ROUTES, /scheduledAt: day7At/);
  assert.match(ROUTES, /scheduledAt: day3,/);
  assert.match(text(), /two for the cruise guide \(day 3 and day 7\) and one for the quiz \(day 3\)/);
});

test('the sitemap and its generator list /privacy', () => {
  assert.match(read('public/sitemap.xml'), /<loc>https:\/\/earnedescape\.agency\/privacy<\/loc>/);
  assert.match(read('scripts/generate-sitemap.js'), /loc: '\/privacy'/);
});

test('the banner links to /privacy', () => {
  assert.match(read('public/js/consent.js'), /el\('a', \{ href: '\/privacy' \}, 'Privacy policy'\)/);
});

test('no em or en dashes in the page', () => {
  assert.doesNotMatch(VIEW, /[\u2013\u2014]/);
  assert.doesNotMatch(html.slice(html.indexOf('<main'), html.indexOf('</main>')), /[\u2013\u2014]/);
});
