import type { Metadata } from "next";
import ContactFormIntranet from "@/components/ContactFormIntranet";

export const metadata: Metadata = {
  title: "Contact",
  description: "Submit a help desk ticket. Response time varies. Chuck is in a lot of meetings.",
  alternates: { canonical: "/contact" },
};

const subjectOptions = [
  "General Inquiry",
  "Speaking / Collaboration",
  "Press",
  "Synergy-Related Feedback",
  "Other",
];

export default function ContactPage() {
  return (
    <div className="mx-auto content-max px-4 py-8 max-w-2xl">
      <div className="intranet-card">
        <div className="intranet-header">Help Desk — Submit a Ticket</div>
        <div className="px-6 py-3 bg-synergy-white border-b border-synergy-rule">
          <p className="font-sans text-sm text-synergy-muted">
            This form goes directly to Chuck. Response time varies. He&apos;s in a lot of meetings.
          </p>
        </div>
        <div className="p-6">
          <ContactFormIntranet subjectOptions={subjectOptions} />
        </div>
      </div>
    </div>
  );
}
