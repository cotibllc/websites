const primaryDomain = 'earnedescape.agency';
const siteUrl = process.env.SITE_URL || `https://${primaryDomain}`;

function optionalUrl(value) {
  return typeof value === 'string' && value && !value.startsWith('YOUR_') ? value : null;
}

const castleDreamsQuote = 'https://castledreamstravel.com/request-a-quote';
const consultationUrl = optionalUrl(process.env.CONSULTATION_URL) || castleDreamsQuote;
const rcGuideUrl = optionalUrl(process.env.RC_GUIDE_URL);
const disneyGuideUrl = optionalUrl(process.env.DISNEY_GUIDE_URL);
const universalUrl = optionalUrl(process.env.UNIVERSAL_PAGE_URL) || `${siteUrl}/?tab=parks#destinations`;
const facebookUrl = optionalUrl(process.env.FACEBOOK_URL);
const tiktokUrl = optionalUrl(process.env.TIKTOK_URL);

module.exports = {
  siteUrl,
  // ── BRAND
  brand: {
    name: 'Earned Escape',
    tagline: "You've Earned It.",
    handle: '@earned_escape',
    owner: 'Chuck Betancourt',
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

  // ── SEO
  seo: {
    title: "Earned Escape | You've Earned It. | Certified Travel Advisory",
    description:
      'Expert travel planning for Royal Caribbean, Disney Cruise Line, Walt Disney World, and Universal Resorts. Certified advisor, zero added cost to you.',
    ogImage: '/images/og/og-default.png',
    twitterHandle: '@earned_escape',
  },
};
