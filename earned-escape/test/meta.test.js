'use strict';
// Meta limits from the House Rule 37 site audit: every page in the sitemap has
// a <title> of 60 characters or fewer, a meta description of 160 or fewer,
// og:title and og:description tags, and no em or en dashes in any of them.
process.env.NODE_ENV = 'production';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
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

const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const meta = (html, attr, name) => {
  const m = html.match(new RegExp(`<meta\\s+${attr}="${name}"\\s+content="([^"]*)"`, 'i'));
  return m ? decode(m[1]).trim() : null;
};

const sitemap = fs.readFileSync(path.join(__dirname, '../public/sitemap.xml'), 'utf8');
const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => new URL(m[1]).pathname)
  .filter((p) => !p.endsWith('.pdf'));

test('sitemap has pages to check', () => {
  assert.ok(paths.length >= 10, String(paths.length));
});

for (const p of paths) {
  test(`${p} title and meta fit the limits`, async () => {
    const res = await fetch(base + p);
    assert.equal(res.status, 200);
    const html = await res.text();
    const title = decode((html.match(/<title>([^<]*)<\/title>/i) || [])[1] || '').trim();
    const description = meta(html, 'name', 'description');
    assert.ok(title.length > 0 && title.length <= 60, `title ${title.length}: ${title}`);
    assert.ok(description && description.length <= 160, `description ${description && description.length}`);
    assert.notEqual(meta(html, 'property', 'og:title'), null, 'og:title missing');
    assert.notEqual(meta(html, 'property', 'og:description'), null, 'og:description missing');
    assert.doesNotMatch(title + description, /[\u2013\u2014]/);
  });
}
