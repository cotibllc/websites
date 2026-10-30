// POST /api/contact behind the local harness, Turnstile and Resend mocked.
const test = require('node:test');
const assert = require('node:assert/strict');

Object.assign(process.env, { RESEND_API_KEY: 'mock-send-key', TURNSTILE_SECRET_KEY: 'mock-turnstile-secret' });
const { startServer, createMockWorld } = require('./harness');

const TOKEN = 'tok-pass-contact-123';
const EMAIL = 'lead@example.com';
let server, base, world, lines;
const realFetch = globalThis.fetch;
const realLog = console.log;
let n = 1;

test.before(async () => { server = await startServer(); base = `http://127.0.0.1:${server.address().port}`; });
test.after(() => server.close());
test.beforeEach(() => {
  world = createMockWorld();
  globalThis.fetch = (url, opts) => (String(url).startsWith(base) ? realFetch(url, opts) : world.fetch(url, opts));
  lines = [];
  console.log = (...a) => { lines.push(a.join(' ')); };
});
test.afterEach(() => { console.log = realLog; globalThis.fetch = realFetch; });

const ip = () => `198.51.100.${n++ % 250}`;
const good = () => ({ name: 'Lead Person', email: EMAIL, organization: '', phone: '', service: 'AI Platforms', message: 'Need help', turnstileToken: TOKEN, website: '' });
function post(fields, { origin = base, cfip = ip() } = {}) {
  const headers = { 'Content-Type': 'application/json', Host: new URL(base).host, 'CF-Connecting-IP': cfip };
  if (origin) headers.Origin = origin;
  return realFetch(`${base}/api/contact`, { method: 'POST', headers, body: JSON.stringify(fields) });
}
const events = () => lines.map((l) => { try { return JSON.parse(l); } catch { return { raw: l }; } });
const sends = () => world.calls.filter((c) => c.host === 'api.resend.com' && c.path === '/emails');

test('a good submission sends one email and logs contact.sent without the email', async () => {
  const r = await post(good());
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { success: true });
  assert.equal(sends().length, 1);
  const sent = events().find((e) => e.event === 'contact.sent');
  assert.deepEqual({ event: sent.event, service: sent.service }, { event: 'contact.sent', service: 'AI Platforms' });
  const ts = world.calls.find((c) => c.host === 'challenges.cloudflare.com');
  assert.match(ts.body.remoteip, /^198\.51\.100\.\d+$/, 'siteverify gets the CF-Connecting-IP visitor address');
});

test('a post from another site or with no Origin is refused with 403 and sends nothing', async () => {
  for (const origin of ['https://evil.example', null]) {
    const r = await post(good(), { origin });
    assert.equal(r.status, 403);
    assert.match((await r.json()).error, /^This form only works on www\.cotib\.com\./);
  }
  assert.equal(sends().length, 0);
  assert.equal(events().filter((e) => e.event === 'contact.bad_origin').length, 2);
});

test('more than 5 tries a minute from one address gets 429', async () => {
  const codes = [];
  for (let i = 0; i < 7; i++) codes.push((await post({ ...good(), name: '' }, { cfip: '203.0.113.50' })).status);
  assert.deepEqual(codes, [400, 400, 400, 400, 400, 429, 429]);
});

test('contact.turnstile_failed carries a reason for each refusal', async () => {
  const cases = [['fail', 400, 'failed'], ['badhost', 400, 'hostname'], ['badsecret', 503, 'config'], ['expired', 400, 'expired'], ['down', 500, 'unreachable']];
  for (const [mode, status, reason] of cases) {
    world.turnstile = mode;
    lines = [];
    const r = await post(good());
    assert.equal(r.status, status, mode);
    const line = events().find((e) => e.event === 'contact.turnstile_failed');
    assert.ok(line, `${mode}: no log line`);
    assert.equal(line.reason, reason, mode);
  }
  assert.equal(sends().length, 0);
});

test('a Resend API error is a 500, not a false success', async () => {
  world.failSend = true;
  const r = await post(good());
  assert.equal(r.status, 500);
  assert.ok(events().some((e) => e.event === 'contact.send_failed'));
  assert.ok(!events().some((e) => e.event === 'contact.sent'));
});

test('no log line ever carries the secret, the token or the email', async () => {
  await post(good());
  await post(good(), { origin: 'https://evil.example' });
  for (const mode of ['fail', 'badsecret', 'down']) { world.turnstile = mode; await post(good()); }
  world.turnstile = 'pass'; world.failSend = true; await post(good());
  const all = lines.join('\n');
  assert.ok(lines.length >= 6);
  for (const s of ['mock-turnstile-secret', TOKEN, EMAIL]) assert.ok(!all.includes(s), `log leaked ${s}`);
});
