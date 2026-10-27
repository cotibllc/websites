import { seriesMark } from "@/lib/core-series";
import type { Post } from "@/lib/feed";
import { formatPostDate } from "@/lib/schedule";

/** One dated row. Core Series posts get the gold rule and a tag. */
export type RowSize = "major" | "standard" | "compact";

/** `major` leads a list (big title, full dek). `compact` is a short row. Lists mix sizes so no two rows read as matching cards. */
export default function PostRow({ post, label, size = "standard" }: { post: Post; label?: string; size?: RowSize }) {
  const mark = seriesMark(post.slug);
  return (
    <li className={`row row--${size}${mark ? " row--core" : ""}`}>
      <div className="row-meta">
        <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
        {(label ?? mark?.label) && <span className="row-tag">{label ?? mark?.label}</span>}
      </div>
      <div>
        <h3 className="row-title">
          <a href={post.link} target="_blank" rel="noopener noreferrer">
            {post.title}
          </a>
        </h3>
        {post.dek && <p className="row-dek">{post.dek}</p>}
      </div>
    </li>
  );
}
