import { getPostData, getAllPostSlugs, getSortedPostsData } from "@/lib/blog";
import { buildMemoHeader } from "@/lib/memo-header";
import MemoHeaderBlock from "@/components/MemoHeaderBlock";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPostSlugs().map((s) => ({ slug: s.slug }));
}

import { metaDescription, pageTitle } from "@/lib/seo";

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPostData(slug);
  if (!post) return { title: "Not Found" };
  const description = metaDescription(post.description);
  return {
    title: { absolute: pageTitle(post.title, post.seoTitle) },
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: `/blog/${slug}`,
      publishedTime: post.date,
      authors: ["Chuck Morrison"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      creator: "@corphardcore",
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostData(slug);
  if (!post) notFound();
  const header = buildMemoHeader({
    collection: "field-notes",
    items: getSortedPostsData().map((p) => ({ id: p.slug, date: p.date })),
    id: post.slug,
    date: post.date,
    frontmatter: { department: post.department, classification: post.classification },
  });

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
          <MemoHeaderBlock
            header={header}
            subject={post.title}
            extraRows={[{ label: "Arc", value: post.arc }]}
            from={
              <>
                <Link href="/about" className="hover:text-synergy-amber transition-colors">Chuck Morrison</Link>
                <span className="text-synergy-muted">, 18 years in the trenches</span>
              </>
            }
          />

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
            <p className="font-mono text-[10px] text-synergy-muted tracking-widest">FILED: SYNERGY CORP INTERNAL</p>
            <p className="font-sans text-xs italic text-synergy-muted"><em>Circle Back. Never Return.</em></p>
          </div>
        </article>
      </div>
    </>
  );
}
