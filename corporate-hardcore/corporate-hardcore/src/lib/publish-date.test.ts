import { test } from "node:test";
import assert from "node:assert/strict";
import { assertPublishDate, isPublished, newYorkToday } from "./publish-date";

// Each row: an instant, then what New York's calendar says at that instant.
test("New York calendar date at the midnight boundary, EST and EDT", () => {
  const rows = [
    // Mon 2026-11-09, EST (UTC-5): midnight ET is 05:00Z.
    "2026-11-09T04:59:59Z",
    "2026-11-09T05:00:00Z",
    // UTC midnight is still Sunday evening in New York.
    "2026-11-09T00:00:00Z",
    // Mon 2026-10-12, EDT (UTC-4): midnight ET is 04:00Z.
    "2026-10-12T03:59:59Z",
    "2026-10-12T04:00:00Z",
  ].map((iso) => `${iso} -> ${newYorkToday(new Date(iso))}`);
  assert.deepEqual(rows, [
    "2026-11-09T04:59:59Z -> 2026-11-08",
    "2026-11-09T05:00:00Z -> 2026-11-09",
    "2026-11-09T00:00:00Z -> 2026-11-08",
    "2026-10-12T03:59:59Z -> 2026-10-11",
    "2026-10-12T04:00:00Z -> 2026-10-12",
  ]);
});

test("Monday entry: 23:59:59 Sunday ET hidden, 00:00:00 Monday ET visible (EST)", () => {
  assert.equal(isPublished("2026-11-09", new Date("2026-11-09T04:59:59Z")), false);
  assert.equal(isPublished("2026-11-09", new Date("2026-11-09T05:00:00Z")), true);
  assert.equal(isPublished("2026-11-09", new Date("2026-11-09T05:00:00-05:00")), true);
  assert.equal(isPublished("2026-11-09", new Date("2026-11-08T23:59:59-05:00")), false);
});

test("same boundary holds in EDT, so the check does not assume an offset", () => {
  assert.equal(isPublished("2026-10-12", new Date("2026-10-12T03:59:59Z")), false);
  assert.equal(isPublished("2026-10-12", new Date("2026-10-12T04:00:00Z")), true);
});

test("DST agnostic: every Monday from Nov 2026 to Mar 2027 flips at New York midnight", () => {
  // Walk Mondays across the Mar 14 2027 spring forward change. For each, find
  // New York midnight by asking the formatter, never by a fixed offset.
  const mondays = [
    "2026-11-02", "2026-11-09", "2027-01-25", "2027-03-08", "2027-03-15", "2027-03-22",
  ];
  for (const day of mondays) {
    // Midnight ET is 04:00Z (EDT) or 05:00Z (EST); find which by checking both.
    const edt = new Date(`${day}T04:00:00Z`);
    const midnight = newYorkToday(edt) === day ? edt : new Date(`${day}T05:00:00Z`);
    const justBefore = new Date(midnight.getTime() - 1000);
    assert.equal(newYorkToday(midnight), day, `${day} midnight`);
    assert.equal(isPublished(day, justBefore), false, `${day} at 23:59:59 the night before`);
    assert.equal(isPublished(day, midnight), true, `${day} at 00:00:00`);
  }
});

test("past dates stay visible and later dates stay hidden", () => {
  const now = new Date("2026-11-03T16:00:00Z");
  assert.equal(isPublished("2026-04-28", now), true);
  assert.equal(isPublished("2026-11-03", now), true);
  assert.equal(isPublished("2026-11-04", now), false);
  assert.equal(isPublished("2027-01-25", now), false);
});

test("malformed or unquoted dates fail loudly instead of publishing or hiding", () => {
  for (const bad of ["", "2026-11-9", "11/09/2026", "2026-02-30", "2026-13-01", "soon", null, undefined, 20261109, new Date("2026-11-09")]) {
    assert.throws(() => assertPublishDate(bad, "entry"), /YYYY-MM-DD/, String(bad));
  }
  assert.throws(() => isPublished("2026-02-30", new Date()), /YYYY-MM-DD/);
  assert.equal(assertPublishDate("2028-02-29", "leap"), "2028-02-29");
});
