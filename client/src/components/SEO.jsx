import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

/**
 * Advanced SEO Component for SnapAdda
 * Handles dynamic metadata, OpenGraph, Twitter, and JSON-LD Structured Data.
 */
export default function SEO({ 
  title, 
  description, 
  canonical, 
  ogImage, 
  ogType = 'website',
  schemaData = null,
  keywords = []
}) {
  const { i18n } = useTranslation();
  const siteName = 'SnapAdda';
  const defaultDesc = 'Discover verified properties, villas, apartments and plots across Andhra Pradesh. SnapAdda is your institutional-grade real estate hub.';
  const baseUrl = window.location.origin;
  
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const fullDescription = description || defaultDesc;
  const currentUrl = canonical || window.location.href;
  const previewImage = ogImage || `${baseUrl}/og-preview.png`;

  // Merge default keywords with page-specific ones
  const baseKeywords = [
    'SnapAdda', 'Real Estate Andhra Pradesh', 'AP Properties', 'Buy Property in AP', 'Amaravati Plots', 
    'Vijayawada Real Estate', 'Guntur Apartments', 'Vizag Villas', 'CRDA Approved Plots', 'RERA Registered Projects', 
    'Open Plots in Mangalagiri', 'Agricultural Land in Krishna District', 'Gajalu', 'Residential Acres', 
    'Commercial Space Vijayawada', 'Duplex Villas Guntur', 'Luxury Apartments Vizag', 'Investment Plots Amaravati',
    'Industrial Sheds AP', 'Farm Houses East Godavari', 'West Godavari Lands', 'Nellore Real Estate', 
    'Tirupati Properties', 'Kurnool Plots', 'Anantapur Real Estate', 'Kadapa Lands', 'Prakasam Properties',
    'Srikakulam Real Estate', 'Vizianagaram Plots', 'Eluru Apartments', 'Ongole Lands'
  ];
  const allKeywords = [...new Set([...baseKeywords, ...keywords])].join(', ');

  return (
    <Helmet>
      {/* Basic Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={allKeywords} />
      <link rel="canonical" href={currentUrl} />

      {/* Language Alternates (Hreflang) */}
      <link rel="alternate" href={currentUrl} hrefLang="x-default" />
      <link rel="alternate" href={currentUrl} hrefLang="en" />
      <link rel="alternate" href={currentUrl} hrefLang="te" />

      {/* OpenGraph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={previewImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@snapadda" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={previewImage} />

      {/* Structured Data (JSON-LD) */}
      {schemaData && (Array.isArray(schemaData) ? schemaData : [schemaData]).map((sd, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(sd)}
        </script>
      ))}

      {/* Institutional Tags */}
      <meta name="author" content="SnapAdda Real Estate" />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="theme-color" content="#050a14" />
      <meta name="msapplication-TileColor" content="#e8b84b" />
    </Helmet>
  );
}
