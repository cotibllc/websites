import Navigation from "@/components/Navigation";

export const metadata = {
  title: "Terms of Use | Corporate Hardcore",
  description: "Terms of use for Corporate Hardcore.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-bg-main">
      <Navigation />
      <div className="mx-auto content-max px-4 py-10 max-w-3xl">
        <div className="surface-card p-8">
          <h1 className="text-2xl font-bold mb-1">Terms of Use</h1>
          <p className="text-sm text-text-secondary mb-8">Effective date: March 31, 2025</p>

          <div className="prose prose-sm max-w-none text-text-primary space-y-8">

            <section>
              <h2 className="text-lg font-semibold mb-2">This is satire</h2>
              <p>
                Corporate Hardcore is a work of <strong>observational satire and fiction</strong>.
                All characters, companies, events, and situations depicted on this site —
                including but not limited to Chuck Morrison, Synergy Corp, and any referenced
                colleagues — are fictional and created for comedic and satirical purposes.
              </p>
              <p className="mt-3">
                Any resemblance to real persons, living or dead, or actual companies or events
                is coincidental. Nothing on this site should be construed as factual reporting,
                professional advice, or an accurate account of any real organization.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Acceptance of terms</h2>
              <p>
                By accessing or using corphardcore.com, you agree to be bound by these Terms
                of Use. If you do not agree, please exit the site. (No hard feelings. HR would
                document this interaction either way.)
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Intellectual property</h2>
              <p>
                All content on this site — articles, videos, graphics, copy, and design — is
                owned by Corporate Hardcore unless otherwise noted. You may not reproduce,
                distribute, or create derivative works from this content without written
                permission.
              </p>
              <p className="mt-3">
                Sharing individual articles or videos with attribution and a link to the
                original is encouraged. Repurposing content wholesale without credit is not.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">User conduct</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Use this site for any unlawful purpose.</li>
                <li>Attempt to gain unauthorized access to any part of the site.</li>
                <li>Scrape, crawl, or harvest content in bulk without permission.</li>
                <li>Submit false or misleading information through any form on this site.</li>
                <li>Schedule unnecessary meetings about the terms of this agreement.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Newsletter</h2>
              <p>
                By subscribing to the Corporate Hardcore newsletter, you consent to receive
                periodic email communications. You may unsubscribe at any time using the link
                provided in every email. We will not use your email address for any purpose
                other than sending the newsletter.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">External links</h2>
              <p>
                This site may link to third-party websites (YouTube, TikTok, Instagram, etc.).
                We are not responsible for the content, privacy practices, or terms of those
                sites. Following external links is at your own discretion.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Disclaimer of warranties</h2>
              <p>
                This site is provided &ldquo;as is&rdquo; without warranties of any kind, express or
                implied. We do not guarantee the site will be available, error-free, or free
                of viruses at all times. Corporate Hardcore is a satirical blog, not a
                mission-critical enterprise system. Downtime will not be escalated.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Limitation of liability</h2>
              <p>
                To the fullest extent permitted by law, Corporate Hardcore and its operators
                shall not be liable for any indirect, incidental, special, or consequential
                damages arising from your use of this site. This includes, but is not limited
                to, lost productivity from reading articles during work hours.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Governing law</h2>
              <p>
                These terms are governed by the laws of the United States. Any disputes will
                be resolved in the appropriate courts of jurisdiction. We reserve the right to
                handle all disputes in a 30-minute standup.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Changes to these terms</h2>
              <p>
                We may update these terms at any time. Changes take effect upon posting.
                Continued use of the site constitutes acceptance. We will not send a
                company-wide email about this.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Contact</h2>
              <p>
                Questions about these terms:{" "}
                <a href="mailto:hello@corphardcore.com" className="text-linkedin-blue hover:underline">
                  hello@corphardcore.com
                </a>
              </p>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}
