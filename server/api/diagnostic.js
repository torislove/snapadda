import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { db } from './firebase.js';

// Ensure DB connects for diagnostic
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/snapadda';
if (mongoose.connection.readyState === 0) {
  mongoose.connect(MONGODB_URI).catch(e => console.error('DIAG_DB_ERR:', e));
}

export const runFullDiagnostic = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    mongodb: { status: 'testing', latency: 0 },
    cloudinary: { status: 'testing' },
    firebase: { status: 'testing' },
    overall: 'checking'
  };

  // 1. MongoDB Diagnostic
  try {
    const start = Date.now();
    // Ensure DB is connected
    if (mongoose.connection.readyState !== 1) {
      const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/snapadda';
      await mongoose.connect(MONGODB_URI);
    }
    // Test a simple query on the database
    await mongoose.connection.db.admin().ping();
    results.mongodb.latency = Date.now() - start;
    results.mongodb.status = 'healthy';
    results.mongodb.details = `Connected to Cluster0 (ReadyState: ${mongoose.connection.readyState})`;
  } catch (err) {
    results.mongodb.status = 'error';
    results.mongodb.details = err.message;
  }

  // 2. Cloudinary Diagnostic
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const cloudKey = process.env.CLOUDINARY_API_KEY;
    const cloudSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !cloudKey || !cloudSecret) {
      throw new Error('Cloudinary credentials missing in environment');
    }

    // Configure before ping
    cloudinary.config({ 
      cloud_name: cloudName, 
      api_key: cloudKey, 
      api_secret: cloudSecret 
    });

    // Ping Cloudinary API
    const ping = await cloudinary.api.ping();
    results.cloudinary.status = ping.status === 'ok' ? 'healthy' : 'degraded';
    results.cloudinary.details = `Cloud: ${cloudName.slice(0, 3)}*** | API Key: Verified`;
  } catch (err) {
    results.cloudinary.status = 'error';
    results.cloudinary.details = err.message;
  }

  // 3. Firebase Diagnostic
  try {
    if (!db) throw new Error('Firebase RTDB not initialized');
    
    // Check if we can reach the DB URL
    const dbUrl = process.env.VITE_RTDB_URL || process.env.DB_FIREBASE_URL;
    results.firebase.status = dbUrl ? 'healthy' : 'warning';
    results.firebase.details = dbUrl ? `Target: ${dbUrl}` : 'RTDB URL missing, sync might fail';
  } catch (err) {
    results.firebase.status = 'error';
    results.firebase.details = err.message;
  }

  // Calculate overall status
  const issues = Object.values(results).filter(v => v.status === 'error').length;
  results.overall = issues === 0 ? 'ELITE' : (issues < 2 ? 'DEGRADED' : 'CRITICAL');

  return results;
};

// If run directly via node
if (process.env.npm_lifecycle_event === 'diagnostic') {
  console.log('--- STARTING ELITE BACKEND DIAGNOSTIC ---');
  runFullDiagnostic().then(res => {
    console.log(JSON.stringify(res, null, 2));
    process.exit(res.overall === 'ELITE' ? 0 : 1);
  });
}
