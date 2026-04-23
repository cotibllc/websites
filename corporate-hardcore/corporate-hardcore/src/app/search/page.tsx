import Link from "next/link";
import { getSortedPostsData } from "@/lib/blog";
import { Calendar, SearchX } from "lucide-react";

export function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return searchParams.then(({ q }) => ({
    title: q ? `"${q}" – Search | Corporate Hardcore` : "Search | Corporate Hardcore",
    description: q
      ? `Search results for "${q}" on Corporate Hardcore.`
      : "Search articles on Corporate Hardcore.",
  }));
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();

  const allPosts = getSortedPostsData();

  const results = query
    ? allPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.description.toLowerCase().includes(query) ||
          post.arc.toLowerCase().includes(query)
      )
    : [];

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="mx-auto content-max px-4 py-6 max-w-2xl">
        <div className="surface-card p-6 mb-4">
          <h1 className="text-xl font-bold text-text-primary">
            {query ? (
              <>
                Results for{" "}
                <span className="text-linkedin-blue">&ldquo;{q}&rdquo;</span>
              </>
            ) : (
              "Search"
            )}
          </h1>
          {query && (
            <p className="text-sm text-text-secondary mt-1">
              {results.length === 0
                ? "No articles found."
                : `${results.length} article${results.length !== 1 ? "s" : ""} found.`}
            </p>
          )}
        </div>

        {query && results.length === 0 && (
          <div className="surface-card p-10 flex flex-col items-center text-center gap-3">
            <SearchX className="w-10 h-10 text-text-secondary opacity-40" />
            <p className="font-medium text-text-primary">No results for &ldquo;{q}&rdquo;</p>
            <p className="text-sm text-text-secondary">
              Try different keywords, or{" "}
              <Link href="/blog" className="text-linkedin-blue hover:underline">
                browse all articles
              </Link>
              .
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="surface-card divide-y divide-border-light">
            {results.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block p-6 hover:bg-gray-50 transition"
              >
                <span className="text-xs font-medium text-linkedin-blue uppercase tracking-wide">
                  {post.arc}
                </span>
                <h2 className="text-lg font-semibold text-text-primary mt-1">{post.title}</h2>
                <p className="mt-2 text-sm text-text-secondary line-clamp-2">
                  {post.description}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-text-secondary">
                  <Calendar className="w-3 h-3" />
                  <time dateTime={post.date}>{post.date}</time>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!query && (
          <div className="surface-card p-6 text-center text-text-secondary text-sm">
            Enter a search term above to find articles.
          </div>
        )}
      </div>
    </div>
  );
}
