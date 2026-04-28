import type { Metadata } from "next";
import Link from "next/link";
import { getSortedJargonData } from "@/lib/jargon";

export const metadata: Metadata = {
  title: "Corporate Jargon Glossary | Corporate Hardcore",
  description:
    "Authoritative definitions of corporate jargon from an 18-year insider. What 'circle back,' 'synergy,' 'boil the ocean,' and dozens of other phrases actually mean — and why they exist.",
  alternates: { canonical: "/glossary" },
  openGraph: {
    title: "Corporate Jargon Glossary | Corporate Hardcore",
    description:
      "Authoritative definitions of corporate jargon from an 18-year insider. What these phrases actually mean — and why they exist.",
    url: "/glossary",
    type: "website",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  name: "Corporate Hardcore Glossary",
  description:
    "Authoritative definitions of corporate jargon compiled from 18 years of direct field observation by Chuck Morrison.",
  url: "https://www.corphardcore.com/glossary",
  author: {
    "@type": "Person",
    name: "Chuck Morrison",
    url: "https://www.corphardcore.com/about",
  },
};

export default function GlossaryPage() {
  const terms = getSortedJargonData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="mx-auto content-max px-4 py-8">
        {/* Header */}
        <div className="intranet-card mb-6">
          <div className="intranet-header flex items-center justify-between">
            <span>Corporate Jargon Glossary</span>
            <span className="text-white/50">{terms.length} terms defined</span>
          </div>
          <div className="px-6 py-4 bg-synergy-white border-t border-synergy-rule">
            <p className="font-sans text-sm text-synergy-muted max-w-2xl">
              Eighteen years inside the same company produces a specific kind of expertise: the
              ability to decode what corporate language actually means. Each entry is drawn from
              direct field observation, documented with statistics, and analyzed with the
              specificity that generic business dictionaries avoid.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Term list */}
          <section className="lg:col-span-2">
            {terms.length === 0 ? (
              <div className="intranet-card p-8 text-center">
                <p className="dept-label mb-2">No terms on file yet</p>
                <p className="font-sans text-sm text-synergy-muted">
                  The first entry publishes this week.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {terms.map((term) => (
                  <Link
                    key={term.slug}
                    href={`/blog/jargon/${term.slug}`}
                    className="memo-card p-5 block hover:border-l-synergy-navy transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="dept-label text-synergy-amber mb-1">
                          Jargon of the Week
                        </p>
                        <h2 className="font-sans font-semibold text-synergy-dark text-base leading-snug group-hover:text-synergy-navy transition-colors">
                          {term.title}
                        </h2>
                        <p className="font-sans text-xs text-synergy-muted mt-1.5 line-clamp-2 font-light">
                          {term.description}
                        </p>
                        {term.stat && (
                          <p className="font-mono text-[10px] text-synergy-amber mt-2 tracking-wide">
                            ↳ {term.stat}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className="status-filed">DEFINED</span>
                        <p className="font-mono text-[9px] text-synergy-muted mt-1">{term.date}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="intranet-card p-5">
              <p className="dept-label mb-2">About This Glossary</p>
              <p className="font-sans text-xs text-synergy-muted leading-relaxed">
                Every entry is authored by Chuck Morrison — 18 years at the same company,
                now documenting what these phrases actually mean, not what they pretend to mean.
              </p>
              <p className="font-sans text-xs text-synergy-muted leading-relaxed mt-3">
                New term published weekly. Each entry includes a field statistic, a real
                overheard quote, usage examples, and an FAQ for the people still Googling these
                at 11pm before a review cycle.
              </p>
            </div>

            <div className="intranet-card p-5">
              <p className="dept-label mb-3">Publishing Cadence</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs text-synergy-muted">Frequency</span>
                  <span className="font-mono text-[10px] text-synergy-dark">Weekly</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs text-synergy-muted">Source</span>
                  <span className="font-mono text-[10px] text-synergy-dark">18 yrs field obs.</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs text-synergy-muted">Author</span>
                  <span className="font-mono text-[10px] text-synergy-dark">Chuck Morrison</span>
                </div>
              </div>
            </div>

            <div className="intranet-card p-5">
              <p className="dept-label mb-2">Also In Field Notes</p>
              <Link
                href="/blog"
                className="font-sans text-sm text-synergy-navy hover:text-synergy-amber transition-colors"
              >
                Read the full narrative archive →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
