'use strict';
// GET /api/consent-region: tells the cookie banner whether this visitor must
// be asked before Google Analytics loads. Per visitor, so never cached.
const express = require('express');
const { consentRegion } = require('../lib/consent');

const router = express.Router();

router.all('/api/consent-region', (req, res) => {
  res.set('Cache-Control', 'private, no-store, max-age=0');
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.set('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  return res.json({ region: consentRegion(req.get('x-vercel-ip-country')) });
});

module.exports = router;
