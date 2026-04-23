export const metadata = {
  title: "Privacy Policy | Corporate Hardcore",
  description: "Privacy policy for Corporate Hardcore.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg-main">
      <div className="mx-auto content-max px-4 py-10 max-w-3xl">
        <div className="surface-card p-8">
          <h1 className="text-2xl font-bold mb-1">Privacy Policy</h1>
          <p className="text-sm text-text-secondary mb-8">Effective date: March 31, 2025</p>

          <div className="prose prose-sm max-w-none text-text-primary space-y-8">

            <section>
              <h2 className="text-lg font-semibold mb-2">Who we are</h2>
              <p>
                Corporate Hardcore is a satirical media project operated by Chuck Morrison.
                This site is located at <strong>corphardcore.com</strong>. Questions about
                this policy can be directed to{" "}
                <a href="mailto:hello@corphardcore.com" className="text-linkedin-blue hover:underline">
                  hello@corphardcore.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">What data we collect</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Email address</strong> — if you subscribe to the newsletter or
                  submit a contact form.
                </li>
                <li>
                  <strong>Name and message content</strong> — if you submit the contact form.
                </li>
                <li>
                  <strong>Usage data</strong> — standard server logs may include your IP
                  address, browser type, referring URL, and pages visited. This data is not
                  linked to your identity.
                </li>
              </ul>
              <p className="mt-3">We do not collect payment information, government IDs, or sensitive personal data.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">How we use your data</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>To send you the Corporate Hardcore newsletter (if subscribed).</li>
                <li>To respond to contact form submissions.</li>
                <li>To maintain and improve the site.</li>
              </ul>
              <p className="mt-3">We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Third-party services</h2>
              <p>We use the following third-party services that may process your data:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>
                  <strong>Kit (formerly ConvertKit)</strong> — email newsletter delivery.
                  Subscriber data is stored on Kit&apos;s servers. See{" "}
                  <a href="https://kit.com/privacy" target="_blank" rel="noopener noreferrer" className="text-linkedin-blue hover:underline">
                    Kit&apos;s privacy policy
                  </a>.
                </li>
                <li>
                  <strong>Vercel</strong> — website hosting and infrastructure. See{" "}
                  <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-linkedin-blue hover:underline">
                    Vercel&apos;s privacy policy
                  </a>.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Cookies</h2>
              <p>
                This site does not use tracking cookies or advertising cookies. We may use
                essential session cookies required for basic site functionality. No cookie
                consent banner is currently required as we do not use non-essential cookies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Data retention</h2>
              <p>
                Newsletter subscriber data is retained until you unsubscribe. Contact form
                submissions are retained only as long as necessary to respond. You may request
                deletion at any time.
              </p>
            </section>

            {/* GDPR */}
            <section>
              <h2 className="text-lg font-semibold mb-2">Your rights (EU/UK — GDPR)</h2>
              <p>
                If you are located in the European Union or United Kingdom, you have the
                following rights under the General Data Protection Regulation (GDPR):
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Right of access</strong> — request a copy of the data we hold about you.</li>
                <li><strong>Right to rectification</strong> — request correction of inaccurate data.</li>
                <li><strong>Right to erasure</strong> — request deletion of your personal data.</li>
                <li><strong>Right to restrict processing</strong> — request that we limit how we use your data.</li>
                <li><strong>Right to data portability</strong> — request your data in a portable format.</li>
                <li><strong>Right to object</strong> — object to processing based on legitimate interests.</li>
              </ul>
              <p className="mt-3">
                Our legal basis for processing newsletter subscriber data is <strong>consent</strong> (Article 6(1)(a) GDPR).
                You may withdraw consent at any time by unsubscribing.
              </p>
              <p className="mt-2">
                To exercise any of these rights, contact us at{" "}
                <a href="mailto:hello@corphardcore.com" className="text-linkedin-blue hover:underline">
                  hello@corphardcore.com
                </a>. We will respond within 30 days.
              </p>
            </section>

            {/* CCPA */}
            <section>
              <h2 className="text-lg font-semibold mb-2">Your rights (California — CCPA)</h2>
              <p>
                If you are a California resident, the California Consumer Privacy Act (CCPA)
                grants you the following rights:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Right to know</strong> — request disclosure of the personal information we collect and how it is used.</li>
                <li><strong>Right to delete</strong> — request deletion of your personal information.</li>
                <li><strong>Right to opt-out</strong> — we do not sell personal information, so no opt-out is required.</li>
                <li><strong>Right to non-discrimination</strong> — we will not discriminate against you for exercising these rights.</li>
              </ul>
              <p className="mt-3">
                To submit a CCPA request, contact us at{" "}
                <a href="mailto:hello@corphardcore.com" className="text-linkedin-blue hover:underline">
                  hello@corphardcore.com
                </a>.
              </p>
            </section>

            {/* Canada */}
            <section>
              <h2 className="text-lg font-semibold mb-2">Canadian residents (PIPEDA)</h2>
              <p>
                If you are located in Canada, your personal information is handled in accordance
                with the Personal Information Protection and Electronic Documents Act (PIPEDA).
                You have the right to access and correct your personal information. Contact us
                at{" "}
                <a href="mailto:hello@corphardcore.com" className="text-linkedin-blue hover:underline">
                  hello@corphardcore.com
                </a>{" "}
                to make a request.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Children&apos;s privacy</h2>
              <p>
                This site is not directed at children under 13. We do not knowingly collect
                personal data from children. If you believe a child has submitted personal
                information, contact us and we will delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Changes to this policy</h2>
              <p>
                We may update this policy periodically. Changes will be posted on this page
                with a revised effective date. Continued use of the site constitutes acceptance
                of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Contact</h2>
              <p>
                Questions, requests, or concerns:{" "}
                <a href="mailto:hello@corphardcore.com" className="text-linkedin-blue hover:underline">
                  hello@corphardcore.com
                </a>
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
