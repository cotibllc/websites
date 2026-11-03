import { test } from "node:test";
import assert from "node:assert/strict";
import { GEAR_DISCLOSURE, gearCopy, gearIsPublishable, gearItems, type GearItem } from "./gear";

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

test("placeholders keep the page unpublished; all real links publish it", () => {
  assert.equal(gearIsPublishable(), false);
  const real: GearItem[] = gearItems.map((i) => ({
    ...i,
    link: { kind: "affiliate", url: "https://example.com/x", merchant: "Example" },
  }));
  assert.equal(gearIsPublishable(real), true);
  assert.equal(gearIsPublishable([]), false);
});
