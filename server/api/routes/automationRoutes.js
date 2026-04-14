import express from 'express';
import {
  getAutomationStatus,
  getChatList,
  getChatHistory,
  sendTestWhatsApp,
  streamLogs,
  registerToken,
  sendPushNotification,
  notifyAIInteraction,
} from '../controllers/automationController.js';

const router = express.Router();

// Real-time & Status
router.get('/status', getAutomationStatus);
router.get('/chat/list', getChatList);
router.get('/chat/history/:number', getChatHistory);
router.get('/logs/stream', streamLogs);

// Testing & Messaging
router.post('/send-whatsapp', sendTestWhatsApp);
router.post('/register-token', registerToken);
router.post('/send-push', sendPushNotification);
router.post('/notify-interaction', notifyAIInteraction);

export default router;
