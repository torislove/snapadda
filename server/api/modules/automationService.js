import { EventEmitter } from 'events';
import { db } from '../firebase.js';
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
    
    // Start periodic scanning for unverified properties (every hour)
    setInterval(() => this.scanUnverifiedProperties(), 60 * 60 * 1000);
    // Run once on startup after 10s
    setTimeout(() => this.scanUnverifiedProperties(), 10000);
  }


  async refreshSettings() {
    try {
      const settings = await SiteSetting.findOne({ key: 'automation_settings' });
      if (settings?.value) {
        const { fcmVapid } = settings.value;
        // fcmVapid removed
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

        // Optional: Trigger FCM removed
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

  /* ─── SEND PUSH NOTIFICATION (REMOVED) ─── */
  async sendPushNotification() {
    return { success: false, reason: 'Decommissioned' };
  }

  /* ─── AI INTERACTION ALERT ─── */
  /* ─── AI INTERACTION ALERT ─── */
  async notifyAdminAIInsight({ type, clientContext, previewText }) {
    pushLog(type === 'inquiry' ? 'lead' : 'inquiry', `AI Alert: User drafted ${type} for ${clientContext}`);
    return { success: true };
  }

  /* ─── AUTOMATED LEAD RESPONSE & ROUTING ─── */
  async handleNewLead(lead) {
    pushLog('lead', `🎯 Processing new lead: ${lead.name} (${lead.phone})`);
    
    // Auto-Routing Logic (Phase 5)
    const district = (lead.district || '').toLowerCase();
    const districtMap = {
      'vijayawada': 'franchise_vja_01',
      'guntur': 'franchise_gnt_01',
      'amaravati': 'franchise_ama_01',
      'visakhapatnam': 'franchise_viz_01',
      'kakinada': 'franchise_kkd_01',
      'tirupati': 'franchise_tpt_01'
    };

    if (districtMap[district]) {
      lead.franchiseId = districtMap[district];
      lead.assignedTo = `District Manager (${lead.district})`;
      pushLog('automation', `🔀 Lead routed to ${lead.assignedTo} based on district: ${lead.district}`);
    } else {
      lead.assignedTo = 'Super Admin';
      pushLog('automation', `🔀 Lead unrouted — assigned to Super Admin. District: ${lead.district || 'N/A'}`);
    }

    await lead.save();
  }

  /* ─── AUTOMATED INQUIRY RESPONSE ─── */
  async handleNewInquiry(inquiry) {
    pushLog('inquiry', `💬 New inquiry from: ${inquiry.clientName}`);
    // AI Drafting Removed
  }

  /* ─── UNVERIFIED MONITORING ─── */
  async scanUnverifiedProperties() {
    try {
      const Property = (await import('../models/Property.js')).default;
      const unverifiedCount = await Property.countDocuments({ isVerified: false, status: 'Active' });
      
      if (unverifiedCount > 0) {
        pushLog('automation', `🚨 CRITICAL: ${unverifiedCount} properties are currently LIVE but UNVERIFIED.`);
        // In a real production environment, this would trigger an SMS/Push to the Super Admin
      }
      return unverifiedCount;
    } catch (err) {
      console.error('Unverified scan failed:', err);
    }
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
