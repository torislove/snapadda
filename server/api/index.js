import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { v2 as cloudinary } from 'cloudinary';
import { onRequest } from "firebase-functions/v2/https";
import './firebase.js'; // Ensure Firebase is initialized


// Critical Environment Check
console.log('--- PRODUCTION_ENV_DIAGNOSTICS ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI_PROVIDED:', !!process.env.MONGODB_URI);
console.log('CLOUDINARY_NAME_PROVIDED:', !!process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_KEY_PROVIDED:', !!process.env.CLOUDINARY_API_KEY);
console.log('DB_FIREBASE_URL_PROVIDED:', !!process.env.DB_FIREBASE_URL);
console.log('----------------------------------');

// ─── MEGA SEO ENGINE V1.2 (Active Indexing) ───
const app = express();


// Security & Optimization Middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(compression());

// Handle CORS early and consistently
const allowedOrigins = [
  'https://snapadda-7a6e6.web.app',
  'https://snapadda-7a6e6.firebaseapp.com',
  'https://snapaddaadmin.web.app',
  'https://snapaddaadmin.firebaseapp.com',
  'https://www.snapadda.com',
  'https://snapadda.com',
  'https://admin.snapadda.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' })); // Support for large form data payloads

// Rate Limiting & Proxy Trust (Critical for Firebase/Cloud Functions)
app.set('trust proxy', 1); 

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { status: 'error', message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);


// 1. Basic Health Check (Must be at the TOP (to respond even if DB is still connecting))
// Base health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Root health check reached' });
});

// consolidated health check below


// Alternative media health check
app.get('/media-health', (req, res) => {
  res.json({ status: 'success', message: 'Media health check (no prefix) reached' });
});

// Direct diagnostic route for media
app.get('/api/media-health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'Direct media health check reached',
    cloudinary_keys: {
      name: !!process.env.CLOUDINARY_CLOUD_NAME,
      key: !!process.env.CLOUDINARY_API_KEY
    }
  });
});

// Cloudinary Configuration
const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
const api_key = process.env.CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRET;

if (cloud_name && api_key && api_secret) {
  cloudinary.config({ cloud_name, api_key, api_secret });
}

// 2. Optimized MongoDB Connection for Serverless (with auto-reconnect)
let connectionPromise = null;

const connectDB = async () => {
  // If already connected, return immediately
  if (mongoose.connection.readyState === 1) return;
  // If a connection is in progress, wait for it
  if (connectionPromise) return connectionPromise;

  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/snapadda';
  
  connectionPromise = mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 3000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
  }).then(() => {
    console.log('AUTO_INIT: MongoDB connection established');
    connectionPromise = null; // Reset so reconnect can happen
  }).catch((err) => {
    connectionPromise = null;
    console.error('CRITICAL: MongoDB connection error:', err.message);
    throw err;
  });

  return connectionPromise;
};

// Auto-reconnect on disconnect
mongoose.connection.on('disconnected', () => {
  console.warn('MONGO_DISCONNECTED: Attempting reconnect...');
  connectionPromise = null;
  connectDB().catch(console.error);
});

// Immediate connection attempt removed to avoid side-effects during Firebase deployment analysis
// connectDB().catch(console.error);

// Middleware to ensure DB connection before any route
app.use(async (req, res, next) => {
  // Skip DB check for health/warmup endpoints
  if (req.path === '/health' || req.path === '/api/health' || req.path === '/api/warmup' || req.path === '/warmup') {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ status: 'error', message: 'Database temporarily unavailable. Please retry.' });
  }
});

// Warmup endpoint — call this before login to pre-warm the DB connection
app.get('/api/warmup', async (req, res) => {
  try {
    await connectDB();
    res.json({ status: 'warm', db: mongoose.connection.readyState === 1 ? 'connected' : 'connecting', ts: Date.now() });
  } catch (err) {
    res.status(503).json({ status: 'cold', error: err.message });
  }
});
app.get('/warmup', async (req, res) => {
  try {
    await connectDB();
    res.json({ status: 'warm', db: mongoose.connection.readyState === 1 ? 'connected' : 'connecting' });
  } catch (err) {
    res.status(503).json({ status: 'cold' });
  }
});


// 3. API Routes (Restored relative paths, no internal movements)
import propertyRoutes from './routes/propertyRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import seoRoutes from './routes/seoRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import adminStatsRoute from './routes/adminStatsRoute.js';
import contactRoutes from './routes/contactRoutes.js';
import districtRoutes from './routes/districtRoutes.js';
import cityRoutes from './routes/cityRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import promotionRoutes from './routes/promotionRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import automationRoutes from './routes/automationRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import { getSitemap } from './controllers/seoController.js';

import { automationService } from './modules/automationService.js';

// 3. Resilient API Routing (Handled by a unified router for Cloud vs Local)
const apiRouter = express.Router();

apiRouter.use('/properties', propertyRoutes);
apiRouter.use('/cities', cityRoutes);
apiRouter.use('/settings', settingRoutes);
apiRouter.use('/seo', seoRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.post('/users/otp/send', (req, res, next) => {
  console.log('DEBUG: Hit /api/users/otp/send directly');
  next();
});
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/admin', adminStatsRoute);
apiRouter.use('/inquiries', inquiryRoutes);
apiRouter.use('/leads', leadRoutes);
apiRouter.use('/contacts', contactRoutes);
apiRouter.use('/districts', districtRoutes);
apiRouter.use('/media', mediaRoutes);
apiRouter.use('/promotions', promotionRoutes);
apiRouter.use('/testimonials', testimonialRoutes);
apiRouter.use('/questions', questionRoutes);
apiRouter.use('/automation', automationRoutes);
apiRouter.use('/activity', activityRoutes);
apiRouter.get('/sitemap.xml', getSitemap);

// Attach the unified router to both prefixed and root paths
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Standard Response Logic
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI_SET: !!process.env.MONGODB_URI,
      CLOUDINARY_SET: !!process.env.CLOUDINARY_CLOUD_NAME,
      FIREBASE_URL_SET: !!process.env.DB_FIREBASE_URL
    },
    platform: process.platform
  });
});

// Elite Admin Diagnostic — Exposed for internal integrity audits
import { runFullDiagnostic } from './diagnostic.js';
app.get('/api/admin/system-check', async (req, res) => {
  try {
    const diagnostic = await runFullDiagnostic();
    res.status(diagnostic.overall === 'ELITE' ? 200 : 207).json(diagnostic);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Deep health check — probes actual connectivity status
app.get('/api/health/deep', async (req, res) => {
  const mongoStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  const mongoState = mongoose.connection.readyState;
  const mongoOk = mongoState === 1;

  // Cloudinary: verify config is loaded (keys are non-empty strings)
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const cloudKey = process.env.CLOUDINARY_API_KEY;
  const cloudSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudinaryConfigured = !!(cloudName && cloudKey && cloudSecret &&
    cloudName !== 'your_cloud_name' && cloudKey !== 'your_api_key');

  // Try a lightweight Cloudinary ping (only if configured)
  let cloudinaryOk = false;
  let cloudinaryMessage = '';
  if (cloudinaryConfigured) {
    try {
      // ping() is available in cloudinary SDK — lightweight API call
      await cloudinary.api.ping({ timeout: 4000 });
      cloudinaryOk = true;
      cloudinaryMessage = 'Cloudinary API reachable';
    } catch (err) {
      // If we get a 420 (Rate Limit Exceeded), it means the service IS reachable and keys are correct
      if (err.error?.http_code === 420) {
        cloudinaryOk = true; 
        cloudinaryMessage = 'Cloudinary OK (Rate Limited)';
      } else {
        cloudinaryOk = false;
        cloudinaryMessage = err.message || 'Cloudinary ping failed';
      }
    }
  } else {
    cloudinaryMessage = 'Cloudinary not configured';
  }

  const allOk = mongoOk && cloudinaryOk;

  res.status(allOk ? 200 : 207).json({
    status: allOk ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      server: { ok: true, message: 'Express server running' },
      mongodb: {
        ok: mongoOk,
        state: mongoStates[mongoState] || 'unknown',
        message: mongoOk ? 'Connected to MongoDB Atlas' : `MongoDB is ${mongoStates[mongoState] || 'unknown'}`
      },
      cloudinary: {
        ok: cloudinaryOk,
        configured: cloudinaryConfigured,
        cloudName: cloudName ? `${cloudName.slice(0, 3)}***` : null,
        message: cloudinaryMessage
      }
    }
  });
});

// Catch-all 404 Diagnostic
app.use((req, res) => {
  console.log('404_NOT_FOUND_PATH:', req.originalUrl);
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    suggestion: 'Try checking /api/health to verify base URL'
  });
});

// ─── Global Error Handling Middleware (MUST be last, after all routes) ───
// Express identifies error handlers by their 4-argument signature (err, req, res, next)
app.use((err, req, res, next) => {
  console.error('SERVER_ERROR:', err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred'
      : err.message
  });
});

// Export for Firebase Functions
export const api = onRequest({ 
  memory: "1GiB",
  timeoutSeconds: 300,
  maxInstances: 10,
  // We handle CORS manually in Express middleware above
}, app);

// Local Development Fallback
// Only run the server if explicitly started via 'npm start' and NOT in a Firebase/Function environment
if (process.env.npm_lifecycle_event === 'start' && !process.env.FUNCTIONS_EMULATOR && !process.env.FIREBASE_CONFIG) {
  const PORT = process.env.PORT || 5000;
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Server fully running locally on port ${PORT}`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ PORT_ERROR: Port ${PORT} is already in use. Try: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force`);
      } else {
        console.error('❌ SERVER_START_ERROR:', err);
      }
    });
  } catch (err) {
    console.error('❌ FATAL_START_ERROR:', err);
  }
}
