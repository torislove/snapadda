import Property from '../models/Property.js';

const SITE_URL = (process.env.SITE_URL || 'https://snapadda.com').replace(/\/$/, '');

const buildUrl = (path) => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

export const getSitemap = async (req, res) => {
  try {
    const properties = await Property.find({ status: 'Active' }).select('_id createdAt').sort({ createdAt: -1 }).lean();
    const urls = [
      {
        loc: buildUrl('/'),
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: '1.0'
      }
    ];

    properties.forEach((property) => {
      if (!property?._id) return;
      urls.push({
        loc: buildUrl(`/property/${property._id}`),
        lastmod: (property.createdAt || new Date()).toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.8'
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
    res.status(500).json({ status: 'error', message: error.message });
  }
};
