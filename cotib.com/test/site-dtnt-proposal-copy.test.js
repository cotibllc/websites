// Locks the approved Astra proposal-test copy (Chuck, cards t1531s6956 and t1531s6959).
// Prices, consent, form behavior, the sampler, and the Nov 29 gate stay unchanged.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const PAGE = path.join(__dirname, '..', 'www', 'do-the-next-thing.html');
const BUILD = path.join(__dirname, '..', 'scripts', 'build-dtnt-pages.js');
const HUB = path.join(__dirname, '..', '..', 'cotib.link', 'index.html');
const CONSENT =
  'Email me the free sampler and up to 3 short emails over the next week about the paid Do the Next Thing Pack ($24) and Setup Kit ($37). I can unsubscribe any time.';

function load(file) {
  return fs.readFileSync(file, 'utf8');
}

test('DTNT page uses the approved hero, example, and heading A, and leaves the form, consent, and prices alone', () => {
  const html = load(PAGE);
  const doc = new JSDOM(html).window.document;

  assert.equal(doc.querySelector('#title').textContent.trim(), 'Do the Next Thing');
  assert.equal(
    doc.querySelector('.hero .sub').textContent.trim(),
    'A proposal draft waiting for you? Start with one small piece.',
  );
  assert.equal(
    doc.querySelector('.hero .lead').textContent.trim(),
    'Three free AI prompts for solo consultants and technical operators. Pick the one that matches your stall, paste it into your AI chat, and use a ten-minute timer to finish one concrete piece.',
  );
  const heroCta = doc.querySelector('.hero-actions a.btn-primary');
  assert.equal(heroCta.textContent.trim(), 'Email me the 3 free prompts');
  assert.equal(heroCta.getAttribute('href'), '#free');
  assert.equal(
    doc.querySelector('.hero-note').textContent.trim(),
    'A two-page PDF. Free AI chat accounts work. Confirm your email to receive it. The form below explains the follow-up emails.',
  );

  const example = doc.querySelector('section.example');
  assert.ok(example, 'worked example section is present');
  assert.equal(
    doc.querySelector('#example-label').textContent.trim(),
    'Example (illustrative, not a customer result)',
  );
  assert.equal(
    doc.querySelector('.example-task').textContent.trim(),
    "I need to start the opening of a consulting proposal and haven't begun.",
  );
  assert.equal(
    doc.querySelector('.example-response').textContent.trim(),
    "Open your proposal draft and write two rough sentences: the client's problem and the outcome they asked for. Done means those sentences are saved at the top of the draft.",
  );
  assert.match(
    example.textContent,
    /What to check after the timer: Two sentences saved in the actual proposal file\. If the suggested move is still too large, reply:/,
  );
  assert.equal(
    example.querySelector('code').textContent.trim(),
    '"Too big. Smaller. One move, under 10 minutes, no research."',
  );

  const hero = doc.querySelector('section.hero');
  const free = doc.querySelector('section#free');
  assert.ok(hero && free && example);
  assert.ok(
    hero.compareDocumentPosition(example) & doc.defaultView.Node.DOCUMENT_POSITION_FOLLOWING,
    'example comes after the hero (and the public 1.1 card inside it)',
  );
  assert.ok(
    example.compareDocumentPosition(free) & doc.defaultView.Node.DOCUMENT_POSITION_FOLLOWING,
    'example comes before the signup form',
  );

  assert.equal(doc.querySelector('#free-title').textContent.trim(), 'Get three of the 28 prompts, free');
  assert.equal(
    doc.querySelector('#free .section-head p').textContent.trim(),
    "One is for starting, one for coming back after a skip, and one for when you're researching instead of deciding. Paste one in, start a 10-minute timer, and see if it moves you.",
  );
  assert.doesNotMatch(html, /Not ready to buy\?/);

  const consent = doc.querySelector('#free-consent');
  assert.equal(consent.getAttribute('type'), 'checkbox');
  assert.ok(consent.hasAttribute('required'));
  assert.ok(!consent.hasAttribute('checked'));
  assert.equal(doc.querySelector('label.consent span').childNodes[0].textContent, CONSENT);
  assert.equal(doc.querySelector('#free-form button[type="submit"]').textContent.trim(), 'Send me the 3 prompts');
  assert.equal(doc.querySelector('#free-form').getAttribute('action'), '/do-the-next-thing/free');
  assert.ok(doc.querySelector('#free-utm-source') && doc.querySelector('#free-utm-medium') && doc.querySelector('#free-utm-campaign'));

  assert.equal(doc.querySelector('#t1').textContent.trim(), 'The Pack');
  assert.equal(doc.querySelector('#t1').parentElement.querySelector('.price b').textContent, '$24');
  assert.equal(doc.querySelector('#t2').parentElement.querySelector('.price b').textContent, '$37');
  assert.equal([...doc.querySelectorAll('p.soon')].filter((n) => n.textContent.trim() === 'Coming soon').length, 2);
  assert.doesNotMatch(html, /stripe\.com|buy\.|checkout|Get the Pack/i);
});

test('the DTNT build script carries the same approved copy as the committed page', () => {
  const script = load(BUILD);
  for (const snippet of [
    'A proposal draft waiting for you? Start with one small piece.',
    'Email me the 3 free prompts',
    'Example (illustrative, not a customer result)',
    'Get three of the 28 prompts, free',
    "One is for starting, one for coming back after a skip, and one for when you're researching instead of deciding.",
    'Send me the 3 prompts',
  ]) {
    assert.match(script, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), snippet);
  }
  assert.doesNotMatch(script, /Not ready to buy\?/);
});

test('cotib.link has a Do the Next Thing card after the COTIB card, with the approved text and destination and no checkout', () => {
  const html = load(HUB);
  const doc = new JSDOM(html).window.document;
  const cards = [...doc.querySelectorAll('.cards > .card')];
  const titles = cards.map((c) => c.querySelector('h2').textContent.trim());
  const cotibAt = titles.indexOf('COTIB');
  const dtntAt = titles.indexOf('Do the Next Thing');
  assert.ok(cotibAt >= 0, 'COTIB card is present');
  assert.equal(dtntAt, cotibAt + 1, 'DTNT card is immediately after the COTIB card');

  const card = cards[dtntAt];
  assert.equal(
    card.querySelector('p').textContent.trim(),
    "Three free AI prompts for when you already know the next step and still haven't started. Paste one in, start a ten-minute timer, and finish one small piece.",
  );
  const btn = card.querySelector('a.btn');
  assert.equal(btn.textContent.trim(), 'Start with 3 prompts, free');
  assert.equal(
    btn.getAttribute('href'),
    'https://www.cotib.com/do-the-next-thing?utm_source=cotib.link&utm_medium=linkhub&utm_campaign=do-the-next-thing',
  );
  assert.equal(card.querySelectorAll('.chip, .chips').length, 0, 'no chips');
  assert.doesNotMatch(card.outerHTML, /stripe\.com|checkout|buy\./i);
});
