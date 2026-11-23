import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { BRAND_SUFFIX, DESCRIPTION_LIMIT, TITLE_LIMIT, metaDescription, pageTitle } from "./seo";
import { getSortedPostsData } from "./blog";
import { getFieldMemoBody } from "./field-memo-content";
import { getAllJargonEntriesIncludingScheduled } from "./jargon";

test("pageTitle keeps the brand suffix when it fits, drops it when it doesn't", () => {
  assert.equal(pageTitle("The Reorg"), "The Reorg | Corporate Hardcore");
  assert.equal(pageTitle("The Meeting That Could Have Been an Email"), "The Meeting That Could Have Been an Email");
  assert.equal(
    pageTitle("How to Survive a Corporate Reorg Without Losing Your Mind (or Your Job)"),
    "How to Survive a Corporate Reorg Without Losing Your Mind",
  );
  assert.equal(
    pageTitle("AutoMinutes Says Confidence 94%. Greg Was Not on the Call."),
    "AutoMinutes Says Confidence 94%. Greg Was Not on the Call.",
  );
  assert.equal(pageTitle("Long headline", "Short"), "Short" + BRAND_SUFFIX);
});

test("metaDescription keeps whole sentences, first and last first", () => {
  assert.equal(
    metaDescription(
      "The org chart arrived this morning. My box moved two inches to the right. Same level, same responsibilities, same reporting structure. The department got a new name.",
    ),
    "The org chart arrived this morning. My box moved two inches to the right. The department got a new name.",
  );
  assert.equal(metaDescription("Short and fine."), "Short and fine.");
});

const posts = getSortedPostsData();

test("every Field Note title and meta description fits the limits", () => {
  assert.ok(posts.length > 20);
  for (const p of posts) {
    const t = pageTitle(p.title, p.seoTitle);
    const d = metaDescription(p.description);
    assert.ok(t.length <= TITLE_LIMIT, `${p.slug} title ${t.length}: ${t}`);
    assert.ok(d.length > 0 && d.length <= DESCRIPTION_LIMIT, `${p.slug} description ${d.length}`);
    assert.doesNotMatch(t + d, /[\u2013\u2014]/, p.slug);
  }
});

test("every Field Memo title and meta description fits the limits", async () => {
  const dir = path.join(process.cwd(), "src/content/field-memos");
  const slugs = fs.readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
  assert.ok(slugs.includes("direct-report"));
  for (const slug of slugs) {
    const m = await getFieldMemoBody(slug);
    assert.ok(m, slug);
    const t = pageTitle(m.title, m.seoTitle);
    const d = metaDescription(m.description);
    assert.ok(t.length <= TITLE_LIMIT, `${slug} title ${t.length}: ${t}`);
    assert.ok(d.length > 0 && d.length <= DESCRIPTION_LIMIT, `${slug} description ${d.length}`);
  }
});

test("every glossary entry, live or scheduled, fits the limits", () => {
  for (const j of getAllJargonEntriesIncludingScheduled()) {
    const t = `What Does "${j.title}" Mean?${BRAND_SUFFIX}`;
    const d = metaDescription(j.description);
    assert.ok(t.length <= TITLE_LIMIT, `${j.slug} title ${t.length}`);
    assert.ok(d.length > 0 && d.length <= DESCRIPTION_LIMIT, `${j.slug} description ${d.length}`);
  }
});
