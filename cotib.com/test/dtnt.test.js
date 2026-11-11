// Local tests for the Do the Next Thing free sampler. They run the real
// handlers behind test/harness.js with Resend and Turnstile mocked, so no
// email is sent and no key is needed.  Run:  npm run test:dtnt
// Case IDs: F11.x = setup addendum F11 free-path cases, F10.x = CAN-SPAM.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const SECRET = 'local-test-secret-0123456789abcdef0123456789';
const ENV = {
  RESEND_API_KEY: 'mock-send-key',
  RESEND_FULL_API_KEY: 'mock-full-key',
  DTNT_FREE_SEGMENT_ID: 'seg_mock_dtnt_free',
  DTNT_TOKEN_SECRET: SECRET,
  TURNSTILE_SECRET_KEY: 'mock-turnstile-secret',
};
Object.assign(process.env, ENV);

const { startServer, createMockWorld } = require('./harness');
const { createToken } = require('../lib/dtnt/tokens');
const ROOT = path.join(__dirname, '..');
const PDF = fs.readFileSync(path.join(ROOT, 'private', 'dtnt', 'do-the-next-thing-free-sampler-v2.pdf'));
const POSTAL = 'COTIB LLC, 155 Willowbrook Blvd, Ste 110 #2800, Wayne NJ 07470, United States';
const DASHES = /[\u2013\u2014]|&ndash;|&mdash;/;

let server, base, world;
const realFetch = globalThis.fetch;
let ipCounter = 1;

test.before(async () => {
  server = await startServer();
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => server.close());
test.beforeEach(() => {
  world = createMockWorld();
  globalThis.fetch = (url, opts) => (String(url).startsWith(base) ? realFetch(url, opts) : world.fetch(url, opts));
  Object.assign(process.env, ENV);
});

const ip = () => `198.51.100.${ipCounter++ % 250}`;

function signup(fields, { origin = base, json = true, xff = ip() } = {}) {
  const headers = { 'X-Forwarded-For': xff, Host: new URL(base).host };
  if (origin) headers.Origin = origin;
  if (json) { headers['Content-Type'] = 'application/json'; headers.Accept = 'application/json'; }
  else headers['Content-Type'] = 'application/x-www-form-urlencoded';
  const body = json ? JSON.stringify(fields) : new URLSearchParams(fields).toString();
  return realFetch(`${base}/do-the-next-thing/free`, { method: 'POST', headers, body, redirect: 'manual' });
}
const good = (email = 'reader@example.com') => ({ email, consent: true, turnstileToken: 'tok-pass', website: '' });
const get = (p, opts = {}) => realFetch(p.startsWith('http') ? p : base + p, { redirect: 'manual', ...opts });
const linkFrom = (text, re) => { const m = text.match(re); assert.ok(m, `link ${re} not found in:\n${text}`); return m[0]; };
const confirmLink = (e) => linkFrom(e.text, /http:\/\/127\.0\.0\.1:\d+\/do-the-next-thing\/free\/confirm\?t=[\w.\-]+/);
const dlLink = (e) => linkFrom(e.text, /http:\/\/127\.0\.0\.1:\d+\/do-the-next-thing\/free\/dl\/[\w.\-]+/);
const unsubLink = (e) => linkFrom(e.text, /http:\/\/127\.0\.0\.1:\d+\/do-the-next-thing\/free\/unsubscribe\?t=[\w.\-]+/);
const sends = () => world.calls.filter((c) => c.host === 'api.resend.com' && c.path === '/emails');

function withClock(offsetSeconds, fn) {
  const real = Date.now;
  Date.now = () => real() + offsetSeconds * 1000;
  return Promise.resolve(fn()).finally(() => { Date.now = real; });
}

async function confirmedReader(email = 'reader@example.com') {
  assert.equal((await signup(good(email))).status, 200);
  const res = await get(confirmLink(world.emails.at(-1)));
  assert.equal(res.status, 200);
  return world.emails.at(-1);
}

// ---------- Pages ----------
test('page: /do-the-next-thing is sampler-first with no buy buttons', async () => {
  const res = await get('/do-the-next-thing');
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /<form id="free-form" method="post" action="\/do-the-next-thing\/free"/);
  assert.match(html, /name="consent" type="checkbox" required>/);
  assert.doesNotMatch(html, /type="checkbox"[^>]*checked/);
  assert.match(html, /class="cf-turnstile" data-sitekey="0x4AAAAAAC2VHJDJh24KBJBW"/);
  assert.equal((html.match(/Coming soon<\/p>/g) || []).length, 2);
  assert.doesNotMatch(html, /stripe\.com|buy\.|checkout|Get the Pack/i);
  assert.match(html, /href="\/do-the-next-thing\/privacy"/);
  assert.doesNotMatch(html, DASHES);
  assert.doesNotMatch(html, /COTIB Adventures/);
});

test('page: /do-the-next-thing/privacy names Vercel, not the Worker, KV or R2', async () => {
  const res = await get('/do-the-next-thing/privacy');
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /<strong>Vercel:<\/strong> hosts this page and runs the signup, confirm, download, and unsubscribe service \(serverless functions\)/);
  assert.match(html, /<strong>Cloudflare:<\/strong> provides Turnstile\./);
  assert.doesNotMatch(html, /Workers|\bKV\b|\bR2\b/);
  // Only what the build does: no paid flow, no deletion or archive promises.
  assert.doesNotMatch(html, /Stripe|Link, LLC|When you buy|Paid download|Order records|7 years|180 days|3 years|deleted from Resend|one-way code only|counters: 24 hours|fresh link/i);
  assert.match(html, /keep your contact in Resend, marked unsubscribed, so we don't email you again\. We don't delete it\./);
  assert.match(html, /only added back after you click a new confirm link/);
  assert.match(html, /about 10 tries a minute from one connection\. That count is kept in memory for a minute and isn't saved\./);
  assert.match(html, /Unconfirmed signups: we don't store them\./);
  assert.match(html, /Effective October 29, 2026\./);
  assert.match(html, new RegExp(POSTAL.replace(/[.#]/g, '\\$&')));
  assert.doesNotMatch(html, DASHES);
});

test('page: the sampler PDF is not in the public folder', () => {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [e.name]));
  assert.deepEqual(walk(path.join(ROOT, 'www')).filter((f) => f.endsWith('.pdf')), []);
});

// ---------- F11 free path ----------
test('F11.1 signup sends one confirm email and adds nobody to the list yet', async () => {
  const res = await signup(good());
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.match(data.message, /^Check your email\. We sent a confirm link/);
  assert.equal(world.emails.length, 1);
  assert.equal(world.emails[0].subject, 'Confirm your email for the free Do the Next Thing prompts');
  assert.equal(world.contacts.size, 0, 'no contact before confirm (double opt-in)');
  const ts = world.calls.find((c) => c.host === 'challenges.cloudflare.com');
  assert.equal(ts.body.secret, 'mock-turnstile-secret');
  assert.ok(ts.body.remoteip);
  assert.equal(sends()[0].headers.Authorization, 'Bearer mock-send-key', 'sends use the sending key');
});

test('F11.1 confirm adds the contact to the DTNT segment, records consent, sends the delivery email, shows the download', async () => {
  await signup(good());
  const res = await get(confirmLink(world.emails[0]));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('cache-control'), 'no-store');
  const html = await res.text();
  assert.match(html, /You're confirmed\./);
  assert.match(html, /href="\/do-the-next-thing\/free\/dl\/d1\.[\w-]+">Download the free sampler/);
  const c = world.contacts.get('reader@example.com');
  assert.ok(c && c.segments.has('seg_mock_dtnt_free') && !c.unsubscribed);
  assert.equal(c.properties.dtnt_consent_version, 'dtnt-free-2026-10-07');
  assert.ok(c.properties.dtnt_confirmed_at && c.properties.dtnt_signed_up_at && c.properties.dtnt_ip_hash);
  const contactCall = world.calls.find((x) => x.path === '/contacts' && x.method === 'POST');
  assert.equal(contactCall.headers.Authorization, 'Bearer mock-full-key', 'contacts use the full-access key');
  assert.equal(world.emails.length, 2);
  assert.equal(world.emails[1].subject, 'Your 3 free Do the Next Thing prompts');
  assert.match(world.emails[1].idempotencyKey, /^dtnt-delivery-/);
});

test('F11.1 download link streams the PDF as an attachment, no-store', async () => {
  const delivery = await confirmedReader();
  const res = await get(dlLink(delivery));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'application/pdf');
  assert.match(res.headers.get('content-disposition'), /^attachment; filename="Do-the-Next-Thing-3-free-prompts\.pdf"$/);
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.ok(Buffer.from(await res.arrayBuffer()).equals(PDF));
});

test('F11.2 repeat confirm click shows the download again and sends nothing', async () => {
  await signup(good());
  const link = confirmLink(world.emails[0]);
  await get(link);
  const before = world.emails.length;
  const res = await get(link);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /Download the free sampler/);
  assert.equal(world.emails.length, before);
});

test('F11.2 repeat signup by a confirmed reader resends the delivery email, same reply', async () => {
  await confirmedReader();
  const before = world.emails.length;
  const res = await signup(good());
  assert.equal(res.status, 200);
  assert.match((await res.json()).message, /^Check your email\./);
  assert.equal(world.emails.length, before + 1);
  assert.equal(world.emails.at(-1).subject, 'Your 3 free Do the Next Thing prompts');
});

test('F11.2 repeat signup before confirming sends a fresh confirm link', async () => {
  await signup(good());
  await signup(good());
  assert.equal(world.emails.length, 2);
  assert.ok(world.emails.every((e) => e.subject.startsWith('Confirm your email')));
});

test('F11.3 expired confirm link (over 48 hours) shows the expired page and sends nothing', async () => {
  await signup(good());
  const link = confirmLink(world.emails[0]);
  await withClock(48 * 3600 + 60, async () => {
    const res = await get(link);
    assert.equal(res.status, 400);
    assert.match(await res.text(), /That confirm link has expired or was already used\./);
  });
  assert.equal(world.emails.length, 1);
  assert.equal(world.contacts.size, 0);
});

test('F11.3 tampered confirm and download tokens are rejected', async () => {
  await signup(good());
  const link = confirmLink(world.emails[0]);
  const bad = link.slice(0, -3) + (link.endsWith('AAA') ? 'BBB' : 'AAA');
  assert.equal((await get(bad)).status, 400);
  assert.equal((await get('/do-the-next-thing/free/confirm?t=nope')).status, 400);
  assert.equal((await get('/do-the-next-thing/free/dl/d1.nope')).status, 404);
  assert.equal((await get('/do-the-next-thing/free/dl/')).status, 404);
  // A confirm token can't be used as a download token.
  const t = new URL(link).searchParams.get('t');
  assert.equal((await get(`/do-the-next-thing/free/dl/${t}`)).status, 404);
});

test('F11.3 download link expires after 30 days', async () => {
  const delivery = await confirmedReader();
  const link = dlLink(delivery);
  await withClock(30 * 86400 + 60, async () => {
    const res = await get(link);
    assert.equal(res.status, 410);
    assert.match(await res.text(), /That download link has expired\./);
  });
});

test('F11.3 no guessable public URL for the PDF', async () => {
  for (const p of ['/private/dtnt/do-the-next-thing-free-sampler-v2.pdf', '/do-the-next-thing-free-sampler-v2.pdf', '/dtnt/do-the-next-thing-free-sampler-v2.pdf', '/api/dtnt/download']) {
    const res = await get(p);
    assert.notEqual(res.status, 200, p);
  }
});

test('F11.4 unsubscribe from the confirm email: GET asks, POST marks the contact unsubscribed, old confirm link is dead', async () => {
  await signup(good());
  const link = unsubLink(world.emails[0]);
  const ask = await get(link);
  assert.equal(ask.status, 200);
  assert.match(await ask.text(), /Unsubscribe from Do the Next Thing emails\?/);
  assert.equal(world.contacts.size, 0, 'GET changes nothing');
  const t = new URL(link).searchParams.get('t');
  const done = await get('/do-the-next-thing/free/unsubscribe', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `t=${t}` });
  assert.equal(done.status, 200);
  assert.match(await done.text(), /You're unsubscribed\./);
  assert.equal(world.contacts.get('reader@example.com').unsubscribed, true);
  const before = world.emails.length;
  // The confirm link from before the unsubscribe no longer adds them back.
  const c = await get(confirmLink(world.emails[0]));
  assert.equal(c.status, 400);
  assert.equal(world.emails.length, before);
  assert.equal(world.contacts.get('reader@example.com').unsubscribed, true);
});

test('F11.4 re-signup after unsubscribe: stays unsubscribed until a fresh confirm click, never deleted', async () => {
  const delivery = await confirmedReader();
  const oldConfirm = confirmLink(world.emails[0]);
  const t = new URL(unsubLink(delivery)).searchParams.get('t');
  assert.equal((await get('/do-the-next-thing/free/unsubscribe', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `t=${t}` })).status, 200);
  const contact = () => world.contacts.get('reader@example.com');
  assert.equal(contact().unsubscribed, true);
  const id = contact().id;

  // Signing up again sends only a confirm email and changes nothing in Resend.
  const writesBefore = world.calls.filter((x) => x.host === 'api.resend.com' && x.path.startsWith('/contacts') && x.method !== 'GET').length;
  const before = world.emails.length;
  const again = await signup(good());
  assert.equal(again.status, 200);
  assert.match((await again.json()).message, /^Check your email\./, 'same reply, so the list stays private');
  assert.equal(world.emails.length, before + 1);
  assert.equal(world.emails.at(-1).subject, 'Confirm your email for the free Do the Next Thing prompts');
  assert.equal(contact().unsubscribed, true, 're-signup alone does not resubscribe');
  assert.equal(world.calls.filter((x) => x.host === 'api.resend.com' && x.path.startsWith('/contacts') && x.method !== 'GET').length, writesBefore, 'signup writes nothing to Resend');
  const freshConfirm = confirmLink(world.emails.at(-1));

  // A confirm link issued before the unsubscribe still can't flip it back.
  assert.equal((await get(oldConfirm)).status, 400);
  assert.equal(contact().unsubscribed, true);
  assert.equal(world.emails.length, before + 1);

  // The fresh double opt-in click resubscribes the same contact.
  const res = await get(freshConfirm);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /You're confirmed\./);
  assert.equal(contact().id, id, 'same contact, not recreated');
  assert.equal(contact().unsubscribed, false);
  assert.ok(contact().segments.has('seg_mock_dtnt_free'));
  assert.equal(world.emails.at(-1).subject, 'Your 3 free Do the Next Thing prompts');
  assert.equal(world.calls.filter((x) => x.method === 'DELETE').length, 0, 'nothing is ever deleted');
});

test('F11.4 unsubscribe from the delivery email, including RFC 8058 one-click', async () => {
  const delivery = await confirmedReader();
  const t = new URL(unsubLink(delivery)).searchParams.get('t');
  const res = await get(`/do-the-next-thing/free/unsubscribe?t=${t}`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'List-Unsubscribe=One-Click' });
  assert.equal(res.status, 200);
  assert.equal(world.contacts.get('reader@example.com').unsubscribed, true);
  assert.equal((await get('/do-the-next-thing/free/unsubscribe?t=garbage')).status, 400);
});

test('F11.5 paid purchase stopping the sequence: not applicable (no paid flow, no follow-ups in this PR)', { skip: 'paid checkout and the 3 follow-ups are out of scope' }, () => {});

test('F11.6 Turnstile failure, missing token and wrong hostname all fail with the approved message', async () => {
  for (const mode of ['fail', 'badhost']) {
    world.turnstile = mode;
    const res = await signup(good());
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error, "We couldn't confirm you're human. Refresh the page and try again.");
  }
  world.turnstile = 'pass';
  const res = await signup({ ...good(), turnstileToken: '' });
  assert.equal(res.status, 400);
  assert.equal(world.emails.length, 0);
});

// Capture the JSON log lines a handler writes while fn runs.
async function captureLogs(fn) {
  const lines = [];
  const orig = console.log;
  console.log = (...a) => { lines.push(a.join(' ')); };
  try { await fn(); } finally { console.log = orig; }
  return lines.map((l) => { try { return JSON.parse(l); } catch { return { raw: l }; } });
}

test('Turnstile failures each get their own code and message, and the log carries Cloudflare error-codes', async () => {
  const cases = [
    { mode: 'fail', status: 400, code: 'turnstile', reason: 'failed', codes: ['invalid-input-response'], msg: "We couldn't confirm you're human. Refresh the page and try again." },
    { mode: 'badsecret', status: 503, code: 'turnstile_config', reason: 'config', codes: ['invalid-input-secret'], msg: "Signup isn't working on our end right now. Try again later, or email customerservice@cotib.com." },
    { mode: 'expired', status: 400, code: 'turnstile_expired', reason: 'expired', codes: ['timeout-or-duplicate'], msg: 'The human check timed out. Wait for it to say Success again, then send.' },
    { mode: 'down', status: 502, code: 'turnstile_unavailable', reason: 'unreachable', codes: [], msg: "We couldn't reach the human check just now. Wait a minute and try again." },
    { mode: 'badhost', status: 400, code: 'turnstile', reason: 'hostname', codes: [], msg: "We couldn't confirm you're human. Refresh the page and try again.", hostname: 'evil.example' },
  ];
  for (const c of cases) {
    world.turnstile = c.mode;
    let res, data;
    const logs = await captureLogs(async () => { res = await signup(good()); data = await res.json(); });
    assert.equal(res.status, c.status, c.mode);
    assert.deepEqual({ code: data.code, error: data.error }, { code: c.code, error: c.msg }, c.mode);
    const line = logs.find((l) => l.event === 'dtnt.signup.turnstile_failed');
    assert.ok(line, `${c.mode}: no turnstile_failed log line`);
    assert.equal(line.reason, c.reason, c.mode);
    assert.deepEqual(line.errorCodes, c.codes, c.mode);
    if (c.hostname) assert.equal(line.hostname, c.hostname);
    const all = JSON.stringify(logs);
    assert.ok(!all.includes('mock-turnstile-secret'), `${c.mode}: secret leaked into the log`);
    assert.ok(!all.includes('tok-pass'), `${c.mode}: token leaked into the log`);
    assert.ok(!all.includes('reader@example.com'), `${c.mode}: email leaked into the log`);
  }
  assert.equal(world.emails.length, 0);
});

test('siteverify gets the trimmed secret and the CF-Connecting-IP visitor address', async () => {
  process.env.TURNSTILE_SECRET_KEY = '  mock-turnstile-secret\n';
  const res = await realFetch(`${base}/do-the-next-thing/free`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', Origin: base, Host: new URL(base).host, 'X-Forwarded-For': '172.70.1.1', 'CF-Connecting-IP': '203.0.113.9' },
    body: JSON.stringify(good()),
  });
  assert.equal(res.status, 200);
  const ts = world.calls.find((c) => c.host === 'challenges.cloudflare.com');
  assert.equal(ts.body.secret, 'mock-turnstile-secret');
  assert.equal(ts.body.remoteip, '203.0.113.9');
});

test('a bad Origin gets its own message and a log line naming the Origin and host it saw', async () => {
  let r, d;
  const logs = await captureLogs(async () => { r = await signup(good(), { origin: 'https://evil.example' }); d = await r.json(); });
  assert.equal(r.status, 403);
  assert.deepEqual(d, { error: 'This form only works on www.cotib.com. Open www.cotib.com/do-the-next-thing and try again.', code: 'origin' });
  const line = logs.find((l) => l.event === 'dtnt.signup.bad_origin');
  assert.equal(line.origin, 'https://evil.example');
  assert.equal(line.requestHost, new URL(base).host);
  const none = await captureLogs(async () => { await signup(good(), { origin: null }); });
  assert.equal(none.find((l) => l.event === 'dtnt.signup.bad_origin').origin, '(none)');
});

test('form checks: bad email, box not checked, bad origin, honeypot, too many tries', async () => {
  let r = await signup({ ...good(), email: 'not-an-email' });
  assert.equal(r.status, 400);
  assert.equal((await r.json()).error, "That email address doesn't look right. Check it and try again.");
  r = await signup({ ...good(), consent: false });
  assert.equal(r.status, 400);
  assert.equal((await r.json()).error, 'Check the box so we can email you the sampler.');
  r = await signup(good(), { origin: 'https://evil.example' });
  assert.equal(r.status, 403);
  r = await signup(good(), { origin: null });
  assert.equal(r.status, 403);
  r = await signup({ ...good(), website: 'http://spam' });
  assert.equal(r.status, 200);
  assert.equal(world.emails.length, 0, 'honeypot sends nothing');
  const xff = '203.0.113.77';
  const codes = [];
  for (let i = 0; i < 12; i++) codes.push((await signup({ ...good(), email: 'x' }, { xff })).status);
  assert.equal(codes.at(-1), 429);
});

test('no-JS form post gets an HTML page with the same message', async () => {
  const res = await signup({ email: 'reader@example.com', consent: 'on', 'cf-turnstile-response': 'tok' }, { json: false });
  assert.equal(res.status, 200);
  assert.match(await res.text(), /Check your email\./);
});

test('fails closed when any env var is missing, before calling anyone', async () => {
  for (const k of Object.keys(ENV)) {
    world.calls.length = 0;
    const saved = process.env[k];
    delete process.env[k];
    const r = await signup(good());
    assert.equal(r.status, 503, `signup without ${k}`);
    assert.match((await r.json()).error, /isn't available right now/);
    assert.equal(world.calls.length, 0);
    process.env[k] = saved;
  }
  const saved = process.env.DTNT_TOKEN_SECRET;
  process.env.DTNT_TOKEN_SECRET = 'short';
  assert.equal((await signup(good())).status, 503);
  assert.equal((await get('/do-the-next-thing/free/confirm?t=x')).status, 503);
  assert.equal((await get('/do-the-next-thing/free/dl/x')).status, 503);
  assert.equal((await get('/do-the-next-thing/free/unsubscribe?t=x')).status, 503);
  process.env.DTNT_TOKEN_SECRET = saved;
});

test('a Resend send failure returns the retry message', async () => {
  world.failSend = true;
  const r = await signup(good());
  assert.equal(r.status, 502);
  assert.equal((await r.json()).error, "We couldn't send the email just now. Wait a minute and try again.");
});

test('missing consent properties in Resend do not block the sampler', async () => {
  world.propertiesExist = false;
  await signup(good());
  const res = await get(confirmLink(world.emails[0]));
  assert.equal(res.status, 200);
  assert.equal(world.emails.length, 2);
});

test('tokens keep the email address out of URLs', async () => {
  await signup(good('private.person@example.com'));
  const e = world.emails[0];
  for (const link of [confirmLink(e), unsubLink(e)]) {
    const t = decodeURIComponent(new URL(link).searchParams.get('t'));
    assert.doesNotMatch(t, /private/);
    assert.doesNotMatch(Buffer.from(t.slice(3), 'base64url').toString('latin1'), /private\.person/);
  }
});

// ---------- F10 CAN-SPAM, on every email this flow sends ----------
test('F10 every email: accurate From and Reply-To, subject, postal address, working unsubscribe, one-click headers', async () => {
  const delivery = await confirmedReader();
  const all = [world.emails[0], delivery];
  for (const e of all) {
    assert.equal(e.from, 'COTIB LLC <no-reply@cotib.com>', 'F10.1 From');
    assert.equal(e.reply_to, 'customerservice@cotib.com', 'F10.1 Reply-To');
    assert.ok(['Confirm your email for the free Do the Next Thing prompts', 'Your 3 free Do the Next Thing prompts'].includes(e.subject), 'F10.2 subject says what is inside');
    assert.ok(e.html.includes(POSTAL) && e.text.includes(POSTAL), 'F10.4 postal address in HTML and text');
    assert.match(e.html, /<a href="http[^"]+\/do-the-next-thing\/free\/unsubscribe\?t=[^"]+"[^>]*>Unsubscribe<\/a>/, 'F10.5 unsubscribe in HTML');
    assert.match(e.text, /Unsubscribe: http\S+\/do-the-next-thing\/free\/unsubscribe\?t=/, 'F10.5 unsubscribe in text');
    assert.match(e.headers['List-Unsubscribe'], /^<http[^>]+unsubscribe\?t=[^>]+>, <mailto:customerservice@cotib\.com\?subject=Unsubscribe>$/);
    assert.equal(e.headers['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click');
    assert.doesNotMatch(e.html + e.text + e.subject, DASHES, 'house rule: no em or en dashes');
    assert.doesNotMatch(e.html + e.text, /COTIB Adventures/);
  }
});

test('F10.5 unsubscribe link still works more than 30 days after the email, and asks for nothing but a click', async () => {
  await signup(good());
  const link = unsubLink(world.emails[0]);
  await withClock(400 * 86400, async () => {
    const ask = await get(link);
    assert.equal(ask.status, 200);
    const html = await ask.text();
    assert.doesNotMatch(html, /type="(email|password|text)"/, 'no extra info asked');
  });
});

test('F10.6 unsubscribed addresses are not sent anywhere else (only Resend is ever called)', async () => {
  await confirmedReader();
  const hosts = new Set(world.calls.map((c) => c.host));
  assert.deepEqual([...hosts].sort(), ['api.resend.com', 'challenges.cloudflare.com']);
});

// ---------- Entry points: the sampler page is reachable from the site ----------
test('the homepage and /ventures link to /do-the-next-thing, and nothing links the old /resend', () => {
  const www = path.join(ROOT, 'www');
  const index = fs.readFileSync(path.join(www, 'index.html'), 'utf8');
  const ventures = fs.readFileSync(path.join(www, 'ventures.html'), 'utf8');
  assert.match(index, /<a href="\/do-the-next-thing"[^>]*>New: Do the Next Thing, 3 free prompts/);
  assert.match(ventures, /<section[^>]*id="products"[\s\S]*?<a href="\/do-the-next-thing#free"[^>]*>Get the 3 free prompts<\/a>/);
  for (const f of fs.readdirSync(www).filter((n) => n.endsWith('.html'))) {
    assert.doesNotMatch(fs.readFileSync(path.join(www, f), 'utf8'), /href="[^"]*do-the-next-thing\/resend/, f);
  }
});

// ---------- Signup source (UTM) ----------
// The page copies utm_source, utm_medium and utm_campaign into hidden fields;
// signup carries them in the confirm token; confirm writes them to the Resend
// contact in a call of their own. Missing values are 'direct'.
const { cleanUtm } = require('../lib/dtnt/utm');
const { readToken } = require('../lib/dtnt/tokens');
const TODAY_UTM = { utm_source: 'substack', utm_medium: 'social', utm_campaign: 'dtnt-sampler' };
const propertyPatches = () => world.calls.filter((c) => c.host === 'api.resend.com' && c.method === 'PATCH' && c.body && c.body.properties)
  .map((c) => ({ method: c.method, path: c.path, body: c.body }));
const tokenOf = (link) => readToken('confirm', new URL(link).searchParams.get('t')).data;

test('UTM: cleanUtm trims, lowercases, keeps only safe characters, caps at 100, else direct', () => {
  const cases = [
    ['substack', 'substack'],
    ['  LinkedIn ', 'linkedin'],
    ['dtnt-sampler', 'dtnt-sampler'],
    ['Spring Promo+2026', 'spring-promo-2026'],
    ['news_letter.v2', 'news_letter.v2'],
    ['<script>alert(1)</script>', 'scriptalert1script'],
    ['"; DROP TABLE x; --', 'drop-table-x'],
    ['%%%', 'direct'],
    ['', 'direct'],
    ['   ', 'direct'],
    [undefined, 'direct'],
    [null, 'direct'],
    [42, 'direct'],
    [['substack'], 'direct'],
  ];
  for (const [input, want] of cases) assert.equal(cleanUtm(input), want, JSON.stringify(input));
  assert.equal(cleanUtm('a'.repeat(500)), 'a'.repeat(100));
});

test('UTM: ?utm_source=substack&utm_medium=social&utm_campaign=dtnt-sampler is written to the Resend contact on confirm', async (t) => {
  const res = await signup({ ...good(), ...TODAY_UTM });
  assert.equal(res.status, 200);
  assert.equal(world.contacts.size, 0, 'still no contact before confirm');
  const link = confirmLink(world.emails[0]);
  const d = tokenOf(link);
  assert.deepEqual({ us: d.us, um: d.um, uc: d.uc }, { us: 'substack', um: 'social', uc: 'dtnt-sampler' });
  assert.equal((await get(link)).status, 200);
  const patches = propertyPatches();
  t.diagnostic(`payloads: ${JSON.stringify(patches)}`);
  assert.equal(patches.length, 2, 'consent call, then UTM call');
  assert.deepEqual(patches[1], {
    method: 'PATCH',
    path: '/contacts/reader%40example.com',
    body: { properties: { dtnt_utm_source: 'substack', dtnt_utm_medium: 'social', dtnt_utm_campaign: 'dtnt-sampler' } },
  });
  assert.deepEqual(Object.keys(patches[0].body.properties), ['dtnt_consent_version', 'dtnt_signed_up_at', 'dtnt_confirmed_at', 'dtnt_ip_hash'], 'consent call unchanged');
  const c = world.contacts.get('reader@example.com');
  assert.ok(c.segments.has('seg_mock_dtnt_free'), 'contact is in the DTNT free segment');
  assert.equal(c.properties.dtnt_utm_source, 'substack');
  assert.equal(c.properties.dtnt_utm_medium, 'social');
  assert.equal(c.properties.dtnt_utm_campaign, 'dtnt-sampler');
});

test('UTM: utm_source=linkedin is recorded the same way', async () => {
  await signup({ ...good('li@example.com'), ...TODAY_UTM, utm_source: 'linkedin' });
  await get(confirmLink(world.emails[0]));
  assert.deepEqual(propertyPatches()[1].body.properties, { dtnt_utm_source: 'linkedin', dtnt_utm_medium: 'social', dtnt_utm_campaign: 'dtnt-sampler' });
});

test('UTM: no UTM fields (or empty hidden fields) gives direct for all three', async (t) => {
  for (const [i, extra] of [{}, { utm_source: '', utm_medium: '', utm_campaign: '' }].entries()) {
    world = createMockWorld();
    const email = `nosource${i}@example.com`;
    await signup({ ...good(email), ...extra });
    await get(confirmLink(world.emails[0]));
    const patches = propertyPatches();
    t.diagnostic(`payloads (${i ? 'empty fields' : 'no fields'}): ${JSON.stringify(patches[1])}`);
    assert.deepEqual(patches[1], {
      method: 'PATCH',
      path: `/contacts/${encodeURIComponent(email)}`,
      body: { properties: { dtnt_utm_source: 'direct', dtnt_utm_medium: 'direct', dtnt_utm_campaign: 'direct' } },
    });
  }
});

test('UTM: the no-JS urlencoded form post carries the hidden fields too', async () => {
  const res = await signup({ email: 'nojs@example.com', consent: 'on', 'cf-turnstile-response': 'tok-pass', website: '', ...TODAY_UTM }, { json: false });
  assert.equal(res.status, 200);
  await get(confirmLink(world.emails[0]));
  assert.deepEqual(propertyPatches()[1].body.properties, { dtnt_utm_source: 'substack', dtnt_utm_medium: 'social', dtnt_utm_campaign: 'dtnt-sampler' });
});

test('UTM: hostile or oversized values are cleaned, and the confirm token stays under its size cap', async () => {
  const email = `${'x'.repeat(240)}@example.com`;
  const big = 'A'.repeat(1000);
  await signup({ ...good(email), utm_source: big, utm_medium: '<img src=x onerror=alert(1)>', utm_campaign: big });
  const link = confirmLink(world.emails[0]);
  assert.ok(new URL(link).searchParams.get('t').length < 1500, 'token under MAX_TOKEN_LENGTH');
  assert.equal((await get(link)).status, 200);
  assert.deepEqual(propertyPatches()[1].body.properties, { dtnt_utm_source: 'a'.repeat(100), dtnt_utm_medium: 'img-srcx-onerroralert1', dtnt_utm_campaign: 'a'.repeat(100) });
});

test('UTM: if the UTM property keys are missing in Resend, confirm still succeeds, consent is kept and the sampler goes out', async () => {
  world.missingProperties = new Set(['dtnt_utm_source', 'dtnt_utm_medium', 'dtnt_utm_campaign']);
  await signup({ ...good(), ...TODAY_UTM });
  let res;
  const logs = await captureLogs(async () => { res = await get(confirmLink(world.emails[0])); });
  assert.equal(res.status, 200);
  assert.match(await res.text(), /You're confirmed\./);
  assert.equal(world.emails.length, 2, 'delivery email sent');
  const c = world.contacts.get('reader@example.com');
  assert.equal(c.properties.dtnt_consent_version, 'dtnt-free-2026-10-07', 'consent recorded');
  assert.equal(c.properties.dtnt_utm_source, undefined);
  const line = logs.find((l) => l.event === 'dtnt.confirm.utm_properties_failed');
  assert.ok(line, 'logged');
  assert.match(line.error, /Resend contact properties failed \(422\)/);
  assert.ok(!logs.some((l) => l.event === 'dtnt.confirm.consent_properties_failed'));
});

test('UTM: a confirm link issued before this change (no UTM in the token) records direct', async () => {
  const t = createToken('confirm', { e: 'old@example.com', cv: 'dtnt-free-2026-10-07', ch: 'x', sa: new Date().toISOString(), ih: 'h', uh: 'u' }, 3600);
  assert.equal((await get(`/do-the-next-thing/free/confirm?t=${t}`)).status, 200);
  assert.deepEqual(propertyPatches()[1].body.properties, { dtnt_utm_source: 'direct', dtnt_utm_medium: 'direct', dtnt_utm_campaign: 'direct' });
});

test('UTM: the signup and consent log lines carry the cleaned source, never the raw value', async () => {
  let logs = await captureLogs(() => signup({ ...good(), utm_source: ' SubStack ', utm_medium: 'social', utm_campaign: 'dtnt-sampler' }));
  const sent = logs.find((l) => l.event === 'dtnt.signup.confirm_sent');
  assert.equal(sent.utm_source, 'substack');
  logs = await captureLogs(() => get(confirmLink(world.emails[0])));
  const consent = logs.find((l) => l.event === 'dtnt.consent');
  assert.equal(consent.dtnt_utm_source, 'substack');
  assert.equal(consent.dtnt_utm_campaign, 'dtnt-sampler');
});

// The page script, run in jsdom against the committed page.
const { JSDOM } = require('jsdom');
function loadPage(search) {
  const html = fs.readFileSync(path.join(ROOT, 'www', 'do-the-next-thing.html'), 'utf8');
  const dom = new JSDOM(html, { url: `https://www.cotib.com/do-the-next-thing${search}`, runScripts: 'outside-only' });
  const posted = [];
  dom.window.fetch = async (url, opts) => { posted.push({ url, body: JSON.parse(opts.body) }); return { ok: true, json: async () => ({ ok: true, message: 'ok' }) }; };
  // jsdom has no named form properties (form.email in a browser), so add the
  // three the script reads. Real browsers are checked with Playwright in the PR.
  const form = dom.window.document.getElementById('free-form');
  for (const n of ['email', 'consent', 'website']) Object.defineProperty(form, n, { get: () => form.elements.namedItem(n) });
  dom.window.eval(fs.readFileSync(path.join(ROOT, 'www', 'dtnt', 'signup.js'), 'utf8'));
  return { dom, doc: dom.window.document, posted };
}
async function submitForm({ dom, doc }) {
  const form = doc.getElementById('free-form');
  doc.getElementById('free-email').value = 'reader@example.com';
  doc.getElementById('free-consent').checked = true;
  const ts = doc.createElement('input');
  ts.type = 'hidden'; ts.name = 'cf-turnstile-response'; ts.value = 'tok-pass';
  form.appendChild(ts);
  form.dispatchEvent(new dom.window.Event('submit', { cancelable: true }));
  await new Promise((r) => setTimeout(r, 20));
}
const hidden = (doc) => ['source', 'medium', 'campaign'].map((k) => doc.getElementById(`free-utm-${k}`).value);

test('UTM page: the hidden fields exist inside #free-form and start empty', () => {
  const { doc } = loadPage('');
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign']) {
    const input = doc.querySelector(`#free-form input[type="hidden"][name="${k}"]`);
    assert.ok(input, k);
  }
});

test('UTM page: the script fills the hidden fields from the URL and posts them with the signup', async (t) => {
  const page = loadPage('?utm_source=substack&utm_medium=social&utm_campaign=dtnt-sampler');
  assert.deepEqual(hidden(page.doc), ['substack', 'social', 'dtnt-sampler']);
  await submitForm(page);
  t.diagnostic(`browser body: ${JSON.stringify(page.posted[0].body)}`);
  assert.equal(page.posted.length, 1);
  assert.deepEqual(page.posted[0].body, { email: 'reader@example.com', consent: true, turnstileToken: 'tok-pass', website: '', ...TODAY_UTM });
});

test('UTM page: with no UTM in the URL the fields stay empty and the server turns them into direct', async () => {
  const page = loadPage('?ref=x');
  assert.deepEqual(hidden(page.doc), ['', '', '']);
  await submitForm(page);
  assert.deepEqual(page.posted[0].body, { email: 'reader@example.com', consent: true, turnstileToken: 'tok-pass', website: '', utm_source: '', utm_medium: '', utm_campaign: '' });
});

test('UTM page: the build script writes the same hidden fields as the committed page', () => {
  const script = fs.readFileSync(path.join(ROOT, 'scripts', 'build-dtnt-pages.js'), 'utf8');
  for (const k of ['source', 'medium', 'campaign']) {
    assert.match(script, new RegExp(`<input type="hidden" id="free-utm-${k}" name="utm_${k}" value="">`));
  }
});
