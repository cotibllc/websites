// China Entry Checklist: one copy source (config/china-checklist.json, built
// verbatim from EE Marketing's checklist.md) rendered three ways: the
// printable PDF, the delivery email body, and the /china page summary.
const data = require('../config/china-checklist.json');

const BOX = '&#9744;';

// Printable HTML (2 pages, US Letter). 2 pages at 9.5pt, no section split across pages. Printed to public/downloads/china-entry-checklist.pdf
// with headless Chrome (see scripts/china-checklist/README.md).
function printHtml() {
  const items = (list) => list.map((it) => `<li><span class="box">${BOX}</span><div>${it.html}${it.sub.length ? `<ul>${items(it.sub)}</ul>` : ''}</div></li>`).join('');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${data.title}</title>
<style>
  @page { size: letter; margin: 0.5in 0.55in; }
  * { box-sizing: border-box; }
  body { font-family: "Montserrat", "Inter", Arial, sans-serif; color: #1d1530; font-size: 9.5pt; line-height: 1.32; margin: 0; }
  header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #C9A84C; padding-bottom: 6px; margin-bottom: 8px; }
  h1 { font-family: "Playfair Display", Georgia, serif; font-weight: 500; font-size: 19pt; color: #512E5F; margin: 0; line-height: 1.1; }
  .brand { font-size: 8pt; letter-spacing: 0.14em; text-transform: uppercase; color: #9E7B2E; text-align: right; }
  .intro p { margin: 0 0 2px; }
  .intro { margin-bottom: 8px; }
  .cols { }
  section { margin-bottom: 8px; break-inside: avoid; page-break-inside: avoid; }
  h2 { font-family: "Playfair Display", Georgia, serif; font-weight: 500; font-size: 12.5pt; color: #512E5F; margin: 0 0 4px; padding-bottom: 2px; border-bottom: 1px solid #e3d6ea; break-after: avoid; page-break-after: avoid; }
  .sec-intro { break-before: avoid; }
  h2 + ul > li:first-child, .sec-intro + ul > li:first-child { break-before: avoid; }
  ul { list-style: none; margin: 0; padding: 0; }
  li { display: flex; gap: 5px; margin: 0 0 3px; break-inside: avoid; }
  li ul { margin-top: 2px; }
  li li { margin-bottom: 2px; }
  .sec-intro { margin: 0 0 4px; font-style: italic; }
  .box { font-size: 11pt; line-height: 1; color: #76448A; flex: none; }
  a { color: #76448A; text-decoration: underline; }
  strong { font-weight: 700; }
  footer { margin-top: 8px; border-top: 1px solid #C9A84C; padding-top: 6px; break-inside: avoid; }
  footer p { margin: 0 0 2px; }
</style>
</head>
<body>
<header><h1>${data.title}</h1><div class="brand">Earned Escape</div></header>
<div class="intro">${data.intro.map((p) => `<p>${p.html}</p>`).join('')}</div>
<div class="cols">
${data.sections.map((s) => `<section><h2>${s.heading}</h2>${(s.intro || []).map((p) => `<p class="sec-intro">${p.html}</p>`).join('')}<ul>${items(s.items)}</ul></section>`).join('\n')}
</div>
<footer>${data.closing.map((p) => `<p>${p.html}</p>`).join('')}</footer>
</body>
</html>`;
}

// Email body (inline styles only).
function emailHtml() {
  const A = 'color:#512E5F;';
  const fix = (html) => html.replace(/<a href=/g, `<a style="${A}" href=`);
  const items = (list, nested) => `<ul style="margin:${nested ? '6px 0 0' : '0 0 16px'}; padding-left:${nested ? '18px' : '20px'}; list-style:none;">${list.map((it) => `<li style="margin:0 0 8px;">&#9744; ${fix(it.html)}${it.sub.length ? items(it.sub, true) : ''}</li>`).join('')}</ul>`;
  return `
  ${data.intro.map((p) => `<p style="margin:0 0 8px;">${fix(p.html)}</p>`).join('')}
  ${data.sections.map((s) => `<h2 style="font-size:17px; color:#512E5F; margin:24px 0 10px;">${s.heading}</h2>${(s.intro || []).map((p) => `<p style="margin:0 0 10px;">${fix(p.html)}</p>`).join('')}${items(s.items)}`).join('')}
  ${data.closing.map((p) => `<p style="margin:16px 0 0;">${fix(p.html)}</p>`).join('')}`;
}

module.exports = { data, printHtml, emailHtml };
