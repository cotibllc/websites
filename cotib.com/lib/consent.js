// Analytics consent rules for cotib.com, ported from corphardcore.com
// (corporate-hardcore/src/lib/consent.ts). Pure functions only, used by
// api/consent-region.js and the tests. The browser copy of the decision
// rules lives in www/js/consent-v1.js; a test keeps the two in step.

// Countries where Google Analytics waits for an explicit Accept: the EU 27,
// the rest of the EEA (IS, LI, NO), the UK and Switzerland, plus EU outermost
// regions and nearby territories that Vercel may report under their own ISO
// code. Erring wide only means a few more visitors see the banner.
const CONSENT_COUNTRIES = new Set([
  // EU 27
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE',
  'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  // Rest of the EEA
  'IS', 'LI', 'NO',
  // UK and Switzerland
  'GB', 'CH',
  // Territories with their own ISO code: EU outermost regions, Aland, Crown Dependencies, Gibraltar
  'GF', 'GP', 'MQ', 'RE', 'YT', 'MF', 'AX', 'GG', 'JE', 'IM', 'GI',
]);

// "required": ask before analytics. "not-required": analytics may load by default.
// Vercel's x-vercel-ip-country value; missing or unreadable means we ask.
function consentRegion(country) {
  const code = String(country ?? '').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return 'required';
  return CONSENT_COUNTRIES.has(code) ? 'required' : 'not-required';
}

function parseRegion(raw) {
  return raw === 'not-required' ? 'not-required' : 'required';
}

function parseChoice(raw) {
  return raw === 'granted' || raw === 'denied' ? raw : null;
}

// What the page does with Google Analytics:
// "load-default": no choice made outside the consent region, GA loads.
// "load-consented": the visitor chose Accept, GA loads.
// "ask": show the banner, GA does not load.
// "off": the visitor chose Reject, GA does not load.
function analyticsDecision(region, choice) {
  if (choice === 'granted') return 'load-consented';
  if (choice === 'denied') return 'off';
  return region === 'required' ? 'ask' : 'load-default';
}

function analyticsLoads(decision) {
  return decision === 'load-default' || decision === 'load-consented';
}

// localStorage key for the visitor's stored choice. Bump the version to ask everyone again.
const CONSENT_STORAGE_KEY = 'cotib-analytics-consent-v1';

// GA4 Measurement IDs are public (every page view sends it), so it is a
// committed constant: nothing for anyone to set in Vercel.
const GA_MEASUREMENT_ID = 'G-7C8Q4SNYQQ';

module.exports = {
  CONSENT_COUNTRIES, consentRegion, parseRegion, parseChoice, analyticsDecision, analyticsLoads,
  CONSENT_STORAGE_KEY, GA_MEASUREMENT_ID,
};
