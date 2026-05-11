import Property from '../models/Property.js';

export const getSitemap = async (req, res) => {
  try {
    const properties = await Property.find({ status: { $ne: 'Deleted' } }).select('_id updatedAt');
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://snapadda-7a6e6.web.app/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://snapadda-7a6e6.web.app/search</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;

    properties.forEach(p => {
      xml += `
  <url>
    <loc>https://snapadda-7a6e6.web.app/property/${p._id}</loc>
    <lastmod>${p.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
};
