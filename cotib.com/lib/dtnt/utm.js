// Signup source (UTM) for the free sampler. The page copies utm_source,
// utm_medium and utm_campaign from its URL into hidden form fields
// (www/dtnt/signup.js); signup.js cleans them and carries them inside the
// encrypted confirm token; confirm.js writes them to the Resend contact.
// Anything missing, empty or made only of unsafe characters becomes 'direct'.
const UTM_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign'];
const UTM_DEFAULT = 'direct';
const UTM_MAX_LENGTH = 100;

// Lowercase, spaces and pluses to '-', then keep only a-z 0-9 . _ - and cap
// the length. The result is safe in a log line, a token and a Resend property.
function cleanUtm(value) {
  if (typeof value !== 'string') return UTM_DEFAULT;
  const v = value
    .trim()
    .toLowerCase()
    .replace(/[\s+]+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, UTM_MAX_LENGTH)
    .replace(/^[-._]+|[-._]+$/g, '');
  return v || UTM_DEFAULT;
}

// From a parsed form body: { utm_source, utm_medium, utm_campaign }, all clean.
function utmFromBody(body) {
  const b = body || {};
  return Object.fromEntries(UTM_FIELDS.map((k) => [k, cleanUtm(b[k])]));
}

// Resend contact properties for a confirmed signup. Takes the short token
// keys (us, um, uc); tokens issued before this change have none, so 'direct'.
function utmProperties(d) {
  return {
    dtnt_utm_source: cleanUtm(d && d.us),
    dtnt_utm_medium: cleanUtm(d && d.um),
    dtnt_utm_campaign: cleanUtm(d && d.uc),
  };
}

module.exports = { UTM_FIELDS, UTM_DEFAULT, UTM_MAX_LENGTH, cleanUtm, utmFromBody, utmProperties };
