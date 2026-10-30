// House style: no em or en dashes in cotib.com copy, meta descriptions, the
// DTNT pages, or the script that generates them.
// #42, #46 and #50 are merged, so every line is checked, titles included.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DASH = /[\u2013\u2014]|&mdash;|&ndash;|&#821[12];/;
const SKIP_DIRS = new Set(['css', 'fontawesome', 'img', 'js']); // www/js is vendor code; www/dtnt/*.js is ours and is scanned


function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return SKIP_DIRS.has(e.name) ? [] : walk(p);
    return /\.(html|txt|js)$/.test(e.name) ? [p] : [];
  });
}

test('site copy and DTNT generator have no em or en dashes', () => {
  const files = [...walk(path.join(ROOT, 'www')), path.join(ROOT, 'scripts', 'build-dtnt-pages.js')];
  const found = [];
  for (const file of files) {
    const rel = path.relative(ROOT, file);
    fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      if (!DASH.test(line)) return;
      found.push(`${rel}:${i + 1}`);
    });
  }
  assert.deepEqual(found, []);
});
