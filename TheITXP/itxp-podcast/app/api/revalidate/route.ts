import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { FEED_CACHE_TAG } from "@/lib/feed";

// On-demand refresh of the Libsyn feed after a new episode is published.
// Call: POST /api/revalidate with header "Authorization: Bearer <REVALIDATE_SECRET>".
// REVALIDATE_SECRET is set by Chuck in Vercel. While it is unset, this route is off (503).

const MIN_SECRET_LENGTH = 32;

function secretMatches(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const expected = process.env.REVALIDATE_SECRET ?? "";
  if (expected.length < MIN_SECRET_LENGTH) {
    console.error("revalidate: REVALIDATE_SECRET is unset or shorter than 32 characters; route disabled");
    return NextResponse.json({ error: "On-demand revalidation is not configured" }, { status: 503 });
  }

  const header = request.headers.get("authorization") ?? "";
  const given = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  if (!secretMatches(given, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // expire: 0 makes the next request refetch the feed instead of serving the stale copy.
  revalidateTag(FEED_CACHE_TAG, { expire: 0 });
  return NextResponse.json({ revalidated: true, tag: FEED_CACHE_TAG, now: Date.now() });
}
