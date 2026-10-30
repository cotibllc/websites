// Every /services#anchor link on cotib.com (pages and the DTNT generator)
// must land on a real section of /services. The Cloud Security pillar was
// dropped (no /services#security section exists), so its links went with it.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const WWW = path.join(ROOT, 'www');
const SKIP_DIRS = new Set(['css', 'fontawesome', 'img', 'js']);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return SKIP_DIRS.has(e.name) ? [] : walk(p);
    return /\.(html|txt|xml)$/.test(e.name) ? [p] : [];
  });
}

test('every /services#anchor points at a section that exists', () => {
  const ids = new Set([...fs.readFileSync(path.join(WWW, 'services.html'), 'utf8').matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  const files = [...walk(WWW), path.join(ROOT, 'lib', 'dtnt', 'pages.js')];
  const broken = [];
  for (const f of files) {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/\/services#([\w-]+)/g)) {
      if (!ids.has(m[1])) broken.push(`${path.relative(ROOT, f)}: #${m[1]}`);
    }
  }
  assert.deepEqual(broken, []);
});

test('homepage pillars grid has three cards in a three-column grid', () => {
  const html = fs.readFileSync(path.join(WWW, 'index.html'), 'utf8');
  const grid = html.split('<!-- Pillars Grid -->')[1].split('<div class="pt-6">')[0];
  assert.match(grid, /<div class="grid grid-cols-1 md:grid-cols-3 gap-6">/);
  assert.equal(grid.match(/glass-card/g).length, 3);
  assert.doesNotMatch(html, /Cloud Security/);
});
