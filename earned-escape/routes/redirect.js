const express = require('express');
const router = express.Router();
const site = require('../config/site');

const REDIRECT_DOMAINS = {
  [site.domains.co]:       { url: `https://${site.domains.primary}`, code: 301 },
  [site.domains.voyage]:   { url: `https://${site.domains.primary}/royal-caribbean`, code: 301 },
  [site.domains.vacations]:{ url: `https://${site.domains.primary}/disney-world`, code: 301 },
};

router.use((req, res, next) => {
  const host = req.hostname;

  // Production: redirect alternate domains
  if (REDIRECT_DOMAINS[host]) {
    return res.redirect(REDIRECT_DOMAINS[host].code, REDIRECT_DOMAINS[host].url);
  }

  if (host === site.domains.linktree && req.path === '/') {
    return res.redirect(302, '/linktree');
  }

  // Development simulation via query param
  const domain = req.query.domain;
  if (domain === 'voyage') {
    return res.redirect(302, '/royal-caribbean');
  }
  if (domain === 'vacations') {
    return res.redirect(302, '/disney-world');
  }
  if (domain === 'co') {
    return res.redirect(302, '/');
  }
  if (domain === 'linktree') {
    return res.redirect(302, '/linktree');
  }

  next();
});

module.exports = router;
