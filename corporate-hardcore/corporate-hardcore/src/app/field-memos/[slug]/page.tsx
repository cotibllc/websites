import { getFieldMemoBySlug, getFieldMemoSlugs } from "@/data/field-memos";
import { getFieldMemoBody } from "@/lib/field-memo-content";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getFieldMemoSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const memo = await getFieldMemoBody(slug);
  if (!memo) return { title: "Not Found" };
  return {
    title: memo.title,
    description: memo.description,
    alternates: { canonical: `/field-memos/${slug}` },
    openGraph: {
      title: memo.title,
      description: memo.description,
      type: "article",
      url: `/field-memos/${slug}`,
      publishedTime: memo.date,
      authors: ["Chuck Morrison"],
    },
    twitter: {
      card: "summary_large_image",
      title: memo.title,
      description: memo.description,
      creator: "@corphardcore",
    },
  };
}

export default async function FieldMemoPage({ params }: Props) {
  const { slug } = await params;
  const entry = getFieldMemoBySlug(slug);
  const memo = await getFieldMemoBody(slug);
  if (!entry || !memo) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: memo.title,
            description: memo.description,
            datePublished: memo.date,
            url: `https://www.corphardcore.com/field-memos/${memo.slug}`,
            author: { "@type": "Person", name: "Chuck Morrison", url: "https://www.corphardcore.com/about" },
            publisher: { "@type": "Organization", name: "Corporate Hardcore", url: "https://www.corphardcore.com" },
          }),
        }}
      />

      <div className="mx-auto content-max px-4 py-8 max-w-3xl">
        <Link href="/field-memos" className="inline-flex items-center gap-1 font-mono text-[10px] tracking-widest uppercase text-synergy-navy hover:text-synergy-amber transition-colors mb-6">
          ← Back to Field Memos
        </Link>

        <article className="intranet-card">
          {/* Memo header */}
          <div className="bg-synergy-amber-light border-b border-synergy-rule px-6 py-4 grid grid-cols-2 gap-x-6 gap-y-1">
            <div><span className="dept-label">Filing Code</span><p className="font-mono text-sm text-synergy-amber">{entry.fmCode} · {entry.status}</p></div>
            <div><span className="dept-label">Date Filed</span><p className="font-mono text-sm text-synergy-dark">{memo.date}</p></div>
            <div className="col-span-2"><span className="dept-label">Subject</span><p className="font-sans font-semibold text-synergy-dark text-lg leading-snug mt-0.5">{memo.title}</p></div>
            <div className="col-span-2 mt-1">
              <span className="dept-label">Author</span>
              <p className="font-sans text-sm text-synergy-dark mt-0.5">
                <Link href="/about" className="hover:text-synergy-amber transition-colors">Chuck Morrison</Link>
                <span className="text-synergy-muted"> — Information Technology, Badge #00847</span>
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 md:p-8">
            <div
              className="prose prose-neutral max-w-none
                prose-headings:font-sans prose-headings:font-semibold
                prose-p:font-sans prose-p:leading-relaxed prose-p:text-synergy-dark
                prose-a:text-synergy-navy prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-l-4 prose-blockquote:border-synergy-amber prose-blockquote:text-synergy-muted
                prose-strong:text-synergy-dark prose-strong:font-semibold"
              dangerouslySetInnerHTML={{ __html: memo.contentHtml }}
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
