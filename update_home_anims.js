const fs = require('fs');
const path = 'client/src/pages/Home.jsx';
let content = fs.readFileSync(path, 'utf8');

// Update useSpring for search platform tilt
content = content.replace(
  'const smx = useSpring(mx), smy = useSpring(my);',
  'const smx = useSpring(mx, { stiffness: 300, damping: 30 }), smy = useSpring(my, { stiffness: 300, damping: 30 });'
);

// Update RecentlySoldTicker transition
content = content.replace(
  "transition: 'opacity 0.3s ease', opacity: visible ? 1 : 0",
  "transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)', opacity: visible ? 1 : 0, transform: visible ? 'scale(1)' : 'scale(0.98)'"
);

// Update motion.div inside sortedProperties.map
content = content.replace(
  'initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}',
  "initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ type: 'spring', stiffness: 260, damping: 20, delay: i * 0.05 }}"
);

fs.writeFileSync(path, content, 'utf8');
console.log('Home.jsx animation updates applied.');
