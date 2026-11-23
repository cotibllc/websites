import type { Metadata } from "next";
import Link from "next/link";
import { getLatestFieldMemo } from "@/data/field-memos";
import { SUBSCRIBE_ASK, SUBSCRIBE_HREF } from "@/lib/subscribe-ask";

// Same cadence as the home page: the Field Memo allowlist ships with each deploy.
export const revalidate = 86400;

const description =
  "New employee orientation for Corporate Hardcore. Meet the staff of Synergy Corp, watch the latest Field Memo and join distribution.";

export const metadata: Metadata = {
  title: "Start Here",
  description,
  alternates: { canonical: "/start-here" },
  openGraph: {
    title: "Start Here | Corporate Hardcore",
    description,
    url: "/start-here",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Start Here | Corporate Hardcore",
    description,
    creator: "@corphardcore",
  },
};

/** "Direct Report · Annual Review | Synergy Corp Field Memo" to "Direct Report · Annual Review". */
function shortMemoTitle(title: string): string {
  return title.split(" | ")[0];
}

const linkClass =
  "font-mono text-[11px] tracking-widest uppercase text-synergy-navy underline underline-offset-2 decoration-synergy-rule hover:text-synergy-amber hover:decoration-synergy-amber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-synergy-navy";

export default function StartHerePage() {
  const latest = getLatestFieldMemo();

  return (
    <div className="mx-auto content-max px-4 py-8 max-w-3xl">
      <article className="intranet-card">
        <div className="intranet-header">Human Resources · New Employee Orientation</div>

        <header className="bg-synergy-amber-light border-b border-synergy-rule px-6 py-4">
          <dl className="font-mono text-[12px] border-y-2 border-double border-synergy-rule divide-y divide-dashed divide-synergy-rule">
            {[
              ["To", "New Employee"],
              ["From", "Chuck Morrison, IT Manager, Badge #00847"],
              ["Re", "Your first week"],
              ["Classification", "Onboarding Packet"],
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-[8.5rem_1fr] sm:grid-cols-[10rem_1fr] gap-x-3 py-1.5">
                <dt className="dept-label self-center">{label}</dt>
                <dd className="text-synergy-dark tracking-wide min-w-0 break-words">{value}</dd>
              </div>
            ))}
          </dl>
          <h1 className="font-sans font-semibold text-synergy-dark text-2xl leading-tight mt-4">
            Welcome to Synergy Corp.
          </h1>
        </header>

        <div className="p-6 md:p-8 font-sans text-synergy-dark leading-relaxed">
          <p className="mb-3">
            HR asked me to write this because I have been here the longest. Eighteen years. Same
            company. Same mug. Nobody else wanted to do it either.
          </p>
          <p className="mb-8">
            What follows is everything I wish someone had told me on my first day. Keep it somewhere
            you can find it. Nobody will send it again.
          </p>

          <h2 className="intranet-header inline-block mb-4">Your First Week</h2>
          <ol className="border-t border-synergy-rule" id="first-week">
            <li className="border-b border-synergy-rule py-4 grid grid-cols-[3rem_1fr] gap-x-3">
              <span className="font-mono text-sm text-synergy-amber">01</span>
              <div>
                <p className="font-semibold">Day 1. Meet the staff.</p>
                <p className="text-sm text-synergy-muted mt-1">
                  Learn who approves what, who schedules what, and who ends up in the minutes either way.
                </p>
                <p className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                  <Link href="/characters" className={linkClass}>Open the Employee Directory →</Link>
                  <Link href="/company" className={linkClass}>Leadership on file →</Link>
                </p>
              </div>
            </li>
            <li className="border-b border-synergy-rule py-4 grid grid-cols-[3rem_1fr] gap-x-3">
              <span className="font-mono text-sm text-synergy-amber">02</span>
              <div>
                <p className="font-semibold">Day 2. Watch the latest Field Memo.</p>
                {latest ? (
                  <>
                    <p className="text-sm text-synergy-muted mt-1">
                      Every department gets a copy. Watching it is not required. Neither was anything
                      else, and here we are.
                    </p>
                    <p className="font-mono text-[12px] mt-2" id="start-here-latest-memo">
                      <span className="text-synergy-amber">{latest.fmCode}</span>{" "}
                      <span className="text-synergy-dark">{shortMemoTitle(latest.title)}</span>
                    </p>
                    <p className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                      {latest.slug && (
                        <Link href={`/field-memos/${latest.slug}`} className={linkClass}>Read the memo →</Link>
                      )}
                      <a
                        href={`https://www.youtube.com/watch?v=${latest.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                      >
                        Watch →
                      </a>
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-synergy-muted mt-1">
                    No memo is on file yet. <Link href="/field-memos" className={linkClass}>Check the Media Library →</Link>
                  </p>
                )}
              </div>
            </li>
            <li className="border-b border-synergy-rule py-4 grid grid-cols-[3rem_1fr] gap-x-3">
              <span className="font-mono text-sm text-synergy-amber">03</span>
              <div>
                <p className="font-semibold">Day 3. Read the Field Notes.</p>
                <p className="text-sm text-synergy-muted mt-1">
                  My written record. Filed by arc and dated, so you can see how long nothing has been fixed.
                </p>
                <p className="mt-2">
                  <Link href="/blog" className={linkClass}>Open the Field Notes →</Link>
                </p>
              </div>
            </li>
            <li className="border-b border-synergy-rule py-4 grid grid-cols-[3rem_1fr] gap-x-3">
              <span className="font-mono text-sm text-synergy-amber">04</span>
              <div>
                <p className="font-semibold">Day 4. Learn the language.</p>
                <p className="text-sm text-synergy-muted mt-1">
                  Nobody here says what they mean. The Glossary translates.
                </p>
                <p className="mt-2">
                  <Link href="/glossary" className={linkClass}>Open the Glossary →</Link>
                </p>
              </div>
            </li>
            <li className="border-b border-synergy-rule py-4 grid grid-cols-[3rem_1fr] gap-x-3">
              <span className="font-mono text-sm text-synergy-amber">05</span>
              <div>
                <p className="font-semibold">Day 5. Join distribution.</p>
                <p className="text-sm text-synergy-muted mt-1">{SUBSCRIBE_ASK.line}</p>
                <p className="mt-2">
                  <Link href={SUBSCRIBE_HREF} className={linkClass}>{SUBSCRIBE_ASK.link} →</Link>
                </p>
              </div>
            </li>
          </ol>

          <p className="mt-8">Welcome aboard. Circle back if you need anything.</p>
          <p className="font-mono text-[11px] text-synergy-muted tracking-wide mt-2">
            MORRISON, C. · IT DEPT · BADGE #00847
          </p>
        </div>

        <div className="px-6 py-4 bg-synergy-white border-t border-synergy-rule flex items-center justify-between gap-4">
          <p className="font-mono text-[10px] text-synergy-muted tracking-widest">FILED: SYNERGY CORP INTERNAL</p>
          <p className="font-sans text-xs italic text-synergy-muted"><em>Circle Back. Never Return.</em></p>
        </div>
      </article>
    </div>
  );
}
