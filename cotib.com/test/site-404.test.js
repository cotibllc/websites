// The branded not-found page, served the way Vercel serves www/404.html.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { startServer } = require('./harness');

let server, base;
test.before(async () => { server = await startServer(); base = `http://127.0.0.1:${server.address().port}`; });
test.after(() => server.close());

test('a missing URL at any depth gets 404 and the branded page', async () => {
  for (const p of ['/no-such-page', '/services/old/thing', '/insights']) {
    const r = await fetch(base + p);
    assert.equal(r.status, 404, p);
    const html = await r.text();
    assert.match(html, /<title>Page not found \| COTIB LLC<\/title>/);
    assert.match(html, /<h1[^>]*>Page not found<\/h1>/);
    assert.match(html, /<meta name="robots" content="noindex">/);
  }
});

test('404.html uses only absolute asset paths and no dead anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'www', '404.html'), 'utf8');
  const rel = [...html.matchAll(/(?:href|src)="(?!https?:|\/|#|mailto:)([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(rel, []);
  assert.doesNotMatch(html, /services#security/);
  assert.doesNotMatch(html, /[\u2013\u2014]/);
});

test('real pages still answer 200', async () => {
  for (const p of ['/', '/services', '/do-the-next-thing']) assert.equal((await fetch(base + p)).status, 200, p);
});
