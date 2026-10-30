// House rule: Chuck's experience is "25+ years" everywhere on cotib.com.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const WWW = path.join(__dirname, '..', 'www');
test('every years-of-experience claim says 25+ years', () => {
  const found = [];
  const files = fs.readdirSync(WWW).filter((n) => /\.(html|txt)$/.test(n));
  for (const f of files) {
    fs.readFileSync(path.join(WWW, f), 'utf8').split('\n').forEach((line, i) => {
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
  assert.equal(index.match(/25\+ years/g).length, 5);
  assert.equal(about.match(/25\+ years/g).length, 3);
  assert.equal(llms.match(/25\+ years/g).length, 4);
});
