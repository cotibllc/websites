import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

const SUBSTACK_URL = "https://techleadshift.substack.com";

export const metadata: Metadata = {
  title: "Work with Charles - Tech Lead Shift",
  description:
    "Consulting and speaking on hybrid human/agent teams, culture, and accountability.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <section id="work" className="work-page">
      <div className="container">
        <div className="section-label">Work</div>
        <h1 className="section-headline">Work with Charles</h1>
        <p className="work-lede">
          Quiet consulting and speaking for leaders building hybrid teams of humans and
          AI agents - culture, accountability, and systems, not demos.
        </p>
        <p className="work-lede">
          Prefer the series first?{" "}
          <a
            href={SUBSTACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            Read on Substack
          </a>
          {" | "}
          <a href="/#series" className="text-link">
            The Series
          </a>
        </p>
        <div className="work-form-wrap">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

