// House style: no em or en dashes in page titles or the /contact email subject.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const WWW = path.join(__dirname, '..', 'www');
const DASH = /[\u2013\u2014]|&mdash;|&ndash;|&#821[12];/;
// about.html gets its own title in a separate PR (fix/cotib-about-title).
const LATER = new Set(['about.html']);

test('page <title>, og:title and twitter:title carry no em or en dash', () => {
  const found = [];
  for (const f of fs.readdirSync(WWW).filter((n) => n.endsWith('.html') && !LATER.has(n))) {
    const html = fs.readFileSync(path.join(WWW, f), 'utf8');
    const titles = [...html.matchAll(/<title>([^<]*)<\/title>|<meta (?:property|name)="(?:og|twitter):title" content="([^"]*)"/g)].map((m) => m[1] ?? m[2]);
    for (const t of titles) if (DASH.test(t)) found.push(`${f}: ${t}`);
  }
  assert.deepEqual(found, []);
});

test('the /contact notification subject has no em or en dash', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'api', 'contact.js'), 'utf8');
  const subject = src.match(/subject:\s*`([^`]*)`/);
  assert.ok(subject, 'subject line not found');
  assert.equal(subject[1], "[COTIB] Free Consultation: ${service || 'General Inquiry'}, from ${name}");
  assert.doesNotMatch(subject[1], DASH);
});
