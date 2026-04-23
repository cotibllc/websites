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

module.exports = router;
