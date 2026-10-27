import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import FeedNotice from "./FeedNotice";
import { Lead, LeadFallback } from "./Lead";
import PostRow from "./PostRow";
import StartHere from "./StartHere";
import type { Post } from "@/lib/feed";

const post: Post = {
  slug: "the-future-leader-is-a-systems-architect",
  title: "The future leader is a systems architect",
  link: "https://techleadshift.substack.com/p/the-future-leader-is-a-systems-architect",
  dek: "Design the work, don't perform the sentiment",
  publishedAt: "2026-10-15T12:06:27.000Z",
  coverUrl: "https://substackcdn.com/image/fetch/cover_1280x720.jpeg",
};

const text = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

describe("Lead", () => {
  it("shows date, title, dek, Read link, series tag, next line and a decorative cover", () => {
    const html = renderToStaticMarkup(<Lead post={post} next="Next: Wed Nov 4" />);
    assert.equal(
      text(html),
      "Latest · Oct 15, 2026 · Core Series, No. 10 The future leader is a systems architect Design the work, don't perform the sentiment Read this article Next: Wed Nov 4"
    );
    assert.match(html, /<img[^>]*alt=""/);
    assert.match(html, /aria-hidden="true"/);
  });

  it("without a cover: no image, and the layout switches to the single column", () => {
    const html = renderToStaticMarkup(<Lead post={{ ...post, coverUrl: undefined }} next="Next: Wed Nov 4" />);
    assert.doesNotMatch(html, /<img/);
    assert.match(html, /lead--no-cover/);
  });

  it("with no upcoming Wednesday: no Next line", () => {
    const html = renderToStaticMarkup(<Lead post={post} />);
    assert.doesNotMatch(html, /Next:/);
  });

  it("fallback points to Substack and invents no article", () => {
    const html = renderToStaticMarkup(<LeadFallback />);
    assert.equal(text(html), "Latest The newest article is on Substack. The live list could not be loaded right now. Every article is published there first. Read on Substack");
    assert.match(html, /href="https:\/\/techleadshift\.substack\.com"/);
  });
});

describe("PostRow", () => {
  it("marks Core Series rows with the gold rule class and leaves later posts plain", () => {
    assert.match(renderToStaticMarkup(<PostRow post={post} />), /class="row [^"]*row--core"/);
    const later = renderToStaticMarkup(<PostRow post={{ ...post, slug: "article-11" }} />);
    assert.doesNotMatch(later, /row--core/);
    assert.doesNotMatch(later, /Core Series/);
  });
});

describe("StartHere", () => {
  it("lists the prologue, then Nos. 1, 2 and 3, from the snapshot when the feed is down", () => {
    const html = renderToStaticMarkup(<StartHere feedPosts={[]} />);
    const titles = [...html.matchAll(/<h3 class="row-title"><a[^>]*>([^<]*)<\/a>/g)].map((m) => m[1].replace(/&#x27;/g, "'"));
    assert.deepEqual(titles, [
      "The Leadership Gap Nobody Is Talking About",
      "The First Leadership Crisis of AI Won't Be Technical. It Will Be Cultural.",
      "Managing the Invisible Worker",
      "Delegation Drift",
    ]);
    assert.deepEqual([...html.matchAll(/row--(major|compact)/g)].map((m) => m[1]), ["major", "compact", "compact", "compact"], "one large entry, three short rows");
    assert.match(text(html), /See all 11 in the archive/);
    assert.doesNotMatch(html, /Act I|Ten articles\. One argument/);
  });
});

describe("FeedNotice", () => {
  it("says plainly what happened", () => {
    assert.match(text(renderToStaticMarkup(<FeedNotice snapshotDate="Oct 27, 2026" />)), /could not be loaded right now\. This is the Core Series as of Oct 27, 2026\./);
  });
});
