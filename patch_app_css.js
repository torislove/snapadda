const fs = require('fs');
const path = 'client/src/App.css';
let css = fs.readFileSync(path, 'utf8');

// Update :root for --cmd-bottom
css = css.replace('--nav-h: 74px;', '--nav-h: 74px;\n  --cmd-bottom: 24px;');

// Add the media query after :root block
if (!css.includes('--cmd-bottom: 90px;')) {
  css = css.replace(/}\n\*\,\n\:before\,/m, '}\n\n@media (max-width: 768px) {\n  :root {\n    --cmd-bottom: 90px;\n  }\n}\n\n*,\n:before,');
}

// Add Premium Request CallBack Styles at the end
const requestStyles = `
/* --- PREMIUM REQUEST CALLBACK STYLES --- */
.request-glass-card {
  background: rgba(10, 10, 20, 0.6) !important;
  backdrop-filter: blur(30px) saturate(180%) !important;
  border: 1px solid rgba(232, 184, 75, 0.2) !important;
  border-radius: 32px !important;
  box-shadow: 0 25px 60px rgba(0,0,0,0.6) !important;
  padding: 3rem !important;
}

.request-input-group {
  margin-bottom: 1.75rem;
}

.request-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--gold);
  margin-bottom: 0.75rem;
  text-transform: uppercase;
}

.request-input {
  width: 100%;
  background: rgba(255,255,255,0.03) !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
  border-radius: 16px !important;
  padding: 1rem 1.25rem !important;
  color: white !important;
  transition: all 0.3s ease !important;
  outline: none !important;
}

.request-input:focus {
  border-color: var(--gold) !important;
  background: rgba(255,255,255,0.06) !important;
  box-shadow: 0 0 15px rgba(232, 184, 75, 0.1) !important;
}

.request-btn-submit {
  width: 100%;
  padding: 1.25rem !important;
  background: linear-gradient(135deg, var(--gold), #b9933a) !important;
  color: black !important;
  font-weight: 900 !important;
  font-size: 1rem !important;
  border-radius: 18px !important;
  border: none !important;
  box-shadow: 0 10px 30px rgba(232, 184, 75, 0.25) !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
}

.request-btn-submit:hover {
  transform: translateY(-3px) !important;
  box-shadow: 0 15px 40px rgba(232, 184, 75, 0.35) !important;
}
`;

if (!css.includes('.request-glass-card')) {
  css += '\n' + requestStyles;
}

fs.writeFileSync(path, css, 'utf8');
console.log('App.css patched successfully.');
