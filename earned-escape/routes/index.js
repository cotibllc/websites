const express = require('express');
const router = express.Router();
const site = require('../config/site');

router.get('/', (req, res) => {
  res.render('pages/index.njk', {
    site,
    title: site.seo.title,
    description: site.seo.description,
  });
});

router.get('/disney-world', (req, res) => {
  res.render('pages/disney-world.njk', {
    site,
    title: 'Walt Disney World Planning | Earned Escape',
    description: 'Thoughtful Walt Disney World planning for families who want a smoother, more elevated vacation with the right resort, rhythm, and strategy.',
  });
});

router.get('/royal-caribbean', (req, res) => {
  res.render('pages/royal-caribbean.njk', {
    site,
    title: 'Royal Caribbean Cruises | Earned Escape',
    description: 'Royal Caribbean cruise planning shaped by firsthand travel experience, with help choosing the right ship, stateroom, and itinerary.',
    canonical: '/royal-caribbean',
  });
});

router.get('/disney-cruise-line', (req, res) => {
  res.render('pages/disney-cruise-line.njk', {
    site,
    title: 'Disney Cruise Line Planning | Earned Escape',
    description: 'Disney Cruise Line planning for families who want thoughtful guidance on ships, itineraries, and the kind of details that make the experience feel special.',
  });
});

router.get('/universal', (req, res) => {
  res.render('pages/universal.njk', {
    site,
    title: 'Universal Orlando & Epic Universe | Earned Escape',
    description: 'Universal Orlando and Epic Universe planning with practical strategy for hotels, park days, and a trip that feels exciting without the overwhelm.',
  });
});

module.exports = router;
