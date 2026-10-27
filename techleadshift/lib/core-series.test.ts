import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CORE_SERIES, START_HERE_SLUGS, mergeWithSnapshot, seriesMark, snapshotPosts } from "./core-series";
import { parseFeed } from "./feed";
import { readFileSync } from "node:fs";

describe("Core Series list", () => {
  it("is the prologue plus Articles 1 to 10, once each", () => {
    assert.equal(CORE_SERIES.length, 11);
    assert.deepEqual(CORE_SERIES.map((e) => e.number).filter((n) => n !== null).sort((a, b) => a! - b!), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    assert.equal(CORE_SERIES.filter((e) => e.number === null).length, 1);
    assert.equal(new Set(CORE_SERIES.map((e) => e.slug)).size, 11);
  });

  it("marks series posts by slug and nothing else", () => {
    assert.equal(seriesMark("the-leadership-gap-nobody-is-talking")?.label, "Core Series, prologue");
    assert.equal(seriesMark("delegation-drift")?.label, "Core Series, No. 3");
    assert.equal(seriesMark("the-future-leader-is-a-systems-architect")?.label, "Core Series, No. 10");
    assert.equal(seriesMark("a-post-after-the-series"), undefined);
  });

  it("has Start here picks that are all in the series, prologue first", () => {
    assert.equal(START_HERE_SLUGS.length, 4);
    assert.equal(START_HERE_SLUGS[0], "the-leadership-gap-nobody-is-talking");
    for (const slug of START_HERE_SLUGS) assert.ok(seriesMark(slug), slug);
  });
});

describe("snapshot and merge", () => {
  it("snapshot lists all 11 posts newest first through merge", () => {
    const merged = mergeWithSnapshot([]);
    assert.equal(merged.length, 11);
    assert.equal(merged[0].slug, "the-future-leader-is-a-systems-architect");
    assert.equal(merged[10].slug, "the-leadership-gap-nobody-is-talking");
  });

  it("keeps the feed's copy of a post and adds a newer post on top", () => {
    const feed = parseFeed(readFileSync(new URL("./__fixtures__/feed.xml", import.meta.url), "utf8"));
    const newer = { slug: "article-11", title: "Article 11", link: "https://techleadshift.substack.com/p/article-11", dek: "", publishedAt: "2026-11-04T13:00:00.000Z" };
    const merged = mergeWithSnapshot([newer, ...feed]);
    assert.equal(merged[0].slug, "article-11");
    assert.equal(merged.length, 11 + 2);
    assert.equal(merged.find((p) => p.slug === "the-future-leader-is-a-systems-architect")?.dek, "Design the work, don't perform the sentiment");
    assert.equal(snapshotPosts().length, 11);
  });
});
