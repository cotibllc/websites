'use strict';
// Consent-gated Google Analytics 4: the region rules, /api/consent-region,
// the rendered pages and the browser script run against a small fake DOM, so
// these tests prove that nothing is requested from Google before consent in
// the EU, EEA, UK and Switzerland, and that unsubscribe pages never load GA.
// Production mode, like smoke.test.js: no file watchers, no lead store writes.
process.env.NODE_ENV = 'production';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const app = require('../app');
const consent = require('../lib/consent');

const SCRIPT = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'consent.js'), 'utf8');
const HEAD = fs.readFileSync(path.join(__dirname, '..', 'views', 'layout', 'head.njk'), 'utf8');

// ---------- rules ----------
test('EU, EEA, UK and Swiss visitors are asked first', () => {
  for (const c of ['DE', 'FR', 'IE', 'PL', 'NO', 'IS', 'LI', 'GB', 'CH', 'de']) assert.equal(consent.consentRegion(c), 'required', c);
});

test('a missing or malformed country header means we ask', () => {
  for (const c of [null, undefined, '', '  ', 'XYZ', '1A', 'T1']) assert.equal(consent.consentRegion(c), 'required', String(c));
});

test('other countries load analytics by default', () => {
  for (const c of ['US', 'CA', 'AU', 'BR', 'JP', 'IN']) assert.equal(consent.consentRegion(c), 'not-required', c);
});

test('decision table: region by stored choice', () => {
  const rows = ['required', 'not-required'].flatMap((r) => ['granted', 'denied', null].map((c) => `${r} + ${c ?? 'none'} = ${consent.analyticsDecision(r, c)}`));
  assert.deepEqual(rows, [
    'required + granted = load-consented',
    'required + denied = off',
    'required + none = ask',
    'not-required + granted = load-consented',
    'not-required + denied = off',
    'not-required + none = load-default',
  ]);
  assert.equal(consent.analyticsLoads('ask'), false);
  assert.equal(consent.analyticsLoads('off'), false);
  assert.equal(consent.analyticsLoads('load-default'), true);
  assert.equal(consent.analyticsLoads('load-consented'), true);
});

test('stored values and API values parse strictly', () => {
  assert.equal(consent.parseChoice('granted'), 'granted');
  assert.equal(consent.parseChoice('denied'), 'denied');
  assert.equal(consent.parseChoice('yes'), null);
  assert.equal(consent.parseRegion('not-required'), 'not-required');
  assert.equal(consent.parseRegion('anything else'), 'required');
  assert.equal(consent.parseRegion(undefined), 'required');
});

test('the Measurement ID is the Earned Escape GA4 property, the same in the server module and the browser script', () => {
  assert.equal(consent.GA_MEASUREMENT_ID, 'G-HF5TCJ4DKH');
  assert.equal(consent.CONSENT_STORAGE_KEY, 'ee-analytics-consent-v1');
  assert.match(SCRIPT, new RegExp(`var GA_ID = '${consent.GA_MEASUREMENT_ID}';`));
  assert.match(SCRIPT, new RegExp(`var STORAGE_KEY = '${consent.CONSENT_STORAGE_KEY}';`));
  assert.equal((SCRIPT.match(/G-[A-Z0-9]{6,12}/g) || []).filter((id) => id !== consent.GA_MEASUREMENT_ID).length, 0);
});

test('the page head no longer loads gtag.js directly: the consent script is the only way in', () => {
  assert.doesNotMatch(HEAD, /googletagmanager|gtag\(|G-[A-Z0-9]{6,12}/);
  assert.match(HEAD, /<script src="\/js\/consent\.js\?v=\{\{ site\.assetVersion \}\}" defer><\/script>/);
});

// ---------- /api/consent-region and the rendered pages ----------

let server, base;
test.before(async () => {
  await new Promise((resolve) => { server = app.listen(0, '127.0.0.1', resolve); });
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});
const get = (p, init = {}) => fetch(base + p, { redirect: 'manual', ...init });

test('/api/consent-region answers per visitor and is never cached', async () => {
  for (const [country, want] of [['DE', 'required'], ['GB', 'required'], ['CH', 'required'], ['US', 'not-required'], [null, 'required']]) {
    const r = await get('/api/consent-region', { headers: country ? { 'x-vercel-ip-country': country } : {} });
    assert.equal(r.status, 200);
    assert.deepEqual(await r.json(), { region: want }, String(country));
    assert.match(r.headers.get('cache-control'), /no-store/);
    assert.match(r.headers.get('cache-control'), /private/);
  }
  const post = await get('/api/consent-region', { method: 'POST' });
  assert.equal(post.status, 405);
  assert.equal(post.headers.get('allow'), 'GET, HEAD');
});

const PAGES = ['/', '/about', '/plan', '/guide', '/china', '/royal-caribbean', '/disney-cruise-line', '/disney-world', '/theme-parks', '/universal', '/sports', '/links', '/compliance', '/privacy', '/unsubscribe?t=bad', '/no-such-page'];

test('every page loads the consent script once, has the footer Privacy link and a hidden Cookie choices button, and carries no Google tag in the HTML', async () => {
  for (const p of PAGES) {
    const html = await (await get(p)).text();
    assert.equal((html.match(/<script src="\/js\/consent\.js\?v=[^"]+" defer><\/script>/g) || []).length, 1, p);
    assert.match(html, /<a href="\/privacy" class="footer-link">Privacy<\/a>/, p);
    assert.match(html, /<button type="button" class="footer-link" data-cookie-choices aria-controls="cookie-consent" hidden>Cookie choices<\/button>/, p);
    assert.doesNotMatch(html, /googletagmanager\.com\/gtag|gtag\(|G-HF5TCJ4DKH/, p);
  }
});

// ---------- the browser script in a fake DOM ----------

function fakeEl(tag, doc) {
  const el = {
    tagName: tag.toUpperCase(), attrs: {}, children: [], listeners: {}, parentNode: null, textContent: '',
    setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'id') this.id = String(v); },
    getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
    hasAttribute(k) { return k in this.attrs; },
    removeAttribute(k) { delete this.attrs[k]; },
    appendChild(c) { c.parentNode = this; this.children.push(c); return c; },
    removeChild(c) { this.children = this.children.filter((x) => x !== c); c.parentNode = null; return c; },
    addEventListener(t, fn) { (this.listeners[t] ||= []).push(fn); },
    click() { for (const fn of this.listeners.click || []) fn({ currentTarget: this }); },
    focus() { doc.activeElement = this; },
  };
  return el;
}

function all(root) { return [root, ...root.children.flatMap(all)]; }

// Runs public/js/consent.js once, as if on a fresh page load.
async function runScript({ region = 'required', stored = null, path: pathname = '/', regionFails = false, storage } = {}) {
  const requests = [];
  const cookies = [];
  const doc = { activeElement: null };
  doc.head = fakeEl('head', doc);
  doc.body = fakeEl('body', doc);
  const footerBtn = fakeEl('button', doc);
  footerBtn.setAttribute('data-cookie-choices', '');
  footerBtn.setAttribute('hidden', '');
  footerBtn.textContent = 'Cookie choices';
  doc.body.appendChild(footerBtn);
  doc.createElement = (t) => fakeEl(t, doc);
  doc.getElementById = (id) => all(doc.head).concat(all(doc.body)).find((e) => e.id === id) || null;
  doc.querySelectorAll = (sel) => (sel === '[data-cookie-choices]' ? all(doc.body).filter((e) => e.hasAttribute('data-cookie-choices')) : []);
  Object.defineProperty(doc, 'cookie', { set(v) { cookies.push(v); }, get() { return ''; } });
  const store = storage || new Map(stored ? [['ee-analytics-consent-v1', stored]] : []);
  const win = {
    document: doc,
    location: { pathname, hostname: 'earnedescape.agency' },
    localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, v) },
    fetch: async (url) => {
      requests.push(String(url));
      if (regionFails) throw new Error('offline');
      return { ok: true, json: async () => ({ region }) };
    },
    Promise, Date, Object,
  };
  win.window = win;
  vm.runInNewContext(SCRIPT, win);
  for (let i = 0; i < 5; i++) await new Promise((r) => setImmediate(r));
  const googleScripts = () => all(doc.head).concat(all(doc.body)).filter((e) => e.tagName === 'SCRIPT' && /google/.test(e.src || ''));
  const googleRequests = () => requests.filter((u) => /google/.test(u)).concat(googleScripts().map((e) => e.src));
  const banner = () => doc.getElementById('cookie-consent');
  const button = (label) => all(banner()).find((e) => e.tagName === 'BUTTON' && e.textContent === label);
  return { win, doc, requests, cookies, store, footerBtn, googleScripts, googleRequests, banner, button };
}

test('EU/UK first visit: banner shows and nothing is requested from Google', async () => {
  const t = await runScript({ region: 'required' });
  assert.deepEqual(t.requests, ['/api/consent-region']);
  assert.deepEqual(t.googleRequests(), []);
  assert.equal(t.win.dataLayer, undefined);
  assert.equal(typeof t.win.gtag, 'undefined');
  assert.ok(t.banner(), 'banner shown');
  assert.equal(t.banner().attrs['aria-labelledby'], 'cookie-consent-title');
  assert.deepEqual(all(t.banner()).filter((e) => e.tagName === 'BUTTON').map((e) => e.textContent), ['Accept analytics', 'Reject analytics']);
  assert.equal(t.footerBtn.hasAttribute('hidden'), false, 'Cookie choices is revealed once the script runs');
  const link = all(t.banner()).find((e) => e.tagName === 'A');
  assert.equal(link.attrs.href, '/privacy');
  assert.equal(link.textContent, 'Privacy policy');
});

test('unknown country or a failed region lookup also asks first, with nothing from Google', async () => {
  const t = await runScript({ regionFails: true });
  assert.ok(t.banner());
  assert.deepEqual(t.googleRequests(), []);
});

test('Reject: GA stays off, the choice is stored, cookies are cleared, and the next page view still requests nothing', async () => {
  const t = await runScript({ region: 'required' });
  t.button('Reject analytics').click();
  assert.equal(t.banner(), null);
  assert.equal(t.store.get('ee-analytics-consent-v1'), 'denied');
  assert.equal(t.win['ga-disable-G-HF5TCJ4DKH'], true);
  assert.ok(t.cookies.some((c) => c.startsWith('_ga=; Max-Age=0')));
  assert.ok(t.cookies.some((c) => c.startsWith('_ga_HF5TCJ4DKH=; Max-Age=0')));
  assert.deepEqual(t.googleRequests(), []);
  const next = await runScript({ storage: t.store });
  assert.deepEqual(next.requests, [], 'a stored choice skips the region lookup');
  assert.deepEqual(next.googleRequests(), []);
  assert.equal(next.banner(), null);
});

test('Accept: gtag.js loads once, with advertising consent denied', async () => {
  const t = await runScript({ region: 'required' });
  assert.deepEqual(t.googleRequests(), []);
  t.button('Accept analytics').click();
  assert.equal(t.store.get('ee-analytics-consent-v1'), 'granted');
  assert.deepEqual(t.googleScripts().map((e) => e.src), ['https://www.googletagmanager.com/gtag/js?id=G-HF5TCJ4DKH']);
  // JSON round trip: objects made inside the vm have another realm's prototypes.
  const calls = JSON.parse(JSON.stringify(t.win.dataLayer.map((a) => Array.from(a))));
  assert.deepEqual(calls[0], ['consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' }]);
  assert.deepEqual(calls[2], ['config', 'G-HF5TCJ4DKH']);
  assert.equal(t.banner(), null);
});

test('Cookie choices reopens the banner, takes focus, and withdrawing consent stops GA and returns focus', async () => {
  const t = await runScript({ stored: 'granted' });
  assert.equal(t.googleScripts().length, 1);
  t.footerBtn.focus();
  t.footerBtn.click();
  assert.ok(t.banner());
  assert.equal(t.doc.activeElement, t.banner());
  t.button('Reject analytics').click();
  assert.equal(t.store.get('ee-analytics-consent-v1'), 'denied');
  assert.equal(t.win['ga-disable-G-HF5TCJ4DKH'], true);
  assert.deepEqual(JSON.parse(JSON.stringify(Array.from(t.win.dataLayer.at(-1)))), ['consent', 'update', { analytics_storage: 'denied' }]);
  assert.equal(t.doc.activeElement, t.footerBtn);
});

test('outside the consent region GA loads by default, still with advertising denied', async () => {
  const t = await runScript({ region: 'not-required' });
  assert.equal(t.banner(), null);
  assert.equal(t.googleScripts().length, 1);
  assert.equal(Array.from(t.win.dataLayer[0])[2].ad_storage, 'denied');
});

test('on an unsubscribe URL (it carries a signed token with the email address) the script does nothing, even outside the consent region', async () => {
  for (const p of ['/unsubscribe', '/unsubscribe/']) {
    const t = await runScript({ region: 'not-required', stored: 'granted', path: p });
    assert.deepEqual(t.requests, [], p);
    assert.deepEqual(t.googleRequests(), [], p);
    assert.equal(t.banner(), null, p);
  }
  const other = await runScript({ region: 'not-required', path: '/unsubscribed-tips' });
  assert.equal(other.googleScripts().length, 1, 'only the unsubscribe route is excluded');
});

test('banner copy has no em or en dashes', () => {
  assert.doesNotMatch(SCRIPT, /[\u2013\u2014]/);
});
