'use strict';
// Handler tests for api/contact.js that never leave the process: only paths
// that return before Turnstile or Resend are called.
process.env.RESEND_API_KEY = 're_test_key_not_real';
const test = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/contact');

function fakeRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test('GET is rejected with 405', async () => {
  const res = fakeRes();
  await handler({ method: 'GET' }, res);
  assert.equal(res.statusCode, 405);
  assert.deepEqual(res.body, { error: 'Method not allowed' });
});

test('honeypot field returns a fake success without sending', async () => {
  const res = fakeRes();
  await handler({ method: 'POST', body: { website: 'http://spam.example' } }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { success: true });
});

test('missing required fields returns 400', async () => {
  const res = fakeRes();
  await handler({ method: 'POST', body: { name: 'A' } }, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, /required fields/);
});
