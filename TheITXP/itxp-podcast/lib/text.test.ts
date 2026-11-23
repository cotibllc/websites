import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { EPISODE_TITLE_OVERRIDES, TITLE_LIMIT, episodePageTitle, removeDashes } from "./text";

test("removeDashes turns real feed dashes into commas, colons and 'to'", () => {
  assert.equal(
    removeDashes("Navigating IT Careers in 2025\u2014AI, Layoffs, and Staying Relevant"),
    "Navigating IT Careers in 2025, AI, Layoffs, and Staying Relevant",
  );
  assert.equal(
    removeDashes("the last 30%\u2014judgment, context, validation\u2014is where"),
    "the last 30%, judgment, context, validation, is where",
  );
  assert.equal(
    removeDashes("AWS US-East-1 Goes Down \u2014 Why DNS Still Rules the Internet", "title"),
    "AWS US-East-1 Goes Down: Why DNS Still Rules the Internet",
  );
  assert.equal(removeDashes("<li>00:00 \u2013 Ignite overview</li>"), "<li>00:00, Ignite overview</li>");
  assert.equal(removeDashes("pages 3\u20135"), "pages 3 to 5");
  assert.equal(removeDashes("no dashes - just a hyphen"), "no dashes - just a hyphen");
});

test("episodePageTitle keeps the brand suffix only when it fits in 60", () => {
  assert.equal(episodePageTitle("back-to-basics", "Back to Basics"), "Back to Basics | The IT XP");
  assert.equal(
    episodePageTitle(
      "aws-us-east-1-goes-down-why-dns-still-rules-the-internet",
      "AWS US-East-1 Goes Down: Why DNS Still Rules the Internet",
    ),
    "AWS US-East-1 Goes Down: Why DNS Still Rules the Internet",
  );
});

test("every hand trimmed episode title is 60 characters or fewer", () => {
  for (const [slug, title] of Object.entries(EPISODE_TITLE_OVERRIDES)) {
    const full = episodePageTitle(slug, "ignored when an override exists");
    assert.equal(full.startsWith(title), true, slug);
    assert.ok(full.length <= TITLE_LIMIT, `${slug}: ${full.length}`);
  }
});

test("a new long episode title is trimmed at a word boundary", () => {
  const long = "A Brand New Episode Title That Runs Well Past The Sixty Character Limit Today";
  const out = episodePageTitle("new-episode", long);
  assert.ok(out.length <= TITLE_LIMIT, String(out.length));
  assert.ok(long.startsWith(out));
  assert.ok(!out.endsWith(" "));
});

test("no em or en dashes in site source or public files", () => {
  const root = join(__dirname, "..");
  const hits: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(tsx?|txt|md|json|xml|css)$/.test(name) && !name.endsWith(".test.ts")) {
        readFileSync(p, "utf8").split("\n").forEach((line, i) => {
          if (/[\u2013\u2014]/.test(line)) hits.push(`${p}:${i + 1}`);
        });
      }
    }
  };
  for (const d of ["app", "components", "lib", "public"]) walk(join(root, d));
  assert.deepEqual(hits, []);
});
