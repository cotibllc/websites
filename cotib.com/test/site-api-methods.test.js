// Crawler methods on /api/contact, with no env vars set at all.
// Search Console logged a 5xx for a Googlebot GET on /api/contact (Oct 22).
// The handler built its Resend client at load time, and new Resend() throws
// when RESEND_API_KEY is missing, which fails every request with a 500.
// node --test runs each file in its own process, so this env stays here.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

for (const k of ['RESEND_API_KEY', 'RESEND_FULL_API_KEY', 'TURNSTILE_SECRET_KEY', 'DTNT_TOKEN_SECRET', 'DTNT_FREE_SEGMENT_ID']) delete process.env[k];
const { startServer } = require('./harness');

let server, base;
test.before(async () => { server = await startServer(); base = `http://127.0.0.1:${server.address().port}`; });
test.after(() => server.close());

// Resolves only once the body has fully arrived, so a response that never
// ends fails here instead of hanging the run.
async function call(method, p) {
  const t0 = Date.now();
  const r = await fetch(`${base}${p}`, { method, signal: AbortSignal.timeout(2000) });
  const body = await r.text();
  return { status: r.status, allow: r.headers.get('allow'), type: r.headers.get('content-type'), body, ms: Date.now() - t0 };
}

test('every api handler loads with no env vars set', () => {
  for (const f of ['contact', 'dtnt/signup', 'dtnt/confirm', 'dtnt/download', 'dtnt/unsubscribe']) {
    assert.doesNotThrow(() => require(path.join(__dirname, '..', 'api', `${f}.js`)), f);
  }
});

test('GET /api/contact is a fast, ended 405 with Allow: POST', async () => {
  for (const p of ['/api/contact', '/api/contact?nc=1']) {
    const r = await call('GET', p);
    assert.deepEqual({ status: r.status, allow: r.allow, body: r.body }, { status: 405, allow: 'POST', body: '{"error":"Method not allowed"}' }, p);
    assert.match(r.type, /^application\/json/);
    assert.ok(r.ms < 1000, `${p} took ${r.ms}ms`);
  }
});

test('HEAD, PUT and DELETE on /api/contact are 405 with Allow: POST', async () => {
  for (const method of ['HEAD', 'PUT', 'DELETE']) {
    const r = await call(method, '/api/contact');
    assert.deepEqual({ status: r.status, allow: r.allow }, { status: 405, allow: 'POST' }, method);
    assert.equal(r.body, method === 'HEAD' ? '' : '{"error":"Method not allowed"}', method);
  }
});
