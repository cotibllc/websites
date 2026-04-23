import { getPostData, getAllPostSlugs } from "@/lib/blog";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPostSlugs().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPostData(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `/blog/${slug}`,
      publishedTime: post.date,
      authors: ["Chuck Morrison"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      creator: "@corphardcore",
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostData(slug);
  if (!post) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            url: `https://www.corphardcore.com/blog/${post.slug}`,
            author: { "@type": "Person", name: "Chuck Morrison", url: "https://www.corphardcore.com/about" },
            publisher: { "@type": "Organization", name: "Corporate Hardcore", url: "https://www.corphardcore.com" },
          }),
        }}
      />

      <div className="mx-auto content-max px-4 py-8 max-w-3xl">
        <Link href="/blog" className="inline-flex items-center gap-1 font-mono text-[10px] tracking-widest uppercase text-synergy-navy hover:text-synergy-amber transition-colors mb-6">
          ← Back to Field Notes
        </Link>

        <article className="intranet-card">
          {/* Memo header */}
          <div className="bg-synergy-amber-light border-b border-synergy-rule px-6 py-4 grid grid-cols-2 gap-x-6 gap-y-1">
            <div><span className="dept-label">Classification</span><p className="font-mono text-sm text-synergy-amber">{post.arc}</p></div>
            <div><span className="dept-label">Date Filed</span><p className="font-mono text-sm text-synergy-dark">{post.date}</p></div>
            <div className="col-span-2"><span className="dept-label">Subject</span><p className="font-sans font-semibold text-synergy-dark text-lg leading-snug mt-0.5">{post.title}</p></div>
          </div>

          {/* Body */}
          <div className="p-6 md:p-8">
            <div
              className="prose prose-neutral max-w-none
                prose-headings:font-sans prose-headings:font-semibold
                prose-p:font-sans prose-p:leading-relaxed prose-p:text-synergy-dark
                prose-a:text-synergy-navy prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-l-4 prose-blockquote:border-synergy-amber prose-blockquote:text-synergy-muted
                prose-strong:text-synergy-dark prose-strong:font-semibold
                prose-code:bg-synergy-gray prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm
                prose-pre:bg-synergy-gray"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-synergy-white border-t border-synergy-rule flex items-center justify-between">
            <p className="font-mono text-[10px] text-synergy-muted tracking-widest">FILED — SYNERGY CORP INTERNAL</p>
            <p className="font-sans text-xs italic text-synergy-muted"><em>Circle Back. Never Return.</em></p>
          </div>
        </article>
      </div>
    </>
  );
}
