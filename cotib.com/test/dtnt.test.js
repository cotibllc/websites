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
const tipsData = require('../lib/dtnt/tips');
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
const unsubLink = (e) => linkFrom(e.text, /http:\/\/127\.0\.0\.1:\d+\/do-the-next-thing\/free\/unsubscribe\?t=[\w.\-]+/);
const sends = () => world.calls.filter((c) => c.host === 'api.resend.com' && c.path === '/emails');

function withClock(offsetSeconds, fn) {
  const real = Date.now;
  Date.now = () => real() + offsetSeconds * 1000;
  return Promise.resolve(fn()).finally(() => { Date.now = real; });
}

// The confirm click sends Tip 1 and schedules Tips 2 and 3. tipEmail(n) is the
// email for tip n; tip1 is the one with no scheduled_at.
const tipEmail = (n) => world.emails.find((e) => e.subject === tipsData.TIPS[n - 1].subject);
const SUBJECT_TIP1 = tipsData.TIPS[0].subject;

async function confirmedReader(email = 'reader@example.com') {
  assert.equal((await signup(good(email))).status, 200);
  const res = await get(confirmLink(world.emails.at(-1)));
  assert.equal(res.status, 200);
  return tipEmail(1);
}

// ---------- Pages ----------
test('page: /do-the-next-thing is sampler-first with no buy buttons', async () => {
  const res = await get('/do-the-next-thing');
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /<form id="free-form" method="post" action="\/do-the-next-thing\/free"/);
  assert.match(html, /name="consent" type="checkbox" required>/);
  assert.match(html, /name="marketing_consent" type="checkbox">/, 'optional paid-products box, not required');
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
  assert.match(html, /Effective November 17, 2026\./);
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
  assert.equal(world.emails[0].subject, 'Confirm your email for the free Do the Next Thing coaching tips');
  assert.equal(world.contacts.size, 0, 'no contact before confirm (double opt-in)');
  const ts = world.calls.find((c) => c.host === 'challenges.cloudflare.com');
  assert.equal(ts.body.secret, 'mock-turnstile-secret');
  assert.ok(ts.body.remoteip);
  assert.equal(sends()[0].headers.Authorization, 'Bearer mock-send-key', 'sends use the sending key');
});

test('F11.1 confirm adds the contact to the DTNT segment, records consent, starts the tip series, links the tips page', async () => {
  await signup(good());
  const res = await get(confirmLink(world.emails[0]));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('cache-control'), 'no-store');
  const html = await res.text();
  assert.match(html, /You're confirmed\./);
  assert.match(html, /You're on the list\. Tip 1 is in your inbox now\. Tip 2 arrives on day 3 and Tip 3 on day 7\./);
  assert.match(html, /<a class="btn btn-primary" href="\/do-the-next-thing\/tips">Read all three tips<\/a>/);
  assert.doesNotMatch(html, /sampler|3 prompts|\/free\/dl\//, 'the confirmed page no longer offers the PDF');
  const c = world.contacts.get('reader@example.com');
  assert.ok(c && c.segments.has('seg_mock_dtnt_free') && !c.unsubscribed);
  assert.equal(c.properties.dtnt_consent_version, 'dtnt-tips-2026-11-17');
  assert.ok(c.properties.dtnt_confirmed_at && c.properties.dtnt_signed_up_at && c.properties.dtnt_ip_hash);
  const contactCall = world.calls.find((x) => x.path === '/contacts' && x.method === 'POST');
  assert.equal(contactCall.headers.Authorization, 'Bearer mock-full-key', 'contacts use the full-access key');
  // Confirm email, then Tips 2 and 3 (scheduled), then Tip 1 (immediate).
  assert.equal(world.emails.length, 4);
  assert.deepEqual(world.emails.slice(1).map((e) => e.subject), [tipsData.TIPS[1].subject, tipsData.TIPS[2].subject, tipsData.TIPS[0].subject]);
  assert.match(tipEmail(1).idempotencyKey, /^dtnt-tip1-/);
  assert.match(tipEmail(2).idempotencyKey, /^dtnt-tip2-/);
  assert.match(tipEmail(3).idempotencyKey, /^dtnt-tip3-/);
});

// The sampler PDF is no longer linked from any page or email. The endpoint
// stays for links already issued, so it is tested with a minted token.
const oldDownloadLink = (ttl = 30 * 86400) => `/do-the-next-thing/free/dl/${createToken('download', { eh: 'abc' }, ttl)}`;

test('F11.1 an already issued download link still streams the PDF as an attachment, no-store', async () => {
  const res = await get(oldDownloadLink());
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'application/pdf');
  assert.match(res.headers.get('content-disposition'), /^attachment; filename="Do-the-Next-Thing-3-free-prompts\.pdf"$/);
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.ok(Buffer.from(await res.arrayBuffer()).equals(PDF));
});

test('F11.2 repeat confirm click shows the confirmed page again and sends nothing', async () => {
  await signup(good());
  const link = confirmLink(world.emails[0]);
  await get(link);
  const before = world.emails.length;
  const res = await get(link);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /You're on the list\./);
  assert.equal(world.emails.length, before);
});

test('F11.2 repeat signup by a confirmed reader gets the already-on-the-list note (no tip), same reply', async () => {
  await confirmedReader();
  const before = world.emails.length;
  const res = await signup(good());
  assert.equal(res.status, 200);
  assert.match((await res.json()).message, /^Check your email\./);
  assert.equal(world.emails.length, before + 1);
  const note = world.emails.at(-1);
  assert.equal(note.subject, "You're already on the list for the Do the Next Thing coaching tips");
  assert.equal(note.scheduled_at, undefined, 'sent now, not scheduled');
  assert.ok(!tipsData.TIPS.some((t) => t.subject === note.subject), 'no tip is re-sent, so the 3 and 7 day timing holds');
  assert.equal(world.emails.filter((e) => e.subject === SUBJECT_TIP1).length, 1);
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
  const link = oldDownloadLink();
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
  assert.equal(world.emails.at(-1).subject, 'Confirm your email for the free Do the Next Thing coaching tips');
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
  assert.equal(world.emails.at(-1).subject, SUBJECT_TIP1, 'a fresh confirm starts the series again with Tip 1');
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
  assert.equal((await r.json()).error, 'Check the box so we can email you the coaching tips.');
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

test('missing properties in Resend do not block the confirm page or Tip 1, and nothing is left scheduled that unsubscribe could not stop', async () => {
  world.propertiesExist = false;
  await signup(good());
  const res = await get(confirmLink(world.emails[0]));
  assert.equal(res.status, 200);
  assert.ok(tipEmail(1), 'Tip 1 still went out');
  for (const n of [2, 3]) assert.equal(tipEmail(n).last_event, 'canceled', `Tip ${n} was cancelled because its id could not be saved`);
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
  const all = [world.emails[0], tipEmail(1), tipEmail(2), tipEmail(3)];
  for (const e of all) {
    assert.equal(e.from, 'COTIB LLC <no-reply@cotib.com>', 'F10.1 From');
    assert.equal(e.reply_to, 'customerservice@cotib.com', 'F10.1 Reply-To');
    assert.ok(['Confirm your email for the free Do the Next Thing coaching tips', ...tipsData.TIPS.map((t) => t.subject)].includes(e.subject), 'F10.2 subject says what is inside');
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
  assert.match(index, /<a href="\/do-the-next-thing"[^>]*>New: Do the Next Thing, free coaching tips/);
  assert.match(ventures, /<section[^>]*id="products"[\s\S]*?<a href="\/do-the-next-thing#free"[^>]*>Get the free coaching tips<\/a>/);
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
  assert.equal(patches.length, 4, 'consent call, UTM call, marketing opt-in call, then the scheduled tip ids');
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

test('UTM: if the UTM property keys are missing in Resend, confirm still succeeds, consent is kept and Tip 1 goes out', async () => {
  world.missingProperties = new Set(['dtnt_utm_source', 'dtnt_utm_medium', 'dtnt_utm_campaign']);
  await signup({ ...good(), ...TODAY_UTM });
  let res;
  const logs = await captureLogs(async () => { res = await get(confirmLink(world.emails[0])); });
  assert.equal(res.status, 200);
  assert.match(await res.text(), /You're confirmed\./);
  assert.ok(tipEmail(1), 'Tip 1 sent');
  const c = world.contacts.get('reader@example.com');
  assert.equal(c.properties.dtnt_consent_version, 'dtnt-tips-2026-11-17', 'consent recorded');
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
  for (const n of ['email', 'consent', 'marketing_consent', 'website']) Object.defineProperty(form, n, { get: () => form.elements.namedItem(n) });
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
  assert.deepEqual(page.posted[0].body, { email: 'reader@example.com', consent: true, marketingConsent: false, turnstileToken: 'tok-pass', website: '', ...TODAY_UTM });
});

test('UTM page: with no UTM in the URL the fields stay empty and the server turns them into direct', async () => {
  const page = loadPage('?ref=x');
  assert.deepEqual(hidden(page.doc), ['', '', '']);
  await submitForm(page);
  assert.deepEqual(page.posted[0].body, { email: 'reader@example.com', consent: true, marketingConsent: false, turnstileToken: 'tok-pass', website: '', utm_source: '', utm_medium: '', utm_campaign: '' });
});

test('UTM page: the build script writes the same hidden fields as the committed page', () => {
  const script = fs.readFileSync(path.join(ROOT, 'scripts', 'build-dtnt-pages.js'), 'utf8');
  for (const k of ['source', 'medium', 'campaign']) {
    assert.match(script, new RegExp(`<input type="hidden" id="free-utm-${k}" name="utm_${k}" value="">`));
  }
});

// ---------- Consent Option B: required tips box, optional paid-products box ----------
const { CONSENT_TEXT, MARKETING_CONSENT_TEXT, CONSENT_VERSION, CONSENT_TEXT_HASH, MARKETING_CONSENT_TEXT_HASH } = require('../lib/dtnt/config');
const marketingPatch = () => propertyPatches().find((p) => 'dtnt_marketing_opt_in' in p.body.properties);

test('Option B: the two consent texts, the version, and their hashes', () => {
  assert.equal(CONSENT_TEXT, 'Email me the free Do the Next Thing coaching tips, one short email at a time. I can unsubscribe any time.');
  assert.equal(MARKETING_CONSENT_TEXT, 'Also send me occasional emails about paid Do the Next Thing products.');
  assert.equal(CONSENT_VERSION, 'dtnt-tips-2026-11-17');
  assert.match(CONSENT_TEXT_HASH, /^[0-9a-f]{64}$/);
  assert.match(MARKETING_CONSENT_TEXT_HASH, /^[0-9a-f]{64}$/);
  assert.notEqual(CONSENT_TEXT_HASH, MARKETING_CONSENT_TEXT_HASH);
});

test('Option B page: required tips box, optional unchecked paid-products box, no Pack pitch in the consent', () => {
  const page = loadPage('');
  const req = page.doc.getElementById('free-consent');
  const opt = page.doc.getElementById('free-marketing-consent');
  assert.ok(req.required && !req.checked);
  assert.ok(opt && !opt.required && !opt.checked && opt.name === 'marketing_consent');
  const labels = [...page.doc.querySelectorAll('label.consent span')].map((n) => n.textContent);
  assert.deepEqual(labels, [`${CONSENT_TEXT}Required`, `${MARKETING_CONSENT_TEXT}Optional`]);
  assert.doesNotMatch(labels.join(' '), /\$24|\$37|up to 3|Pack/);
});

test('Option B page: the browser posts marketingConsent true only when the optional box is ticked', async () => {
  const page = loadPage('');
  page.doc.getElementById('free-marketing-consent').checked = true;
  await submitForm(page);
  assert.equal(page.posted[0].body.marketingConsent, true);
  assert.equal(page.posted[0].body.consent, true);
});

test('Option B: signup without the optional box records marketing opt-in false, and the tips box alone is enough', async (t) => {
  assert.equal((await signup(good())).status, 200);
  const d = tokenOf(confirmLink(world.emails[0]));
  assert.deepEqual({ mc: d.mc, mh: d.mh, cv: d.cv, ch: d.ch }, { mc: 0, mh: MARKETING_CONSENT_TEXT_HASH, cv: CONSENT_VERSION, ch: CONSENT_TEXT_HASH });
  assert.equal((await get(confirmLink(world.emails[0]))).status, 200);
  t.diagnostic(`marketing payload: ${JSON.stringify(marketingPatch())}`);
  assert.deepEqual(marketingPatch().body, { properties: { dtnt_marketing_opt_in: 'false' } });
  assert.equal(world.contacts.get('reader@example.com').properties.dtnt_marketing_opt_in, 'false');
});

test('Option B: JSON marketingConsent true and a plain form post marketing_consent=on both record opt-in true', async (t) => {
  assert.equal((await signup({ ...good('json@example.com'), marketingConsent: true })).status, 200);
  assert.equal(tokenOf(confirmLink(world.emails[0])).mc, 1);
  assert.equal((await get(confirmLink(world.emails[0]))).status, 200);
  assert.deepEqual(marketingPatch().body, { properties: { dtnt_marketing_opt_in: 'true' } });
  t.diagnostic(`json: ${JSON.stringify(marketingPatch())}`);

  world = createMockWorld();
  assert.equal((await signup({ email: 'nojs@example.com', consent: 'on', marketing_consent: 'on', 'cf-turnstile-response': 'tok-pass', website: '' }, { json: false })).status, 200);
  assert.equal(tokenOf(confirmLink(world.emails[0])).mc, 1);
});

test('Option B: a marketing box without the required box is refused, and "false" or junk values count as no', async () => {
  const r = await signup({ ...good(), consent: false, marketingConsent: true });
  assert.equal(r.status, 400);
  assert.equal((await r.json()).code, 'consent');
  assert.equal(world.emails.length, 0);
  for (const v of ['false', 'yes', 1, null, 'off']) {
    world = createMockWorld();
    assert.equal((await signup({ ...good(), marketingConsent: v })).status, 200);
    assert.equal(tokenOf(confirmLink(world.emails[0])).mc, 0, String(v));
  }
});

test('Option B: if the dtnt_marketing_opt_in key is missing in Resend, confirm still succeeds, consent and UTM are kept, and the miss is logged', async () => {
  world.missingProperties = new Set(['dtnt_marketing_opt_in']);
  await signup({ ...good(), marketingConsent: true, ...TODAY_UTM });
  let res;
  const logs = await captureLogs(async () => { res = await get(confirmLink(world.emails[0])); });
  assert.equal(res.status, 200);
  assert.ok(tipEmail(1), 'Tip 1 sent');
  const c = world.contacts.get('reader@example.com');
  assert.equal(c.properties.dtnt_consent_version, 'dtnt-tips-2026-11-17');
  assert.equal(c.properties.dtnt_utm_source, 'substack');
  assert.equal(c.properties.dtnt_marketing_opt_in, undefined);
  assert.match(logs.find((l) => l.event === 'dtnt.confirm.marketing_property_failed').error, /Resend contact properties failed \(422\)/);
  assert.ok(!logs.some((l) => l.event === 'dtnt.confirm.consent_properties_failed' || l.event === 'dtnt.confirm.utm_properties_failed'));
});

test('Option B: the consent log line carries the opt-in and the text hash, never the email', async () => {
  await signup({ ...good(), marketingConsent: true });
  const logs = await captureLogs(() => get(confirmLink(world.emails[0])));
  const line = logs.find((l) => l.event === 'dtnt.consent');
  assert.equal(line.marketingOptIn, true);
  assert.equal(line.marketingConsentTextHash, MARKETING_CONSENT_TEXT_HASH);
  assert.equal(line.consentVersion, 'dtnt-tips-2026-11-17');
  assert.doesNotMatch(JSON.stringify(line), /reader@example\.com/);
});

test('Option B: the welcome email carries no paid-product pitch, so it is safe for people who did not opt in', async () => {
  await confirmedReader();
  const delivery = world.emails.at(-1);
  assert.doesNotMatch(delivery.text + delivery.html, /\$24|\$37|Pack|Setup Kit|coming soon/i);
});

// ---------- Tips: timing relative to each reader's confirm, and the archive ----------
const { tipsPage } = require('../lib/dtnt/pages');
const { JSDOM: TipsDOM } = require('jsdom');
const DAY = 24 * 60 * 60 * 1000;
const tipsDoc = async (res) => new TipsDOM(await res.text()).window.document;
const resendCalls = (method, pathRe) => world.calls.filter((c) => c.host === 'api.resend.com' && c.method === method && pathRe.test(c.path));
const unsubscribeVia = (email, { oneClick = false } = {}) => {
  const t = new URL(unsubLink(email)).searchParams.get('t');
  return get('/do-the-next-thing/free/unsubscribe', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: oneClick ? `t=${t}&List-Unsubscribe=One-Click` : `t=${t}` });
};

test('tips: the three approved emails are the text on file, unchanged', () => {
  const crypto = require('crypto');
  assert.deepEqual(tipsData.TIPS.map((t) => t.subject), ['The proposal opening you keep avoiding', 'The follow-up you skipped', 'Close the tabs, pick one']);
  assert.equal(
    crypto.createHash('sha256').update(JSON.stringify(tipsData.TIPS.map((t) => [t.subject, t.blocks]))).digest('hex'),
    '31b888430cc8fab0ede4bb7d913671eec4a3767dacf74e667021ce673dc1048c',
    'tip text changed: it must match the version Chuck approved on 2026-11-17 (update this hash only with his OK)',
  );
  // Each prompt is verbatim from the locked v0 list: 1.1, 3.1, 4.3.
  const prompts = tipsData.TIPS.map((t) => t.blocks.find((b) => b[0] === 'code')[1]);
  assert.match(prompts[0], /^I need to start \[the thing\] and I haven't begun\. Give me ONE move/);
  assert.match(prompts[1], /^I skipped \[the thing\] for \[how long\]\. Don't give me a catch-up plan\./);
  assert.match(prompts[2], /^I've been researching \[the decision\] instead of making it\./);
});

test('tips: delivery is relative to the confirm click: Tip 1 now, Tip 2 on day 3, Tip 3 on day 7', () => {
  assert.deepEqual(tipsData.TIPS.map((t) => t.delayDays), [0, 3, 7]);
  const t0 = Date.parse('2026-12-01T14:30:00Z');
  assert.deepEqual(tipsData.TIPS.map((t) => tipsData.sendAtMs(t0, t)), [t0, t0 + 3 * DAY, t0 + 7 * DAY]);
  assert.ok(tipsData.TIPS.every((t) => !('publishAt' in t)), 'no fixed publish dates remain');
});

test('tips: confirm sends Tip 1 now and schedules Tips 2 and 3 at Resend for 3 and 7 days after the click, within Resend\'s 30 day limit', async () => {
  await signup(good());
  const link = confirmLink(world.emails[0]);
  const clickAt = Date.now() + 90 * 1000;
  await withClock(90, async () => { assert.equal((await get(link)).status, 200); });
  const [t1, t2, t3] = [1, 2, 3].map(tipEmail);
  for (const e of [t1, t2, t3]) {
    assert.deepEqual(e.to, ['reader@example.com']);
    assert.equal(e.headers['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click');
  }
  assert.equal(t1.scheduled_at, undefined, 'Tip 1 is sent immediately');
  assert.equal(t1.last_event, 'delivered');
  // The mock clock is advanced 90 s inside the handler's Date.now, so allow a small window around the click.
  const near = (iso, expected) => assert.ok(Math.abs(Date.parse(iso) - expected) < 5000, `${iso} is not near ${new Date(expected).toISOString()}`);
  near(t2.scheduled_at, clickAt + 3 * DAY);
  near(t3.scheduled_at, clickAt + 7 * DAY);
  assert.match(t2.scheduled_at, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/, 'ISO 8601');
  for (const e of [t2, t3]) {
    assert.equal(e.last_event, 'scheduled');
    assert.ok(Date.parse(e.scheduled_at) - Date.now() < 30 * DAY, 'inside the 30 day scheduling limit');
  }
  // Sent with the sending key, the ids saved on the contact with the full-access key.
  for (const c of sends().slice(1)) assert.equal(c.headers.Authorization, 'Bearer mock-send-key');
  const props = world.contacts.get('reader@example.com').properties;
  assert.equal(props.dtnt_tip2_email_id, t2.id);
  assert.equal(props.dtnt_tip3_email_id, t3.id);
  assert.equal(new Set(world.emails.map((e) => e.idempotencyKey).filter(Boolean)).size, 3, 'one idempotency key per tip');
});

test('tips: two readers who confirm on different days get different send times, each counted from their own click', async () => {
  const first = await (async () => { await confirmedReader('a@example.com'); return world.emails.filter((e) => e.to[0] === 'a@example.com' && e.scheduled_at).map((e) => Date.parse(e.scheduled_at)); })();
  await withClock(5 * DAY / 1000, async () => {
    await signup(good('b@example.com'));
    await get(confirmLink(world.emails.filter((e) => e.to[0] === 'b@example.com').at(-1)));
  });
  const second = world.emails.filter((e) => e.to[0] === 'b@example.com' && e.scheduled_at).map((e) => Date.parse(e.scheduled_at));
  assert.equal(first.length, 2);
  assert.equal(second.length, 2);
  second.forEach((t, i) => assert.ok(Math.abs(t - first[i] - 5 * DAY) < 10000, 'five days later, five days later'));
});

test('tips: a repeat click on the confirm link neither sends nor schedules anything twice', async () => {
  await signup(good());
  const link = confirmLink(world.emails[0]);
  await get(link);
  const before = world.emails.length;
  await get(link);
  await get(link);
  assert.equal(world.emails.length, before);
  assert.equal(world.emails.filter((e) => e.scheduled_at).length, 2);
});

test('tips: the same confirm token reuses its idempotency keys, so a retry inside Resend\'s window cannot double-send', async () => {
  await signup(good());
  const link = confirmLink(world.emails[0]);
  await get(link);
  const keys = world.emails.slice(1).map((e) => e.idempotencyKey);
  // Simulate the lookup failing on a second click: confirm then runs the whole path again with the same token.
  const real = world.fetch;
  world.fetch = async (url, opts = {}) => (/\/contacts\/reader%40example\.com$/.test(url) && (opts.method || 'GET') === 'GET' ? { ok: false, status: 500, json: async () => ({}) } : real(url, opts));
  await get(link);
  world.fetch = real;
  assert.equal(world.emails.length, 4, 'Resend returned the original emails for the same keys');
  assert.deepEqual(world.emails.slice(1).map((e) => e.idempotencyKey), keys);
});

test('tips: no tip is sent or scheduled without the required tips consent on the signup', async () => {
  // A confirm token that lacks the consent version and text hash (signup.js only sets them when the box is ticked).
  const t = createToken('confirm', { e: 'noconsent@example.com', sa: new Date().toISOString() }, 3600);
  let res;
  const logs = await captureLogs(async () => { res = await get(`/do-the-next-thing/free/confirm?t=${t}`); });
  assert.equal(res.status, 200);
  assert.equal(world.emails.length, 0, 'no tip, no schedule');
  assert.ok(logs.some((l) => l.event === 'dtnt.confirm.no_tips_consent'));
  // And the signup endpoint refuses an unticked box outright.
  const refused = await signup({ ...good(), consent: false });
  assert.equal(refused.status, 400);
});

test('tips: unsubscribing cancels the scheduled Tips 2 and 3 and leaves the delivered Tip 1 alone', async () => {
  const tip1 = await confirmedReader();
  assert.equal((await unsubscribeVia(tip1)).status, 200);
  assert.equal(world.contacts.get('reader@example.com').unsubscribed, true);
  assert.equal(tipEmail(2).last_event, 'canceled');
  assert.equal(tipEmail(3).last_event, 'canceled');
  assert.equal(tipEmail(1).last_event, 'delivered');
  const cancels = resendCalls('POST', /^\/emails\/[^/]+\/cancel$/);
  assert.equal(cancels.length, 2);
  for (const c of cancels) assert.equal(c.headers.Authorization, 'Bearer mock-full-key');
  // Repeating the unsubscribe is safe: nothing left to cancel.
  assert.equal((await unsubscribeVia(tip1)).status, 200);
  assert.equal(resendCalls('POST', /^\/emails\/[^/]+\/cancel$/).length, 2);
});

test('tips: one-click unsubscribe (RFC 8058) from a later tip also cancels what is still scheduled', async () => {
  await confirmedReader();
  tipEmail(2).last_event = 'delivered'; // day 3 has passed and Tip 2 went out
  assert.equal((await unsubscribeVia(tipEmail(2), { oneClick: true })).status, 200);
  assert.equal(tipEmail(2).last_event, 'delivered', 'an email that already went out is not touched');
  assert.equal(tipEmail(3).last_event, 'canceled');
  const cancelled = resendCalls('POST', /^\/emails\/[^/]+\/cancel$/).map((c) => c.path);
  assert.deepEqual(cancelled, [`/emails/${tipEmail(3).id}/cancel`]);
});

test('tips: if the cancel fails, unsubscribe says so (502, one-click 502) instead of claiming success, and a retry finishes it', async () => {
  const tip1 = await confirmedReader();
  world.failCancel = true;
  const page = await unsubscribeVia(tip1);
  assert.equal(page.status, 502);
  assert.match(await page.text(), /We couldn't finish that just now\./);
  assert.equal((await unsubscribeVia(tip1, { oneClick: true })).status, 502);
  assert.equal(world.contacts.get('reader@example.com').unsubscribed, true, 'the contact is flagged either way');
  assert.equal(tipEmail(3).last_event, 'scheduled', 'still scheduled, so the person was told to retry');
  world.failCancel = false;
  assert.equal((await unsubscribeVia(tip1)).status, 200);
  assert.equal(tipEmail(2).last_event, 'canceled');
  assert.equal(tipEmail(3).last_event, 'canceled');
});

test('tips: unsubscribing before ever confirming has nothing to cancel and still suppresses the address', async () => {
  await signup(good());
  assert.equal((await unsubscribeVia(world.emails[0])).status, 200);
  assert.equal(resendCalls('POST', /\/cancel$/).length, 0);
  assert.equal(world.contacts.get('reader@example.com').unsubscribed, true);
});

test('tips: after an unsubscribe, a fresh confirm starts the series over from that click, with its own scheduled emails', async () => {
  const tip1 = await confirmedReader();
  await unsubscribeVia(tip1);
  const firstScheduled = world.emails.filter((e) => e.scheduled_at);
  assert.ok(firstScheduled.every((e) => e.last_event === 'canceled'));
  await signup(good());
  await get(confirmLink(world.emails.at(-1)));
  const scheduled = world.emails.filter((e) => e.scheduled_at);
  assert.equal(scheduled.length, 4);
  const live = scheduled.filter((e) => e.last_event === 'scheduled');
  assert.equal(live.length, 2, 'only the new Tips 2 and 3 are live');
  const props = world.contacts.get('reader@example.com').properties;
  assert.deepEqual([props.dtnt_tip2_email_id, props.dtnt_tip3_email_id].sort(), live.map((e) => e.id).sort(), 'the contact points at the live ones');
  // Unsubscribing again cancels exactly those.
  await unsubscribeVia(world.emails.filter((e) => e.subject === SUBJECT_TIP1).at(-1));
  assert.ok(scheduled.every((e) => e.last_event === 'canceled'));
});

test('tips: if Resend refuses to schedule, the reader still confirms and gets Tip 1, the failure is logged, and nothing half-scheduled is left', async () => {
  await signup(good());
  const real = world.fetch;
  world.fetch = async (url, opts = {}) => {
    const body = opts.body ? JSON.parse(opts.body) : {};
    if (body.scheduled_at && body.subject === tipsData.TIPS[2].subject) return { ok: false, status: 422, json: async () => ({ message: 'mock: cannot schedule' }) };
    return real(url, opts);
  };
  let res;
  const logs = await captureLogs(async () => { res = await get(confirmLink(world.emails[0])); });
  world.fetch = real;
  assert.equal(res.status, 200);
  assert.ok(tipEmail(1));
  assert.equal(tipEmail(2).last_event, 'canceled', 'Tip 2 was scheduled, then cancelled when Tip 3 could not be');
  assert.equal(tipEmail(3), undefined);
  assert.ok(logs.some((l) => l.event === 'dtnt.confirm.tips_schedule_failed'));
  assert.doesNotMatch(JSON.stringify(logs), /reader@example\.com/);
});

test('tips: the emails carry the approved tip text word for word, say where the reader is in the series, and keep the footer', async () => {
  await confirmedReader();
  tipsData.TIPS.forEach((t, i) => {
    const e = tipEmail(i + 1);
    assert.equal(e.subject, t.subject);
    for (const [, text] of t.blocks) assert.ok(e.text.includes(text.replace(/\*\*/g, '')), `Tip ${t.number} text block present: ${text.slice(0, 40)}`);
    assert.match(e.text, new RegExp(`Tip ${t.number} of 3`));
    assert.ok(e.html.includes(POSTAL) && e.text.includes(POSTAL));
    assert.doesNotMatch(e.html + e.text, /Hi \[first name\]|\$24|\$37|Pack\b|Setup Kit/);
  });
  assert.match(tipEmail(1).text, /^You're on the list\. This is Tip 1 of 3\. Tip 2 arrives 3 days from now and Tip 3 arrives on day 7\./);
  assert.match(tipEmail(1).html, /<strong>The technique:<\/strong>/);
  assert.match(tipEmail(1).html, /<pre [^>]*>I need to start \[the thing\]/);
  assert.match(tipEmail(3).text, /^Tip 3 of 3, the last one\./);
  assert.match(world.emails[0].text, /After you confirm, Tip 1 arrives right away, Tip 2 on day 3 and Tip 3 on day 7\./);
});

test('tips: the archive shows all three tips to everyone, in order, labelled by when they arrive, with no dates', async () => {
  const res = await get('/do-the-next-thing/tips');
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/html/);
  assert.equal(res.headers.get('cache-control'), 'public, max-age=0, s-maxage=300, must-revalidate');
  const html = await res.text();
  const doc = new TipsDOM(html).window.document;
  assert.equal(doc.querySelector('h1').textContent, 'The tips');
  assert.equal(doc.querySelectorAll('article.tip').length, 3);
  assert.deepEqual([...doc.querySelectorAll('.tip-meta')].map((m) => m.textContent), ['Tip 1Arrives when you confirm', 'Tip 2Arrives on day 3', 'Tip 3Arrives on day 7']);
  tipsData.TIPS.forEach((t, i) => {
    const art = doc.querySelectorAll('article.tip')[i];
    assert.equal(art.querySelector('h2').textContent, t.subject);
    assert.equal(art.querySelector('pre.tip-prompt code').textContent, t.blocks.find((b) => b[0] === 'code')[1]);
    const paras = [...art.querySelectorAll('p:not(.tip-meta)')].map((p) => p.textContent);
    assert.deepEqual(paras, t.blocks.filter((b) => b[0] === 'p').map((b) => b[1].replace(/\*\*/g, '')));
    assert.equal(art.querySelectorAll('strong').length >= 3, true, 'technique, prompt and today labels are bold');
  });
  assert.match(doc.querySelector('.tips-head').textContent, /Tip 1 arrives when you confirm your signup, Tip 2 on day 3 and Tip 3 on day 7\./);
  assert.doesNotMatch(html, /hasn't gone out yet|Sent (January|February|March|April|May|June|July|August|September|October|November|December)/);
  assert.doesNotMatch(html, /Hi \[first name\]/, 'the mail merge greeting is not on the web page');
  assert.doesNotMatch(html, DASHES);
  assert.match(html, /<title>Do the Next Thing: the tips \| COTIB LLC<\/title>/);
  assert.ok(doc.querySelector('title').textContent.length <= 60);
  assert.ok(doc.querySelector('meta[name="description"]').content.length <= 160);
  assert.doesNotMatch(html, /stripe\.com|\$24|\$37|checkout/i, 'no sales on the archive');
  assert.match(html, /href="\/do-the-next-thing#free"/, 'links back to the signup');
  // The clock has no say: the same page a year from now.
  await withClock(365 * 86400, async () => assert.equal(await (await get('/do-the-next-thing/tips')).text(), html));
});

test('tips: the archive escapes tip text and only accepts GET and HEAD', async () => {
  const html = tipsPage({ tips: [{ number: 1, delayDays: 0, slug: 'x', subject: '<script>alert(1)</script>', blocks: [['p', 'a <b>bold</b> & **real bold**'], ['code', '<img src=x onerror=alert(1)>']] }] });
  assert.doesNotMatch(html, /<script>alert|<img src=x|<b>bold/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /<strong>real bold<\/strong>/);
  const post = await get('/do-the-next-thing/tips', { method: 'POST' });
  assert.equal(post.status, 405);
  assert.equal((await get('/do-the-next-thing/tips', { method: 'HEAD' })).status, 200);
});

test('tips: the DTNT page, the confirmed page and the already-subscribed note point to the archive and say when tips arrive', async () => {
  const page = fs.readFileSync(path.join(ROOT, 'www', 'do-the-next-thing.html'), 'utf8');
  assert.match(page, /<p class="tips-link">Already signed up\? <a href="\/do-the-next-thing\/tips">Read all three tips\.<\/a><\/p>/);
  assert.match(page, /<a href="\/do-the-next-thing\/tips">tips page<\/a>/);
  assert.match(page, /Tip 1 arrives right after you click it, Tip 2 on day 3 and Tip 3 on day 7\./);
  assert.match(page, /As three short emails, timed from the day you confirm your signup: Tip 1 right away, Tip 2 on day 3 and Tip 3 on day 7\./);
  const privacy = fs.readFileSync(path.join(ROOT, 'www', 'do-the-next-thing', 'privacy.html'), 'utf8');
  assert.match(privacy, /Tip 1 when you confirm, Tip 2 on day 3 and Tip 3 on day 7/);
  assert.match(privacy, /we can cancel them if you unsubscribe/);
  await signup(good());
  const confirmHtml = await (await get(confirmLink(world.emails[0]))).text();
  assert.match(confirmHtml, /href="\/do-the-next-thing\/tips"/);
  assert.match(tipEmail(1).text, /http:\/\/127\.0\.0\.1:\d+\/do-the-next-thing\/tips/);
  await signup(good());
  const note = world.emails.at(-1);
  assert.match(note.text, /http:\/\/127\.0\.0\.1:\d+\/do-the-next-thing\/tips/);
  assert.match(note.html, /href="http:\/\/127\.0\.0\.1:\d+\/do-the-next-thing\/tips"/);
  assert.match(note.text, /^You're already on the list, so there's nothing more to do\.\n\nThree tips arrive in order: Tip 1 when you confirm, Tip 2 on day 3 and Tip 3 on day 7\./);
});

test('tips: no leftover wording about fixed dates or publish schedules in the code or the pages', () => {
  const files = ['lib/dtnt/tips.js', 'lib/dtnt/pages.js', 'lib/dtnt/emails.js', 'api/dtnt-tips.js', 'scripts/build-dtnt-pages.js', 'www/do-the-next-thing.html', 'www/do-the-next-thing/privacy.html'];
  for (const f of files) {
    assert.doesNotMatch(fs.readFileSync(path.join(ROOT, f), 'utf8'), /publishAt|publishedTips|sentOn|dated send|next dated|set dates|tips so far|already gone out|has gone out/i, f);
  }
});

test('tips: no page and no email links the sampler PDF or promises "3 free prompts" any more', async () => {
  await confirmedReader();
  for (const e of world.emails) assert.doesNotMatch(e.html + e.text + e.subject, /free\/dl\/|sampler|3 free|3 prompts|\$24|\$37|Pack\b/i, e.subject);
  const www = path.join(ROOT, 'www');
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((en) => (en.isDirectory() ? walk(path.join(d, en.name)) : [path.join(d, en.name)]));
  for (const f of walk(www).filter((n) => n.endsWith('.html'))) {
    assert.doesNotMatch(fs.readFileSync(f, 'utf8'), /free\/dl\//, `${path.relative(www, f)} links the sampler download`);
  }
  const lib = fs.readFileSync(path.join(ROOT, 'lib', 'dtnt', 'pages.js'), 'utf8');
  assert.doesNotMatch(lib, /free\/dl\/|Download the free sampler/);
});
