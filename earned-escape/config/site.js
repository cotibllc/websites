const primaryDomain = 'earnedescape.agency';
const siteUrl = process.env.SITE_URL || `https://${primaryDomain}`;

function optionalUrl(value) {
  return typeof value === 'string' && value && !value.startsWith('YOUR_') ? value : null;
}

const castleDreamsQuote = 'https://castledreamstravel.com/request-a-quote';
const consultationUrl = optionalUrl(process.env.CONSULTATION_URL) || '/plan';
const rcGuideUrl = optionalUrl(process.env.RC_GUIDE_URL);
const disneyGuideUrl = optionalUrl(process.env.DISNEY_GUIDE_URL);
const universalUrl = optionalUrl(process.env.UNIVERSAL_PAGE_URL) || `${siteUrl}/?tab=parks#destinations`;
const facebookUrl = optionalUrl(process.env.FACEBOOK_URL);
const tiktokUrl = optionalUrl(process.env.TIKTOK_URL);

const turnstileSiteKey = (process.env.TURNSTILE_SITE_KEY && !process.env.TURNSTILE_SITE_KEY.startsWith('YOUR_'))
  ? process.env.TURNSTILE_SITE_KEY
  : null;

module.exports = {
  siteUrl,
  // Bump when static assets change (cache-bust CDN after deploy)
  assetVersion: '20260612-dest-logos',
  // ── BRAND
  brand: {
    name: 'Earned Escape',
    tagline: "You've Earned It.",
    handle: '@earned_escape',
    owner: 'Chuck',
    business: 'COTIB Adventures LLC',
    parentAgency: 'Castle Dreams Travel',
    parentAgencyUrl: 'https://castledreamstravel.com',
    cotibUrl: 'https://cotib.com',
  },

  // ── DOMAINS
  domains: {
    primary: primaryDomain,
    co: 'earnedescape.co',
    vacations: 'earnedescape.vacations',
    voyage: 'earnedescape.voyage',
    linktree: 'cotib.link',
  },

  // ── LINKS
  links: {
    consultation: consultationUrl,
    rcGuide: rcGuideUrl,
    disneyGuide: disneyGuideUrl,
    universalLink: universalUrl,
    castleDreamsQuote,
  },

  // ── SOCIAL
  social: {
    instagram: 'https://instagram.com/earned_escape',
    pinterest: 'https://pinterest.com/earned_escape',
    facebook: facebookUrl,
    tiktok: tiktokUrl,
  },

  // ── FEATURE FLAGS
  features: {
    hasRcGuide: Boolean(rcGuideUrl),
    hasDisneyGuide: Boolean(disneyGuideUrl),
    hasFacebook: Boolean(facebookUrl),
    hasTiktok: Boolean(tiktokUrl),
  },

  // ── FORM / TURNSTILE (public site key only)
  turnstileSiteKey,

  // ── SEO
  seo: {
    title: "Earned Escape | Luxury Cruise Travel Agency & Family Vacations",
    description:
      "Earned Escape is a luxury cruise travel agency specializing in Disney Cruise Line, Royal Caribbean, Walt Disney World, and Universal vacations planned with a personal touch.",
    ogImage: '/images/og/og-default.png',
    twitterHandle: '@earned_escape',
  },
};
