import { CORE_SERIES, START_HERE_SLUGS, seriesEntry, snapshotPosts } from "@/lib/core-series";
import Link from "next/link";
import type { Post } from "@/lib/feed";
import PostRow from "./PostRow";

/** The Core Series shelf: the prologue plus three picks. Feed titles and decks win when present. */
export default function StartHere({ feedPosts }: { feedPosts: readonly Post[] }) {
  const live = new Map(feedPosts.map((p) => [p.slug, p]));
  const local = new Map(snapshotPosts().map((p) => [p.slug, p]));
  const picks = START_HERE_SLUGS.flatMap((slug) => {
    const post = live.get(slug) ?? local.get(slug);
    return post && seriesEntry(slug) ? [post] : [];
  });

  const [feature, ...others] = picks;

  return (
    <section id="start-here" className="band" aria-labelledby="start-here-heading">
      <div className="container-wide">
        <div className="section-label">Start here</div>
        <h2 className="section-headline" id="start-here-heading">
          The Core Series
        </h2>
        <p className="shelf-intro">
          Ten articles on what leading looks like when software does real work next to your team, and the post that came before them.
        </p>
        <div className="shelf">
          <ul className="rows">
            {feature && <PostRow post={feature} size="major" />}
          </ul>
          <ul className="rows">
            {others.map((post) => (
              <PostRow key={post.slug} post={post} size="compact" />
            ))}
          </ul>
        </div>
        <p className="shelf-link">
          <Link href="/archive" className="text-link">
            See all {CORE_SERIES.length} in the archive
          </Link>
        </p>
      </div>
    </section>
  );
}
