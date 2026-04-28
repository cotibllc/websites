import { getJargonData, getAllJargonSlugs } from "@/lib/jargon";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ term: string }>;
}

export async function generateStaticParams() {
  return getAllJargonSlugs();
}

export async function generateMetadata({ params }: Props) {
  const { term } = await params;
  const post = await getJargonData(term);
  if (!post) return { title: "Not Found" };
  return {
    title: `What Does "${post.title}" Mean? | Corporate Hardcore Glossary`,
    description: post.description,
    alternates: { canonical: `/blog/jargon/${term}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `/blog/jargon/${term}`,
      publishedTime: post.date,
      authors: ["Chuck Morrison"],
    },
    twitter: {
      card: "summary_large_image",
      title: `What Does "${post.title}" Mean?`,
      description: post.description,
      creator: "@corphardcore",
    },
  };
}

export default async function JargonPostPage({ params }: Props) {
  const { term } = await params;
  const post = await getJargonData(term);
  if (!post) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DefinedTerm",
        name: post.title,
        description: post.description,
        inDefinedTermSet: {
          "@type": "DefinedTermSet",
          name: "Corporate Hardcore Glossary",
          url: "https://www.corphardcore.com/glossary",
        },
        url: `https://www.corphardcore.com/blog/jargon/${post.slug}`,
      },
      {
        "@type": "FAQPage",
        mainEntity: post.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
      {
        "@type": "Article",
        headline: `What Does "${post.title}" Mean? A Corporate Glossary Entry`,
        description: post.description,
        datePublished: post.date,
        url: `https://www.corphardcore.com/blog/jargon/${post.slug}`,
        author: {
          "@type": "Person",
          name: "Chuck Morrison",
          url: "https://www.corphardcore.com/about",
          description: "18-year corporate survivor and founder of Corporate Hardcore",
        },
        publisher: {
          "@type": "Organization",
          name: "Corporate Hardcore",
          url: "https://www.corphardcore.com",
        },
        citation: post.statSource,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="mx-auto content-max px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/glossary"
            className="inline-flex items-center gap-1 font-mono text-[10px] tracking-widest uppercase text-synergy-navy hover:text-synergy-amber transition-colors"
          >
            ← Glossary
          </Link>
          <span className="font-mono text-[10px] text-synergy-muted">/</span>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 font-mono text-[10px] tracking-widest uppercase text-synergy-navy hover:text-synergy-amber transition-colors"
          >
            Field Notes
          </Link>
        </div>

        <article>
          {/* Term header */}
          <div className="intranet-card mb-4">
            <div className="bg-synergy-amber-light border-b border-synergy-rule px-6 py-5">
              <p className="font-mono text-[10px] tracking-widest uppercase text-synergy-amber mb-2">
                Jargon of the Week — Corporate Hardcore Glossary
              </p>
              <h1 className="font-sans font-bold text-3xl text-synergy-dark leading-tight mb-3">
                {post.title}
              </h1>
              <p className="font-sans text-base text-synergy-dark leading-relaxed max-w-2xl">
                {post.description}
              </p>
            </div>
            <div className="px-6 py-3 bg-synergy-white flex items-center justify-between">
              <p className="font-mono text-[10px] text-synergy-muted tracking-widest">
                FILED — SYNERGY CORP INTERNAL / CHUCK MORRISON, 18-YEAR OBSERVER
              </p>
              <p className="font-mono text-[10px] text-synergy-muted">{post.date}</p>
            </div>
          </div>

          {/* Stat callout */}
          <div className="memo-card border-l-4 border-l-synergy-amber p-5 mb-4">
            <p className="dept-label text-synergy-amber mb-1">Field Statistic</p>
            <p className="font-sans font-semibold text-synergy-dark text-lg leading-snug">
              {post.stat}
            </p>
            <p className="font-sans text-xs text-synergy-muted mt-1 italic">
              Source: {post.statSource}
            </p>
          </div>

          {/* Quote */}
          <div className="memo-card p-5 mb-4">
            <p className="dept-label text-synergy-navy mb-2">Overheard In The Wild</p>
            <blockquote className="font-sans text-base italic text-synergy-dark leading-relaxed border-l-4 border-synergy-amber pl-4 mb-2">
              &ldquo;{post.quote}&rdquo;
            </blockquote>
            <p className="font-sans text-xs text-synergy-muted italic">{post.quoteContext}</p>
          </div>

          {/* Main body */}
          {post.contentHtml && (
            <div className="intranet-card mb-4">
              <div className="intranet-header">Chuck&apos;s 18-Year Field Observation</div>
              <div
                className="p-6 md:p-8 prose prose-neutral max-w-none
                  prose-headings:font-sans prose-headings:font-semibold
                  prose-p:font-sans prose-p:leading-relaxed prose-p:text-synergy-dark
                  prose-a:text-synergy-navy prose-a:no-underline hover:prose-a:underline
                  prose-blockquote:border-l-4 prose-blockquote:border-synergy-amber prose-blockquote:text-synergy-muted
                  prose-strong:text-synergy-dark prose-strong:font-semibold"
                dangerouslySetInnerHTML={{ __html: post.contentHtml }}
              />
            </div>
          )}

          {/* Examples */}
          {post.examples.length > 0 && (
            <div className="intranet-card mb-4">
              <div className="intranet-header">Usage Examples</div>
              <div className="divide-y divide-synergy-rule">
                {post.examples.map((ex, i) => (
                  <div key={i} className="px-6 py-4">
                    <p className="dept-label text-synergy-amber mb-1.5">{ex.label}</p>
                    <p className="font-sans text-sm text-synergy-dark leading-relaxed italic">
                      &ldquo;{ex.text}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ */}
          {post.faqs.length > 0 && (
            <div className="intranet-card mb-4">
              <div className="intranet-header">Frequently Asked Questions</div>
              <div className="divide-y divide-synergy-rule">
                {post.faqs.map((faq, i) => (
                  <div key={i} className="px-6 py-5">
                    <h2 className="font-sans font-semibold text-synergy-dark text-sm mb-2">
                      {faq.question}
                    </h2>
                    <p className="font-sans text-sm text-synergy-muted leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="intranet-card">
            <div className="px-6 py-4 flex items-center justify-between">
              <p className="font-mono text-[10px] text-synergy-muted tracking-widest">
                PART OF THE CORPORATE HARDCORE GLOSSARY
              </p>
              <Link
                href="/glossary"
                className="font-mono text-[10px] tracking-widest uppercase text-synergy-navy hover:text-synergy-amber transition-colors"
              >
                View All Terms →
              </Link>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
