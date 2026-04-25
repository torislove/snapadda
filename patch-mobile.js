const fs = require('fs');

// Client HTML Update
const clientHtmlPath = 'client/index.html';
if (fs.existsSync(clientHtmlPath)) {
  let html = fs.readFileSync(clientHtmlPath, 'utf8');
  html = html.replace(/<meta name="viewport".*?>/, '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover">');
  fs.writeFileSync(clientHtmlPath, html);
}

// Admin HTML Update
const adminHtmlPath = 'admin/index.html';
if (fs.existsSync(adminHtmlPath)) {
  let html = fs.readFileSync(adminHtmlPath, 'utf8');
  html = html.replace(/<meta name="viewport".*?>/, '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover">');
  fs.writeFileSync(adminHtmlPath, html);
}

// Mobile-First CSS Injection (Client)
const clientCssPath = 'client/src/App.css';
if (fs.existsSync(clientCssPath)) {
  const cssInject = `
/* Mobile-First Adjustments (Google Accessibility Specs) */
button, select, input[type='text'], input[type='number'], input[type='password'], input[type='email'], a.btn, a.btn-3d, .btn {
  min-height: 44px; /* Apple/Google 44px standard */
}
* {
  -webkit-overflow-scrolling: touch;
}
`;
  fs.appendFileSync(clientCssPath, cssInject);
}

// Mobile-First CSS Injection (Admin)
const adminCssPath = 'admin/src/pages/admin/Layout.css';
if (fs.existsSync(adminCssPath)) {
  const cssInject = `
/* Mobile-First Adjustments (Google Accessibility Specs) */
button, select, input.admin-input, select.admin-select, a {
  min-height: 44px; /* Apple/Google 44px standard */
}
.admin-content, .admin-sidebar, .bento-grid {
  -webkit-overflow-scrolling: touch;
}
`;
  fs.appendFileSync(adminCssPath, cssInject);
}

console.log('Mobile-First Overhaul Complete');
