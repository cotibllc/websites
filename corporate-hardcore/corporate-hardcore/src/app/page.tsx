import type { Metadata } from "next";
import Link from "next/link";
import { getLatestFieldMemo } from "@/data/field-memos";
import { getSortedPostsData } from "@/lib/blog";
import { characters, synergyStats, platformLinks } from "@/data/content";
import FieldMemoCard from "@/components/FieldMemoCard";
import CharacterCard from "@/components/CharacterCard";
import DistributionList from "@/components/DistributionList";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Corporate Hardcore | Circle Back. Never Return.",
  description:
    "Observational satire for the corporate lifer. Chuck Morrison documents eighteen years of dysfunction so you don't have to.",
  alternates: { canonical: "/" },
  openGraph: { url: "https://www.corphardcore.com" },
};

export default async function HomePage() {
  const [latestMemo, posts] = await Promise.all([
    Promise.resolve(getLatestFieldMemo()),
    Promise.resolve(getSortedPostsData()),
  ]);
  const recentPosts = posts.slice(0, 2);
  const featuredCharacters = characters.filter((c) =>
    ["chuck-morrison", "hr-jill", "ceo-joe"].includes(c.id)
  );
  const watchHref = latestMemo
    ? `https://www.youtube.com/watch?v=${latestMemo.videoId}`
    : "/field-memos";

  return (
    <>
      <section className="bg-synergy-gray border-b border-synergy-rule animate-fade-in">
        <div className="mx-auto content-max px-4 py-10 lg:py-12">
          <div className="flex items-center gap-3 mb-4">
            <p className="intranet-header inline-block">Latest Field Memo</p>
            {latestMemo && (
              <span className="font-mono text-[10px] text-synergy-muted tracking-wider">
                {latestMemo.fmCode}
              </span>
            )}
          </div>

          {latestMemo ? (
            <FieldMemoCard memo={latestMemo} featured />
          ) : (
            <p className="font-sans text-sm text-synergy-muted mb-6">
              Additional memos will appear when filed.
            </p>
          )}

          <div className="flex flex-wrap gap-3 mt-6">
            <a
              href={watchHref}
              target={latestMemo ? "_blank" : undefined}
              rel={latestMemo ? "noopener noreferrer" : undefined}
              className="btn-intranet"
            >
              OPEN LATEST FIELD MEMO →
            </a>
            <Link href="/blog" className="btn-ghost">Read the Field Notes</Link>
          </div>
        </div>
      </section>

      <section className="border-b border-synergy-rule">
        <div className="mx-auto content-max px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="dept-label text-synergy-amber mb-3">Employee Documentation Series</p>
              <h1 className="font-sans font-semibold text-2xl lg:text-3xl text-synergy-dark leading-tight mb-3">
                Eighteen years. Same company. Same mug. Still here.
              </h1>
              <p className="font-sans text-synergy-muted text-base font-light max-w-lg">
                Chuck Morrison, IT Manager, documents the dysfunction so you don&apos;t have to.
              </p>
            </div>
            <div className="flex items-center justify-center gap-6 lg:justify-end">
              <div className="border-2 border-dashed border-synergy-rule bg-white p-4 flex flex-col items-center gap-2 w-40">
                <div className="w-24 h-28 bg-synergy-gray border border-synergy-rule flex flex-col items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                    <circle cx="16" cy="11" r="6" stroke="#c8c4bc" strokeWidth="1.5"/>
                    <path d="M4 29c0-6.6 5.4-12 12-12s12 5.4 12 12" stroke="#c8c4bc" strokeWidth="1.5" fill="none"/>
                  </svg>
                </div>
                <span className="font-mono text-[9px] text-synergy-muted tracking-widest text-center">
                  MORRISON, C.<br />ID PHOTO
                </span>
                <span className="font-mono text-[8px] text-synergy-muted/60">#00847</span>
              </div>
              <div className="border-4 border-synergy-rule bg-white p-3 max-w-[110px] text-center shadow-sm rotate-[-2deg] flex-shrink-0 hidden sm:block">
                <p className="dept-label mb-1">Motivational<br/>Thought</p>
                <p className="font-sans text-[11px] text-synergy-dark italic leading-snug">
                  &ldquo;Together we can achieve synergy.&rdquo;
                </p>
                <p className="font-mono text-[8px] text-synergy-muted mt-1">— Leadership, 2019</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-synergy-navy border-b border-white/10">
        <div className="mx-auto content-max px-4 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10">
            {synergyStats.map((stat) => (
              <div key={stat.label} className="px-6 py-2 text-center first:pl-0 last:pr-0">
                <p className="font-mono text-3xl font-medium text-synergy-amber tracking-tight">{stat.value}</p>
                <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-white/50 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-synergy-rule">
        <div className="mx-auto content-max px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <p className="intranet-header inline-block">Personnel on File</p>
            <Link href="/characters" className="font-mono text-[10px] tracking-widest uppercase text-synergy-navy hover:text-synergy-amber transition-colors">
              View Directory →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredCharacters.map((char) => (
              <CharacterCard key={char.id} character={char} compact />
            ))}
          </div>
        </div>
      </section>

      {recentPosts.length > 0 && (
        <section className="border-b border-synergy-rule">
          <div className="mx-auto content-max px-4 py-10">
            <div className="flex items-center justify-between mb-6">
              <p className="intranet-header inline-block">Recent Field Notes</p>
              <Link href="/blog" className="font-mono text-[10px] tracking-widest uppercase text-synergy-navy hover:text-synergy-amber transition-colors">
                Full Archive →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {recentPosts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="memo-card p-5 block hover:border-l-synergy-navy transition-colors group">
                  <p className="dept-label text-synergy-amber mb-2">{post.arc}</p>
                  <h3 className="font-sans font-semibold text-synergy-dark text-sm leading-snug group-hover:text-synergy-navy transition-colors">{post.title}</h3>
                  <p className="font-sans text-xs text-synergy-muted mt-2 line-clamp-2 font-light">{post.description}</p>
                  <p className="font-mono text-[10px] text-synergy-muted mt-3">{post.date}</p>
                </Link>
              ))}
            </div>
            <DistributionList />
          </div>
        </section>
      )}

      <section className="border-b border-synergy-rule">
        <div className="mx-auto content-max px-4 py-8">
          <p className="dept-label mb-3">Follow Channels</p>
          <div className="flex flex-wrap gap-3">
            {platformLinks.map((p) => (
              <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className="btn-ghost font-mono text-[10px] tracking-widest uppercase">
                {p.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
