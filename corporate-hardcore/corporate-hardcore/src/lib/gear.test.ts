import { test } from "node:test";
import assert from "node:assert/strict";
import sitemap from "../app/sitemap";
import { GEAR_DISCLOSURE, GEAR_INDEXABLE, gearCopy, gearIsComplete, gearIsPublishable, gearItems, gearRobots, type GearItem } from "./gear";

test("disclosure is the plain commission line", () => {
  assert.match(GEAR_DISCLOSURE, /we may earn a commission/i);
});

test("no em or en dashes in any /gear copy", () => {
  for (const s of gearCopy()) assert.doesNotMatch(s, /[\u2013\u2014]/, s);
});

test("affiliate links are https", () => {
  for (const i of gearItems) {
    if (i.link.kind === "affiliate") assert.match(i.link.url, /^https:\/\//, i.code);
  }
});

test("placeholders keep the page unpublished; all real links publish it only with the flag on", () => {
  assert.equal(gearIsPublishable(), false);
  const real: GearItem[] = gearItems.map((i) => ({
    ...i,
    link: { kind: "affiliate", url: "https://example.com/x", merchant: "Example" },
  }));
  const withPlaceholder: GearItem[] = [...real, { ...real[0], code: "REQ 99", link: { kind: "placeholder" } }];
  assert.equal(gearIsPublishable(real, true), true);
  assert.equal(gearIsPublishable(real, false), false);
  assert.equal(gearIsPublishable(withPlaceholder, true), false);
  assert.equal(gearIsPublishable([], true), false);
});

test("/gear stays noindex, nofollow even with every real link in place", () => {
  assert.equal(GEAR_INDEXABLE, false);
  assert.equal(gearIsComplete(), true);
  assert.deepEqual(gearRobots(), { index: false, follow: false });
});

test("/gear is not in the sitemap", () => {
  const urls = sitemap().map((e) => e.url);
  assert.ok(urls.length > 0);
  assert.ok(!urls.some((u) => /\/gear(\/|$)/.test(u)), "sitemap must not list /gear");
});

test("Chuck's three picks: Requisitions 1, 3 and 5 as plain untagged Amazon.com links", () => {
  assert.deepEqual(
    gearItems.map((i) => [i.code, i.name, i.link.kind === "affiliate" ? i.link.url : null, i.link.kind === "affiliate" ? i.link.merchant : null]),
    [
      ["REQ 01", "Hydration Compliance Unit", "https://www.amazon.com/dp/B0B435SSYZ", "Amazon.com"],
      ["REQ 03", "Personal Beverage Retention Vessel", "https://www.amazon.com/dp/B098RD6VL4", "Amazon.com"],
      ["REQ 05", "Breakroom Ceramic Allocation", "https://www.amazon.com/dp/B09KYJ8SPQ", "Amazon.com"],
    ],
  );
  // No affiliate tag or query string until the account exists.
  for (const i of gearItems) if (i.link.kind === "affiliate") assert.doesNotMatch(i.link.url, /[?&]tag=|\?/, i.code);
});

test("no hyphens in visible /gear copy", () => {
  for (const s of gearCopy()) assert.doesNotMatch(s, /-/, s);
});
