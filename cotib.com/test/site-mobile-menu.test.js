// Every page with #mobile-menu-btn wires aria-controls and updates aria-expanded.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const WWW = path.join(__dirname, '..', 'www');
const pages = fs.readdirSync(WWW).filter((f) => f.endsWith('.html') && fs.readFileSync(path.join(WWW, f), 'utf8').includes('id="mobile-menu-btn"'));

test('the menu button exists on the expected pages', () => {
  assert.ok(pages.length >= 9, pages.join(', '));
});

for (const f of pages) {
  test(`${f}: button points at #mobile-menu and the script sets aria-expanded`, () => {
    const html = fs.readFileSync(path.join(WWW, f), 'utf8');
    const btn = html.match(/<button id="mobile-menu-btn"[^>]*>/)[0];
    assert.match(btn, /aria-expanded="false"/);
    assert.match(btn, /aria-controls="mobile-menu"/);
    assert.match(html, /<div id="mobile-menu"/);
    assert.match(html, /btn\.setAttribute\('aria-expanded', String\(open\)\)/);
    assert.doesNotMatch(html, /btn\.addEventListener\('click', \(\) => menu\.classList\.toggle\('hidden'\)\)/, 'old toggle without aria');
  });
}
