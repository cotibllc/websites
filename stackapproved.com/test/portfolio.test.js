'use strict';
// Portfolio slot 1 checks for Chuck's Oct 30 ruling: Test-01 is embedded
// as a 9:16 privacy-friendly YouTube Short with the approved spec ad label.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const index = fs.readFileSync(path.join(__dirname, '..', 'www', 'index.html'), 'utf8');
const LABEL = 'Spec ad: made unpaid, on my own, for Claude Code. Not a client.';

function workTiles(html) {
  const section = html.match(/<section id="work"[\s\S]*?<\/section>/);
  assert.ok(section, 'section#work exists');
  const grid = section[0].match(/<div class="grid[^"]*">([\s\S]*)<\/div>\s*<\/div>\s*<\/section>/);
  assert.ok(grid, 'work grid exists');
  // Split on top level tiles: each tile opens with a glass-card div at the grid's indent.
  const tiles = grid[1].split(/\n {20}<div class="glass-card/).slice(1);
  assert.equal(tiles.length, 3, 'work grid has three tiles');
  return tiles;
}

test('work slot 1 embeds Test-01 from youtube-nocookie in a 9:16 wrapper', () => {
  const [slot1] = workTiles(index);
  const iframes = [...slot1.matchAll(/<iframe\b[^>]*>/g)].map((m) => m[0]);
  assert.equal(iframes.length, 1, 'slot 1 has exactly one iframe');
  const iframe = iframes[0];
  assert.match(iframe, /src="https:\/\/www\.youtube-nocookie\.com\/embed\/isx3vZGxUhM"/);
  assert.match(iframe, /title="[^"]+"/);
  assert.match(iframe, /loading="lazy"/);
  assert.match(iframe, /allowfullscreen/);
  assert.match(iframe, /referrerpolicy="strict-origin-when-cross-origin"/);
  assert.match(slot1, /<div class="aspect-\[9\/16\][^"]*"[^>]*>\s*<iframe/, 'iframe sits in a 9/16 wrapper');
});

test('work slot 1 shows the approved label exactly, as a visible caption', () => {
  const [slot1] = workTiles(index);
  const captions = [...slot1.matchAll(/<p class="font-mono[^"]*">([\s\S]*?)<\/p>/g)].map((m) => m[1].trim());
  assert.deepEqual(captions, [LABEL]);
  assert.equal(index.split(LABEL).length - 1, 1, 'label appears once on the page');
});

test('work slots 2 and 3 stay placeholders with no embed', () => {
  const [, slot2, slot3] = workTiles(index);
  for (const tile of [slot2, slot3]) {
    assert.doesNotMatch(tile, /<iframe|<video/);
    assert.match(tile, /in production<\/p>/);
  }
  assert.match(slot2, /screen demo \+ face/);
  assert.match(slot3, /problem → agitate → solve/);
});
