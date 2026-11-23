import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SITE_DESCRIPTION, SITE_TITLE } from "./site";

describe("site metadata fits search result limits (Rule 37 audit)", () => {
  it("title is 60 characters or fewer", () => {
    assert.ok(SITE_TITLE.length <= 60, String(SITE_TITLE.length));
  });
  it("meta description is 160 characters or fewer", () => {
    assert.ok(SITE_DESCRIPTION.length <= 160, String(SITE_DESCRIPTION.length));
  });
  it("no em or en dashes", () => {
    assert.doesNotMatch(SITE_TITLE + SITE_DESCRIPTION, /[\u2013\u2014]/);
  });
});
