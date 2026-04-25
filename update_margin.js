const fs = require('fs');
const path = 'client/src/App.css';
let css = fs.readFileSync(path, 'utf8');

// Update --cmd-bottom for mobile
css = css.replace('--cmd-bottom: 90px;', '--cmd-bottom: 120px;');

fs.writeFileSync(path, css, 'utf8');
console.log('App.css updated with safer margin for mobile command button.');
