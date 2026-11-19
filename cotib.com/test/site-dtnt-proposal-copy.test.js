// Locks the approved Astra proposal-test copy (Chuck, cards t1531s6956, t1531s6959, and t1532u).
// Updated Nov 17 for the email-series reposition and consent Option B (Chuck, t1630u, t1631s7334):
// the hero lead, hero note, CTA, signup copy, FAQ, consent boxes and meta descriptions changed; prices, the form
// action, Turnstile, UTM fields, the example and the headline did not.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const PAGE = path.join(__dirname, '..', 'www', 'do-the-next-thing.html');
const BUILD = path.join(__dirname, '..', 'scripts', 'build-dtnt-pages.js');
const HUB = path.join(__dirname, '..', '..', 'cotib.link', 'index.html');
const VENTURES = path.join(__dirname, '..', 'www', 'ventures.html');
const CONSENT = 'Email me the free Do the Next Thing coaching tips, one short email at a time. I can unsubscribe any time.';
const MARKETING_CONSENT = 'Also send me occasional emails about paid Do the Next Thing products.';
const TAGLINE = 'Short coaching tips for the one small piece you keep putting off.';
const BLURB =
  'Get a short coaching tip by email on getting unstuck, built for solo consultants and technical operators with a side offer to move forward. Each tip names a stall you probably know, gives one technique and a line to paste into your AI chat, and ends with one small thing to do today.';
const PAGE_TITLE = 'Do the Next Thing: Start with one small piece. | COTIB LLC';
const PAGE_DESCRIPTION =
  'Do the Next Thing: A proposal draft waiting for you? Start with one small piece. Short coaching tips for the one small piece you keep putting off.';
const SOCIAL_TITLE =
  'Do the Next Thing: A proposal draft waiting for you? Start with one small piece. | COTIB LLC';
const SOCIAL_DESCRIPTION =
  'Do the Next Thing: A proposal draft waiting for you? Start with one small piece. Short coaching tips for the one small piece you keep putting off. Each tip gives one technique and a line to paste into your AI chat.';

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
    TAGLINE,
  );
  const heroCta = doc.querySelector('.hero-actions a.btn-primary');
  assert.equal(heroCta.textContent.trim(), 'Email me the free coaching tips');
  assert.equal(heroCta.getAttribute('href'), '#free');
  assert.equal(
    doc.querySelector('.hero-note').textContent.trim(),
    'Free AI chat accounts work. Confirm your email to start. The form below explains exactly what we will send.',
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

  assert.equal(doc.querySelector('#free-title').textContent.trim(), 'Get the free coaching tips');
  assert.equal(
    doc.querySelector('#free .section-head p').textContent.trim(),
    BLURB,
  );
  assert.doesNotMatch(html, /Not ready to buy\?/);

  const consent = doc.querySelector('#free-consent');
  assert.equal(consent.getAttribute('type'), 'checkbox');
  assert.ok(consent.hasAttribute('required'));
  assert.ok(!consent.hasAttribute('checked'));
  const spans = [...doc.querySelectorAll('label.consent span')];
  assert.equal(spans.length, 2);
  assert.equal(spans[0].childNodes[0].textContent, CONSENT);
  assert.equal(spans[0].querySelector('small').textContent, 'Required');
  const marketing = doc.querySelector('#free-marketing-consent');
  assert.equal(marketing.getAttribute('type'), 'checkbox');
  assert.equal(marketing.getAttribute('name'), 'marketing_consent');
  assert.ok(!marketing.hasAttribute('required') && !marketing.hasAttribute('checked'), 'optional and unchecked');
  assert.equal(spans[1].childNodes[0].textContent, MARKETING_CONSENT);
  assert.equal(spans[1].querySelector('small').textContent, 'Optional');
  assert.equal(doc.querySelector('#free-form button[type="submit"]').textContent.trim(), 'Send me the free tips');
  assert.equal(doc.querySelector('#free-form').getAttribute('action'), '/do-the-next-thing/free');
  assert.ok(doc.querySelector('#free-utm-source') && doc.querySelector('#free-utm-medium') && doc.querySelector('#free-utm-campaign'));

  assert.equal(doc.querySelector('#t1').textContent.trim(), 'The Coaching Tips Library');
  assert.equal(doc.querySelector('#t2').textContent.trim(), 'The Coaching Tips Library plus Assistant Setup Kit');
  assert.equal(doc.querySelector('#t1').parentElement.querySelector('.price b').textContent, '$24');
  assert.equal(doc.querySelector('#t2').parentElement.querySelector('.price b').textContent, '$37');
  assert.equal([...doc.querySelectorAll('p.soon')].filter((n) => n.textContent.trim() === 'Coming soon').length, 2);
  assert.doesNotMatch(html, /stripe\.com|buy\.|checkout|Get the Pack/i);

  const footerCta = doc.querySelector('section.close a.btn-quiet');
  assert.equal(footerCta.textContent.trim(), 'Email me the free coaching tips');
  assert.equal(footerCta.getAttribute('href'), '#free');
});

test('the leftover prompt-pack sections now describe coaching tips, and the paid tiers keep their prices and Coming soon', () => {
  const html = load(PAGE);
  const doc = new JSDOM(html).window.document;
  const text = (sel) => doc.querySelector(sel).textContent.replace(/\s+/g, ' ').trim();

  // Hero sample card: the prompt is the tool inside tip 1, not a numbered pack item.
  const card = doc.querySelector('.hero-figure article.sheet');
  assert.equal(card.getAttribute('aria-label'), 'The line inside tip 1');
  assert.deepEqual([...card.querySelectorAll('.sheet-meta span')].map((n) => n.textContent), ['Tip 1: START', 'The line inside']);
  assert.equal(card.querySelector('h2').textContent, 'The first ugly version');
  assert.ok(!card.querySelector('.num'), 'no 1.1 prompt number');

  assert.match(text('section[aria-label="What it is"] .story'), /^You already know the step\. What's missing is a move small enough .* Do the Next Thing is a short coaching tip for that moment\. .* Each tip names the stall and gives you one technique\. The line inside is the tool: paste it into ChatGPT/);
  assert.match(text('section[aria-label="What it is"] .closer'), /^None of the tips explain why you stalled\./);
  assert.deepEqual([...doc.querySelectorAll('#how ~ .steps li, .steps li')].map((li) => li.querySelector('div').childNodes[0].textContent),
    ['Read the tip.', 'Paste the line into any AI chat app and swap the [brackets] for your own words.', 'Start a 10-minute timer and do the one move it gives you.']);
  assert.equal(text('#inside'), 'Five kinds of stall');
  assert.deepEqual([...doc.querySelectorAll('.index-row h3')].map((h) => h.textContent), ['START', 'CONTINUE', 'RESTART AFTER A SKIP', 'DECIDE', 'SHIP']);
  assert.match(text('.by-name'), /^The first three tips: The proposal opening you keep avoiding\. The follow-up you skipped\. Close the tabs, pick one\./);
  assert.equal(doc.querySelector('.by-name a').getAttribute('href'), '/do-the-next-thing/tips');
  assert.equal(text('.faq details:nth-of-type(4) summary'), 'How do the tips arrive?');
  assert.match(text('.faq details:nth-of-type(4) p'), /^As three short emails, timed from the day you confirm your signup: Tip 1 right away, Tip 2 on day 3 and Tip 3 on day 7\./);
  assert.equal(text('.faq details:nth-of-type(3) summary'), "What's the Coach?");
  assert.match(text('.faq details:nth-of-type(3) p'), /^A bonus that comes with the paid Setup Kit, which is coming later\. It's an AI coach, built as a Grok Bot template, that picks one 10-minute move with you at a time using the Coaching Tips Library\./);
  assert.doesNotMatch(html, /<h2 id="inside">28 prompts|Bucket 1|In the free sampler|A few of the prompts by name|isn't the right pack|is 28 prompts for that moment/);

  // Paid tiers: still coming soon, prices unchanged, still no buy links.
  assert.equal(text('#pick-title'), 'Paid versions come later');
  assert.equal(doc.querySelector('#t1').parentElement.querySelector('.price b').textContent, '$24');
  assert.equal(doc.querySelector('#t2').parentElement.querySelector('.price b').textContent, '$37');
  assert.equal([...doc.querySelectorAll('p.soon')].filter((n) => n.textContent.trim() === 'Coming soon').length, 2);
  assert.doesNotMatch(html, /stripe\.com|buy\.|checkout|Get the Pack/i);
});

test('the page makes no promise of a prompt-pack sale or "up to 3 emails about the paid Pack"', () => {
  const html = load(PAGE) + load(path.join(__dirname, '..', 'www', 'do-the-next-thing', 'privacy.html'));
  assert.doesNotMatch(html, /up to 3|few short emails about the full Pack|Consent also covers|Get three of the 28 prompts|Email me the 3 free prompts|Send me the 3 prompts/i);
});

test('DTNT title, meta, og, and twitter tags use the approved headline and subhead, within the 60 and 160 limits', () => {
  const html = load(PAGE);
  const doc = new JSDOM(html).window.document;
  const content = (sel) => {
    const el = doc.querySelector(sel);
    assert.ok(el, sel);
    return el.getAttribute('content');
  };
  const title = doc.querySelector('title').textContent.trim();
  const description = content('meta[name="description"]');
  assert.equal(title, PAGE_TITLE);
  assert.ok(title.length <= 60, String(title.length));
  assert.equal(description, PAGE_DESCRIPTION);
  assert.ok(description.length <= 160, String(description.length));
  assert.equal(content('meta[property="og:title"]'), SOCIAL_TITLE);
  assert.equal(content('meta[property="og:description"]'), SOCIAL_DESCRIPTION);
  assert.equal(content('meta[name="twitter:card"]'), 'summary_large_image');
  assert.equal(content('meta[name="twitter:title"]'), SOCIAL_TITLE);
  assert.equal(content('meta[name="twitter:description"]'), SOCIAL_DESCRIPTION);
  assert.match(title, /Start with one small piece/);
  assert.match(description, /A proposal draft waiting for you\? Start with one small piece/);
  assert.match(description, /Short coaching tips for the one small piece you keep putting off/);
  assert.match(SOCIAL_TITLE, /A proposal draft waiting for you\? Start with one small piece/);
  assert.match(SOCIAL_DESCRIPTION, /a line to paste into your AI chat/);
});

test('/ventures uses the approved DTNT headline and the coaching-tips blurb, and leaves the product name in place', () => {
  const html = load(VENTURES);
  const doc = new JSDOM(html).window.document;
  const block = doc.querySelector('#products');
  assert.equal(block.querySelector('h3').textContent.trim(), 'Do the Next Thing');
  assert.match(
    block.querySelector('p').textContent.replace(/\s+/g, ' ').trim(),
    /^A proposal draft waiting for you\? Start with one small piece\. Get short coaching tips by email, each with a line to paste into your AI chat\. The paid Coaching Tips Library is coming later\.$/,
  );
  assert.doesNotMatch(html, /28 prompts for when you know the step and still don't take it/);
  const btn = block.querySelector('a.btn-primary-custom');
  assert.equal(btn.textContent.trim(), 'Get the free coaching tips');
  assert.equal(btn.getAttribute('href'), '/do-the-next-thing#free');
});

test('the DTNT build script carries the same approved copy as the committed page', () => {
  const script = load(BUILD);
  for (const snippet of [
    'A proposal draft waiting for you? Start with one small piece.',
    'Email me the free coaching tips',
    'Example (illustrative, not a customer result)',
    'Get the free coaching tips',
    BLURB,
    TAGLINE,
    'Send me the free tips',
    'marketing_consent',
    'MARKETING_CONSENT_TEXT',
    PAGE_TITLE,
    PAGE_DESCRIPTION,
    SOCIAL_TITLE,
    SOCIAL_DESCRIPTION,
    'twitter: true',
    'Five kinds of stall',
    'The line inside',
    'Paste the line into any AI chat app',
    'How do the tips arrive?',
    'Already signed up?',
    '/do-the-next-thing/tips',
  ]) {
    assert.match(script, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), snippet);
  }
  assert.doesNotMatch(script, /Not ready to buy\?/);
  assert.doesNotMatch(script, /28 prompts for when you know the step and still don't take it/);
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
    'Short coaching tips for the one small piece you keep putting off. Each tip gives you one technique and a line to paste into your AI chat.',
  );
  const btn = card.querySelector('a.btn');
  assert.equal(btn.textContent.trim(), 'Get the free coaching tips');
  assert.equal(
    btn.getAttribute('href'),
    'https://www.cotib.com/do-the-next-thing?utm_source=cotib.link&utm_medium=linkhub&utm_campaign=do-the-next-thing',
  );
  assert.equal(card.querySelectorAll('.chip, .chips').length, 0, 'no chips');
  assert.doesNotMatch(card.outerHTML, /stripe\.com|checkout|buy\./i);
});

// Chuck, Nov 19, 2026 4:39 PM ET: paid tiers are coaching tips, not a prompt pack, and carry no count.
test('no user-visible "Pack" or "28" on the DTNT page, its privacy notice or /ventures, and the paid tiers read as coaching tips', () => {
  const visible = (file) => {
    const doc = new JSDOM(load(file)).window.document;
    doc.querySelectorAll('script, style').forEach((n) => n.remove());
    const attrs = [...doc.querySelectorAll('[alt], [aria-label], [title], meta[content]')].flatMap((n) => [n.getAttribute('alt'), n.getAttribute('aria-label'), n.getAttribute('title'), n.tagName === 'META' ? n.getAttribute('content') : null]).filter(Boolean);
    return `${doc.body.textContent}\n${attrs.join('\n')}`.replace(/\s+/g, ' ');
  };
  for (const file of [PAGE, VENTURES, path.join(__dirname, '..', 'www', 'do-the-next-thing', 'privacy.html')]) {
    const text = visible(file);
    assert.doesNotMatch(text, /\bPack\b/, `${path.basename(file)} shows "Pack"`);
    assert.doesNotMatch(text, /\b28\b/, `${path.basename(file)} shows "28"`);
    assert.doesNotMatch(text, /prompt/i, `${path.basename(file)} shows "prompt"`);
  }
  const doc = new JSDOM(load(PAGE)).window.document;
  const card = (id) => doc.querySelector(`#${id}`).parentElement.textContent.replace(/\s+/g, ' ').trim();
  assert.equal(card('t1'), 'The Coaching Tips Library $24 The full set of coaching tips, across the 5 kinds of stall A beginner how-to with one worked example, start to finish The one reply for when your AI gives you too much A 10-page PDF, a Notion template, and a one-page printable cheat sheet that maps back to the PDF Coming soon');
  assert.equal(card('t2'), 'The Coaching Tips Library plus Assistant Setup Kit $37 Everything in the Library, plus the Setup Kit: A setup guide for turning the coaching tips into a standing assistant you can come back to The coaching tips as plain text files, ready to paste Onboarding steps for your first session, from setup to your first 10-minute move Bonus: the Do the Next Thing Coach. A link to a ready-made Grok Bot template that walks you through the coaching tips, one move at a time. It\'s a bonus that comes with the kit, not the product itself. The Coach requires your own Grok Bot account on a paid plan, sold separately. Coming soon');
  assert.equal(doc.querySelector('#pick-title').textContent, 'Paid versions come later');
  assert.doesNotMatch(card('t2') + card('t1'), /skills/i);
  const faq = [...doc.querySelectorAll('.faq details')].map((d) => d.textContent.replace(/\s+/g, ' '));
  assert.ok(faq.some((t) => /^Do I need a paid AI account\? Not for the free tips, the Coaching Tips Library, or the coaching tips in the Setup Kit\./.test(t.trim())));
  assert.ok(faq.every((t) => !/skills/i.test(t)));
});
