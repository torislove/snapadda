const fs = require('fs');
const path = require('path');

const clientFiles = [
  'client/src/components/LeadCaptureModal.jsx',
  'client/src/components/MobileBottomNav.jsx',
  'client/src/components/PropertyCard.jsx',
  'client/src/pages/PostProperty.jsx',
  'client/src/pages/Home.jsx',
];

const adminFiles = [
  'admin/src/pages/admin/Settings.tsx',
  'admin/src/pages/admin/Leads.tsx',
  'admin/src/pages/admin/Layout.tsx',
];

const processFile = (filePath) => {
  const absolutePath = path.join(__dirname, filePath);
  if (!fs.existsSync(absolutePath)) {
    console.log(`Skipping ${filePath} (not found)`);
    return;
  }
  let content = fs.readFileSync(absolutePath, 'utf8');

  // Remove import statement
  content = content.replace(/import\s+{\s*triggerHaptic\s*}\s*from\s*['"].*haptics['"];?\n?/g, '');

  // Remove standalone triggerHaptic calls (e.g. triggerHaptic('light');)
  content = content.replace(/triggerHaptic\([^)]*\);?/g, '');

  // In arrow functions onClick={() => triggerHaptic('light')} we need to remove it
  // If it's onClick={() => triggerHaptic('light')} it becomes onClick={() => {}} 
  // We'll replace `() => triggerHaptic('light')` with `() => {}`
  content = content.replace(/\(\)\s*=>\s*triggerHaptic\([^)]*\)/g, '() => {}');

  fs.writeFileSync(absolutePath, content);
  console.log(`Updated ${filePath}`);
};

clientFiles.concat(adminFiles).forEach(processFile);

// Remove the utils files
const utilsFiles = [
  'client/src/utils/haptics.js',
  'client/src/utils/haptics.ts',
  'admin/src/utils/haptics.js',
  'admin/src/utils/haptics.ts',
];

utilsFiles.forEach(file => {
  const absolutePath = path.join(__dirname, file);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
    console.log(`Deleted ${file}`);
  }
});
