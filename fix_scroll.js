const fs = require('fs');
const path = 'client/src/App.css';
let css = fs.readFileSync(path, 'utf8');

// The dangerous property
css = css.replace('html {\n  scroll-behavior: smooth;\n  overscroll-behavior-y: contain;\n}', 'html {\n  scroll-behavior: smooth;\n}');
css = css.replace('body {\n  -webkit-overflow-scrolling: touch;\n  overscroll-behavior-y: contain;', 'body {\n  -webkit-overflow-scrolling: touch;');

// Remove duplicates or conflicting overscroll definitions if any
css = css.replace(/overscroll-behavior-y: contain;/g, '');
css = css.replace(/overscroll-behavior: contain;/g, '');

fs.writeFileSync(path, css, 'utf8');
console.log('App.css fixed: Removed overscroll-behavior-y which caused scrolling to get stuck.');
