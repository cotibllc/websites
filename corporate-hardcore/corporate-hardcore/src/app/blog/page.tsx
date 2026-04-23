import type { Metadata } from "next";
import Link from "next/link";
import { getSortedPostsData } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Field Notes",
  description: "Written dispatches from eighteen years inside the same company.",
  alternates: { canonical: "/blog" },
};

const ARC_LIST = [
  "Performance Review Arc",
  "Holiday Party Arc",
  "Vision Emails Arc",
  "Budget Cuts Arc",
  "Job Search Arc",
];

export default function BlogPage() {
  const posts = getSortedPostsData();

  return (
    <div className="mx-auto content-max px-4 py-8">
      {/* Page header */}
      <div className="intranet-card mb-6">
        <div className="intranet-header flex items-center justify-between">
          <span>Field Notes — Document Archive</span>
          <span className="text-white/50">{posts.length} filed</span>
        </div>
        <div className="px-4 py-3 bg-synergy-white border-t border-synergy-rule">
          <p className="font-sans text-sm text-synergy-muted">
            Observations from eighteen years in the same company.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main post list */}
        <section className="lg:col-span-2">
          {posts.length === 0 ? (
            <div className="intranet-card p-8 text-center">
              <p className="dept-label mb-2">No documents on file</p>
              <p className="font-sans text-sm text-synergy-muted">Check back soon.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="memo-card p-5 block hover:border-l-synergy-navy transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="dept-label text-synergy-amber mb-1">{post.arc}</p>
                      <h2 className="font-sans font-semibold text-synergy-dark text-sm leading-snug group-hover:text-synergy-navy transition-colors">
                        {post.title}
                      </h2>
                      <p className="font-sans text-xs text-synergy-muted mt-1.5 line-clamp-2 font-light">
                        {post.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="status-filed">FILED</span>
                      <p className="font-mono text-[9px] text-synergy-muted mt-1">{post.date}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="intranet-card">
            <div className="intranet-header">Browse by Arc</div>
            <ul className="divide-y divide-synergy-rule">
              {ARC_LIST.map((arc) => (
                <li key={arc}>
                  <span className="block px-4 py-2.5 font-sans text-sm text-synergy-navy hover:bg-synergy-gray cursor-default transition-colors">
                    {arc}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="intranet-card p-4">
            <p className="dept-label mb-2">Publishing Cadence</p>
            <p className="font-sans text-xs text-synergy-muted">
              Posts are filed monthly as part of recurring narrative arcs.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
