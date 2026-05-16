import Property from '../models/Property.js';
import { AP_DISTRICTS } from '../utils/LocationData.js';

const SITE_URL = (process.env.SITE_URL || 'https://snapadda.com').replace(/\/$/, '');

const buildUrl = (path) => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

const PROPERTY_TYPES = [
  'Apartment', 'Villa', 'Plot', 'Agriculture', 'Commercial', 'House', 'Independent House', 'Office Space', 'Showroom'
];

export const getSitemap = async (req, res) => {
  try {
    const properties = await Property.find({ status: 'Active' }).select('_id updatedAt').sort({ updatedAt: -1 }).lean();
    
    const urls = [
      { loc: buildUrl('/'), lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: '1.0' },
      { loc: buildUrl('/search'), lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: '0.9' },
      { loc: buildUrl('/post-property'), lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: '0.8' },
      { loc: buildUrl('/regional-directory'), lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: '0.9' },
      { loc: buildUrl('/compare'), lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: '0.5' }
    ];

    // Add ALL Districts and Mandals (Hyper-local SEO)
    AP_DISTRICTS.forEach(region => {
      // Add District HQ
      urls.push({
        loc: buildUrl(`/search?keyword=${encodeURIComponent(region.hq)}`),
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: '0.8'
      });

      // Add every Mandal
      region.mandals.forEach(mandal => {
        urls.push({
          loc: buildUrl(`/search?keyword=${encodeURIComponent(mandal)}`),
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: '0.7'
        });
      });
    });

    // Add Property Type URLs
    PROPERTY_TYPES.forEach(type => {
      urls.push({
        loc: buildUrl(`/search?type=${encodeURIComponent(type)}`),
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.7'
      });
    });

    // Add Individual Property URLs
    properties.forEach((property) => {
      if (!property?._id) return;
      urls.push({
        loc: buildUrl(`/property/${property._id}`),
        lastmod: (property.updatedAt || new Date()).toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.6'
      });
    });

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls.map((url) => `  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>\n  </url>`),
      '</urlset>'
    ].join('\n');

    res.header('Content-Type', 'application/xml');
    return res.send(xml);
  } catch (error) {
    console.error('SITEMAP_GEN_ERROR:', error);
    res.status(500).send('Error generating ultra-advanced sitemap');
  }
};
