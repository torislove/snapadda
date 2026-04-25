const fs = require('fs');

try {
  let current = fs.readFileSync('client/src/pages/Home.jsx', 'utf8');
  const old = fs.readFileSync('temp_home2.jsx', 'utf8');

  // We are replacing <section className="hero-cinematic"> ... </section>
  const regexCurrent = /<section className="hero-cinematic">[\s\S]*?<\/section>/;
  const matchCurrent = current.match(regexCurrent);

  if(!matchCurrent) {
    console.log('Failed to match current hero-cinematic');
    process.exit(1);
  }

  const matchOldSearch = old.match(/<section id="search" className="search-section"[\s\S]*?<\/section>/);
  const matchOldHero = old.match(/<section className="hero-section"[\s\S]*?<\/section>/);

  if(!matchOldSearch || !matchOldHero) {
    console.log('Failed to match old blocks');
    process.exit(1);
  }

  const replacement = matchOldSearch[0] + '\n\n        ' + matchOldHero[0];
  const updated = current.replace(regexCurrent, replacement);

  fs.writeFileSync('client/src/pages/Home.jsx', updated, 'utf8');
  console.log('Successfully reverted hero & search');
} catch (error) {
  console.error(error);
}
