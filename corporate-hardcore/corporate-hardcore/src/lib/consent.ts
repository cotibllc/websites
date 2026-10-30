// Analytics consent rules for corphardcore.com.
// Pure functions only, so they run in node:test, the API route and the browser.

/**
 * Countries where Google Analytics waits for an explicit Accept:
 * the EU 27, the rest of the EEA (IS, LI, NO), the UK and Switzerland,
 * plus EU outermost regions and nearby territories that Vercel may report
 * under their own ISO code. Erring wide only means a few more visitors see the banner.
 */
export const CONSENT_COUNTRIES: ReadonlySet<string> = new Set([
  // EU 27
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE",
  "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  // Rest of the EEA
  "IS", "LI", "NO",
  // UK and Switzerland
  "GB", "CH",
  // Territories with their own ISO code: EU outermost regions, Aland, Crown Dependencies, Gibraltar
  "GF", "GP", "MQ", "RE", "YT", "MF", "AX", "GG", "JE", "IM", "GI",
]);

/** "required": ask before analytics. "not-required": analytics may load by default. */
export type ConsentRegion = "required" | "not-required";

/** Vercel's x-vercel-ip-country value. Missing or unreadable means we ask. */
export function consentRegion(country: string | null | undefined): ConsentRegion {
  const code = (country ?? "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "required";
  return CONSENT_COUNTRIES.has(code) ? "required" : "not-required";
}

export function parseRegion(raw: unknown): ConsentRegion {
  return raw === "not-required" ? "not-required" : "required";
}

export type ConsentChoice = "granted" | "denied";

/** localStorage key for the visitor's stored choice. Bump the version to ask everyone again. */
export const CONSENT_STORAGE_KEY = "ch-analytics-consent-v1";

export function parseChoice(raw: string | null | undefined): ConsentChoice | null {
  return raw === "granted" || raw === "denied" ? raw : null;
}

/**
 * What the page does with Google Analytics.
 * - "load-default": no choice made outside the consent region; GA loads as it always has.
 * - "load-consented": the visitor chose Accept; GA loads for analytics only, ad storage denied.
 * - "ask": show the banner; GA does not load.
 * - "off": the visitor chose Reject; GA does not load.
 */
export type AnalyticsDecision = "load-default" | "load-consented" | "ask" | "off";

export function analyticsDecision(region: ConsentRegion, choice: ConsentChoice | null): AnalyticsDecision {
  if (choice === "granted") return "load-consented";
  if (choice === "denied") return "off";
  return region === "required" ? "ask" : "load-default";
}

export function analyticsLoads(decision: AnalyticsDecision): boolean {
  return decision === "load-default" || decision === "load-consented";
}

/** Window event the footer's Cookie choices button fires to reopen the banner. */
export const COOKIE_CHOICES_EVENT = "ch:cookie-choices";

export const GA_MEASUREMENT_ID = "G-RYY0GT1TLS";
