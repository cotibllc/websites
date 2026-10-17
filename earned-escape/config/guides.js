// Free guide registry. Each guide has its own landing page, PDF, and email
// templates (see lib/guide-emails.js). Only enabled guides are accepted by
// POST /api/guide. To add a guide later (for example a Disney guide on its own
// page), add an entry here with enabled: false until its page, PDF, copy and
// templates are approved.
const DEFAULT_GUIDE_TYPE = 'rc';

const GUIDES = {
  rc: {
    id: 'rc',
    enabled: true,
    title: '5 Mistakes First-Time Cruisers Make',
    fullTitle: '5 Mistakes First-Time Cruisers Make (And How to Avoid Them)',
    pagePath: '/guide',
    pdfPath: '/downloads/5-mistakes-first-time-cruisers-make.pdf',
    // Page 1 of the PDF, rendered to WebP.
    coverPath: '/images/guides/rc-cover.webp',
    coverWidth: 600,
    coverHeight: 776,
  },
};

function getGuide(type) {
  const key = String(type || DEFAULT_GUIDE_TYPE).trim().toLowerCase();
  const guide = Object.prototype.hasOwnProperty.call(GUIDES, key) ? GUIDES[key] : null;
  return guide && guide.enabled ? guide : null;
}

module.exports = { GUIDES, DEFAULT_GUIDE_TYPE, getGuide };
