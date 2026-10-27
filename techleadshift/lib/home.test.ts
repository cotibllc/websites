import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { snapshotPosts } from "./core-series";
import type { Post } from "./feed";
import { selectHome } from "./home";

const slugs = (posts: Post[]) => posts.map((p) => p.slug);
const newestFirst = snapshotPosts().sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
const art = (n: number, publishedAt: string): Post => ({ slug: `article-${n}`, title: `Article ${n}`, link: `https://techleadshift.substack.com/p/article-${n}`, dek: "", publishedAt });

describe("selectHome", () => {
  it("today: the lead is No. 10 and Recent is the 3 newest after it, Nos. 9, 8 and 7", () => {
    const { lead, recent } = selectHome(newestFirst);
    assert.equal(lead?.slug, "the-future-leader-is-a-systems-architect");
    assert.deepEqual(slugs(recent), ["you-still-own-what-you-ship", "ai-will-scale-whatever-culture-you", "middle-management-in-the-age-of-ai"]);
  });

  it("Recent is in date order, newest first", () => {
    const { recent } = selectHome(newestFirst);
    const times = recent.map((p) => Date.parse(p.publishedAt));
    assert.deepEqual(times, [...times].sort((a, b) => b - a));
  });

  it("the lead never appears in Recent", () => {
    const { lead, recent } = selectHome(newestFirst);
    assert.ok(lead);
    assert.equal(slugs(recent).includes(lead.slug), false);
  });

  it("after Article 11: the new post leads and Recent is Nos. 10, 9 and 8", () => {
    const { lead, recent } = selectHome([art(11, "2026-11-04T13:00:00.000Z"), ...newestFirst]);
    assert.equal(lead?.slug, "article-11");
    assert.deepEqual(slugs(recent), ["the-future-leader-is-a-systems-architect", "you-still-own-what-you-ship", "ai-will-scale-whatever-culture-you"]);
  });

  it("handles short and empty feeds", () => {
    assert.deepEqual(selectHome([]), { lead: undefined, recent: [] });
    assert.deepEqual(slugs(selectHome(newestFirst.slice(0, 2)).recent), ["you-still-own-what-you-ship"]);
  });
});
