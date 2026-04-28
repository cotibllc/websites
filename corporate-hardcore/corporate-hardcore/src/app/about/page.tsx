import type { Metadata } from "next";
import Link from "next/link";
import { platformLinks } from "@/data/content";
import ContactFormIntranet from "@/components/ContactFormIntranet";

export const metadata: Metadata = {
  title: "About Chuck Morrison",
  description: "Chuck Morrison is an IT Manager and corporate satirist with 18 years documenting workplace dysfunction at Synergy Corp. Creator of Corporate Hardcore.",
  alternates: { canonical: "/about" },
  openGraph: {
    url: "https://www.corphardcore.com/about",
    title: "About Chuck Morrison | Corporate Hardcore",
    description: "Chuck Morrison is an IT Manager and corporate satirist with 18 years documenting workplace dysfunction at Synergy Corp.",
  },
};

const subjectOptions = [
  "General Inquiry",
  "Speaking / Collaboration",
  "Press",
  "Synergy-Related Feedback",
  "Other",
];

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: "Chuck Morrison",
            jobTitle: "IT Manager",
            description: "Corporate satirist and IT Manager with 18 years of firsthand experience documenting workplace dysfunction at a Fortune-adjacent company.",
            url: "https://www.corphardcore.com/about",
            sameAs: [
              "https://www.youtube.com/@corphardcore",
              "https://www.instagram.com/corphardcore/",
              "https://www.tiktok.com/@corphardcore",
              "https://x.com/corphardcore",
            ],
            knowsAbout: [
              "corporate satire",
              "workplace culture",
              "office humor",
              "corporate dysfunction",
              "organizational behavior",
              "IT management",
            ],
          }),
        }}
      />

      <div className="mx-auto content-max px-4 py-8">
        {/* Page header */}
        <div className="intranet-card mb-6">
          <div className="intranet-header">About — Personnel File</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left col — brand story memo */}
          <div className="lg:col-span-2 space-y-6">
            <div className="intranet-card">
              <div className="bg-synergy-amber-light border-b border-synergy-rule px-6 py-3 grid grid-cols-2 gap-x-6 gap-y-1">
                <div><span className="dept-label">To</span><p className="font-sans text-sm text-synergy-dark">Visitors</p></div>
                <div><span className="dept-label">From</span><p className="font-sans text-sm text-synergy-dark">Chuck Morrison</p></div>
                <div><span className="dept-label">RE</span><p className="font-sans text-sm text-synergy-dark">What this is</p></div>
                <div><span className="dept-label">Clearance</span><p className="font-mono text-sm text-synergy-dark">STANDARD</p></div>
              </div>
              <div className="p-6 space-y-4 font-sans text-synergy-dark leading-relaxed">
                <p>
                  I&apos;ve been an IT Manager at Synergy Corp for eighteen years. That&apos;s not a typo.
                  Eighteen years at the same company. Same building. Same fluorescent lights.
                  Some people would call that loyalty. I&apos;m not sure what to call it yet.
                </p>
                <p>
                  Before IT, I was pre-med. I had a 3.8 GPA, volunteered at a hospital, the whole thing.
                  Then I took an IT job to pay for graduate school. That was 1998. I never went back.
                </p>
                <p>
                  Corporate Hardcore is not satire in the traditional sense. It is documentation.
                  I observe what happens in organizations with calm, factual precision, and I report it.
                  The absurdity is not invented. The absurdity is the point.
                </p>
                <p>
                  Every vision email. Every right-sizing. Every mandatory fun event. Every meeting
                  that could have been an email and was scheduled instead. I document it so that
                  people who live this can see it named, and people who don&apos;t can understand
                  why the ones who do are so quiet about it.
                </p>
                <p className="font-sans italic text-synergy-muted">
                  <em>Circle Back. Never Return.</em>
                </p>
              </div>
            </div>

            {/* Contact form */}
            <div className="intranet-card">
              <div className="intranet-header">Help Desk — Submit a Ticket</div>
              <div className="p-6">
                <ContactFormIntranet subjectOptions={subjectOptions} />
              </div>
            </div>
          </div>

          {/* Right col — platform links */}
          <aside className="space-y-4">
            <div className="intranet-card">
              <div className="intranet-header">External Channels</div>
              <div className="divide-y divide-synergy-rule">
                {platformLinks.map((platform) => (
                  <div key={platform.id} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="dept-label">{platform.label}</p>
                      <p className="font-mono text-xs text-synergy-dark">{platform.handle}</p>
                    </div>
                    <a
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost text-[10px] px-3 py-1.5 flex-shrink-0"
                    >
                      Visit
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="intranet-card p-4">
              <p className="dept-label mb-2">Employee ID</p>
              <p className="font-mono text-2xl text-synergy-dark">#00847</p>
              <p className="dept-label mt-3 mb-1">Department</p>
              <p className="font-sans text-sm text-synergy-dark">Information Technology</p>
              <p className="dept-label mt-3 mb-1">Status</p>
              <p className="font-mono text-sm text-synergy-green">ACTIVE</p>
              <p className="dept-label mt-3 mb-1">Years of Service</p>
              <p className="font-mono text-sm text-synergy-dark">18</p>
            </div>

            <div className="intranet-card p-4">
              <p className="dept-label mb-2">Synergy Corp</p>
              <h2 className="font-sans text-base text-synergy-dark mb-2">
                Want the official company story?
              </h2>
              <p className="font-sans text-sm text-synergy-muted leading-relaxed mb-4">
                Review the corporate overview, leadership roster, and carefully approved history of
                the organization Chuck has been surviving for eighteen years.
              </p>
              <Link href="/company" className="btn-ghost text-[10px] px-3 py-1.5 inline-block">
                Learn About Synergy Corp
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
