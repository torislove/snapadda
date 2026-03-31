import fs from 'fs';
import path from 'path';

const apiPath = path.join(process.cwd(), 'api');
const libPath = path.join(apiPath, 'lib');

try {
  if (!fs.existsSync(libPath)) {
    fs.mkdirSync(libPath);
    console.log('Created lib directory');
  }

  const dirsToMove = ['routes', 'models', 'controllers', 'modules', 'data'];

  for (const dir of dirsToMove) {
    const src = path.join(apiPath, dir);
    const dest = path.join(libPath, dir);
    if (fs.existsSync(src)) {
      fs.renameSync(src, dest);
      console.log(`Successfully moved ${dir} to lib/`);
    } else {
      console.log(`Source ${dir} does not exist`);
    }
  }

  const healthPath = path.join(apiPath, 'health.js');
  if (fs.existsSync(healthPath)) {
    fs.unlinkSync(healthPath);
    console.log('Deleted health.js');
  }
} catch (error) {
  console.error('Error during move operation:', error);
}
