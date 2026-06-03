const fs = require('fs');
const path = require('path');
const site = require('../config/site');

const baseUrl = site.siteUrl;

const urls = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/plan', priority: '0.95', changefreq: 'monthly' },
  { loc: '/royal-caribbean', priority: '0.9', changefreq: 'monthly' },
  { loc: '/disney-cruise-line', priority: '0.85', changefreq: 'monthly' },
  { loc: '/disney-world', priority: '0.8', changefreq: 'monthly' },
  { loc: '/universal', priority: '0.8', changefreq: 'monthly' },
  // Home section anchors (still valid for deep links)
  { loc: '/#about', priority: '0.7', changefreq: 'monthly' },
  { loc: '/#destinations', priority: '0.8', changefreq: 'weekly' },
];

const today = new Date().toISOString().split('T')[0];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${baseUrl}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

const out = path.join(__dirname, '../public/sitemap.xml');
fs.writeFileSync(out, xml, 'utf8');
console.log(`Sitemap written to ${out}`);
