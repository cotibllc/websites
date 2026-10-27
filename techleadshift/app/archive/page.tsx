import type { Metadata } from "next";
import FeedNotice from "@/components/FeedNotice";
import PostRow from "@/components/PostRow";
import { CORE_SERIES, SNAPSHOT_DATE, mergeWithSnapshot } from "@/lib/core-series";
import { fetchFeed, type Post } from "@/lib/feed";
import { easternDate } from "@/lib/schedule";

export const revalidate = 3600; // hourly; must be a literal for Next

export const metadata: Metadata = {
  title: "Archive",
  description:
    "Every Tech Lead Shift article, newest first, including the Core Series: the prologue and the first ten articles. New articles twice a month, on Wednesdays.",
  alternates: { canonical: "/archive" },
};

function groupByYear(posts: readonly Post[]): [string, Post[]][] {
  const groups = new Map<string, Post[]>();
  for (const post of posts) {
    const year = easternDate(post.publishedAt).slice(0, 4);
    groups.set(year, [...(groups.get(year) ?? []), post]);
  }
  return [...groups.entries()];
}

export default async function ArchivePage() {
  const feed = await fetchFeed();
  const posts = mergeWithSnapshot(feed.posts);

  return (
    <section className="archive-page">
      <div className="container-wide">
        <div className="section-label">Archive</div>
        <h1>Every article, newest first.</h1>
        <p className="archive-intro">
          The gold rule marks the Core Series: the prologue and the first {CORE_SERIES.length - 1} articles. New articles twice a month, on
          Wednesdays.
        </p>
        {feed.status !== "ok" && <FeedNotice snapshotDate={SNAPSHOT_DATE} />}
        {groupByYear(posts).map(([year, group]) => (
          <div key={year}>
            <h2 className="year-heading">{year}</h2>
            <ul className="rows">
              {group.map((post) => (
                <PostRow key={post.slug} post={post} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
