// Shared page chrome (cotib.com header and footer, DTNT styles) and the
// server-rendered states for confirm, download and unsubscribe.
// The two static pages (www/do-the-next-thing.html and
// www/do-the-next-thing/privacy.html) are written from this same chrome by
// scripts/build-dtnt-pages.js, so every DTNT page looks the same.
const { esc } = require('./emails');
const { SUPPORT_EMAIL } = require('./config');

const FONTS = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=IBM+Plex+Serif:wght@400;600&family=IBM+Plex+Mono:wght@400;500&display=swap';

function head({ title, description, canonical, noindex }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  ${description ? `<meta name="description" content="${esc(description)}">` : ''}
  ${noindex ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index,follow">'}
  <meta property="og:site_name" content="COTIB LLC">
  <meta property="og:title" content="${esc(title)}">
  ${description ? `<meta property="og:description" content="${esc(description)}">` : ''}
  ${canonical ? `<meta property="og:url" content="${esc(canonical)}">\n  <link rel="canonical" href="${esc(canonical)}">` : ''}
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${FONTS}" rel="stylesheet">
  <link rel="stylesheet" href="/dtnt/dtnt.css">`;
}

const HEADER = `
  <a class="skip" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="wrap">
      <a class="brand" href="/"><img src="/img/logo/cotib-wordmark.svg" alt="COTIB LLC home" width="94" height="28"></a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
      <nav class="nav" id="site-nav" aria-label="Main">
        <a href="/">Home</a>
        <a href="/services">Services</a>
        <a href="/ventures">Ventures</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </nav>
    </div>
  </header>`;

const FOOTER = `
  <footer class="site-footer">
    <div class="wrap">
      <div class="foot-grid">
        <div>
          <img src="/img/logo/cotib-wordmark.svg" alt="COTIB LLC" width="80" height="24">
          <p>Fractional technology leadership and architecture strategy, and the same systems thinking applied to running StackApproved, Earned Escape, and COTIB's media ventures. Based in New York City.</p>
        </div>
        <div>
          <h2>Services</h2>
          <ul>
            <li><a href="/services#cto">Fractional CTO</a></li>
            <li><a href="/services#ai">AI Platforms</a></li>
            <li><a href="/services#finops">FinOps &amp; Savings</a></li>
          </ul>
        </div>
        <div>
          <h2>Company</h2>
          <ul>
            <li><a href="/about">About</a></li>
            <li><a href="/ventures">Ventures</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
      </div>
      <div class="foot-base">
        <p class="m0">&copy; 2026 COTIB LLC. All rights reserved. New York City, NY.</p>
        <nav aria-label="Social">
          <a href="https://www.linkedin.com/in/charles-b-technologist/" rel="noopener">LinkedIn</a>
          <a href="https://techleadshift.substack.com" rel="noopener">Substack</a>
          <a href="https://www.youtube.com/@theitxp" rel="noopener">YouTube</a>
        </nav>
      </div>
    </div>
  </footer>
  <script src="/dtnt/menu.js" defer></script>`;

function page({ title, description, canonical, noindex, headExtra = '', main, bodyEnd = '' }) {
  return `${head({ title, description, canonical, noindex })}${headExtra}
</head>
<body>${HEADER}
  <main id="main">
${main}
  </main>${FOOTER}${bodyEnd}
</body>
</html>
`;
}

// A single-message state page (confirm, download, unsubscribe).
function statePage({ title, eyebrow = 'Do the Next Thing', heading, paragraphs = [], action = '', state }) {
  const body = paragraphs.map((p) => `          <p>${p}</p>`).join('\n');
  return page({
    title: `${title} | Do the Next Thing | COTIB LLC`,
    noindex: true,
    main: `    <section class="hero state-page" data-state="${esc(state)}">
      <div class="wrap">
        <div class="state-simple">
          <p class="eyebrow">${esc(eyebrow)}</p>
          <h1>${heading}</h1>
          <div class="ticks" aria-hidden="true"></div>
${body}
${action}
        </div>
      </div>
    </section>`,
  });
}

const BACK = '<a href="/do-the-next-thing">cotib.com/do-the-next-thing</a>';
const MAIL = `<a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>`;

const states = {
  // Approved copy: free-tier copy section 3, confirm page success.
  confirmed: ({ downloadPath }) => statePage({
    state: 'confirmed',
    title: "You're confirmed",
    heading: "You're confirmed.",
    paragraphs: ['Your 3 prompts are ready:'],
    action: `          <p><a class="btn btn-primary" href="${esc(downloadPath)}">Download the free sampler</a></p>
          <p>We also emailed you the link. It works for 30 days.</p>
          <p class="muted-line">a COTIB LLC product.</p>`,
  }),
  // Approved copy: confirm page, bad or expired link.
  confirmExpired: () => statePage({
    state: 'confirm-expired',
    title: 'Confirm link expired',
    heading: 'That confirm link has expired or was already used.',
    paragraphs: [`Enter your email again at ${BACK} and we'll send a new one.`],
  }),
  // New copy (needs Chuck's re-approval): download link expired or invalid.
  downloadExpired: () => statePage({
    state: 'download-expired',
    title: 'Download link expired',
    heading: 'That download link has expired.',
    paragraphs: [`Enter your email again at ${BACK} and we'll send a new one.`],
  }),
  // New copy: unsubscribe confirm step (GET), so link scanners can't unsubscribe anyone.
  unsubscribeAsk: ({ email, token }) => statePage({
    state: 'unsubscribe-ask',
    title: 'Unsubscribe',
    heading: 'Unsubscribe from Do the Next Thing emails?',
    paragraphs: [`We'll stop emailing <strong>${esc(email)}</strong> about Do the Next Thing.`],
    action: `          <form method="post" action="/do-the-next-thing/free/unsubscribe">
            <input type="hidden" name="t" value="${esc(token)}">
            <button class="btn btn-primary" type="submit">Unsubscribe</button>
          </form>`,
  }),
  unsubscribed: ({ email }) => statePage({
    state: 'unsubscribed',
    title: "You're unsubscribed",
    heading: "You're unsubscribed.",
    paragraphs: [`We won't email <strong>${esc(email)}</strong> about Do the Next Thing again unless you sign up and confirm again.`],
  }),
  unsubscribeInvalid: () => statePage({
    state: 'unsubscribe-invalid',
    title: 'Unsubscribe link not valid',
    heading: "That unsubscribe link doesn't work.",
    paragraphs: [`Email ${MAIL} with "Unsubscribe" in the subject and we'll take you off the list.`],
  }),
  unsubscribeError: () => statePage({
    state: 'unsubscribe-error',
    title: 'Unsubscribe',
    heading: "We couldn't finish that just now.",
    paragraphs: [`Try the link again in a few minutes, or email ${MAIL} with "Unsubscribe" in the subject.`],
  }),
  // Approved copy: after-submit message (no-JS form posts land here).
  checkEmail: () => statePage({
    state: 'check-email',
    title: 'Check your email',
    heading: 'Check your email.',
    paragraphs: ["We sent a confirm link to the address you entered. Click it within 48 hours to get your 3 prompts. Not there in a few minutes? Check spam or promotions."],
  }),
  formError: ({ message }) => statePage({
    state: 'form-error',
    title: 'Try again',
    heading: esc(message),
    paragraphs: [`<a href="/do-the-next-thing#free">Back to the form</a>`],
  }),
  // New copy: an env var is missing, so the flow fails closed.
  paused: () => statePage({
    state: 'paused',
    title: 'Not available right now',
    heading: "The free sampler isn't available right now.",
    paragraphs: [`Try again later, or email ${MAIL}.`],
  }),
};

module.exports = { page, head, HEADER, FOOTER, states };
