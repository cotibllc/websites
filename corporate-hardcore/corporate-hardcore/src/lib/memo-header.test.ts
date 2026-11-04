import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MEMO_DEFAULTS,
  buildMemoHeader,
  chronological,
  formatMemoDate,
  formatMemoNumber,
  memoIndex,
  pickLatest,
} from "./memo-header";
import { fieldMemoDatedItems, fieldMemos, getLatestFieldMemo, type FieldMemoEntry } from "../data/field-memos";
import { getSortedPostsData } from "./blog";

test("dates print plainly and never shift a day", () => {
  assert.equal(formatMemoDate("2026-11-02"), "November 2, 2026");
  assert.equal(formatMemoDate("2026-11-03T00:00:00.000Z"), "November 3, 2026");
  assert.equal(formatMemoDate("2025-01-31"), "January 31, 2025");
  assert.throws(() => formatMemoDate(""), /YYYY-MM-DD/);
  assert.throws(() => formatMemoDate("Nov 2 2026"), /YYYY-MM-DD/);
  assert.throws(() => formatMemoDate("2026-13-01"), /not a real date/);
});

test("memo numbers are zero padded with the collection prefix", () => {
  assert.equal(formatMemoNumber("field-notes", 1), "FN 001");
  assert.equal(formatMemoNumber("field-notes", 25), "FN 025");
  assert.equal(formatMemoNumber("field-memos", 4), "FM 004");
  assert.equal(formatMemoNumber("field-notes", 1234), "FN 1234");
  assert.throws(() => formatMemoNumber("field-notes", 0));
  assert.throws(() => formatMemoNumber("field-notes", 1.5));
});

test("numbering is chronological, oldest first, ties by id, independent of input order", () => {
  const items = [
    { id: "c", date: "2026-03-01" },
    { id: "a", date: "2026-01-01" },
    { id: "b2", date: "2026-02-01" },
    { id: "b1", date: "2026-02-01" },
  ];
  assert.deepEqual(chronological(items).map((i) => i.id), ["a", "b1", "b2", "c"]);
  assert.deepEqual(chronological([...items].reverse()).map((i) => i.id), ["a", "b1", "b2", "c"]);
  assert.equal(memoIndex(items, "a"), 1);
  assert.equal(memoIndex(items, "b1"), 2);
  assert.equal(memoIndex(items, "b2"), 3);
  assert.equal(memoIndex(items, "c"), 4);
  assert.throws(() => memoIndex(items, "missing"), /No memo/);
  // A newer item gets the next number and leaves the others alone.
  const more = [...items, { id: "d", date: "2026-04-01" }];
  for (const it of items) assert.equal(memoIndex(more, it.id), memoIndex(items, it.id));
  assert.equal(memoIndex(more, "d"), 5);
});

test("department and classification come from frontmatter, else the collection default", () => {
  const items = [{ id: "x", date: "2026-05-01" }];
  assert.deepEqual(
    buildMemoHeader({ collection: "field-notes", items, id: "x", date: "2026-05-01" }),
    {
      number: "FN 001",
      department: "Information Technology",
      classification: "Internal Use Only",
      date: "May 1, 2026",
      isoDate: "2026-05-01",
    }
  );
  assert.deepEqual(
    buildMemoHeader({
      collection: "field-memos",
      items,
      id: "x",
      date: "2026-05-01T00:00:00.000Z",
      frontmatter: { department: " Facilities ", classification: "Confidential" },
    }),
    {
      number: "FM 001",
      department: "Facilities",
      classification: "Confidential",
      date: "May 1, 2026",
      isoDate: "2026-05-01",
    }
  );
  const blank = buildMemoHeader({
    collection: "field-memos",
    items,
    id: "x",
    date: "2026-05-01",
    frontmatter: { department: "   ", classification: 7 },
  });
  assert.equal(blank.department, MEMO_DEFAULTS["field-memos"].department);
  assert.equal(blank.classification, MEMO_DEFAULTS["field-memos"].classification);
});

test("memo header defaults contain no dashes or hyphens (CH copy rule)", () => {
  for (const d of Object.values(MEMO_DEFAULTS)) {
    for (const v of Object.values(d)) assert.doesNotMatch(v, /[-\u2013\u2014]/, v);
  }
});

test("real Field Memos: number matches the FM filing code", () => {
  const items = fieldMemoDatedItems();
  for (const m of fieldMemos) {
    const n = memoIndex(items, m.slug ?? m.videoId);
    assert.equal(`FM-${String(n).padStart(2, "0")}`, m.fmCode, m.title);
  }
});

test("real Field Notes: every post gets a unique number, oldest is FN 001", () => {
  const posts = getSortedPostsData();
  const items = posts.map((p) => ({ id: p.slug, date: p.date }));
  const numbers = posts.map((p) => formatMemoNumber("field-notes", memoIndex(items, p.slug)));
  assert.equal(new Set(numbers).size, posts.length);
  assert.equal(formatMemoNumber("field-notes", memoIndex(items, "the-meeting-that-could-have-been-an-email")), "FN 001");
  assert.equal(
    formatMemoNumber("field-notes", memoIndex(items, chronological(items).at(-1)!.id)),
    `FN ${String(posts.length).padStart(3, "0")}`
  );
  for (const p of posts) assert.doesNotThrow(() => formatMemoDate(p.date), p.slug);
});

test("latest Field Memo is the newest by published date, not list order", () => {
  const entry = (fmCode: string, published: string): FieldMemoEntry => ({
    videoId: fmCode, slug: fmCode.toLowerCase(), fmCode, status: "FILED", title: fmCode, rub: "", published,
  });
  const a = entry("FM-01", "2026-08-29T00:00:00.000Z");
  const b = entry("FM-02", "2026-10-19T00:00:00.000Z");
  const c = entry("FM-03", "2026-10-26T00:00:00.000Z");
  assert.equal(getLatestFieldMemo([a, c, b])?.fmCode, "FM-03");
  assert.equal(getLatestFieldMemo([c, b, a])?.fmCode, "FM-03");
  assert.equal(getLatestFieldMemo([]), null);
  assert.equal(pickLatest([]), null);
  // On the real allowlist it is the newest published entry.
  const newest = [...fieldMemos].sort((x, y) => (x.published < y.published ? 1 : -1))[0];
  assert.equal(getLatestFieldMemo()?.fmCode, newest.fmCode);
});
