import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false },
};

// Site-wide 404. Next.js still answers with status 404.
export default function NotFound() {
  return (
    <div className="mx-auto content-max px-4 py-8 max-w-2xl">
      <div className="intranet-card mb-6">
        <div className="intranet-header flex items-center justify-between gap-4">
          <span>Error 404</span>
          <span className="text-white/50">Ticket auto-closed.</span>
        </div>
      </div>

      <div className="intranet-card">
        <div className="bg-synergy-amber-light border-b border-synergy-rule px-6 py-3 grid grid-cols-2 gap-x-6 gap-y-1">
          <div><span className="dept-label">To</span><p className="font-sans text-sm text-synergy-dark">Requester</p></div>
          <div><span className="dept-label">From</span><p className="font-sans text-sm text-synergy-dark">IT Department</p></div>
          <div><span className="dept-label">RE</span><p className="font-sans text-sm text-synergy-dark">Page Not Found</p></div>
          <div><span className="dept-label">Status</span><p className="font-mono text-sm text-synergy-amber">CLOSED</p></div>
        </div>

        <div className="p-6 space-y-4">
          <h1 className="font-sans text-xl font-semibold text-synergy-dark">
            The page you requested could not be located.
          </h1>
          <p className="font-sans text-synergy-dark leading-relaxed">
            It may have been reorganized, deprecated, or moved to a shared drive nobody has access to.
          </p>
          <p className="font-sans text-synergy-dark leading-relaxed">
            A ticket was opened on your behalf. The ticket has been closed. Resolution: working as intended.
          </p>
          <p className="font-sans text-synergy-muted text-sm italic font-light">
            Morrison, C., IT Department
          </p>
        </div>

        <div className="border-t border-synergy-rule px-6 py-5 bg-synergy-white flex flex-wrap gap-3">
          <Link href="/" className="btn-intranet">Return to Homepage</Link>
          <Link href="/field-memos" className="btn-ghost">Field Memos</Link>
          <Link href="/glossary" className="btn-ghost">Glossary</Link>
        </div>
      </div>
    </div>
  );
}
