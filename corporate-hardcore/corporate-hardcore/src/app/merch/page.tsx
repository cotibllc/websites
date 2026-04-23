import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Company Store",
  description: "SYNERGY CORP Company Store. Show your alignment. Coming soon.",
  alternates: { canonical: "/merch" },
};

export default function MerchPage() {
  return (
    <div className="mx-auto content-max px-4 py-8 max-w-2xl">
      {/* Page header */}
      <div className="intranet-card mb-6">
        <div className="intranet-header flex items-center justify-between">
          <span>Synergy Corp Company Store</span>
          <span className="text-white/50">Show your alignment.</span>
        </div>
      </div>

      {/* Coming soon memo */}
      <div className="intranet-card">
        <div className="bg-synergy-amber-light border-b border-synergy-rule px-6 py-3 grid grid-cols-2 gap-x-6 gap-y-1">
          <div><span className="dept-label">To</span><p className="font-sans text-sm text-synergy-dark">All Staff</p></div>
          <div><span className="dept-label">From</span><p className="font-sans text-sm text-synergy-dark">HR Department</p></div>
          <div><span className="dept-label">RE</span><p className="font-sans text-sm text-synergy-dark">Company Store Launch</p></div>
          <div><span className="dept-label">Status</span><p className="font-mono text-sm text-synergy-amber">PENDING</p></div>
        </div>

        <div className="p-6 space-y-4">
          <p className="font-sans text-synergy-dark leading-relaxed">
            The company store is currently being right-sized for optimal brand alignment.
          </p>
          <p className="font-sans text-synergy-dark leading-relaxed">
            Inventory is under review. Pricing is under review. The review timeline is under review.
          </p>
          <p className="font-sans text-synergy-dark leading-relaxed">
            Check back when things stabilize. We appreciate your patience and continued synergy.
          </p>
          <p className="font-sans text-synergy-muted text-sm italic font-light">
            — HR Department
          </p>
        </div>

        {/* Notify me form */}
        <div className="border-t border-synergy-rule px-6 py-5 bg-synergy-white">
          <p className="intranet-label mb-3">Notify Me When Available</p>
          <form className="flex gap-2 max-w-sm">
            <input
              type="email"
              placeholder="your@email.com"
              className="intranet-input flex-1"
              aria-label="Email address"
            />
            <button
              type="submit"
              className="btn-intranet flex-shrink-0"
            >
              Submit Request
            </button>
          </form>
          <p className="font-mono text-[9px] text-synergy-muted mt-2 tracking-wider">
            Submission does not guarantee notification. Notifications not guaranteed.
          </p>
        </div>
      </div>
    </div>
  );
}
