import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import {
  JARGON_REVALIDATE_SECONDS,
  getAllJargonEntriesIncludingScheduled,
  getAllJargonSlugs,
  getJargonData,
  getSortedJargonData,
} from "./jargon";

const LIVE = ["move-the-needle", "synergy", "circle-back"];

test("the three live entries stay published", async () => {
  const now = new Date("2026-11-03T16:00:00Z");
  for (const slug of LIVE) {
    assert.ok(getSortedJargonData(now).some((m) => m.slug === slug), slug);
    assert.ok(await getJargonData(slug, now), slug);
  }
});

test("nothing is published before its date: index, slugs and page all agree", async () => {
  const before = new Date("2026-04-28T03:59:59Z"); // 23:59:59 ET on Apr 27
  assert.deepEqual(getSortedJargonData(before), []);
  assert.deepEqual(getAllJargonSlugs(before), []);
  assert.equal(await getJargonData("circle-back", before), null);
  const at = new Date("2026-04-28T04:00:00Z"); // 00:00 ET on Apr 28
  assert.deepEqual(getAllJargonSlugs(at), [{ term: "circle-back" }]);
  assert.ok(await getJargonData("circle-back", at));
});

test("every file has a valid quoted date and the filter is the only gate", () => {
  const all = getAllJargonEntriesIncludingScheduled();
  const onDisk = fs.readdirSync(path.join(process.cwd(), "src/content/jargon")).filter((f) => f.endsWith(".md"));
  assert.equal(all.length, onDisk.length);
  const farFuture = new Date("2100-01-01T00:00:00Z");
  assert.deepEqual(getSortedJargonData(farFuture).map((m) => m.slug), all.map((m) => m.slug));
});

test("unknown or unsafe slugs return null", async () => {
  for (const slug of ["not-a-term", "../posts/growth-paths", "Circle-Back", ""]) {
    assert.equal(await getJargonData(slug), null, slug);
  }
});

test("every page that lists or renders entries revalidates on the shared window", () => {
  for (const file of ["src/app/glossary/page.tsx", "src/app/blog/jargon/[term]/page.tsx", "src/app/sitemap.ts"]) {
    const src = fs.readFileSync(path.join(process.cwd(), file), "utf8");
    assert.match(src, new RegExp(`^export const revalidate = ${JARGON_REVALIDATE_SECONDS};$`, "m"), file);
  }
});
