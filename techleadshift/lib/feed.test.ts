import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { feedUrl, fetchFeed, parseFeed, slugFromUrl } from "./feed";

const xml = readFileSync(new URL("./__fixtures__/feed.xml", import.meta.url), "utf8");

const respond = (body: string, status = 200) => async () => new Response(body, { status });

describe("parseFeed", () => {
  const posts = parseFeed(xml);

  it("keeps good items, skips items with no date or a non-https link, newest first", () => {
    assert.deepEqual(
      posts.map((p) => `${p.publishedAt.slice(0, 10)} ${p.slug}`),
      ["2026-10-15 the-future-leader-is-a-systems-architect", "2026-09-16 rock-and-roll", "2026-03-18 the-leadership-gap-nobody-is-talking"]
    );
  });

  it("reads CDATA as is and decodes entities and strips tags in plain text fields", () => {
    assert.equal(posts[0].title, "The future leader is a systems architect");
    assert.equal(posts[0].dek, "Design the work, don't perform the sentiment");
    assert.equal(posts[1].title, "Rock & Roll: Don't Ship It");
    assert.equal(posts[1].dek, "Two things at once & more");
  });

  it("reads the cover from the enclosure and leaves it off when missing", () => {
    assert.match(posts[0].coverUrl ?? "", /^https:\/\/substackcdn\.com\/image\/fetch\//);
    assert.equal("coverUrl" in posts[1], false);
  });

  it("takes the slug from the post path and ignores the query string", () => {
    assert.equal(slugFromUrl("https://techleadshift.substack.com/p/delegation-drift?utm_source=x#c"), "delegation-drift");
    assert.equal(slugFromUrl("https://techleadshift.substack.com/about"), "");
  });

  it("returns an empty list for text that is not a feed", () => {
    assert.deepEqual(parseFeed("<html>Not found</html>"), []);
  });
});

describe("fetchFeed never throws and names the state", () => {
  it("ok", async () => {
    const r = await fetchFeed(respond(xml), "https://example.test/feed");
    assert.equal(r.status, "ok");
    assert.equal(r.posts.length, 3);
  });
  it("empty: a valid feed with zero items", async () => {
    const r = await fetchFeed(respond("<rss><channel><title>x</title></channel></rss>"), "https://example.test/feed");
    assert.deepEqual(r, { status: "empty", posts: [] });
  });
  it("unavailable: HTTP 500", async () => {
    assert.deepEqual(await fetchFeed(respond("nope", 500), "https://example.test/feed"), { status: "unavailable", posts: [] });
  });
  it("unavailable: network error or timeout", async () => {
    const boom = async () => {
      throw new TypeError("fetch failed");
    };
    assert.deepEqual(await fetchFeed(boom, "https://example.test/feed"), { status: "unavailable", posts: [] });
  });
});

describe("feedUrl", () => {
  it("defaults to the Substack feed and accepts only an http(s) override", () => {
    assert.equal(feedUrl({}), "https://techleadshift.substack.com/feed");
    assert.equal(feedUrl({ TLS_FEED_URL: "http://localhost:4010/feed" }), "http://localhost:4010/feed");
    assert.equal(feedUrl({ TLS_FEED_URL: "file:///etc/passwd" }), "https://techleadshift.substack.com/feed");
  });
});
