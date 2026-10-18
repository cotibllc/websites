// Builds config/china-checklist.json from EE Marketing's checklist.md so the
// page, the delivery email and the PDF all use the copy verbatim.
// Usage: node scripts/china-checklist/build-data.js /path/to/checklist.md
const fs = require('fs');
const path = require('path');

const src = process.argv[2];
if (!src) { console.error('usage: build-data.js checklist.md'); process.exit(1); }
// EE CoS ruling (2026-10-18): the checklist PDF is 2 pages, so the gate
// blurb's page-count wording in checklist.md reads 'printable' on the site.
// Drop this replace once EE Marketing updates checklist.md.
const md = fs.readFileSync(src, 'utf8').replace(/my one-page entry checklist/g, 'my printable entry checklist');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Inline markdown: **bold** and [text](url). Everything else is escaped text.
function inline(s) {
  let out = '';
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
  let last = 0; let m;
  while ((m = re.exec(s))) {
    out += esc(s.slice(last, m.index));
    if (m[1] !== undefined) out += `<strong>${inline(m[1])}</strong>`;
    else out += `<a href="${esc(m[3])}">${esc(m[2])}</a>`;
    last = re.lastIndex;
  }
  return out + esc(s.slice(last));
}

const lines = md.split('\n');
const gateIdx = lines.findIndex((l) => l.startsWith('> ') && l.includes('checklist'));
const gateBlurb = lines[gateIdx].slice(2).trim();

const start = lines.findIndex((l) => /^# China Entry Checklist \(US passport\)/.test(l));
const notesIdx = lines.findIndex((l, i) => i > start && /^## Notes \(not for print\)/.test(l));
const body = lines.slice(start, notesIdx);

const data = { title: body[0].replace(/^# /, ''), gateBlurb, gateBlurbHtml: inline(gateBlurb), intro: [], sections: [], closing: [] };
let sec = null; let lastItem = null; let inClosing = false;
for (const raw of body.slice(1)) {
  const l = raw.replace(/\s+$/, '');
  if (!l.trim()) continue;
  if (l === '---') { if (sec) inClosing = true; continue; }
  const h = l.match(/^## (.+)$/);
  if (h) { sec = { heading: h[1], intro: [], items: [] }; data.sections.push(sec); continue; }
  const it = l.match(/^(\s*)- \[ \] (.+)$/);
  if (it && sec) {
    const item = { html: inline(it[2]), text: it[2], sub: [] };
    if (it[1].length >= 2 && lastItem) lastItem.sub.push(item);
    else { sec.items.push(item); lastItem = item; }
    continue;
  }
  const para = { html: inline(l), text: l };
  if (inClosing) data.closing.push(para);
  else if (!sec) data.intro.push(para);
  else if (!sec.items.length) sec.intro.push(para);
  else throw new Error('Unexpected line in section: ' + l);
}

const out = path.join(__dirname, '..', '..', 'config', 'china-checklist.json');
fs.writeFileSync(out, JSON.stringify(data, null, 2) + '\n');
console.log('wrote', out, data.sections.map((s) => `${s.heading}: ${s.items.length}`).join(' | '));
