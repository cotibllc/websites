import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { getAllJargonEntriesIncludingScheduled, getJargonData, getSortedJargonData, glossaryMetaDescription } from "./jargon";
import { isPublished } from "./publish-date";

// Release schedule approved by CH CoS, one entry per Monday.
const SCHEDULE = [
  "2026-04-28 circle-back Circle Back",
  "2026-05-05 synergy Synergy",
  "2026-05-12 move-the-needle Move the Needle",
  "2026-11-09 bandwidth Bandwidth",
  "2026-11-16 alignment Alignment",
  "2026-11-23 boil-the-ocean Boil the Ocean",
  "2026-11-30 calibration Calibration",
  "2026-12-07 growth-opportunity Growth Opportunity",
  "2026-12-14 stretch-goal Stretch Goal",
  "2026-12-21 headcount-neutral Headcount Neutral",
  "2026-12-28 human-in-the-loop Human in the Loop",
  "2027-01-04 digital-coworker Digital Coworker",
  "2027-01-11 required-learning Required Learning",
  "2027-01-18 ticket-hygiene Ticket Hygiene",
  "2027-01-25 per-my-last-email Per My Last Email",
];

test("files on disk match the release schedule exactly", () => {
  const rows = getAllJargonEntriesIncludingScheduled()
    .map((m) => `${m.date} ${m.slug} ${m.title}`)
    .sort();
  assert.deepEqual(rows, SCHEDULE);
});

test("each new entry is dated on a Monday", () => {
  for (const row of SCHEDULE.slice(3)) {
    const date = row.slice(0, 10);
    assert.equal(new Date(`${date}T12:00:00Z`).getUTCDay(), 1, row);
  }
});

test("today (Nov 3 2026) only the three live entries show", () => {
  const now = new Date("2026-11-03T16:00:00Z");
  assert.deepEqual(getSortedJargonData(now).map((m) => m.slug), ["move-the-needle", "synergy", "circle-back"]);
});

test("Bandwidth: hidden 23:59:59 Sun Nov 8 ET, live 00:00 Mon Nov 9 ET", async () => {
  const before = new Date("2026-11-09T04:59:59Z");
  const at = new Date("2026-11-09T05:00:00Z");
  assert.equal(await getJargonData("bandwidth", before), null);
  assert.ok(!getSortedJargonData(before).some((m) => m.slug === "bandwidth"));
  assert.equal((await getJargonData("bandwidth", at))?.title, "Bandwidth");
  assert.equal(getSortedJargonData(at)[0].slug, "bandwidth");
});

test("each Monday adds exactly one entry, newest first", () => {
  const counts = SCHEDULE.slice(3).map((row) => {
    const date = row.slice(0, 10);
    // 12:00 ET on the release day, any offset
    return `${date} ${getSortedJargonData(new Date(`${date}T17:00:00Z`)).length} ${getSortedJargonData(new Date(`${date}T17:00:00Z`))[0].slug}`;
  });
  assert.deepEqual(counts, SCHEDULE.slice(3).map((row, i) => `${row.slice(0, 10)} ${4 + i} ${row.split(" ")[1]}`));
});

test("house dash rule: no em dashes, en dashes or spaced hyphens in any entry", () => {
  for (const m of getAllJargonEntriesIncludingScheduled()) {
    // Frontmatter values (not the YAML list markers) plus the Markdown body.
    const raw = fs.readFileSync(path.join(process.cwd(), "src/content/jargon", `${m.slug}.md`), "utf8");
    const body = raw.split("\n---\n").slice(1).join("\n---\n");
    const text = `${JSON.stringify(m)}\n${body}`;
    assert.doesNotMatch(text, /[\u2013\u2014]| - | -- /, m.slug);
  }
});

test("glossary meta description never names an unpublished term", () => {
  const all = getAllJargonEntriesIncludingScheduled();
  // Every hour from Apr 27 2026 to Feb 1 2027, plus each midnight boundary.
  const instants: Date[] = [];
  for (let t = Date.parse("2026-04-27T00:00:00Z"); t <= Date.parse("2027-02-01T00:00:00Z"); t += 3600_000) {
    instants.push(new Date(t));
  }
  for (const row of SCHEDULE) {
    const day = row.slice(0, 10);
    for (const z of ["03:59:59", "04:00:00", "04:59:59", "05:00:00"]) instants.push(new Date(`${day}T${z}Z`));
  }
  for (const now of instants) {
    const desc = glossaryMetaDescription(getSortedJargonData(now)).toLowerCase();
    for (const m of all) {
      if (!isPublished(m.date, now)) {
        assert.ok(!desc.includes(m.title.toLowerCase()), `${now.toISOString()} names ${m.slug}`);
      }
    }
  }
});

test("glossary meta description today, and before Boil the Ocean goes live", () => {
  const today = glossaryMetaDescription(getSortedJargonData(new Date("2026-11-03T16:00:00Z")));
  assert.equal(
    today,
    "Authoritative definitions of corporate jargon from an 18 year insider. What 'circle back,' 'synergy,' 'move the needle,' and other phrases actually mean, and why they exist.",
  );
  const sunNov22 = glossaryMetaDescription(getSortedJargonData(new Date("2026-11-23T04:59:59Z")));
  assert.doesNotMatch(sunNov22, /boil the ocean/i);
  assert.equal(glossaryMetaDescription([]), "Authoritative definitions of corporate jargon from an 18 year insider. What these phrases actually mean, and why they exist.");
});
