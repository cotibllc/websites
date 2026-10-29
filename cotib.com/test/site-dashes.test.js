// House style: no em or en dashes in cotib.com copy, meta descriptions, the
// DTNT pages, or the script that generates them.
// Lines that open PRs rewrite are skipped here so the PRs merge cleanly:
// - <title>, og:title, twitter:title: fix/cotib-title-dashes (#42) and fix/cotib-about-title (#46).
// - about.html description + og:description: fix/cotib-about-title (#46).
// - "30 years" / "15+ years" lines: fix/cotib-about-years (#50) rewrites them dash-free.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DASH = /[\u2013\u2014]|&mdash;|&ndash;|&#821[12];/;
const SKIP_DIRS = new Set(['css', 'fontawesome', 'img', 'js']); // www/js is vendor code; www/dtnt/*.js is ours and is scanned

const OWNED_ELSEWHERE = [
  /<title>|<meta (?:property|name)="(?:og|twitter):title"/,
  /\b30 years\b|\b15\+ years\b/,
];
const ABOUT_HEAD = /^\s*<meta (?:name="description"|property="og:description") /;

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
      if (OWNED_ELSEWHERE.some((re) => re.test(line))) return;
      if (rel === 'www/about.html' && ABOUT_HEAD.test(line)) return;
      found.push(`${rel}:${i + 1}`);
    });
  }
  assert.deepEqual(found, []);
});
