import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CONSENT_STORAGE_KEY,
  GA_MEASUREMENT_ID,
  analyticsDecision,
  analyticsLoads,
  consentRegion,
  parseChoice,
  parseRegion,
} from "./consent";

test("EU, EEA, UK and Swiss visitors are asked first", () => {
  for (const c of ["DE", "FR", "IE", "PL", "NO", "IS", "LI", "GB", "CH", "de"]) {
    assert.equal(consentRegion(c), "required", c);
  }
});

test("a missing or malformed country header means we ask", () => {
  for (const c of [null, undefined, "", "  ", "XYZ", "1A", "T1"]) {
    assert.equal(consentRegion(c), "required", String(c));
  }
});

test("other countries load analytics by default", () => {
  for (const c of ["US", "CA", "AU", "BR", "JP", "IN"]) {
    assert.equal(consentRegion(c), "not-required", c);
  }
});

test("decision table: region by stored choice", () => {
  const rows = (["required", "not-required"] as const).flatMap((r) =>
    (["granted", "denied", null] as const).map((c) => `${r} + ${c ?? "none"} = ${analyticsDecision(r, c)}`),
  );
  assert.deepEqual(rows, [
    "required + granted = load-consented",
    "required + denied = off",
    "required + none = ask",
    "not-required + granted = load-consented",
    "not-required + denied = off",
    "not-required + none = load-default",
  ]);
});

test("GA loads only after Accept, or by default outside the consent region", () => {
  assert.equal(analyticsLoads("ask"), false);
  assert.equal(analyticsLoads("off"), false);
  assert.equal(analyticsLoads("load-default"), true);
  assert.equal(analyticsLoads("load-consented"), true);
});

test("stored values and API values parse strictly", () => {
  assert.equal(parseChoice("granted"), "granted");
  assert.equal(parseChoice("denied"), "denied");
  assert.equal(parseChoice("yes"), null);
  assert.equal(parseChoice(null), null);
  assert.equal(parseRegion("not-required"), "not-required");
  assert.equal(parseRegion("anything else"), "required");
  assert.equal(parseRegion(undefined), "required");
});

test("the Measurement ID is the theitxp.com GA4 property", () => {
  assert.equal(GA_MEASUREMENT_ID, "G-2FEJYVGXPP");
  assert.match(GA_MEASUREMENT_ID, /^G-[A-Z0-9]{6,12}$/);
  assert.equal(CONSENT_STORAGE_KEY, "itxp-analytics-consent-v1");
});
