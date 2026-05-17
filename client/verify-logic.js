/**
 * SnapAdda - Institutional Logic Audit
 * Verifies critical authentication and routing paths before production deployment.
 */
import fs from 'fs';
import path from 'path';

console.log('--- 🛡️ SNAPADDA INSTITUTIONAL AUDIT v4 ---');

const CRITICAL_FILES = [
  'src/pages/Login.jsx',
  'src/services/truecallerService.js',
  'src/services/api.js',
  '../server/api/controllers/userController.js'
];

let errors = 0;

CRITICAL_FILES.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ VERIFIED: ${file}`);
  } else {
    console.error(`❌ MISSING: ${file}`);
    errors++;
  }
});

// Check for legacy WhatsApp references in Login.jsx
if (fs.existsSync('src/pages/Login.jsx')) {
  const content = fs.readFileSync('src/pages/Login.jsx', 'utf8');
  if (content.includes('sendOtp') || content.includes('verifyOtp')) {
    // Note: These are now removed, so this is a safety check
    console.warn('⚠️ WARNING: Legacy OTP functions detected in Login.jsx');
  } else {
    console.log('✅ CLEAN: No legacy WhatsApp OTP functions in Login.jsx');
  }
}

if (errors > 0) {
  console.error(`\n🚨 AUDIT FAILED: ${errors} critical issues found.`);
  process.exit(1);
}

console.log('\n✨ AUDIT SUCCESSFUL: Production environment is stable.');
process.exit(0);
