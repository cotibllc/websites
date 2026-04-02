import { getAllContent } from "@/lib/content";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogPage() {
  const posts = await getAllContent("blog");
  const sorted = posts.sort((a, b) => {
    const da = new Date(String(a.frontMatter.date ?? 0)).getTime();
    const db = new Date(String(b.frontMatter.date ?? 0)).getTime();
    return db - da;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-10">Blog</h1>
      <div className="flex flex-col gap-6">
        {sorted.map(({ slug, frontMatter }) => {
          const title = String(frontMatter.title ?? slug);
          const date = frontMatter.date
            ? new Date(String(frontMatter.date)).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric",
              })
            : "";
          return (
            <article key={slug} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-500 mb-1">{date}</p>
              <h2 className="text-xl font-semibold">
                <Link href={`/blog/${slug}`} className="hover:text-blue-600 transition-colors">
                  {title}
                </Link>
              </h2>
            </article>
          );
        })}
      </div>
    </div>
  );
}
