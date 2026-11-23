// /website-privacy: the site privacy notice for consent-gated GA4 and the
// contact form. Checks the facts it states against the code that does them.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { startServer, createMockWorld } = require('./harness');
const consent = require('../lib/consent');

const WWW = path.join(__dirname, '..', 'www');
const read = (f) => fs.readFileSync(path.join(WWW, f), 'utf8');
const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&rsquo;/g, "'").replace(/\s+/g, ' ');

let server, base;
const realFetch = globalThis.fetch;
test.before(async () => {
  process.env.DTNT_TOKEN_SECRET ||= 'local-test-secret-0123456789abcdef0123456789';
  for (const k of ['RESEND_API_KEY', 'RESEND_FULL_API_KEY', 'TURNSTILE_SECRET_KEY']) process.env[k] ||= `mock-${k}`;
  process.env.DTNT_FREE_SEGMENT_ID ||= 'seg_mock_dtnt_free';
  globalThis.fetch = createMockWorld().fetch;
  server = await startServer();
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => server.close());

test('/website-privacy answers 200 with its own title and canonical', async () => {
  const r = await realFetch(`${base}/website-privacy`);
  assert.equal(r.status, 200);
  const html = await r.text();
  assert.match(html, /<title>Website privacy \| COTIB LLC<\/title>/);
  assert.match(html, /<link rel="canonical" href="https:\/\/cotib\.com\/website-privacy">/);
  assert.match(html, /<h1[^>]*>Website privacy<\/h1>/);
});

test('it states the GA4 facts the setup actually has', () => {
  const t = text(read('website-privacy.html'));
  const id = consent.GA_MEASUREMENT_ID.replace(/^G-/, '');
  for (const fact of [
    'COTIB LLC',
    `_ga and _ga_${id}`,
    'Google keeps this analytics data for 14 months',
    'Google signals is turned off',
    'not linked to Google Ads',
    'does not load, and sets no cookies, until you choose Accept',
    'Cookie choices',
    'through Resend',
    'Cloudflare Turnstile',
    'about 5 tries a minute',
    'customerservice@cotib.com',
  ]) assert.ok(t.includes(fact), fact);
});

test('the rate limit it names matches the contact form code', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'api', 'contact.js'), 'utf8');
  assert.match(src, /rateLimited\(`contact:\$\{visitorIp\}`, 5\)/);
});

test('the banner links to it', () => {
  assert.match(read('js/consent-v1.js'), /el\('a', \{ href: '\/website-privacy' \}, 'Website privacy'\)/);
});

test('every site page footer links to it, next to Cookie choices (the QuickBooks /privacy page is left alone)', async () => {
  for (const p of ['/', '/services', '/ventures', '/about', '/contact', '/eula', '/connect', '/disconnect', '/do-the-next-thing', '/do-the-next-thing/privacy', '/website-privacy', '/no-such-page']) {
    const html = await (await realFetch(base + p)).text();
    assert.match(html, /<a href="\/website-privacy"[^>]*>Website privacy<\/a>\s*<button type="button" data-cookie-choices/, p);
  }
});

test('DTNT token pages do not link it (they have no Cookie choices either)', async () => {
  for (const p of ['/do-the-next-thing/free/confirm?t=bogus', '/do-the-next-thing/free/dl/bogus', '/do-the-next-thing/free/unsubscribe?t=bogus']) {
    assert.doesNotMatch(await (await realFetch(base + p)).text(), /website-privacy/, p);
  }
});

test('it is in the sitemap', () => {
  assert.match(read('sitemap.xml'), /<loc>https:\/\/cotib\.com\/website-privacy<\/loc>/);
});

test('the QuickBooks /privacy policy is left as it was', () => {
  const html = read('privacy.html');
  assert.doesNotMatch(html, /website-privacy/);
  assert.match(html, /<title>Privacy Policy \| COTIB LLC QuickBooks Integration<\/title>/);
  assert.doesNotMatch(text(html), /Google Analytics/);
});

test('no em or en dashes in the new page', () => {
  assert.doesNotMatch(read('website-privacy.html'), /[\u2013\u2014]/);
});
