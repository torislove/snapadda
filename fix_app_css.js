const fs = require('fs');
const path = 'client/src/App.css';
let css = fs.readFileSync(path, 'utf8');

// Fix the unclosed media query
if (css.includes('/* --- PREMIUM REQUEST CALLBACK STYLES --- */')) {
  // If we already injected it, let's find the injection point and fix it.
  css = css.replace('\n/* --- PREMIUM REQUEST CALLBACK STYLES --- */', '}\n\n/* --- PREMIUM REQUEST CALLBACK STYLES --- */');
}

fs.writeFileSync(path, css, 'utf8');
console.log('App.css fix applied.');
