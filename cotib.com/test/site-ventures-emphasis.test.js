// /ventures descriptions used Markdown **asterisks** that showed as
// literal characters. They must render as emphasis, with no ** in the
// visible text.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'www', 'ventures.html'), 'utf8');

function renderedText(s) {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

const DESCRIPTIONS = [
  {
    name: 'Tech Lead Shift',
    source: /<p class="text-navy-300 font-light leading-relaxed text-base">\s*(Managing engineering teams[\s\S]*?governance\.)\s*<\/p>/,
  },
  {
    name: 'The IT XP',
    source: /<p class="text-navy-300 font-light leading-relaxed text-base">\s*(A show dedicated entirely[\s\S]*?trenches\.)\s*<\/p>/,
  },
  {
    name: 'Corporate Hardcore',
    source: /<p class="text-navy-300 font-light leading-relaxed text-base">\s*(Office lifer culture[\s\S]*?grind\.)\s*<\/p>/,
  },
];

test('/ventures rendered text has no literal **', () => {
  assert.doesNotMatch(renderedText(html), /\*\*/);
});

test('/ventures wraps the three description names in <strong> and keeps the words', () => {
  const seen = DESCRIPTIONS.map(({ name, source }) => {
    const m = html.match(source);
    assert.ok(m, `${name} description not found`);
    const inner = m[1];
    assert.match(inner, new RegExp(`<strong>${name}</strong>`));
    assert.doesNotMatch(inner, /\*\*/);
    return `${name}: ${renderedText(inner)}`;
  });
  assert.deepEqual(seen, [
    "Tech Lead Shift: Managing engineering teams is transforming rapidly in the age of generative AI and developer-agents. Tech Lead Shift is a research-backed leadership series analyzing what it takes to manage hybrid teams of human engineers and autonomous AI agents. Written from a practitioner's perspective, each issue provides actionable frameworks to maintain delivery speed, support developer growth, and governance.",
    'The IT XP: A show dedicated entirely to the world of Information Technology and the experienced engineers driving modern business. The IT XP pulls back the curtain on tech architecture, real operational challenges, and career scaling. We discuss complex migrations, DevOps implementations, database choices, and the real-world experiences of practitioners in the trenches.',
    "Corporate Hardcore: Office lifer culture can be absurd. Corporate Hardcore documents the everyday theater of corporate environments through satirical lens. It's not a rebellion against the workplace, but rather a keen, humorous observation of meetings that should have been emails, corporate jargon, and lifer survival strategies. By making IT professionals and managers laugh, it builds a massive community that resonates deeply with the real daily grind.",
  ]);
});
