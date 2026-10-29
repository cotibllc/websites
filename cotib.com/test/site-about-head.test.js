// /about has its own title, description and og tags, not the homepage's.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const read = (f) => fs.readFileSync(path.join(__dirname, '..', 'www', f), 'utf8');
const head = (html) => ({
  title: html.match(/<title>([^<]*)<\/title>/)[1],
  description: html.match(/<meta name="description" content="([^"]*)"/)[1],
  ogTitle: html.match(/<meta property="og:title" content="([^"]*)"/)[1],
  ogDescription: html.match(/<meta property="og:description" content="([^"]*)"/)[1],
  ogUrl: html.match(/<meta property="og:url" content="([^"]*)"/)[1],
});

test('/about head is its own and dash-free', () => {
  const about = head(read('about.html'));
  const home = head(read('index.html'));
  assert.equal(about.title, 'About Charles Betancourt | COTIB LLC');
  assert.equal(about.ogTitle, about.title);
  assert.equal(about.ogUrl, 'https://cotib.com/about');
  for (const k of ['title', 'description', 'ogTitle', 'ogDescription']) {
    assert.notEqual(about[k], home[k], `${k} matches the homepage`);
    assert.doesNotMatch(about[k], /[\u2013\u2014]/, k);
  }
});
