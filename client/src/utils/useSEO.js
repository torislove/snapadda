import { useEffect } from 'react';

/**
 * Custom hook to inject SEO metadata into the document head.
 * Ensures the SnapAdda platform is highly discoverable and consistent across social media.
 */
export const useSEO = (seoData) => {
  useEffect(() => {
    if (!seoData) return;

    // 1. Update Title
    if (seoData.title) {
      document.title = seoData.title;
    }

    // 2. Update Meta Description
    const updateMeta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`) || 
               document.querySelector(`meta[property="${name}"]`);
      if (el) {
        el.setAttribute('content', content);
      } else {
        const newEl = document.createElement('meta');
        newEl.setAttribute(name.includes('og:') ? 'property' : 'name', name);
        newEl.setAttribute('content', content);
        document.head.appendChild(newEl);
      }
    };

    if (seoData.description) {
      updateMeta('description', seoData.description);
      updateMeta('og:description', seoData.description);
      updateMeta('twitter:description', seoData.description);
    }

    if (seoData.keywords) {
      updateMeta('keywords', seoData.keywords);
    }

    if (seoData.image) {
      updateMeta('og:image', seoData.image);
      updateMeta('twitter:image', seoData.image);
    }

    if (seoData.canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (link) {
        link.setAttribute('href', seoData.canonical);
      } else {
        const newLink = document.createElement('link');
        newLink.setAttribute('rel', 'canonical');
        newLink.setAttribute('href', seoData.canonical);
        document.head.appendChild(newLink);
      }
    }

    if (seoData.robots) {
      updateMeta('robots', seoData.robots);
    }

  }, [seoData]);
};
