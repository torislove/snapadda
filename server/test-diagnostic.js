import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

// Critical Environment Check
console.log('--- TEST_DIAGNOSTIC_INIT ---');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'LOADED' : 'MISSING');

import { runFullDiagnostic } from './api/diagnostic.js';

const start = async () => {
  try {
    // Manually connect mongoose first if not already connected (needed for standalone script)
    if (mongoose.connection.readyState !== 1) {
      console.log('Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI);
    }
    
    console.log('Running Diagnostic...');
    const results = await runFullDiagnostic();
    console.log('====================================');
    console.log('DIAGNOSTIC RESULTS:');
    console.log(JSON.stringify(results, null, 2));
    console.log('====================================');
    
    await mongoose.disconnect();
    process.exit(results.overall === 'ELITE' ? 0 : 1);
  } catch (err) {
    console.error('DIAGNOSTIC_FAILURE:', err);
    process.exit(1);
  }
};

start();
