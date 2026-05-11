import { EventEmitter } from 'events';
import { fcm } from '../firebase.js';
import NotificationToken from '../models/NotificationToken.js';
import SiteSetting from '../models/SiteSetting.js';
import ChatMessage from '../models/ChatMessage.js';


/**
 * SnapAdda Automation Service
 * Email: Brevo (free 300/day — smtp-relay.brevo.com)
 * WhatsApp: whatsapp-web.js (link your own phone, free)
 * Real-time logs: Server-Sent Events via EventEmitter
 */
export const logEmitter = new EventEmitter();

const LOG_BUFFER = []; // last 100 events for admin panel

function pushLog(type, message, meta = {}) {
  const entry = { type, message, meta, timestamp: new Date().toISOString() };
  LOG_BUFFER.unshift(entry);
  if (LOG_BUFFER.length > 100) LOG_BUFFER.pop();
  logEmitter.emit('log', entry);
}

class AutomationService {
  constructor() {
    this.whatsappClient = null;
    this.whatsappReady = false;
    this.whatsappQR = null;
    this.whatsappEnabled = process.env.WHATSAPP_ENABLED === 'true';

    this._init();
  }

  async _init() {
    await this.refreshSettings();
    if (this.whatsappEnabled) this._initWhatsApp();
  }

  async refreshSettings() {
    try {
      const settings = await SiteSetting.findOne({ key: 'automation_settings' });
      if (settings?.value) {
        const { fcmVapid } = settings.value;
        if (fcmVapid) this.fcmVapid = fcmVapid;
      }
    } catch (err) {
      console.error('Failed to load automation settings:', err);
    }
  }

  /* ─── WHATSAPP SETUP ─── */
  async _initWhatsApp() {
    try {
      const { Client, LocalAuth } = await import('whatsapp-web.js');
      const qrcode = await import('qrcode-terminal');

      this.whatsappClient = new Client({
        authStrategy: new LocalAuth({ clientId: 'snapadda-bot' }),
        puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: true },
      });

      this.whatsappClient.on('qr', (qr) => {
        this.whatsappQR = qr;
        pushLog('whatsapp', '📱 QR code generated — scan with your phone', { qr });
        qrcode.generate(qr, { small: true });
      });

      this.whatsappClient.on('ready', () => {
        this.whatsappReady = true;
        this.whatsappQR = null;
        pushLog('whatsapp', '✅ WhatsApp connected and ready');
      });

      this.whatsappClient.on('disconnected', (reason) => {
        this.whatsappReady = false;
        pushLog('whatsapp', `⚠️ WhatsApp disconnected: ${reason}`);
        setTimeout(() => this._initWhatsApp(), 8000);
      });

      this.whatsappClient.on('message', async (msg) => {
        // Capture incoming message
        const chatMsg = await ChatMessage.create({
          number: msg.from.split('@')[0],
          body: msg.body,
          fromMe: false,
          senderName: msg._data?.notifyName || 'Lead'
        });
        
        // Push to log for live updates
        pushLog('whatsapp', `📩 New message from ${chatMsg.number}: ${msg.body.substring(0, 50)}...`, { 
          chatMessage: chatMsg 
        });

        // Optional: Trigger FCM to alert admin
        this.sendPushNotification({
          title: `💬 WhatsApp: ${chatMsg.senderName}`,
          body: msg.body.substring(0, 100),
          link: '/admin/comms'
        });
      });

      await this.whatsappClient.initialize();
    } catch (err) {
      pushLog('error', `❌ WhatsApp init failed: ${err.message}`);
    }
  }

  /* ─── SEND WHATSAPP ─── */
  async sendWhatsApp({ phone, message }) {
    if (!this.whatsappReady || !this.whatsappClient) {
      pushLog('whatsapp', `WhatsApp skipped (not connected) — to: ${phone}`);
      return { success: false, reason: 'WhatsApp not connected' };
    }
    try {
      const formatted = phone.replace(/\D/g, '');
      const withCountry = formatted.startsWith('91') ? formatted : `91${formatted}`;
      await this.whatsappClient.sendMessage(`${withCountry}@c.us`, message);
      
      // Save to chat history
      await ChatMessage.create({
        number: formatted,
        body: message,
        fromMe: true,
        senderName: 'Admin'
      });

      pushLog('whatsapp', `✅ WhatsApp sent to ${phone}`);
      return { success: true };
    } catch (err) {
      pushLog('error', `❌ WhatsApp failed to ${phone}: ${err.message}`);
      return { success: false, reason: err.message };
    }
  }

  /* ─── SEND PUSH NOTIFICATION (FCM) ─── */
  async sendPushNotification({ title, body, imageUrl, link }) {
    if (!fcm) {
      pushLog('system', 'Push notification skipped — FCM not initialized');
      return { success: false, reason: 'FCM not initialized' };
    }

    try {
      const tokens = await NotificationToken.find().distinct('token');
      if (tokens.length === 0) {
        pushLog('system', 'Push notification skipped — No registered tokens');
        return { success: false, reason: 'No registered tokens' };
      }

      const message = {
        notification: { title, body },
        data: { 
          click_action: link || '/',
          ...(imageUrl && { image: imageUrl })
        },
        tokens: tokens
      };

      const response = await fcm.sendEachForMulticast(message);
      
      const successCount = response.successCount;
      const failureCount = response.failureCount;

      pushLog('system', `🔔 Push notification sent to ${successCount} devices (${failureCount} failed)`);
      
      // Cleanup invalid tokens
      if (response.failureCount > 0) {
        const invalidTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success && (resp.error.code === 'messaging/registration-token-not-registered' || resp.error.code === 'messaging/invalid-registration-token')) {
            invalidTokens.push(tokens[idx]);
          }
        });
        if (invalidTokens.length > 0) {
          await NotificationToken.deleteMany({ token: { $in: invalidTokens } });
          pushLog('system', `🧹 Cleaned up ${invalidTokens.length} invalid FCM tokens`);
        }
      }

      return { success: true, successCount, failureCount };
    } catch (err) {
      pushLog('error', `❌ Push notification failed: ${err.message}`);
      return { success: false, reason: err.message };
    }
  }

  /* ─── AI INTERACTION ALERT ─── */
  async notifyAdminAIInsight({ type, clientContext, previewText }) {
    const title = type === 'inquiry' ? '🎯 High-Intent Inquiry Drafted' : '🤖 AI Concierge Interaction';
    const body = `${clientContext}: ${previewText.substring(0, 60)}...`;
    
    // Log it locally so it shows in the live stream
    pushLog(type === 'inquiry' ? 'lead' : 'inquiry', `AI Alert: User drafted ${type} for ${clientContext}`);
    
    // Send push notification to all admins
    return this.sendPushNotification({
      title,
      body,
      link: '/admin/comms'
    });
  }

  /* ─── AUTOMATED LEAD RESPONSE ─── */
  async handleNewLead(lead) {
    pushLog('lead', `🎯 New lead received: ${lead.name} (${lead.phone})`);
    // AI Drafting Removed
  }

  /* ─── AUTOMATED INQUIRY RESPONSE ─── */
  async handleNewInquiry(inquiry) {
    pushLog('inquiry', `💬 New inquiry from: ${inquiry.clientName}`);
    // AI Drafting Removed
  }

  /* ─── REAL-TIME STATE ─── */
  async getStatus() {
    const tokenCount = await NotificationToken.countDocuments();
    return {
      whatsapp: { enabled: this.whatsappEnabled, connected: this.whatsappReady, pendingQR: !!this.whatsappQR, qr: this.whatsappQR },
      fcm: { enabled: !!fcm, tokenCount, vapidConfigured: !!this.fcmVapid },
      recentLogs: LOG_BUFFER.slice(0, 20),
    };
  }

  getLogBuffer() { return LOG_BUFFER; }
}

export const automationService = new AutomationService();

// Intercept console.error for real-time error streaming to admin
const _origError = console.error.bind(console);
console.error = (...args) => {
  _origError(...args);
  pushLog('error', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
};
