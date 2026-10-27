'use strict';
// Smoke test: boots the real Express app on an ephemeral port and asserts on
// HTTP status codes and rendered text. No network, no Resend, no env vars.
// Production mode turns off nunjucks file watchers (they keep the process alive)
// and keeps the lead store a no-op, so the test writes nothing to disk.
process.env.NODE_ENV = 'production';
const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app');

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

for (const path of ['/', '/about', '/plan', '/guide', '/china', '/royal-caribbean']) {
  test(`GET ${path} renders 200 HTML`, async () => {
    const res = await fetch(base + path);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type') || '', /text\/html/);
    const body = await res.text();
    assert.match(body, /Earned Escape/i);
  });
}

test('unknown path returns 404', async () => {
  const res = await fetch(base + '/this-page-does-not-exist');
  assert.equal(res.status, 404);
});
