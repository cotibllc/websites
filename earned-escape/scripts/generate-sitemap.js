const fs = require('fs');
const path = require('path');
const site = require('../config/site');

const baseUrl = site.siteUrl;

const urls = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/#about', priority: '0.8', changefreq: 'monthly' },
  { loc: '/#destinations', priority: '0.9', changefreq: 'weekly' },
  { loc: '/#guides', priority: '0.9', changefreq: 'monthly' },
  { loc: '/#why', priority: '0.7', changefreq: 'monthly' },
  { loc: '/#contact', priority: '0.8', changefreq: 'monthly' },
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
