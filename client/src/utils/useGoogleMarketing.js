import { useEffect } from 'react';
import { fetchSetting } from '../services/api';

/**
 * Enterprise Google Marketing Integrations
 * Dynamically injects GA4 and GTM based on admin configurations.
 */
export const useGoogleMarketing = () => {
  useEffect(() => {
    const initializeMarketing = async () => {
      try {
        const res = await fetchSetting('marketing_settings');
        if (!res || !res.data) return;

        const { ga4Id, gtmId } = res.data;

        // 1. Inject Google Analytics 4 (GA4)
        if (ga4Id && !document.getElementById('ga4-script')) {
          const script = document.createElement('script');
          script.async = true;
          script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
          script.id = 'ga4-script';
          document.head.appendChild(script);

          const inlineScript = document.createElement('script');
          inlineScript.id = 'ga4-inline';
          inlineScript.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${ga4Id}');
          `;
          document.head.appendChild(inlineScript);
        }

        // 2. Inject Google Tag Manager (GTM)
        if (gtmId && !document.getElementById('gtm-script')) {
          const script = document.createElement('script');
          script.id = 'gtm-script';
          script.innerHTML = `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `;
          document.head.appendChild(script);

          const noscript = document.createElement('noscript');
          noscript.id = 'gtm-noscript';
          noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
          document.body.insertBefore(noscript, document.body.firstChild);
        }
      } catch (err) {
        console.error('Failed to initialize Google Marketing integrations:', err);
      }
    };

    initializeMarketing();
  }, []);
};
