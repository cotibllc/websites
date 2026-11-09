// Rule 37 site audit: every page in the sitemap has a <title> of 60 characters
// or fewer, a meta description of 160 or fewer, and og:title and og:description.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const WWW = path.join(__dirname, '..', 'www');
const decode = (s) =>
  s.replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const sitemap = fs.readFileSync(path.join(WWW, 'sitemap.xml'), 'utf8');
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
  const p = new URL(m[1]).pathname.replace(/^\/|\/$/g, '');
  return p === '' ? 'index.html' : `${p}.html`;
});

test('every sitemap page fits the title and description limits and has og tags', () => {
  assert.ok(pages.length >= 3);
  const problems = [];
  for (const f of pages) {
    const html = fs.readFileSync(path.join(WWW, f), 'utf8');
    const title = decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '').trim();
    const desc = html.match(/<meta name="description" content="([^"]*)"/);
    if (!title || title.length > 60) problems.push(`${f}: title ${title.length}`);
    if (!desc || decode(desc[1]).length > 160) problems.push(`${f}: description ${desc ? decode(desc[1]).length : 'missing'}`);
    if (!/<meta property="og:title" content="[^"]+"/.test(html)) problems.push(`${f}: og:title missing`);
    if (!/<meta property="og:description" content="[^"]+"/.test(html)) problems.push(`${f}: og:description missing`);
  }
  assert.deepEqual(problems, []);
});
