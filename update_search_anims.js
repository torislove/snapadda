const fs = require('fs');
const path = 'client/src/pages/SearchResults.jsx';
let content = fs.readFileSync(path, 'utf8');

// Update SearchResults.jsx spring
content = content.replace(
  "transition: { type: 'spring', stiffness: 350, damping: 35 }",
  "transition: { type: 'spring', stiffness: 400, damping: 30 }"
);

// Update staggerChildren for faster feel
content = content.replace(
  'transition: { staggerChildren: 0.1 }',
  'transition: { staggerChildren: 0.05 }'
);

fs.writeFileSync(path, content, 'utf8');
console.log('SearchResults.jsx animation updates applied.');
