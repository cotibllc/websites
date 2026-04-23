import Link from "next/link";
import { MapPin, Building2, Calendar, Users, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Synergy Corp | Corporate Hardcore",
  description:
    "Optimizing Tomorrow's Solutions Today™. An integrated enterprise solutions provider since 1987.",
  alternates: {
    canonical: "/company",
  },
};

const values = [
  {
    name: "Integrity",
    description:
      "We say what we mean. Our communications are reviewed by Legal before distribution.",
  },
  {
    name: "Innovation",
    description:
      "We encourage new ideas. Submit them through the proper channels using Form 7-B.",
  },
  {
    name: "Collaboration",
    description:
      "No one succeeds alone. That's why we have open floor plans and no private offices below VP level.",
  },
  {
    name: "Excellence",
    description:
      "We hold ourselves to the highest standards, as defined in your annual performance objectives.",
  },
];

const timeline = [
  { year: "1987", event: "Founded as Consolidated Data Services in a strip mall." },
  { year: "2003", event: "Rebranded to Synergy Corp. New logo costs $2.1M." },
  { year: "2011", event: "Rebranded again. Logo now has a gradient." },
  {
    year: "2019",
    event:
      '"Digital Transformation" initiative launched. Logo unchanged but website takes 11 seconds to load.',
  },
  { year: "2024", event: "AI integration announced. No timeline provided." },
];

const leadership: {
  name: string;
  title: string;
  initials: string;
  quote: string;
  href: string | null;
}[] = [
  {
    name: "Joe Harrison",
    title: "Chief Executive Officer",
    initials: "JH",
    quote: "We're not just a company. We're a journey.",
    href: null,
  },
  {
    name: "Jill Brennan",
    title: "Chief Human Resources Officer",
    initials: "JB",
    quote: "People are our greatest asset. That's why we track them so carefully.",
    href: null,
  },
  {
    name: "Chuck Morrison",
    title: "Director of Information Technology",
    initials: "CM",
    quote: "The system is down. I'm aware.",
    href: "/about",
  },
  {
    name: "Dana Chen",
    title: "Associate Analyst, Strategic Initiatives",
    initials: "DC",
    quote: "Happy to circle back on that.",
    href: null,
  },
  {
    name: "Carl Dietrich",
    title: "Senior Compliance Administrator",
    initials: "CD",
    quote: "I can't speak to that without reviewing the applicable policy.",
    href: null,
  },
];

function LeadershipCard({ person }: { person: (typeof leadership)[number] }) {
  const card = (
    <div className="flex items-start gap-3 rounded-lg border border-border-light p-4 bg-bg-main hover:border-linkedin-blue/40 transition h-full">
      <div className="w-12 h-12 rounded-full bg-linkedin-blue/10 flex items-center justify-center flex-shrink-0">
        <span className="text-linkedin-blue font-bold text-sm">{person.initials}</span>
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm text-text-primary">{person.name}</p>
        <p className="text-xs text-text-secondary leading-snug">{person.title}</p>
        <p className="text-xs text-text-secondary italic mt-1.5 leading-relaxed">
          &ldquo;{person.quote}&rdquo;
        </p>
      </div>
    </div>
  );

  return person.href ? (
    <Link href={person.href} className="block">
      {card}
    </Link>
  ) : (
    card
  );
}

export default function CompanyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Synergy Corp",
            description: "Optimizing Tomorrow's Solutions Today™. An integrated enterprise solutions provider since 1987.",
            url: "https://www.corphardcore.com/company",
            foundingDate: "1987",
          }),
        }}
      />
      <div className="min-h-screen bg-bg-main">
        {/* Banner */}
        <div className="bg-linkedin-blue h-32 md:h-44 w-full" />

        <div className="mx-auto content-max px-4 -mt-10 pb-12">

        {/* Company header card */}
        <div className="surface-card px-6 md:px-8 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {/* Logo */}
            <div className="w-24 h-24 rounded-lg border-4 border-card-bg bg-white shadow-sm flex items-center justify-center flex-shrink-0 -mt-8 md:-mt-10">
              <Building2 className="w-10 h-10 text-linkedin-blue" />
            </div>

            <div className="flex-1 pb-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-text-primary">Synergy Corp</h1>
                  <p className="text-text-secondary text-sm">
                    Optimizing Tomorrow&apos;s Solutions Today™
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      Enterprise Solutions Provider
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      Mid-rise office park visible from the highway
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      Right-sized regularly
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Est. 1987
                    </span>
                  </div>
                </div>
                <button className="self-start px-4 py-1.5 rounded-full border border-linkedin-blue text-linkedin-blue text-sm font-semibold hover:bg-linkedin-blue/10 transition">
                  + Follow
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main layout */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Main column */}
          <div className="lg:col-span-2 space-y-4">

            {/* About */}
            <section className="surface-card px-6 py-5">
              <h2 className="text-lg font-semibold mb-3">About</h2>
              <div className="space-y-4 text-sm text-text-primary leading-relaxed">
                <p>
                  Synergy Corp is a leading provider of integrated business solutions across
                  verticals. For over three decades, we have partnered with organizations to drive
                  transformational outcomes through strategic alignment and operational excellence.
                </p>
                <p>
                  Our core competencies include process optimization, stakeholder engagement, and
                  delivering value to shareholders. We believe people are our greatest asset, which
                  is why we continuously invest in initiatives designed to maximize their
                  productivity potential.
                </p>
                <p className="italic font-medium border-l-2 border-linkedin-blue pl-4">
                  At Synergy Corp, we don&apos;t just meet expectations. We realign them.
                </p>
              </div>
            </section>

            {/* Values */}
            <section className="surface-card px-6 py-5">
              <h2 className="text-lg font-semibold mb-4">Our Values</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {values.map((v) => (
                  <div
                    key={v.name}
                    className="rounded-lg border border-border-light p-4 bg-bg-main"
                  >
                    <h3 className="font-semibold text-sm text-text-primary mb-1">{v.name}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{v.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Timeline */}
            <section className="surface-card px-6 py-5">
              <h2 className="text-lg font-semibold mb-6">Company History</h2>
              <ol className="relative space-y-6 ml-4 border-l border-border-light pl-6">
                {timeline.map((item) => (
                  <li key={item.year} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-[1.6rem] top-1 w-3 h-3 rounded-full bg-linkedin-blue border-2 border-card-bg" />
                    <span className="text-xs font-bold text-linkedin-blue uppercase tracking-wide">
                      {item.year}
                    </span>
                    <p className="text-sm text-text-primary mt-0.5 leading-relaxed">{item.event}</p>
                  </li>
                ))}
              </ol>
            </section>

            {/* Leadership */}
            <section className="surface-card px-6 py-5">
              <h2 className="text-lg font-semibold mb-4">Leadership</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {leadership.map((person) => (
                  <LeadershipCard key={person.name} person={person} />
                ))}
              </div>
            </section>

            {/* Careers */}
            <section className="surface-card px-6 py-5">
              <h2 className="text-lg font-semibold mb-3">Careers</h2>
              <p className="text-sm text-text-primary leading-relaxed mb-2">
                Synergy Corp is always looking for talented individuals who thrive in dynamic
                environments. We offer competitive compensation, comprehensive benefits, and
                opportunities for growth consistent with business needs.
              </p>
              <p className="text-xs text-text-secondary mb-4">
                Current openings are posted internally 48 hours before external listing, as required
                by policy.
              </p>
              <div className="rounded-lg border border-border-light bg-bg-main p-5 text-center">
                <p className="text-sm font-semibold text-text-primary mb-1">Careers Portal</p>
                <p className="text-xs text-text-secondary mb-4">portal.synergycorp.com</p>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-linkedin-blue text-white text-sm font-semibold opacity-60 cursor-not-allowed select-none">
                  View Open Positions <ExternalLink className="w-3.5 h-3.5" />
                </span>
                <p className="text-xs text-text-secondary mt-3 italic">
                  Portal availability may vary. Currently experiencing intermittent issues.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="surface-card px-6 py-5">
              <h2 className="text-lg font-semibold mb-4">Contact</h2>
              <dl className="space-y-4 divide-y divide-border-light">
                <div className="pb-4">
                  <dt className="text-sm font-semibold text-text-primary">General Inquiries</dt>
                  <dd className="text-sm text-text-secondary mt-0.5">
                    Please submit a ticket through the portal.
                  </dd>
                </div>
                <div className="pt-4 pb-4">
                  <dt className="text-sm font-semibold text-text-primary">Media &amp; Press</dt>
                  <dd className="text-sm text-text-secondary mt-0.5">
                    All requests routed through Corporate Communications. Response time varies.
                  </dd>
                </div>
                <div className="pt-4">
                  <dt className="text-sm font-semibold text-text-primary">Physical Address</dt>
                  <dd className="text-sm text-text-secondary mt-0.5">
                    Available upon request following verification.
                  </dd>
                </div>
              </dl>
            </section>

          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <section className="surface-card p-4">
              <h3 className="font-semibold mb-3 text-sm">Company Overview</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-text-secondary">Industry</p>
                    <p className="text-sm text-text-primary">Enterprise Solutions Provider</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-text-secondary">Founded</p>
                    <p className="text-sm text-text-primary">1987</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-text-secondary">Headquarters</p>
                    <p className="text-sm text-text-primary">
                      A mid-rise office park visible from the highway but difficult to actually reach
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-text-secondary">Company size</p>
                    <p className="text-sm text-text-primary">Right-sized regularly</p>
                  </div>
                </li>
              </ul>
            </section>

            <section className="surface-card p-4">
              <h3 className="font-semibold mb-3 text-sm">Affiliated Profiles</h3>
              <Link
                href="/about"
                className="flex items-center gap-3 py-1.5 hover:opacity-80 transition"
              >
                <div className="w-9 h-9 rounded-full bg-linkedin-blue/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-linkedin-blue font-bold text-xs">CM</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">Chuck Morrison</p>
                  <p className="text-xs text-text-secondary">Director of IT</p>
                </div>
              </Link>
            </section>
          </aside>

        </div>
      </div>

      {/* Company-specific footer strip */}
        <div className="border-t border-border-light bg-card-bg">
          <div className="mx-auto content-max px-4 py-4 space-y-1 text-xs text-text-secondary">
            <p>
              © 2024 Synergy Corp. All rights reserved. Results may vary. Past performance not
              indicative of future outcomes.
            </p>
            <p>
              Synergy Corp is an equal opportunity employer. We celebrate diversity and are committed
              to creating an inclusive environment for all employees, as outlined in Section 4.7 of
              the Employee Handbook.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
