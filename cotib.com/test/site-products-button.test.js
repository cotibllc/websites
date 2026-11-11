// The Products row on /ventures must vertically center the
// "Get the 3 free prompts" button against the title plus description.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'www', 'ventures.html'), 'utf8');

function productsSection() {
  const m = html.match(/<section\b[^>]*\bid="products"[^>]*>[\s\S]*?<\/section>/);
  assert.ok(m, 'products section not found');
  return m[0];
}

test('/ventures Products row uses items-center so the button is vertically centered', () => {
  const section = productsSection();
  const row = section.match(
    /<div class="([^"]*\bgrid\b[^"]*)">\s*<div class="lg:col-span-8[\s\S]*?<a href="\/do-the-next-thing#free"[^>]*>Get the 3 free prompts<\/a>/,
  );
  assert.ok(row, 'products row with the DTNT button not found');
  const classes = row[1].split(/\s+/);
  assert.ok(classes.includes('items-center'), `row should use items-center, got: ${row[1]}`);
  assert.ok(!classes.includes('items-start'), 'row should not use items-start');
});

test('/ventures Products button cell has no top padding that would offset centering', () => {
  const section = productsSection();
  const cell = section.match(/<div class="(lg:col-span-4[^"]*)">\s*<a href="\/do-the-next-thing#free"/);
  assert.ok(cell, 'button cell not found');
  assert.doesNotMatch(cell[1], /\b(?:sm:|md:|lg:|xl:)?pt-\d+\b/, `button cell top padding would offset vertical centering, got: ${cell[1]}`);
});
