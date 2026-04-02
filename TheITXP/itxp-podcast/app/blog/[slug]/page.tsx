import { getContentItem, getContentSlugs } from "@/lib/content";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getContentSlugs("blog").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getContentItem("blog", slug);
  if (!post) return {};
  return { title: String(post.frontMatter.title ?? slug) };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getContentItem("blog", slug);
  if (!post) notFound();

  const { frontMatter, contentHtml } = post;
  const title = String(frontMatter.title ?? slug);
  const date = frontMatter.date
    ? new Date(String(frontMatter.date)).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "";

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <p className="text-sm text-gray-500 mb-2">{date}</p>
      <h1 className="text-3xl font-bold mb-8">{title}</h1>
      <div
        className="prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </article>
  );
}
