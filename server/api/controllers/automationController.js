import { automationService, logEmitter } from '../modules/automationService.js';

export const getAutomationStatus = async (req, res) => {
  try {
    res.json({ status: 'success', data: automationService.getStatus() });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getEmailLogs = async (req, res) => {
  try {
    const status = automationService.getStatus();
    res.json({ status: 'success', data: status.recentLogs });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const sendTestEmail = async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) return res.status(400).json({ status: 'fail', message: '`to` email required' });
    const result = await automationService.sendEmail({
      to,
      subject: 'SnapAdda — Automation Test ✅',
      body: `Hello!\n\nYour email automation is working perfectly.\nPowered by Brevo SMTP (free 300/day) + SnapAdda AI.\n\n— SnapAdda Admin`,
    });
    res.json({ status: result.success ? 'success' : 'error', data: result });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const sendTestWhatsApp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ status: 'fail', message: '`phone` number required' });
    const result = await automationService.sendWhatsApp({
      phone,
      message: `Hello from SnapAdda! 👋\n\nYour WhatsApp automation is active.\nThis message was sent by *SnapAdda AI*.\n\n🏠 Browse: https://snapadda.com`,
    });
    res.json({ status: result.success ? 'success' : 'error', data: result });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
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
