import { automationService, logEmitter } from '../modules/automationService.js';
import NotificationToken from '../models/NotificationToken.js';
import ChatMessage from '../models/ChatMessage.js';

export const getAutomationStatus = async (req, res) => {
  try {
    const status = await automationService.getStatus();
    res.json({ status: 'success', data: status });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getChatList = async (req, res) => {
  try {
    const list = await ChatMessage.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: {
          _id: '$number',
          lastMessage: { $first: '$body' },
          lastTimestamp: { $first: '$timestamp' },
          senderName: { $first: '$senderName' },
          fromMe: { $first: '$fromMe' }
      }},
      { $sort: { lastTimestamp: -1 } }
    ]);
    res.json({ status: 'success', data: list });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const { number } = req.params;
    if (!number) return res.status(400).json({ status: 'fail', message: 'Number required' });
    const formatted = number.replace(/\D/g, '');
    const history = await ChatMessage.find({ number: formatted }).sort({ timestamp: 1 });
    res.json({ status: 'success', data: history });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const sendTestWhatsApp = async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone) return res.status(400).json({ status: 'fail', message: '`phone` number required' });
    const result = await automationService.sendWhatsApp({
      phone,
      message: message || `Hello from SnapAdda! 👋\n\nYour WhatsApp automation is active.\n\n🏠 Browse: https://snapadda.com`,
    });
    res.json({ status: result.success ? 'success' : 'error', data: result });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const registerToken = async (req, res) => {
  res.json({ status: 'success', message: 'FCM Decommissioned' });
};

export const sendPushNotification = async (req, res) => {
  res.status(410).json({ status: 'error', message: 'Push Notifications Decommissioned' });
};

/**
 * SSE: Real-time log streaming to admin panel
 * Client connects to GET /api/automation/logs/stream
 * Server pushes events as they happen
 */
export const streamLogs = (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Nginx passthrough
  res.flushHeaders();

  // Send buffered history immediately
  const history = automationService.getLogBuffer();
  res.write(`data: ${JSON.stringify({ type: 'history', logs: history })}\n\n`);

  // Push new events as they come
  const onLog = (entry) => {
    res.write(`data: ${JSON.stringify(entry)}\n\n`);
  };
  logEmitter.on('log', onLog);

  // Heartbeat every 20s to prevent proxy timeouts
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 20000);

  // Cleanup on disconnect
  req.on('close', () => {
    logEmitter.off('log', onLog);
    clearInterval(heartbeat);
  });
};

export const notifyAIInteraction = async (req, res) => {
  try {
    const { type, clientContext, previewText } = req.body;
    const result = await automationService.notifyAdminAIInsight({ type, clientContext, previewText });
    res.json({ status: result.success ? 'success' : 'error', data: result });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
