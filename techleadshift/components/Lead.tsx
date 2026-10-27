import Image from "next/image";
import { seriesMark } from "@/lib/core-series";
import type { Post } from "@/lib/feed";
import { formatPostDate } from "@/lib/schedule";
import { SUBSTACK_URL } from "@/lib/site";

/** The newest article, set as the lead story. The cover and the next-date line are both optional. */
export function Lead({ post, next }: { post: Post; next?: string }) {
  const mark = seriesMark(post.slug);
  return (
    <div className={`lead${post.coverUrl ? "" : " lead--no-cover"}`}>
      <div>
        <p className="lead-meta">
          <strong>Latest</strong> · <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
          {mark && (
            <>
              {" · "}
              <span className="nowrap">{mark.label}</span>
            </>
          )}
        </p>
        <h2 className="lead-title">
          <a href={post.link} target="_blank" rel="noopener noreferrer">
            {post.title}
          </a>
        </h2>
        {post.dek && <p className="lead-dek">{post.dek}</p>}
        <a href={post.link} target="_blank" rel="noopener noreferrer" className="btn-secondary">
          Read this article
        </a>
        {next && <p className="next-line">{next}</p>}
      </div>
      {post.coverUrl && (
        <a href={post.link} target="_blank" rel="noopener noreferrer" className="lead-cover" tabIndex={-1} aria-hidden="true">
          <Image src={post.coverUrl} alt="" width={1280} height={720} sizes="(max-width: 900px) 100vw, 560px" priority unoptimized />
        </a>
      )}
    </div>
  );
}

/** Shown when the live feed is down or empty. Never shows an invented article. */
export function LeadFallback({ next }: { next?: string }) {
  return (
    <div className="lead lead--no-cover lead-fallback">
      <div>
        <p className="lead-meta">
          <strong>Latest</strong>
        </p>
        <h2 className="lead-title">The newest article is on Substack.</h2>
        <p className="fallback-copy">The live list could not be loaded right now. Every article is published there first.</p>
        <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer" className="btn-secondary">
          Read on Substack
        </a>
        {next && <p className="next-line">{next}</p>}
      </div>
    </div>
  );
}

/** Placeholder layout while the feed section resolves. */
export function LeadSkeleton() {
  return (
    <div className="lead" role="status" aria-busy="true" aria-label="Loading the latest article">
      <div>
        <div className="skeleton-line" style={{ width: "40%" }} />
        <div className="skeleton-line" style={{ width: "90%", height: "2rem" }} />
        <div className="skeleton-line" style={{ width: "75%" }} />
      </div>
      <div className="skeleton-cover" />
    </div>
  );
}
