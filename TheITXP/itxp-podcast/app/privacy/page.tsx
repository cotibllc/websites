import type { Metadata } from "next";
import Link from "next/link";
import { GA_MEASUREMENT_ID } from "@/lib/consent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How theitxp.com handles your information: consent-gated Google Analytics, the contact form, and who processes data for COTIB LLC.",
  alternates: { canonical: "/privacy" },
};

const GA_COOKIE = `_ga_${GA_MEASUREMENT_ID.replace(/^G-/, "")}`;

function Out({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-condensed font-bold text-4xl uppercase tracking-tight mb-2">Privacy Policy</h1>
      <p className="font-mono text-sm text-steel mb-8">Effective October 30, 2026</p>
      <div className="prose prose-gray max-w-none">
        <h2 id="who-we-are">Who we are</h2>
        <p>
          The IT XP is a podcast and website at theitxp.com, operated by COTIB LLC, which is responsible for the
          personal data described in this policy. Questions about this policy can be sent to{" "}
          <a href="mailto:customerservice@cotib.com">customerservice@cotib.com</a>.
        </p>

        <h2 id="what-we-collect">What we collect</h2>
        <ul>
          <li>
            <strong>Contact form:</strong> your name, email address, the reason you picked and your message, when you
            send the form at <Link href="/contact">theitxp.com/contact</Link>.
          </li>
          <li>
            <strong>Usage data:</strong> our hosting and network providers keep server logs of your IP address, browser
            type, referring URL and the pages you request. We do not link these logs to your name or email address.
          </li>
          <li>
            <strong>Analytics data:</strong> if Google Analytics runs (see Cookies below), it records the pages you
            view, how you reached the site, your device and browser type, your approximate location (worked out from
            your IP address), and a random ID kept in a cookie so repeat visits can be counted.
          </li>
        </ul>
        <p>We do not collect payment information, government IDs or sensitive personal data. The site has no accounts and no email list.</p>

        <h2 id="how-we-use-it">How we use it</h2>
        <ul>
          <li>To answer contact form messages.</li>
          <li>To keep automated spam out of the contact form.</li>
          <li>To count visits and see which pages and episodes people read.</li>
        </ul>
        <p>We do not sell your personal data, and we do not use it for advertising.</p>

        <h2 id="services">Services that process it for us</h2>
        <ul>
          <li>
            <strong>Google Analytics:</strong> measures visits, as described under Cookies. See{" "}
            <Out href="https://policies.google.com/technologies/partner-sites">how Google uses information from sites that use its services</Out>.
          </li>
          <li>
            <strong>Resend:</strong> sends contact form messages to our inbox, with your email address as the reply-to.
            Your name, email address, reason and message pass through Resend, which keeps a copy for a limited time under
            its own retention policy. See <Out href="https://resend.com/legal/privacy-policy">Resend&apos;s privacy policy</Out>.
          </li>
          <li>
            <strong>Cloudflare:</strong> our network provider, so it handles every request to the site, including your
            IP address. Its Turnstile check runs on the contact form: it reads signals from your browser to tell people
            from bots and tells us whether the check passed. See{" "}
            <Out href="https://www.cloudflare.com/privacypolicy/">Cloudflare&apos;s privacy policy</Out>.
          </li>
          <li>
            <strong>Vercel:</strong> hosts the site and runs the contact form service. See{" "}
            <Out href="https://vercel.com/legal/privacy-policy">Vercel&apos;s privacy policy</Out>.
          </li>
          <li>
            <strong>Libsyn:</strong> hosts the podcast audio. The episode player streams from Libsyn, so Libsyn receives
            your IP address when the player loads or plays an episode. See{" "}
            <Out href="https://libsyn.com/tos-policies/privacy-policy/">Libsyn&apos;s privacy policy</Out>.
          </li>
        </ul>
        <p>Links to YouTube, Apple Podcasts and other sites take you to those services, which have their own policies.</p>

        <h2 id="cookies">Cookies and Cookie choices</h2>
        <p>
          This site uses Google Analytics 4, which sets two cookies on theitxp.com: _ga and {GA_COOKIE}. They hold a
          random ID, not your name or email address, and last up to two years unless you clear them.
        </p>
        <p>
          Google keeps this analytics data for 14 months, then deletes it. Google signals is turned off, so visits are
          not linked to Google accounts. We do not use Google Analytics for advertising, and it is not linked to Google Ads.
        </p>
        <p>
          If you visit from the European Union, the European Economic Area, the United Kingdom or Switzerland, or we
          can&apos;t tell where you are, a cookie banner asks for your choice first. Google Analytics does not load, and
          sets no cookies, until you choose Accept. If you choose Reject, it stays off. Elsewhere, Google Analytics loads
          when the page opens. We store your choice in your browser so we don&apos;t ask on every page, and you can
          change it at any time with Cookie choices at the bottom of every page. Choosing Reject also removes the Google
          Analytics cookies.
        </p>
        <p>
          To opt out, you can also install <Out href="https://tools.google.com/dlpage/gaoptout">Google&apos;s Analytics opt-out add-on</Out>,
          or block or clear cookies for theitxp.com in your browser settings. The site works the same without them.
        </p>

        <h2 id="retention">How long we keep it</h2>
        <ul>
          <li>Google Analytics data: 14 months.</li>
          <li>Contact form messages: only as long as we need them to respond. You can ask us to delete them at any time.</li>
        </ul>

        <h2 id="rights">Your rights</h2>
        <p>
          You can ask to see, correct or delete the personal data we hold about you by emailing{" "}
          <a href="mailto:customerservice@cotib.com">customerservice@cotib.com</a>. We will respond within 30 days.
        </p>
        <p>
          If you are in the European Union, the European Economic Area, the United Kingdom or Switzerland, you also have
          the right to restrict or object to processing and to ask for your data in a portable format. Our legal basis
          for Google Analytics is your consent, given or refused in the cookie banner and withdrawn at any time with
          Cookie choices. We use contact form messages to answer the request you sent us. You may also complain to your
          local data protection authority.
        </p>
        <p>
          If you are a California resident, you can ask what personal information we collect and ask us to delete it. We
          do not sell or share personal information for advertising, and we won&apos;t treat you differently for using
          these rights.
        </p>

        <h2 id="changes">Changes</h2>
        <p>We post any update to this policy on this page with a new effective date.</p>
        <p>COTIB LLC, 155 Willowbrook Blvd, Ste 110 #2800, Wayne NJ 07470, United States.</p>
      </div>
    </div>
  );
}
