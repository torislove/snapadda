const fs = require('fs');
let css = fs.readFileSync('client/src/App.css','utf8');

// Remove old mobile-first append block if duplicate exists
const marker = '/* =================================================================';
const idx = css.lastIndexOf(marker);
if(idx > 100000) {
  css = css.substring(0, idx);
  console.log('Removed duplicate mobile block at', idx);
}

// Also remove the previous v2 block if present
const marker2 = '/* ============================================================';
const idx2 = css.lastIndexOf(marker2);
if(idx2 > 100000) {
  css = css.substring(0, idx2);
  console.log('Removed v2 mobile block at', idx2);
}

const mobileCSS = `

/* =================================================================
   SNAPADDA MOBILE-FIRST APP ARCHITECTURE - FINAL v3
   ================================================================= */

.mobile-only { display: none !important; }
.desktop-only { display: block; }

@media (min-width: 769px) {
  .mobile-only { display: none !important; }
  .desktop-only { display: block !important; }
  nav.nav-links-center.desktop-only { display: flex !important; }
  div.desktop-only { display: flex !important; }
  .mobile-bottom-nav { display: none !important; }
}

@media (max-width: 768px) {
  .mobile-only { display: flex !important; }
  nav.nav-links-center.desktop-only { display: none !important; }
  div.desktop-only { display: none !important; }
  span.desktop-only { display: none !important; }

  .app-nav {
    display: flex !important;
    height: 60px !important;
    background: rgba(5, 5, 10, 0.97) !important;
    backdrop-filter: blur(24px) !important;
    -webkit-backdrop-filter: blur(24px) !important;
    border-bottom: 1px solid rgba(212,175,55,0.20) !important;
  }
  .nav-inner {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 0 0.85rem !important;
    height: 100%;
    width: 100%;
  }
  .app-main-content { padding-top: 60px !important; }
  main { padding-top: 0 !important; }

  .hero-section { padding-top: 1rem !important; padding-bottom: 1.5rem !important; }
  .hero-eyebrow { font-size: 0.7rem !important; }
  .hero-title {
    font-size: clamp(1.85rem, 6.5vw, 2.75rem) !important;
    line-height: 1.15 !important;
    letter-spacing: -0.02em !important;
    margin-bottom: 0.85rem !important;
  }
  .hero-subtitle { font-size: 0.88rem !important; margin-bottom: 1.25rem !important; }
  .hero-ctas { flex-direction: column !important; gap: 0.65rem !important; width: 100%; }
  .hero-btn-primary, .hero-btn-glass { width: 100% !important; justify-content: center !important; min-height: 50px !important; }
  .hero-stats-row { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 0.5rem !important; margin-top: 1.25rem !important; }
  .hero-stat-chip { text-align: center !important; padding: 0.5rem !important; }

  .search-section { padding: 0.75rem 0 1rem !important; }
  .search-section .container { padding: 0 0.75rem !important; }
  .search-platform { padding: 1rem 0.85rem !important; border-radius: 18px !important; width: 100% !important; overflow: visible !important; }
  .intent-cards { gap: 0.5rem !important; margin-bottom: 0.85rem !important; }
  .intent-card { flex: 1 !important; flex-direction: column !important; padding: 0.6rem 0.4rem !important; font-size: 0.72rem !important; min-height: 58px !important; gap: 4px !important; text-align: center; }
  .search-main-row { flex-direction: column !important; gap: 0.65rem !important; }
  .search-bar-wrap { width: 100% !important; }
  .search-bar-input { font-size: 0.9rem !important; height: 50px !important; padding-left: 2.5rem !important; }
  .budget-select { width: 100% !important; height: 50px !important; }
  .search-action-row { flex-direction: column !important; gap: 0.6rem !important; margin-top: 0.5rem !important; }
  .search-go-btn, .search-filter-btn { width: 100% !important; display: flex !important; justify-content: center !important; min-height: 50px !important; }
  .search-quick-chips { flex-wrap: wrap !important; gap: 0.4rem !important; margin-top: 0.65rem !important; }
  .quick-chip { font-size: 0.7rem !important; padding: 0.3rem 0.6rem !important; white-space: nowrap; }

  .type-tabs { flex-wrap: nowrap !important; overflow-x: auto !important; gap: 0.4rem !important; padding-bottom: 6px; scrollbar-width: none; }
  .type-tabs::-webkit-scrollbar { display: none; }
  .type-tab { flex-shrink: 0 !important; font-size: 0.75rem !important; padding: 0.35rem 0.75rem !important; white-space: nowrap; }
  .smart-pills { flex-wrap: nowrap !important; overflow-x: auto !important; gap: 0.45rem !important; padding-bottom: 4px; scrollbar-width: none; }
  .smart-pills::-webkit-scrollbar { display: none; }
  .smart-pill { flex-shrink: 0 !important; }

  .city-cards-grid { grid-template-columns: 1fr 1fr !important; gap: 0.65rem !important; }
  .properties-grid { grid-template-columns: 1fr !important; gap: 1rem !important; }
  .why-grid { grid-template-columns: 1fr !important; gap: 1rem !important; }
  .stats-grid { grid-template-columns: repeat(2,1fr) !important; gap: 0.75rem !important; }
  .footer-grid { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
  .section-title { font-size: 1.55rem !important; }
  .section-subtitle { font-size: 0.88rem !important; }
  .contact-channels { flex-direction: column !important; gap: 0.75rem !important; }
  .promo-section-top { padding: 0.5rem 0 0.75rem !important; }

  .app-main-content > div { padding-bottom: 80px; }

  button, .btn, a.btn,
  .search-go-btn, .search-filter-btn, .hero-btn-primary, .hero-btn-glass {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
  .logo-text-wrap { display: flex !important; }
}

@media (max-width: 400px) {
  .hero-title { font-size: 1.75rem !important; }
  .search-platform { padding: 0.75rem 0.6rem !important; }
  .nav-inner { padding: 0 0.5rem !important; }
}
`;

css += mobileCSS;
fs.writeFileSync('client/src/App.css', css, 'utf8');
console.log('SUCCESS. New size:', css.length);
