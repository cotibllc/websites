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
  it("after Dec 16 it moves on to Dec 30, the first 2026-10-31 date", () => {
    assert.equal(nextWednesday(at("2026-12-17T15:00:00Z")), "2026-12-30");
    assert.equal(nextWednesday(at("2026-12-16T15:00:00Z"), ["2026-12-16T13:00:00.000Z"]), "2026-12-30");
    assert.equal(nextLabel("2026-12-30", at("2026-12-17T15:00:00Z")), "Next: Wed Dec 30");
  });
  it("crosses the year: after Dec 30 it is Jan 13, 2027", () => {
    assert.equal(nextWednesday(at("2026-12-31T15:00:00Z")), "2027-01-13");
    assert.equal(nextLabel("2027-01-13", at("2026-12-31T15:00:00Z")), "Next: Wed Jan 13");
  });
  it("after Feb 10 it is Feb 24", () => {
    assert.equal(nextWednesday(at("2027-02-11T15:00:00Z")), "2027-02-24");
    assert.equal(nextWednesday(at("2027-02-10T15:00:00Z"), ["2027-02-10T13:00:00.000Z"]), "2027-02-24");
  });
  it("returns nothing, not a guess, after the last approved date (Feb 24, 2027)", () => {
    assert.equal(nextWednesday(at("2027-02-25T15:00:00Z")), undefined);
    assert.equal(nextWednesday(at("2027-02-24T15:00:00Z"), ["2027-02-24T13:00:00.000Z"]), undefined);
  });
  it("lists the nine approved Wednesdays, and each is a Wednesday", () => {
    assert.equal(APPROVED_WEDNESDAYS.length, 9);
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
