import type { Metadata } from "next";
import Link from "next/link";
import { getLatestVideo } from "@/lib/youtube";
import { getSortedPostsData } from "@/lib/blog";
import { characters, synergyStats } from "@/data/content";
import EpisodeCard from "@/components/EpisodeCard";
import CharacterCard from "@/components/CharacterCard";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Corporate Hardcore | Circle Back. Never Return.",
  description:
    "Observational satire for the corporate lifer. Chuck Morrison documents eighteen years of dysfunction so you don't have to.",
  alternates: { canonical: "/" },
  openGraph: { url: "https://www.corphardcore.com" },
};

export default async function HomePage() {
  const [latestVideo, posts] = await Promise.all([
    getLatestVideo(),
    Promise.resolve(getSortedPostsData()),
  ]);
  const recentPosts = posts.slice(0, 2);
  const featuredCharacters = characters.filter((c) =>
    ["chuck-morrison", "hr-jill", "ceo-joe"].includes(c.id)
  );

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="bg-synergy-gray border-b border-synergy-rule animate-fade-in">
        <div className="mx-auto content-max px-4 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="dept-label text-synergy-amber mb-4">
                Employee Documentation Series
              </p>
              <h1 className="font-sans font-semibold text-3xl lg:text-5xl text-synergy-dark leading-tight mb-4">
                Eighteen years. Same company. Same mug. Still here.
              </h1>
              <p className="font-sans text-synergy-muted text-lg font-light mb-8 max-w-lg">
                Chuck Morrison, IT Manager, documents the dysfunction so you don&apos;t have to.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/episodes" className="btn-intranet">View Episodes</Link>
                <Link href="/blog" className="btn-ghost">Read the Field Notes</Link>
              </div>
            </div>

            {/* Right side: ID photo placeholder + crooked poster */}
            <div className="flex items-center justify-center gap-6 lg:justify-end">
              {/* ID photo */}
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

              {/* SYNERGY mug */}
              <svg
                width="64" height="72" viewBox="0 0 64 72" fill="none"
                xmlns="http://www.w3.org/2000/svg" aria-label="SYNERGY mug"
                className="flex-shrink-0"
              >
                <rect x="4" y="20" width="42" height="46" rx="1" fill="#e8e6e0" stroke="#1a2f4a" strokeWidth="1.5"/>
                <path d="M46 30 Q58 30 58 40 Q58 52 46 52" stroke="#1a2f4a" strokeWidth="1.5" fill="none"/>
                <line x1="4" y1="32" x2="46" y2="32" stroke="#c8c4bc" strokeWidth="0.75"/>
                <text x="25" y="50" fontFamily="monospace" fontSize="7" fill="#1a2f4a" textAnchor="middle" letterSpacing="1">SYNERGY</text>
                <path d="M14 14 Q16 8 14 3" stroke="#c8c4bc" strokeWidth="1.2" fill="none"/>
                <path d="M22 14 Q24 7 22 1" stroke="#c8c4bc" strokeWidth="1.2" fill="none"/>
                <path d="M30 14 Q32 8 30 3" stroke="#c8c4bc" strokeWidth="1.2" fill="none"/>
              </svg>

              {/* Crooked motivational poster */}
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

      {/* ── LATEST EPISODE ────────────────────────────────────────── */}
      {latestVideo && (
        <section className="border-b border-synergy-rule">
          <div className="mx-auto content-max px-4 py-10">
            <div className="flex items-center gap-3 mb-4">
              <p className="intranet-header inline-block">Latest Dispatch</p>
              <span className="font-mono text-[10px] text-synergy-muted tracking-wider">
                {new Date(latestVideo.published).toLocaleDateString("en-US", {
                  year: "numeric", month: "short", day: "numeric",
                })}
              </span>
            </div>
            <EpisodeCard video={latestVideo} episodeNumber={1} status="PENDING ACKNOWLEDGMENT" featured />
          </div>
        </section>
      )}

      {/* ── STATS BAR ─────────────────────────────────────────────── */}
      <section className="bg-synergy-navy border-b border-white/10">
        <div className="mx-auto content-max px-4 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10">
            {synergyStats.map((stat) => (
              <div key={stat.label} className="px-6 py-2 text-center first:pl-0 last:pr-0">
                <p className="font-mono text-3xl font-medium text-synergy-amber tracking-tight">
                  {stat.value}
                </p>
                <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-white/50 mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHARACTER PREVIEW ─────────────────────────────────────── */}
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

      {/* ── FIELD NOTES TEASER ────────────────────────────────────── */}
      {recentPosts.length > 0 && (
        <section className="border-b border-synergy-rule">
          <div className="mx-auto content-max px-4 py-10">
            <div className="flex items-center justify-between mb-6">
              <p className="intranet-header inline-block">Recent Field Notes</p>
              <Link href="/blog" className="font-mono text-[10px] tracking-widest uppercase text-synergy-navy hover:text-synergy-amber transition-colors">
                Full Archive →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentPosts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="memo-card p-5 block hover:border-l-synergy-navy transition-colors group">
                  <p className="dept-label text-synergy-amber mb-2">{post.arc}</p>
                  <h3 className="font-sans font-semibold text-synergy-dark text-sm leading-snug group-hover:text-synergy-navy transition-colors">
                    {post.title}
                  </h3>
                  <p className="font-sans text-xs text-synergy-muted mt-2 line-clamp-2 font-light">
                    {post.description}
                  </p>
                  <p className="font-mono text-[10px] text-synergy-muted mt-3">{post.date}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
