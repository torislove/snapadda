import express from 'express';
import {
  getAutomationStatus,
  sendTestEmail,
  sendTestWhatsApp,
  getEmailLogs,
  streamLogs,
} from '../controllers/automationController.js';

const router = express.Router();

// Real-time & Status
router.get('/status', getAutomationStatus);
router.get('/logs', getEmailLogs);
router.get('/logs/stream', streamLogs);

// Testing
router.post('/test-email', sendTestEmail);
router.post('/test-whatsapp', sendTestWhatsApp);

export default router;
