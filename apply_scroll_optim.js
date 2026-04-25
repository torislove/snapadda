const fs = require('fs');
const path = 'client/src/App.css';
let css = fs.readFileSync(path, 'utf8');

// Header optimization for GPU
css = css.replace('.app-nav {', '.app-nav {\n  will-change: transform, background, backdrop-filter;\n  transform: translateZ(0);');

// Global Scrolling & Body Optimization
css = css.replace('body {', 'html {\n  scroll-behavior: smooth;\n  overscroll-behavior-y: contain;\n}\n\nbody {\n  -webkit-overflow-scrolling: touch;\n  overscroll-behavior-y: contain;');

// Rubber-band effect on main containers
css = css.replace('.app-main-content {', '.app-main-content {\n  will-change: transform;\n  transform: translateZ(0);\n  content-visibility: auto;');

// GPU blurs for glass elite
css = css.replace('.glass-elite {', '.glass-elite {\n  will-change: transform, backdrop-filter;\n  transform: translate3d(0, 0, 0);');

// Property Card Hover optimization
css = css.replace('.property-card.glass-elite:hover {', '.property-card.glass-elite:hover {\n  will-change: transform;');

fs.writeFileSync(path, css, 'utf8');
console.log('App.css scroll optimization applied.');
