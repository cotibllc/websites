// House rule: Chuck's experience is "25+ years" everywhere on cotib.com.
// Skipped until the PRs that own neighbouring lines merge, so git can merge cleanly:
// - about.html description + og:description: fix/cotib-about-title (#46) rewrites
//   them and drops the years claim.
// - index.html og:description: it sits next to the og:title line that
//   fix/cotib-title-dashes (#42) changes; follow-up after #42 merges.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const WWW = path.join(__dirname, '..', 'www');
const LATER = {
  'about.html': /^\s*<meta (?:name="description"|property="og:description") /,
  'index.html': /^\s*<meta property="og:description" /,
};

test('every years-of-experience claim says 25+ years', () => {
  const found = [];
  const files = fs.readdirSync(WWW).filter((n) => /\.(html|txt)$/.test(n));
  for (const f of files) {
    fs.readFileSync(path.join(WWW, f), 'utf8').split('\n').forEach((line, i) => {
      if (LATER[f] && LATER[f].test(line)) return;
      for (const m of line.matchAll(/\b(\d+)\+? years\b/g)) {
        if (!m[0].startsWith('25+')) found.push(`${f}:${i + 1}: ${m[0]}`);
      }
    });
  }
  assert.deepEqual(found, []);
});

test('the claims that were changed now read 25+', () => {
  const index = fs.readFileSync(path.join(WWW, 'index.html'), 'utf8');
  const about = fs.readFileSync(path.join(WWW, 'about.html'), 'utf8');
  const llms = fs.readFileSync(path.join(WWW, 'llms.txt'), 'utf8');
  assert.equal(index.match(/25\+ years/g).length, 4);
  assert.equal(about.match(/25\+ years/g).length, 3);
  assert.equal(llms.match(/25\+ years/g).length, 4);
});
