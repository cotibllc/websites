import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = new URL("..", import.meta.url).pathname;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? files(p) : /\.(tsx?|txt|md|xml)$/.test(n) ? [p] : [];
  });
}

describe("experience copy (Chuck, 2026-10-29: TLS says 25+ years)", () => {
  it("the home About says 25+ years", () => {
    assert.match(readFileSync(join(ROOT, "app/page.tsx"), "utf8"), /25\+ years of technology leadership\./);
  });

  it("no live copy, metadata, llms.txt or README says 18+ years", () => {
    const hits = [...files(join(ROOT, "app")), ...files(join(ROOT, "public")), ...files(join(ROOT, "lib")), join(ROOT, "README.md")]
      .filter((p) => !p.endsWith("copy.test.ts"))
      .filter((p) => /\b18\+ years\b/.test(readFileSync(p, "utf8")));
    assert.deepEqual(hits, []);
  });
});
