// MOCKUP Nov 11 2026 (held preview, not for merge): the homepage and /ventures
// redesign changes looks only. These checks pin what must not move (every link,
// in order, the DTNT sampler entry point, the MOCKUP label) and the never-do
// rules the new styles must keep (Chuck, Oct 27 2026).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const WWW = path.join(__dirname, '..', 'www');
const read = (f) => fs.readFileSync(path.join(WWW, f), 'utf8');
const CSS = read('css/mockup-nov11.css');
const links = (html) => [...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1]);

const NAV = ['/', '/', '/services', '/ventures', '/about', '/contact', '/', '/services', '/ventures', '/about', '/contact'];
const FOOT = ['/', '/services#cto', '/services#ai', '/services#finops', '/about', '/ventures', '/contact', '/website-privacy',
  'https://www.linkedin.com/in/charles-b-technologist/', 'https://techleadshift.substack.com', 'https://www.youtube.com/@theitxp'];
const LI = 'https://www.linkedin.com/in/charles-b-technologist/';

test('the homepage keeps every link, in the same order as production', () => {
  assert.deepEqual(links(read('index.html')), [...NAV,
    '/contact', '/services', 'https://stackapproved.com', '/ventures', 'https://earnedescape.agency', '/ventures', '/ventures', '/do-the-next-thing',
    LI, '/about', '/about', '/services#cto', '/services#ai', '/services#finops', '/services',
    'https://techleadshift.com', 'https://techleadshift.substack.com', '/ventures', 'https://theitxp.com', 'https://www.youtube.com/@theitxp', '/ventures',
    '/contact', LI, ...FOOT]);
});

test('/ventures keeps every link, in order, including the Do the Next Thing sampler link', () => {
  assert.deepEqual(links(read('ventures.html')), [...NAV,
    'https://stackapproved.com', 'https://earnedescape.agency', '/do-the-next-thing#free',
    'https://techleadshift.com', 'https://techleadshift.substack.com', LI,
    'https://theitxp.com', 'https://www.youtube.com/@theitxp', 'https://twitter.com/theitxp',
    'https://corphardcore.com', 'https://www.youtube.com/@corphardcore', 'https://www.instagram.com/corphardcore/', 'https://www.tiktok.com/@corphardcore',
    '/contact', '/services', ...FOOT]);
  assert.match(read('ventures.html'), /<a href="\/do-the-next-thing#free" class="btn">Get the 3 free prompts<\/a>/);
});

test('both mockup pages carry the fixed MOCKUP label and the scoped stylesheet; no other page does', () => {
  for (const f of ['index.html', 'ventures.html']) {
    const html = read(f);
    assert.match(html, /<body class="mk">/, f);
    assert.match(html, /<div class="mockup-flag"[^>]*>MOCKUP, PREVIEW ONLY<\/div>/, f);
    assert.match(html, /<link href="css\/mockup-nov11\.css" rel="stylesheet" \/>/, f);
  }
  assert.match(CSS, /\.mk \.mockup-flag \{\s*position: fixed;/);
  const others = fs.readdirSync(WWW, { recursive: true })
    .filter((f) => f.endsWith('.html') && !['index.html', 'ventures.html'].includes(f))
    .filter((f) => /mockup-nov11|class="mk"/.test(read(f)));
  assert.deepEqual(others, []);
});

test('every rule in the mockup stylesheet is scoped under body.mk', () => {
  const body = CSS.replace(/\/\*[\s\S]*?\*\//g, '');
  const selectors = [...body.matchAll(/([^{}@]+)\{[^{}]*\}/g)].map((m) => m[1].trim()).filter((s) => s && !/^(from|to|\d+%)$/.test(s));
  const loose = selectors.flatMap((s) => s.split(',').map((x) => x.trim())).filter((x) => !x.startsWith('.mk'));
  assert.deepEqual(loose, []);
});

test('never-do: no Inter, Roboto, Outfit or system sans as the primary face', () => {
  for (const f of ['index.html', 'ventures.html']) {
    const fonts = read(f).match(/fonts\.googleapis\.com\/css2\?[^"]+/)[0];
    assert.doesNotMatch(fonts, /Inter|Roboto|Outfit/, f);
  }
  const sans = CSS.match(/--sans: ([^;]+);/)[1];
  const serif = CSS.match(/--serif: ([^;]+);/)[1];
  assert.match(sans, /^'IBM Plex Sans'/);
  assert.match(serif, /^'Instrument Serif'/);
  assert.doesNotMatch(CSS, /system-ui|-apple-system|Inter\b|Roboto/);
});

test('never-do: no purple or indigo, no gradients, no glass, no soft shadows, no heavy rounding', () => {
  assert.doesNotMatch(CSS, /purple|indigo|violet|#(8B5CF6|7C3AED|6366F1|4F46E5|A855F7|9333EA)/i);
  assert.doesNotMatch(CSS, /gradient|backdrop-filter|box-shadow|blur\(/);
  for (const m of CSS.matchAll(/border-radius: (\d+)px/g)) assert.ok(Number(m[1]) <= 2, `radius ${m[1]}px`);
  for (const f of ['index.html', 'ventures.html']) assert.doesNotMatch(read(f), /\bglass(-card)?\b|bg-gradient|purple-|blur-/, f);
});

test('the three homepage pillars are a numbered list linking cto, ai and finops, not cards', () => {
  const html = read('index.html');
  const pillars = [...html.matchAll(/<div class="pillar">\s*<h3>([^<]+)<\/h3>[\s\S]*?href="(\/services#\w+)"/g)].map((m) => `${m[1]} ${m[2]}`);
  assert.deepEqual(pillars, ['Fractional CTO & Advisory /services#cto', 'AI Platform Engineering /services#ai', 'FinOps & Cost Control /services#finops']);
  assert.doesNotMatch(html, /Cloud Security/);
});
