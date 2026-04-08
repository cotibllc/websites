import Navigation from "@/components/Navigation";
import Link from "next/link";
import { getSortedPostsData } from "@/lib/blog";
import { Calendar } from "lucide-react";

export const metadata = {
  title: "Articles | Corporate Hardcore",
  description: "Observational satire documenting corporate dysfunction.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogPage() {
  const posts = getSortedPostsData();

  return (
    <main className="min-h-screen bg-bg-main">
      <Navigation />

      <div className="mx-auto content-max px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <section className="lg:col-span-2 space-y-6">
          <div className="surface-card p-6">
            <h1 className="text-2xl font-bold">Articles</h1>
            <p className="text-text-secondary mt-1">
              Observations from eighteen years in the same company.
            </p>
          </div>

          {/* Posts feed */}
          <div className="surface-card divide-y divide-border-light">
            {posts.length === 0 ? (
              <div className="p-6 text-center text-text-secondary">
                <p>No articles yet. Check back soon.</p>
              </div>
            ) : (
              posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-linkedin-blue uppercase tracking-wide">
                      {post.arc}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-text-primary">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-text-secondary text-sm line-clamp-2">
                    {post.description}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-text-secondary">
                    <Calendar className="w-3 h-3" />
                    <time dateTime={post.date}>{post.date}</time>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Right rail */}
        <aside className="space-y-4">
          <div className="surface-card p-4">
            <h3 className="font-semibold mb-2">Browse by Arc</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-linkedin-blue hover:underline cursor-pointer">
                Performance Review Arc
              </li>
              <li className="text-linkedin-blue hover:underline cursor-pointer">
                Holiday Party Arc
              </li>
              <li className="text-linkedin-blue hover:underline cursor-pointer">
                Vision Emails Arc
              </li>
              <li className="text-linkedin-blue hover:underline cursor-pointer">
                Budget Cuts Arc
              </li>
              <li className="text-linkedin-blue hover:underline cursor-pointer">
                Job Search Arc
              </li>
            </ul>
          </div>

          <div className="surface-card p-4">
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-sm text-text-secondary">
              Posts are published monthly as part of recurring narrative arcs.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
