import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { snapshotPosts } from "./core-series";
import type { Post } from "./feed";
import { selectHome } from "./home";

const slugs = (posts: Post[]) => posts.map((p) => p.slug);
const newestFirst = snapshotPosts().sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

describe("selectHome", () => {
  it("today: lead is No. 10 and Recent is Nos. 7, 6, 5, skipping the shelf picks 9 and 8", () => {
    const { lead, recent } = selectHome(newestFirst);
    assert.equal(lead?.slug, "the-future-leader-is-a-systems-architect");
    assert.deepEqual(slugs(recent), ["middle-management-in-the-age-of-ai", "the-end-of-productivity-theater", "the-new-leadership-skill-systems"]);
  });

  it("never shows a title twice: lead, Recent and the shelf do not overlap", () => {
    const shelf = ["the-leadership-gap-nobody-is-talking", "the-first-leadership-crisis-of-ai", "ai-will-scale-whatever-culture-you", "you-still-own-what-you-ship"];
    const { lead, recent } = selectHome(newestFirst, shelf);
    const shown = [lead?.slug, ...slugs(recent), ...shelf];
    assert.equal(new Set(shown).size, shown.length);
  });

  it("after Article 11: the new post leads and Recent is No. 10, 7, 6", () => {
    const art11: Post = { slug: "article-11", title: "Article 11", link: "https://techleadshift.substack.com/p/article-11", dek: "", publishedAt: "2026-11-04T13:00:00.000Z" };
    const { lead, recent } = selectHome([art11, ...newestFirst]);
    assert.equal(lead?.slug, "article-11");
    assert.deepEqual(slugs(recent), ["the-future-leader-is-a-systems-architect", "middle-management-in-the-age-of-ai", "the-end-of-productivity-theater"]);
  });

  it("handles short and empty feeds", () => {
    assert.deepEqual(selectHome([]), { lead: undefined, recent: [] });
    assert.deepEqual(slugs(selectHome(newestFirst.slice(0, 2)).recent), []);
  });
});
