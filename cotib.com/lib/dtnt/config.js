// Do the Next Thing free sampler: shared settings.
// Secrets and IDs come from Vercel env vars, which Chuck sets. Nothing here
// is secret. Every handler calls requireEnv() first and fails closed.
const crypto = require('crypto');

const FROM_EMAIL = 'COTIB LLC <no-reply@cotib.com>';
const REPLY_TO = 'customerservice@cotib.com';
const SUPPORT_EMAIL = 'customerservice@cotib.com';
const POSTAL_ADDRESS = 'COTIB LLC, 155 Willowbrook Blvd, Ste 110 #2800, Wayne NJ 07470, United States';

// Consent wording shown next to the required checkbox. Bump CONSENT_VERSION
// whenever CONSENT_TEXT changes (setup addendum F8).
const CONSENT_VERSION = 'dtnt-free-2026-10-07';
const CONSENT_TEXT = 'Email me the free sampler and up to 3 short emails over the next week about the paid Do the Next Thing Pack ($24) and Setup Kit ($37). I can unsubscribe any time.';
const CONSENT_TEXT_HASH = crypto.createHash('sha256').update(CONSENT_TEXT).digest('hex');

const CONFIRM_TTL_SECONDS = 48 * 60 * 60;      // confirm link: 48 hours
const DOWNLOAD_TTL_SECONDS = 30 * 24 * 60 * 60; // download link: 30 days

// Hosts that may submit the form and that Turnstile may report.
const PRODUCTION_HOSTS = ['www.cotib.com', 'cotib.com'];

// Env vars, by name only. RESEND_API_KEY and TURNSTILE_SECRET_KEY already
// exist for /api/contact. The other three are new for this flow.
const REQUIRED_ENV = {
  signup: ['RESEND_API_KEY', 'RESEND_FULL_API_KEY', 'DTNT_FREE_SEGMENT_ID', 'DTNT_TOKEN_SECRET', 'TURNSTILE_SECRET_KEY'],
  confirm: ['RESEND_API_KEY', 'RESEND_FULL_API_KEY', 'DTNT_FREE_SEGMENT_ID', 'DTNT_TOKEN_SECRET'],
  download: ['DTNT_TOKEN_SECRET'],
  unsubscribe: ['RESEND_FULL_API_KEY', 'DTNT_TOKEN_SECRET'],
};

function missingEnv(route) {
  const missing = (REQUIRED_ENV[route] || []).filter((k) => !process.env[k] || !String(process.env[k]).trim());
  // A short secret is treated as missing: tokens need a real key.
  if ((REQUIRED_ENV[route] || []).includes('DTNT_TOKEN_SECRET') && process.env.DTNT_TOKEN_SECRET
    && process.env.DTNT_TOKEN_SECRET.length < 32 && !missing.includes('DTNT_TOKEN_SECRET')) {
    missing.push('DTNT_TOKEN_SECRET (must be at least 32 characters)');
  }
  return missing;
}

module.exports = {
  FROM_EMAIL,
  REPLY_TO,
  SUPPORT_EMAIL,
  POSTAL_ADDRESS,
  CONSENT_VERSION,
  CONSENT_TEXT,
  CONSENT_TEXT_HASH,
  CONFIRM_TTL_SECONDS,
  DOWNLOAD_TTL_SECONDS,
  PRODUCTION_HOSTS,
  REQUIRED_ENV,
  missingEnv,
};
