const babel = require('@babel/core');
const fs = require('fs');
try {
  babel.parseSync(fs.readFileSync('src/App.jsx', 'utf8'), {filename: 'src/App.jsx', presets: ['@babel/preset-react']});
  console.log("No syntax errors");
} catch(e) {
  console.log(e.message);
}
