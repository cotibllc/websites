export const metadata = {
  title: "Privacy Policy",
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
          <p className="text-sm text-text-secondary mb-8">Effective date: March 31, 2025. Last updated: October 30, 2026.</p>

          <div className="prose prose-sm max-w-none text-text-primary space-y-8">

            <section>
              <h2 className="text-lg font-semibold mb-2">Who we are</h2>
              <p>
                Corporate Hardcore is a satirical media project operated by COTIB LLC, which
                is responsible for the personal data described in this policy.
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
                  <strong>Email address:</strong> if you join the Field Notes distribution list, ask
                  to be notified when the Company Store opens, or submit the contact form.
                </li>
                <li>
                  <strong>Name, subject and message:</strong> if you submit the contact form.
                </li>
                <li>
                  <strong>Usage data:</strong> our hosting and network providers keep server logs
                  of your IP address, browser type, referring URL, and the pages you request. We
                  do not link these logs to your name or email address.
                </li>
                <li>
                  <strong>Analytics data:</strong> Google Analytics records the pages you view, how
                  you reached the site, your device and browser type, your approximate location
                  (worked out from your IP address), and a random ID kept in a cookie so repeat
                  visits can be counted. See Cookies below.
                </li>
              </ul>
              <p className="mt-3">We do not collect payment information, government IDs, or sensitive personal data.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">How we use your data</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>To send you Field Notes when filed (if on the distribution list).</li>
                <li>To tell you when the Company Store opens (if on the store notify list).</li>
                <li>To respond to contact form submissions.</li>
                <li>To keep automated spam out of our forms.</li>
                <li>To count visits and see which pages people read.</li>
                <li>To maintain and improve the site.</li>
              </ul>
              <p className="mt-3">We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Third-party services</h2>
              <p>We use the following third-party services that may process your data:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>
                  <strong>Kit (formerly ConvertKit):</strong> runs both of our email lists, the Field
                  Notes distribution list and the Company Store notify list. Kit stores your email
                  address, which list you joined, when you joined, and any tags we add. Every Kit
                  email has an unsubscribe link at the bottom that removes you from that list. See{" "}
                  <a href="https://kit.com/privacy" target="_blank" rel="noopener noreferrer" className="text-linkedin-blue hover:underline">
                    Kit&apos;s privacy policy
                  </a>.
                </li>
                <li>
                  <strong>Resend:</strong> sends contact form submissions to our inbox. Your name,
                  email address, subject and message pass through Resend, which keeps a copy for a
                  limited time under its own retention policy. See{" "}
                  <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-linkedin-blue hover:underline">
                    Resend&apos;s privacy policy
                  </a>.
                </li>
                <li>
                  <strong>Cloudflare:</strong> our network provider, so it handles every request to
                  the site, including your IP address. Its Turnstile check runs on any form that shows
                  a &ldquo;Verify you are human&rdquo; box: it reads signals from your browser to
                  tell people from bots and tells us whether the check passed. See{" "}
                  <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-linkedin-blue hover:underline">
                    Cloudflare&apos;s privacy policy
                  </a>.
                </li>
                <li>
                  <strong>Google Analytics:</strong> measures visits to the site, as described under
                  Cookies. See{" "}
                  <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-linkedin-blue hover:underline">
                    how Google uses information from sites that use its services
                  </a>.
                </li>
                <li>
                  <strong>Vercel:</strong> website hosting and infrastructure. See{" "}
                  <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-linkedin-blue hover:underline">
                    Vercel&apos;s privacy policy
                  </a>.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Cookies</h2>
              <p>
                This site uses Google Analytics, which sets two cookies on corphardcore.com:{" "}
                _ga and _ga_RYY0GT1TLS. They hold a random ID, not your
                name or email address, and last up to two years unless you clear them. We use them
                to count visits and see which pages people read.
              </p>
              <p className="mt-2">
                If you visit from the European Union, the European Economic Area, the United
                Kingdom or Switzerland, a cookie banner asks for your choice first. Google
                Analytics does not load, and sets no cookies, until you choose Accept. If you
                choose Reject, it stays off. We store your choice in your browser so we don&apos;t
                ask on every page, and you can change it at any time with Cookie choices at the
                bottom of every page.
              </p>
              <p className="mt-2">
                To opt out, install{" "}
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-linkedin-blue hover:underline">
                  Google&apos;s Analytics opt-out add-on
                </a>
                , or block or clear cookies for corphardcore.com in your browser settings. The site
                works the same without them.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Data retention</h2>
              <p>
                Email list data (Field Notes and the Company Store notify list) is kept until you
                unsubscribe or ask us to remove it. Google Analytics data is kept for the period set
                in our Google Analytics settings, then deleted by Google. Contact form
                submissions are retained only as long as necessary to respond. You may request
                deletion at any time.
              </p>
            </section>

            {/* GDPR */}
            <section>
              <h2 className="text-lg font-semibold mb-2">Your rights (EU and UK GDPR)</h2>
              <p>
                If you are located in the European Union or United Kingdom, you have the
                following rights under the General Data Protection Regulation (GDPR):
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Right of access:</strong> request a copy of the data we hold about you.</li>
                <li><strong>Right to rectification:</strong> request correction of inaccurate data.</li>
                <li><strong>Right to erasure:</strong> request deletion of your personal data.</li>
                <li><strong>Right to restrict processing:</strong> request that we limit how we use your data.</li>
                <li><strong>Right to data portability:</strong> request your data in a portable format.</li>
                <li><strong>Right to object:</strong> object to processing based on legitimate interests.</li>
              </ul>
              <p className="mt-3">
                Our legal basis for processing email list data is <strong>consent</strong> (Article 6(1)(a) GDPR).
                You may withdraw consent at any time with the unsubscribe link in any list email, or
                by contacting us. For visitors in the EU, EEA, UK and Switzerland, our legal basis
                for Google Analytics is also <strong>consent</strong>, given or refused in the cookie
                banner and withdrawn at any time with Cookie choices.
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
              <h2 className="text-lg font-semibold mb-2">Your rights (California CCPA)</h2>
              <p>
                If you are a California resident, the California Consumer Privacy Act (CCPA)
                grants you the following rights:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Right to know:</strong> request disclosure of the personal information we collect and how it is used.</li>
                <li><strong>Right to delete:</strong> request deletion of your personal information.</li>
                <li><strong>Right to opt-out:</strong> we do not sell personal information, so no opt-out is required.</li>
                <li><strong>Right to non-discrimination:</strong> we will not discriminate against you for exercising these rights.</li>
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
