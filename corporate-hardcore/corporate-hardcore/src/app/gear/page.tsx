import type { Metadata } from "next";
import { GEAR_DISCLOSURE, gearIsPublishable, gearItems, type GearItem } from "@/lib/gear";

const publishable = gearIsPublishable();

export const metadata: Metadata = {
  title: "Approved Equipment",
  description: "Synergy Corp approved equipment list. Requisitions are processed in the order they are ignored.",
  alternates: { canonical: "/gear" },
  // Placeholder slots stay out of search until real products are filed.
  robots: publishable ? undefined : { index: false, follow: false },
};

function RequisitionLink({ item }: { item: GearItem }) {
  if (item.link.kind === "placeholder") {
    return (
      <span
        aria-disabled="true"
        className="inline-block font-mono text-[11px] tracking-[0.08em] uppercase border border-synergy-rule text-synergy-muted px-3 py-2 cursor-not-allowed"
      >
        Link pending
      </span>
    );
  }
  return (
    <a
      href={item.link.url}
      target="_blank"
      rel="sponsored nofollow noopener noreferrer"
      className="inline-block font-mono text-[11px] tracking-[0.08em] uppercase bg-synergy-dark text-white px-3 py-2 hover:bg-synergy-amber active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-synergy-amber transition-colors"
    >
      View at {item.link.merchant}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export default function GearPage() {
  return (
    <div className="mx-auto content-max px-4 py-8 max-w-3xl">
      <div className="intranet-card mb-6">
        <div className="intranet-header flex items-center justify-between">
          <span>Synergy Corp Approved Equipment</span>
          <span className="text-white/50">Form IT 7</span>
        </div>
        <div className="px-4 py-3 bg-synergy-white border-t border-synergy-rule">
          <p className="font-sans text-sm text-synergy-dark">{GEAR_DISCLOSURE}</p>
        </div>
      </div>

      <div className="intranet-card">
        <div className="bg-synergy-amber-light border-b border-synergy-rule px-6 py-3 grid grid-cols-2 gap-x-6 gap-y-1">
          <div><span className="dept-label">Requested by</span><p className="font-sans text-sm text-synergy-dark">Morrison, C.</p></div>
          <div><span className="dept-label">Approved by</span><p className="font-sans text-sm text-synergy-dark">Morrison, C.</p></div>
          <div><span className="dept-label">Budget code</span><p className="font-mono text-sm text-synergy-dark">PERSONAL CARD</p></div>
          <div><span className="dept-label">Status</span><p className="font-mono text-sm text-synergy-amber">{publishable ? "FILED" : "DRAFT"}</p></div>
        </div>

        <ol className="divide-y divide-synergy-rule">
          {gearItems.map((item) => (
            <li key={item.code} className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[5rem_1fr_auto] gap-x-6 gap-y-2 sm:items-center">
              <span className="font-mono text-xs text-synergy-muted tracking-wider">{item.code}</span>
              <div>
                <p className="font-sans font-semibold text-synergy-dark">{item.name}</p>
                <p className="font-sans text-sm text-synergy-muted mt-1">{item.justification}</p>
              </div>
              <RequisitionLink item={item} />
            </li>
          ))}
        </ol>
      </div>

      <p className="font-mono text-[10px] text-synergy-muted text-center mt-8 tracking-wider">
        Equipment not issued. Equipment not reimbursed. Equipment purchased anyway.
      </p>
    </div>
  );
}
