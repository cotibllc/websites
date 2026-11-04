import { fieldMemoDatedItems, getFieldMemoBySlug, getFieldMemoSlugs } from "@/data/field-memos";
import { buildMemoHeader } from "@/lib/memo-header";
import MemoHeaderBlock from "@/components/MemoHeaderBlock";
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
  const canonical = memo.canonical ?? `/field-memos/${slug}`;
  return {
    title: memo.title,
    description: memo.description,
    alternates: { canonical },
    openGraph: {
      title: memo.title,
      description: memo.description,
      type: "article",
      url: canonical,
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
  const header = buildMemoHeader({
    collection: "field-memos",
    items: fieldMemoDatedItems(),
    id: entry.slug ?? entry.videoId,
    date: memo.date || entry.published,
    frontmatter: { department: memo.department, classification: memo.classification },
  });

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
          <MemoHeaderBlock
            header={header}
            subject={memo.title}
            extraRows={[{ label: "Filing Code", value: `${entry.fmCode} · ${entry.status}` }]}
            from={
              <>
                <Link href="/about" className="hover:text-synergy-amber transition-colors">Chuck Morrison</Link>
                <span className="text-synergy-muted">, Information Technology, Badge #00847</span>
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
                prose-strong:text-synergy-dark prose-strong:font-semibold"
              dangerouslySetInnerHTML={{ __html: memo.contentHtml }}
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
