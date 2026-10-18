# China Entry Checklist PDF

Copy source: EE Marketing `checklist.md` (ee-china-copy-2026-10, checked October 18, 2026).

1. `node scripts/china-checklist/build-data.js /path/to/checklist.md` writes `config/china-checklist.json` (verbatim, markdown bold and links only).
2. `node scripts/china-checklist/print-html.js > /tmp/china-entry-checklist.html`
3. Print that HTML to `public/downloads/china-entry-checklist.pdf` with headless Chrome (US Letter, print backgrounds on; 2 pages at 9.5pt body text, sections kept whole), the same way the cruise guide PDF was made.

Rebuild all three whenever the checklist copy changes, and update the "Last checked" line in the copy first.
