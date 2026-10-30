// The /privacy page states what the site actually does. These checks tie its
// facts to the code: the GA4 ID and cookie, the consent banner behavior, the
// contact form fields and processors, and the footer and sitemap links.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GA_MEASUREMENT_ID } from "./consent";

const root = join(__dirname, "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");
const page = read("app/privacy/page.tsx");
const flat = page.replace(/\s+/g, " ");

test("it names the operator and the GA4 facts", () => {
  for (const fact of [
    "operated by COTIB LLC",
    "Google keeps this analytics data for 14 months",
    "Google signals is turned off",
    "it is not linked to Google Ads",
    "does not load, and sets no cookies, until you choose Accept",
    "Cookie choices at the bottom of every page",
  ]) assert.ok(flat.includes(fact), fact);
  assert.match(page, /import \{ GA_MEASUREMENT_ID \} from "@\/lib\/consent";/);
  assert.equal(GA_MEASUREMENT_ID, "G-2FEJYVGXPP");
});

test("its contact form facts match app/api/contact/route.ts", () => {
  const route = read("app/api/contact/route.ts");
  assert.match(route, /const \{ name, email, reason, message, honeypot, turnstileToken \}/);
  assert.match(route, /replyTo: email/);
  assert.match(route, /challenges\.cloudflare\.com\/turnstile/);
  assert.match(route, /new Resend\(/);
  assert.ok(flat.includes("your name, email address, the reason you picked and your message"));
  assert.ok(flat.includes("with your email address as the reply-to"));
});

test("the footer links it next to Cookie choices, the banner links it, and the sitemap lists it", () => {
  assert.match(read("components/Footer.tsx"), /<Link href="\/privacy"[\s\S]*?Privacy[\s\S]*?<\/Link>\s*<CookieChoicesButton \/>/);
  assert.match(read("components/AnalyticsConsent.tsx"), /href="\/privacy"/);
  assert.match(read("app/sitemap.ts"), /url: `\$\{BASE\}\/privacy`/);
});

test("no em or en dashes in the page", () => {
  assert.doesNotMatch(page, /[\u2013\u2014]/);
});
