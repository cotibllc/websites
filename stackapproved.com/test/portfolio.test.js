'use strict';
// Portfolio slot 1 checks. Chuck's Oct 30 rulings: Test-01 (YouTube Short
// isx3vZGxUhM) fills the slot 1 tile as a click-to-play facade, with the
// approved spec ad label as a caption under the tile. The server HTML ships
// a thumbnail button only; www/js/main.js swaps in the iframe on click.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const index = fs.readFileSync(path.join(__dirname, '..', 'www', 'index.html'), 'utf8');
const LABEL = 'Spec ad: made unpaid, on my own, for Claude Code. Not a client.';
const VIDEO_ID = 'isx3vZGxUhM';

// Slots 2 and 3 exactly as they shipped in #63. Any edit to them fails here.
const SLOT2 = `<div class="glass-card aspect-[9/16] max-h-96 flex flex-col items-center justify-center gap-3 p-6">
                        <span class="font-mono text-brand text-lg">[ ]</span>
                        <p class="font-mono text-sm text-ink-500 text-center">screen demo + face<br>in production</p>
                    </div>`;
const SLOT3 = `<div class="glass-card aspect-[9/16] max-h-96 flex flex-col items-center justify-center gap-3 p-6 sm:col-span-2 lg:col-span-1">
                        <span class="font-mono text-brand text-lg">[ ]</span>
                        <p class="font-mono text-sm text-ink-500 text-center">problem → agitate → solve<br>in production</p>
                    </div>`;

function workTiles(html) {
  const section = html.match(/<section id="work"[\s\S]*?<\/section>/);
  assert.ok(section, 'section#work exists');
  const grid = section[0].match(/<div class="grid[^"]*">([\s\S]*)<\/div>\s*<\/div>\s*<\/section>/);
  assert.ok(grid, 'work grid exists');
  // Top level tiles open at the grid's child indent (20 spaces).
  const tiles = grid[1].split(/\n {20}(?=<(?:div|figure)\b)/).slice(1).map((t) => t.trimEnd());
  assert.equal(tiles.length, 3, 'work grid has three tiles');
  return tiles;
}

function slot1Parts() {
  const [slot1] = workTiles(index);
  assert.match(slot1, /^<figure\b[^>]*data-portfolio-slot="1"/, 'slot 1 is a figure');
  const m = slot1.match(
    /^<figure\b[^>]*>\s*<div class="glass-card aspect-\[9\/16\][^"]*"[^>]*data-video-frame[^>]*>([\s\S]*?)<\/div>\s*<figcaption class="([^"]*)">([\s\S]*?)<\/figcaption>\s*<\/figure>$/
  );
  assert.ok(m, 'slot 1 is a 9:16 frame followed by a figcaption, nothing else');
  return { slot1, frame: m[1], captionClass: m[2], caption: m[3] };
}

test('no iframe in the initial page HTML (the embed loads only on click)', () => {
  assert.doesNotMatch(index, /<iframe\b/i);
});

test('slot 1 server HTML is a facade button with thumbnail, aria-label and video id', () => {
  const { frame } = slot1Parts();
  assert.doesNotMatch(frame, /<div\b/, 'the frame holds no nested wrappers');
  const buttons = [...frame.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)];
  assert.equal(buttons.length, 1, 'slot 1 has exactly one button');
  const [, attrs, inner] = buttons[0];
  assert.match(attrs, /\btype="button"/);
  assert.match(attrs, /\bclass="sa-facade"/);
  assert.match(attrs, new RegExp(`\\bdata-video-id="${VIDEO_ID}"`));
  assert.match(attrs, /\baria-label="Play spec ad for Claude Code"/);

  const imgs = [...inner.matchAll(/<img\b[^>]*>/g)].map((x) => x[0]);
  assert.equal(imgs.length, 1, 'the button holds one thumbnail image');
  const img = imgs[0];
  assert.match(img, new RegExp(`\\bsrc="https://i\\.ytimg\\.com/vi/${VIDEO_ID}/oardefault\\.jpg"`));
  assert.match(img, new RegExp(`\\bdata-fallback-src="https://i\\.ytimg\\.com/vi/${VIDEO_ID}/hqdefault\\.jpg"`));
  assert.match(img, /\balt="[^"]{10,}"/, 'thumbnail has real alt text');
  assert.match(img, /\bloading="lazy"/);
  assert.match(inner, /<span class="sa-play" aria-hidden="true"><svg\b/, 'play glyph is decorative');
});

test('facade styles: cover fit, brand green glyph, no YouTube red, visible focus ring', () => {
  const style = index.match(/<style>([\s\S]*?)<\/style>/);
  assert.ok(style, 'page has the scoped facade style block');
  const css = style[1];
  assert.match(css, /\.sa-facade img\s*\{[^}]*object-fit:\s*cover/);
  assert.match(css, /\.sa-frame iframe[^{]*\{[^}]*width:\s*100%[^}]*height:\s*100%/s);
  assert.match(css, /\.sa-play\s*\{[^}]*#22C55E/i, 'glyph uses the brand green');
  assert.match(css, /\.sa-facade:focus-visible\s*\{[^}]*outline:\s*\d+px solid/);
  assert.doesNotMatch(css, /#f00\b|#ff0000|#ff0033|red\b/i, 'no YouTube red');
  assert.doesNotMatch(css, /backdrop-filter|blur\(|box-shadow/i, 'no glass or soft shadows on the facade');
});

test('noscript fallback links to the Short', () => {
  const { frame } = slot1Parts();
  assert.match(frame, /<noscript>\s*<a\b[^>]*href="https:\/\/youtube\.com\/shorts\/isx3vZGxUhM"[^>]*>[^<]+<\/a>\s*<\/noscript>/);
});

test('caption is exact, mono ink-400, and sits under the 9:16 frame, not inside it', () => {
  const { frame, captionClass, caption } = slot1Parts();
  assert.equal(caption.trim(), LABEL);
  assert.deepEqual(captionClass.split(/\s+/).filter((c) => ['font-mono', 'text-sm', 'text-ink-400'].includes(c)).sort(), ['font-mono', 'text-ink-400', 'text-sm']);
  assert.ok(!frame.includes(LABEL), 'label is not inside the 9:16 frame');
  assert.equal(index.split(LABEL).length - 1, 1, 'label appears once on the page');
});

test('work slots 2 and 3 are unchanged placeholders', () => {
  const [, slot2, slot3] = workTiles(index);
  assert.equal(slot2, SLOT2);
  assert.equal(slot3, SLOT3);
});

// Click handler unit tests against a minimal fake DOM (main.js exports its
// facade functions under CommonJS and skips DOM wiring when there is no document).
const loadFacade = () => require('../www/js/main.js');

function fakeDoc() {
  const doc = {
    activeElement: null,
    createElement(tag) {
      const el = {
        tagName: tag.toUpperCase(),
        attrs: {},
        setAttribute(k, v) { this.attrs[k] = String(v); },
        focus() { doc.activeElement = this; },
      };
      return el;
    },
  };
  return doc;
}

function fakeButton(doc, videoId) {
  const listeners = {};
  return {
    dataset: { videoId },
    ownerDocument: doc,
    replacedWith: null,
    replaceWith(node) { this.replacedWith = node; },
    addEventListener(type, fn, opts) { listeners[type] = { fn, opts }; },
    listeners,
    querySelector() { return null; },
  };
}

test('buildVideoIframe makes the nocookie autoplay iframe with the #63 attributes', () => {
  const iframe = loadFacade().buildVideoIframe(fakeDoc(), VIDEO_ID);
  assert.equal(iframe.tagName, 'IFRAME');
  assert.deepEqual(iframe.attrs, {
    src: 'https://www.youtube-nocookie.com/embed/isx3vZGxUhM?autoplay=1&playsinline=1&rel=0',
    title: 'StackApproved spec ad for Claude Code',
    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    referrerpolicy: 'strict-origin-when-cross-origin',
    allowfullscreen: '',
  });
});

test('buildVideoIframe rejects anything that is not a YouTube video id', () => {
  for (const bad of ['', 'abc', 'isx3vZGxUhM"><script', '../../evil', undefined]) {
    assert.throws(() => loadFacade().buildVideoIframe(fakeDoc(), bad), /video id/);
  }
});

test('clicking the facade replaces the button with the iframe and moves focus to it', () => {
  const doc = fakeDoc();
  const button = fakeButton(doc, VIDEO_ID);
  loadFacade().initVideoFacades({ querySelectorAll: () => [button] });
  assert.ok(button.listeners.click, 'click listener bound');
  assert.deepEqual(button.listeners.click.opts, { once: true });
  button.listeners.click.fn();
  assert.ok(button.replacedWith, 'button was replaced');
  assert.equal(button.replacedWith.tagName, 'IFRAME');
  assert.match(button.replacedWith.attrs.src, /\/embed\/isx3vZGxUhM\?autoplay=1&playsinline=1&rel=0$/);
  assert.equal(doc.activeElement, button.replacedWith, 'focus follows to the player');
});
