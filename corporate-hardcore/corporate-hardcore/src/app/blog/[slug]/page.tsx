import Navigation from "@/components/Navigation";
import { getPostData, getAllPostSlugs } from "@/lib/blog";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPostData(slug);
  
  if (!post) {
    return { title: "Not Found" };
  }

  return {
    title: `${post.title} | Corporate Hardcore`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostData(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-bg-main">
      <Navigation />

      <div className="mx-auto content-max px-4 py-6">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-linkedin-blue hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </Link>

        {/* Article card */}
        <article className="surface-card">
          {/* Header */}
          <header className="p-6 md:p-8 border-b border-border-light">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium text-linkedin-blue uppercase tracking-wide">
                {post.arc}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
              {post.title}
            </h1>
            <div className="mt-4 flex items-center gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.date}>{post.date}</time>
              </span>
            </div>
          </header>

          {/* Content */}
          <div className="p-6 md:p-8">
            <div
              className="prose prose-neutral prose-base sm:prose-lg max-w-none
                prose-headings:font-semibold prose-headings:text-text-primary
                prose-p:text-text-primary prose-p:leading-relaxed
                prose-a:text-linkedin-blue prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-l-4 prose-blockquote:border-linkedin-blue prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-text-secondary
                prose-strong:text-text-primary prose-strong:font-semibold
                prose-code:bg-bg-main prose-code:px-2 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                prose-em:text-text-secondary prose-em:italic
                prose-pre:bg-bg-main prose-pre:text-text-primary"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          </div>

          {/* Footer */}
          <footer className="px-6 md:px-8 py-4 bg-bg-main border-t border-border-light">
            <p className="text-sm text-text-secondary text-center italic">
              Circle back. Never return.
            </p>
          </footer>
        </article>

        {/* Next post navigation could go here */}
      </div>
    </main>
  );
}
