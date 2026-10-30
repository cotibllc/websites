// Consent-gated Google Analytics 4: the region rules, /api/consent-region,
// and the browser script run against a small fake DOM, so these tests prove
// that nothing is requested from Google before consent in the EU, EEA, UK
// and Switzerland, and that the DTNT token pages never load GA at all.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { startServer, createMockWorld } = require('./harness');
const consent = require('../lib/consent');

const ROOT = path.join(__dirname, '..');
const WWW = path.join(ROOT, 'www');
const SCRIPT = fs.readFileSync(path.join(WWW, 'js', 'consent-v1.js'), 'utf8');

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

test('the Measurement ID is the cotib.com GA4 property, the same in the server module and the browser script', () => {
  assert.equal(consent.GA_MEASUREMENT_ID, 'G-7C8Q4SNYQQ');
  assert.match(consent.GA_MEASUREMENT_ID, /^G-[A-Z0-9]{6,12}$/);
  assert.match(SCRIPT, new RegExp(`var GA_ID = '${consent.GA_MEASUREMENT_ID}';`));
  assert.match(SCRIPT, new RegExp(`var STORAGE_KEY = '${consent.CONSENT_STORAGE_KEY}';`));
  assert.equal((SCRIPT.match(/G-[A-Z0-9]{6,12}/g) || []).filter((id) => id !== consent.GA_MEASUREMENT_ID).length, 0);
});

// ---------- /api/consent-region and the pages ----------

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
const get = (p, headers = {}) => realFetch(base + p, { headers, redirect: 'manual' });

test('/api/consent-region answers per visitor and is never cached', async () => {
  for (const [country, want] of [['DE', 'required'], ['GB', 'required'], ['US', 'not-required'], [null, 'required']]) {
    const r = await get('/api/consent-region', country ? { 'x-vercel-ip-country': country } : {});
    assert.equal(r.status, 200);
    assert.deepEqual(await r.json(), { region: want }, String(country));
    assert.match(r.headers.get('cache-control'), /no-store/);
    assert.match(r.headers.get('cache-control'), /private/);
  }
  assert.equal((await realFetch(base + '/api/consent-region', { method: 'POST' })).status, 405);
});

const SITE_PAGES = ['/', '/services', '/ventures', '/about', '/contact', '/privacy', '/eula', '/connect', '/disconnect', '/do-the-next-thing', '/do-the-next-thing/privacy', '/no-such-page'];

test('every site page loads the consent script and has a hidden Cookie choices button, with no Google tag in the HTML', async () => {
  for (const p of SITE_PAGES) {
    const html = await (await get(p)).text();
    assert.equal((html.match(/<script src="\/js\/consent-v1\.js" defer><\/script>/g) || []).length, 1, p);
    assert.match(html, /<button type="button" data-cookie-choices aria-controls="cookie-consent" hidden[^>]*>Cookie choices<\/button>/, p);
    assert.doesNotMatch(html, /googletagmanager|google-analytics|gtag\(/, p);
  }
});

test('DTNT token pages (confirm, download, unsubscribe) carry no consent script, no Cookie choices and no Google tag', async () => {
  for (const p of ['/do-the-next-thing/free/confirm?t=bogus', '/do-the-next-thing/free/dl/bogus', '/do-the-next-thing/free/unsubscribe?t=bogus']) {
    const html = await (await get(p)).text();
    assert.doesNotMatch(html, /consent-v1\.js|data-cookie-choices|googletagmanager|gtag/, p);
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

// Runs consent-v1.js once, as if on a fresh page load.
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
  const store = storage || new Map(stored ? [['cotib-analytics-consent-v1', stored]] : []);
  const win = {
    document: doc,
    location: { pathname, hostname: 'www.cotib.com' },
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
  assert.equal(link.attrs.href, '/website-privacy');
  assert.equal(link.textContent, 'Website privacy');
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
  assert.equal(t.store.get('cotib-analytics-consent-v1'), 'denied');
  assert.equal(t.win['ga-disable-G-7C8Q4SNYQQ'], true);
  assert.ok(t.cookies.some((c) => c.startsWith('_ga=; Max-Age=0')));
  assert.ok(t.cookies.some((c) => c.startsWith('_ga_7C8Q4SNYQQ=; Max-Age=0')));
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
  assert.equal(t.store.get('cotib-analytics-consent-v1'), 'granted');
  assert.deepEqual(t.googleScripts().map((e) => e.src), ['https://www.googletagmanager.com/gtag/js?id=G-7C8Q4SNYQQ']);
  // JSON round trip: objects made inside the vm have another realm's prototypes.
  const calls = JSON.parse(JSON.stringify(t.win.dataLayer.map((a) => Array.from(a))));
  assert.deepEqual(calls[0], ['consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' }]);
  assert.deepEqual(calls[2], ['config', 'G-7C8Q4SNYQQ']);
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
  assert.equal(t.store.get('cotib-analytics-consent-v1'), 'denied');
  assert.equal(t.win['ga-disable-G-7C8Q4SNYQQ'], true);
  assert.deepEqual(JSON.parse(JSON.stringify(Array.from(t.win.dataLayer.at(-1)))), ['consent', 'update', { analytics_storage: 'denied' }]);
  assert.equal(t.doc.activeElement, t.footerBtn);
});

test('outside the consent region GA loads by default, still with advertising denied', async () => {
  const t = await runScript({ region: 'not-required' });
  assert.equal(t.banner(), null);
  assert.equal(t.googleScripts().length, 1);
  assert.equal(Array.from(t.win.dataLayer[0])[2].ad_storage, 'denied');
});

test('on a DTNT token URL the script does nothing, even outside the consent region', async () => {
  for (const p of ['/do-the-next-thing/free/confirm', '/do-the-next-thing/free/dl/abc', '/do-the-next-thing/free/unsubscribe', '/do-the-next-thing/free']) {
    const t = await runScript({ region: 'not-required', stored: 'granted', path: p });
    assert.deepEqual(t.requests, [], p);
    assert.deepEqual(t.googleRequests(), [], p);
    assert.equal(t.banner(), null, p);
  }
});

test('banner copy has no em or en dashes', () => {
  assert.doesNotMatch(SCRIPT, /[\u2013\u2014]/);
});
