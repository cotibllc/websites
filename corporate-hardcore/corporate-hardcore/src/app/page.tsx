import Link from "next/link";
import Navigation from "@/components/Navigation";
import NewsletterForm from "@/components/NewsletterForm";
import CorporateWisdom from "@/components/CorporateWisdom";
import { getSortedPostsData } from "@/lib/blog";

export default function Home() {
  const posts = getSortedPostsData();

  return (
    <main className="min-h-screen bg-bg-main">
      <Navigation />

      {/* 3-col grid */}
      <div className="mx-auto content-max px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left rail */}
        <aside className="space-y-4">
          <div className="surface-card p-4">
            <h3 className="font-semibold mb-2">About Chuck</h3>
            <p className="text-sm text-text-secondary mb-3">
              IT Manager, 18 years at the same company.
              Quietly documenting dysfunction.
            </p>
            <Link href="/about" className="text-sm text-linkedin-blue hover:underline">
              View profile →
            </Link>
          </div>
          <CorporateWisdom />
        </aside>

        {/* Main feed */}
        <section className="lg:col-span-2 xl:col-span-1 space-y-6">
          <div className="surface-card p-6">
            <h1 className="text-2xl font-bold mb-2">Observational satire for the corporate lifer</h1>
            <p className="text-text-secondary mb-4">
              Not a rebellion. An observation. We follow Chuck Morrison through monthly arcs of office absurdity.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/blog"
                className="px-4 py-2 rounded-md bg-linkedin-blue text-white hover:bg-linkedin-blue-hover transition-colors"
              >
                Start Reading
              </Link>
              <a
                href="https://www.youtube.com/@corphardcore"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-md border border-border-medium hover:bg-btn-secondary transition-colors"
              >
                View Latest Video
              </a>
            </div>
          </div>

          {/* Article cards — dynamic */}
          <div className="surface-card divide-y divide-border-light">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block p-6 hover:bg-gray-50 transition"
              >
                <span className="text-xs text-text-secondary uppercase tracking-wide">{post.arc}</span>
                <h2 className="mt-1 text-lg font-semibold">{post.title}</h2>
                <p className="mt-1 text-text-secondary">{post.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Right rail */}
        <aside className="space-y-4">
          <div className="surface-card p-4">
            <h3 className="font-semibold mb-2">Stay Updated</h3>
            <NewsletterForm />
          </div>

          <div className="surface-card p-4">
            <h3 className="font-semibold mb-2">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a className="text-linkedin-blue hover:underline" href="https://www.youtube.com/@corphardcore" target="_blank" rel="noopener noreferrer">YouTube Shorts</a></li>
              <li><a className="text-linkedin-blue hover:underline" href="https://www.instagram.com/corphardcore/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a className="text-linkedin-blue hover:underline" href="https://www.tiktok.com/@corphardcore" target="_blank" rel="noopener noreferrer">TikTok Clips</a></li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
