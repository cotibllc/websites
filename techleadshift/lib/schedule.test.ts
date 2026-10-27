import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { APPROVED_WEDNESDAYS, easternDate, formatPostDate, nextLabel, nextWednesday } from "./schedule";

const at = (iso: string) => new Date(iso);

describe("nextWednesday", () => {
  it("is Nov 4 from today (Oct 27)", () => {
    assert.equal(nextWednesday(at("2026-10-27T14:00:00Z")), "2026-11-04");
  });
  it("uses New York days: 11 PM ET on Nov 3 is still before Nov 4, 1 AM UTC Nov 4 is Nov 3 in New York", () => {
    assert.equal(easternDate(at("2026-11-04T02:00:00Z")), "2026-11-03");
    assert.equal(nextWednesday(at("2026-11-04T02:00:00Z")), "2026-11-04");
  });
  it("on publish day it stays today until the post is out, then moves on", () => {
    const now = at("2026-11-04T12:00:00Z");
    assert.equal(nextWednesday(now, []), "2026-11-04");
    assert.equal(nextWednesday(now, ["2026-11-04T13:00:00.000Z"]), "2026-11-18");
  });
  it("skips past dates", () => {
    assert.equal(nextWednesday(at("2026-11-05T15:00:00Z")), "2026-11-18");
  });
  it("returns nothing, not a guess, after the last approved date", () => {
    assert.equal(nextWednesday(at("2026-12-17T15:00:00Z")), undefined);
    assert.equal(nextWednesday(at("2026-12-16T15:00:00Z"), ["2026-12-16T13:00:00.000Z"]), undefined);
  });
  it("lists the four approved Wednesdays, and each is a Wednesday", () => {
    assert.equal(APPROVED_WEDNESDAYS.length, 4);
    for (const d of APPROVED_WEDNESDAYS) assert.equal(new Date(`${d}T12:00:00Z`).getUTCDay(), 3, d);
  });
});

describe("labels", () => {
  it("reads like the page copy", () => {
    const now = at("2026-10-27T14:00:00Z");
    assert.equal(nextLabel("2026-11-04", now), "Next: Wed Nov 4");
    assert.equal(nextLabel("2026-11-04", at("2026-11-04T12:00:00Z")), "Next: today, Wed Nov 4");
    assert.equal(nextLabel(undefined, now), undefined);
  });
  it("formats post dates in New York", () => {
    assert.equal(formatPostDate("2026-10-15T12:06:27.000Z"), "Oct 15, 2026");
    assert.equal(formatPostDate("2026-08-20T21:56:33.000Z"), "Aug 20, 2026");
    assert.equal(formatPostDate("2026-08-21T01:30:00.000Z"), "Aug 20, 2026");
  });
});
