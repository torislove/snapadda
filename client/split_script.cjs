const fs = require('fs');

const content = fs.readFileSync('src/main.jsx', 'utf8');
const lines = content.split('\n');
const extract = (startLine, endLine) => lines.slice(startLine - 1, endLine).join('\n') + '\n';

// 1. Globals
const globalsLines = extract(1, 21); // The imports
const globalsImports = globalsLines
  .replace('import{a as e}', 'import{a as e}')
  .replace(/import\s*\{([^\}]+)\}\s*from\s*"([^"]+)";/g, (match, names, path) => {
    return `import { ${names} } from "${path}";`;
  });

const globalsSetup = `
const Ne = r();
const Y = e(t(), 1);
const X = s();
const Pe = (0,Y.createContext)(void 0);

// Exports of minified original variables
export {
  e, t, n, r,
  Ne, Y, X, Pe,
  i, a, o, s, c, l,
  u, d, f, p, m, h, g, _, v,
  y, b, x, ee, S, te, C, w, T, E, ne, re, ie, D, ae, oe, se, ce, O, le, k, A, j, M, ue, N, de, P, F, I, L, R, fe, pe, me, z, he, B, V, ge, _e, ve, ye, be, H, U, W, G, K, xe, Se, Ce, we, Te, Ee, q, De,
  J, Oe, ke, Ae, je, Me
};
`;
fs.writeFileSync('src/globals.jsx', globalsImports + globalsSetup);

// 2. AuthProvider & Hooks
let authCode = `import * as G from './globals.jsx';\n` + 
  `const { Y, X, Pe } = G;\n` + 
  extract(37, 54)
    .replace('var Ne=r(),Y=e(t(),1),X=s(),Pe=(0,Y.createContext)(void 0),Fe =', 'export const Fe =')
    .replace('const Z =', 'export const Z =');
    
// We need to inject G. prefix for all standard minified variables inside authCode, 
// OR we can just unpack them!
authCode = `import * as G from './globals.jsx';\n` + 
  `const { Y, X, Pe } = G;\n` + 
  extract(37, 54)
    .replace('var Ne=r(),Y=e(t(),1),X=s(),Pe=(0,Y.createContext)(void 0),Fe =', 'export const Fe =')
    .replace('const Z =', 'export const Z =');
fs.writeFileSync('src/contexts/AuthContext.jsx', authCode);

// 3. API Services
let apiCode = `const Q = "http://localhost:5000/api";\n` + extract(56, 194);
apiCode = apiCode
  .replace(/const Ie =/g, 'export const Ie =')
  .replace(/const Le =/g, 'export const Le =')
  .replace(/const Re =/g, 'export const Re =')
  .replace(/const ze =/g, 'export const ze =')
  .replace(/const Be =/g, 'export const Be =')
  .replace(/const Ve =/g, 'export const Ve =')
  .replace(/const He =/g, 'export const He =')
  .replace(/const Ue =/g, 'export const Ue =')
  .replace(/const We =/g, 'export const We =')
  .replace(/const Ge =/g, 'export const Ge =');
fs.writeFileSync('src/services/api.js', apiCode);

// 4. Logo (Ke)
let logoCode = `import { Y, X } from '../globals.jsx';\nexport const Ke = ` + extract(195, 294).replace('const Ke = ', '');
fs.writeFileSync('src/components/Logo.jsx', logoCode);

// 5. Button ($)
let buttonCode = `import { X } from '../globals.jsx';\nexport const Button = ` + extract(434, 437).replace('$=', '');
fs.writeFileSync('src/components/Button.jsx', buttonCode);

// We won't split further using basic Regex as it breaks easily due to missing dependencies. 
// Instead, we create an App.jsx that holds the rest, and rename main.jsx to a clean mount point.

let appCode = `import * as Globals from './globals.jsx';\n` +
`import { Fe, Z } from './contexts/AuthContext.jsx';\n` +
`import { Ie, Le, Re, ze, Be, Ve, He, Ue, We, Ge } from './services/api.js';\n` +
`import { Ke } from './components/Logo.jsx';\n` +
`import { Button as $ } from './components/Button.jsx';\n` +
`const { Y, X, Pe, e, t, n, r, a, i, o, c, s, l, u, d, f, p, m, h, g, _, v, y, b, x, ee, S, te, C, w, T, E, ne, re, ie, D, ae, oe, se, ce, O, le, k, A, j, M, ue, N, de, P, F, I, L, R, fe, pe, me, z, he, B, V, ge, _e, ve, ye, be, H, U, W, G, K, xe, Se, Ce, we, Te, Ee, q, De } = Globals;\n\n` +
extract(295, 433) + // qe (PropertyCard)
extract(438, 504).replace(',Je=(', 'const Je=(') + // Je (ContactModal)
extract(505, 2680).replace(';function It', 'export function App'); // main app code

// We need to replace references to `$` with `Button`? No, since we destructured `Button as $` above, `$` points to the button component.
fs.writeFileSync('src/App.jsx', appCode);

// 6. Clean main.jsx
const mainCode = `import './App.css';
import { Ne, Y, X, n } from './globals.jsx';
import { Fe } from './contexts/AuthContext.jsx';
import { App } from './App.jsx';

(0,Ne.createRoot)(document.getElementById('root')).render(
  (0,X.jsx)(Y.StrictMode, {
    children: (0,X.jsx)(n, {
      clientId: '1234567890-mockclientid.apps.googleusercontent.com',
      children: (0,X.jsx)(Fe, {
        children: (0,X.jsxs)(X.Fragment, {
          children: [
            (0,X.jsx)(App, {}),
            (0,X.jsx)('style', {
              children: \`.fab-callback { position: fixed; bottom: 2rem; right: 2rem; width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #f4d03f, #c5a059); color: #07070f; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 36px rgba(244, 208, 63, 0.4); z-index: 1000; cursor: pointer; transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); border: 1px solid rgba(255, 255, 255, 0.2); } .fab-callback:hover { transform: scale(1.15) translateY(-8px) rotate(8deg); box-shadow: 0 20px 50px rgba(244, 208, 63, 0.6); } .fab-filters { position: fixed; bottom: 2rem; left: 2rem; width: 58px; height: 58px; border-radius: 50%; background: rgba(18, 18, 42, 0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); color: #f4d03f; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(244, 208, 63, 0.3); z-index: 1000; cursor: pointer; transition: all 0.4s ease; box-shadow: 0 8px 32px rgba(0,0,0,0.5); } .fab-filters:hover { background: rgba(25, 25, 55, 0.95); border-color: #f4d03f; transform: translateY(-5px) scale(1.05); box-shadow: 0 12px 40px rgba(244, 208, 63, 0.2); } @media (max-width: 768px) { .fab-callback { bottom: 1.5rem; right: 1.5rem; width: 58px; height: 58px; } .fab-filters { bottom: 1.5rem; left: 1.5rem; width: 54px; height: 54px; } .bottom-nav { padding-bottom: env(safe-area-inset-bottom); } } .glass-heavy { background: rgba(18, 18, 42, 0.8) !important; backdrop-filter: blur(20px) !important; -webkit-backdrop-filter: blur(20px) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; } .section-wrap { padding: 6rem 0 !important; } @media (max-width: 768px) { .section-wrap { padding: 4rem 0 !important; } } .filter-sidebar { background: rgba(18, 18, 42, 0.98) !important; backdrop-filter: blur(40px) !important; border-left: 1px solid rgba(212, 175, 55, 0.3) !important; padding: 2.5rem !important; box-shadow: -20px 0 80px rgba(0,0,0,0.9) !important; } .filter-header { border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important; padding-bottom: 2rem !important; margin-bottom: 2.5rem !important; } .filter-group label { color: #f4d03f !important; font-weight: 800 !important; text-transform: uppercase !important; letter-spacing: 0.15em !important; font-size: 0.7rem !important; margin-bottom: 1rem !important; display: block !important; } .filter-group input, .filter-group select { background: rgba(255, 255, 255, 0.04) !important; border: 1px solid rgba(255, 255, 255, 0.12) !important; border-radius: 14px !important; padding: 1rem 1.25rem !important; color: white !important; width: 100% !important; transition: all 0.35s ease !important; font-size: 0.9rem !important; } .filter-group input:focus, .filter-group select:focus { border-color: #f4d03f !important; background: rgba(255, 255, 255, 0.08) !important; outline: none !important; box-shadow: 0 0 0 4px rgba(244, 208, 63, 0.1) !important; } .bhk-btn, .pill-btn { background: rgba(255, 255, 255, 0.05) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; border-radius: 10px !important; padding: 0.75rem !important; color: white !important; font-weight: 600 !important; transition: all 0.3s ease !important; } .bhk-btn.active, .pill-btn.active { background: #f4d03f !important; color: #07070f !important; border-color: #f4d03f !important; transform: scale(1.05) !important; box-shadow: 0 4px 15px rgba(244, 208, 63, 0.3) !important; } .filter-footer { border-top: 1px solid rgba(255, 255, 255, 0.08) !important; padding-top: 2rem !important; margin-top: 2.5rem !important; gap: 1.5rem !important; }\`
            })
          ]
        })
      })
    })
  })
);
`;

fs.writeFileSync('src/main.jsx', mainCode);

console.log('Splitting Complete.');
