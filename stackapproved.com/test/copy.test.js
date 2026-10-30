'use strict';
// Copy checks for Chuck's Oct 30 rulings: the contact H2 reads
// "Get 3 hook ideas" and every years claim on the SA site reads 25+.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const www = path.join(__dirname, '..', 'www');
const read = (file) => fs.readFileSync(path.join(www, file), 'utf8');
const index = read('index.html');
const siteFiles = ['index.html', 'privacy.html', 'terms.html', 'llms.txt'];

function contactSection(html) {
  const match = html.match(/<section id="contact"[\s\S]*?<\/section>/);
  assert.ok(match, 'section#contact exists');
  return match[0];
}

test('contact H2 reads "Get 3 hook ideas"', () => {
  const h2s = [...contactSection(index).matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => m[1].trim());
  assert.deepEqual(h2s, ['Get 3 hook ideas']);
});

test('"Send a brief" no longer appears anywhere on the page', () => {
  assert.doesNotMatch(index, /<h2[^>]*>\s*Send a brief\s*<\/h2>/);
  assert.doesNotMatch(index, /Send a brief/);
  assert.match(index, /Rates on inquiry\. Get 3 hook ideas and a\s+same-day quote\./);
});

test('submit button label is unchanged', () => {
  assert.match(index, /<button type="submit" id="submit-btn"[^>]*>Get 3 hook ideas<\/button>/);
});

test('no 20+ or 20 years claim remains on any SA page', () => {
  for (const file of siteFiles) {
    const text = read(file);
    assert.doesNotMatch(text, /\b20\s*\+/, `${file} has a 20+ claim`);
    assert.doesNotMatch(text, /\b20 years\b/i, `${file} has a 20 years claim`);
    assert.doesNotMatch(text, /\btwenty\b/i, `${file} has a twenty claim`);
  }
});

test('years claims read 25+ in meta, hero, stat, about and llms.txt', () => {
  assert.match(index, /<meta name="description" content="[^"]*25\+ years enterprise IT/);
  assert.match(index, /25\+ years on the buying side/);
  assert.match(index, /<dt[^>]*>25\+<\/dt>\s*<dd[^>]*>years enterprise IT<\/dd>/);
  assert.match(index, /I spent 25\+ years running enterprise IT/);
  assert.match(index, /25\+ years evaluating tools/);
  assert.match(read('llms.txt'), /Chuck Betancourt, 25\+ years enterprise IT/);
});
