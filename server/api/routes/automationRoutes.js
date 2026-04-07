import express from 'express';
import {
  getAutomationStatus,
  sendTestEmail,
  sendTestWhatsApp,
  getEmailLogs,
  streamLogs,
} from '../controllers/automationController.js';

const router = express.Router();

router.get('/status', getAutomationStatus);
router.get('/email-logs', getEmailLogs);
router.get('/logs/stream', streamLogs);   // SSE real-time stream
router.post('/test-email', sendTestEmail);
router.post('/test-whatsapp', sendTestWhatsApp);

export default router;
