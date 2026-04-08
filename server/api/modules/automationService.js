import nodemailer from 'nodemailer';
import { EventEmitter } from 'events';


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
    this.emailTransporter = null;
    this.whatsappClient = null;
    this.whatsappReady = false;
    this.whatsappQR = null;
    this.emailEnabled = !!(process.env.BREVO_SMTP_KEY || process.env.SMTP_PASS);
    this.whatsappEnabled = process.env.WHATSAPP_ENABLED === 'true';

    this._initEmail();
    if (this.whatsappEnabled) this._initWhatsApp();
  }

  /* ─── BREVO (FREE SMTP) SETUP ─── */
  _initEmail() {
    if (!this.emailEnabled) {
      pushLog('system', 'Email automation disabled — add BREVO_SMTP_KEY to .env');
      return;
    }

    // Brevo SMTP config (free tier: 300 emails/day)
    this.emailTransporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_LOGIN || process.env.SMTP_USER,
        pass: process.env.BREVO_SMTP_KEY || process.env.SMTP_PASS,
      },
    });
    pushLog('system', '📧 Brevo SMTP initialized (free 300 emails/day)');
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

      await this.whatsappClient.initialize();
    } catch (err) {
      pushLog('error', `❌ WhatsApp init failed: ${err.message}`);
    }
  }

  /* ─── SEND EMAIL ─── */
  async sendEmail({ to, subject, body }) {
    if (!this.emailEnabled || !this.emailTransporter) {
      pushLog('email', `Email skipped (disabled) — to: ${to}`);
      return { success: false, reason: 'Email not configured' };
    }
    try {
      const info = await this.emailTransporter.sendMail({
        from: `"SnapAdda Premium Real Estate" <${process.env.BREVO_SMTP_LOGIN || process.env.SMTP_USER}>`,
        to,
        subject,
        html: this._wrapEmailHTML(body),
      });
      pushLog('email', `✅ Email sent to ${to}`, { subject, messageId: info.messageId });
      return { success: true, messageId: info.messageId };
    } catch (err) {
      pushLog('error', `❌ Email failed to ${to}: ${err.message}`);
      return { success: false, reason: err.message };
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
      pushLog('whatsapp', `✅ WhatsApp sent to ${phone}`);
      return { success: true };
    } catch (err) {
      pushLog('error', `❌ WhatsApp failed to ${phone}: ${err.message}`);
      return { success: false, reason: err.message };
    }
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
  getStatus() {
    return {
      email: { enabled: this.emailEnabled, provider: 'Brevo (Free 300/day)', fromAddress: process.env.BREVO_SMTP_LOGIN || process.env.SMTP_USER || null },
      whatsapp: { enabled: this.whatsappEnabled, connected: this.whatsappReady, pendingQR: !!this.whatsappQR, qr: this.whatsappQR },
      recentLogs: LOG_BUFFER.slice(0, 20),
    };
  }

  getLogBuffer() { return LOG_BUFFER; }

  /* ─── BRANDED EMAIL HTML ─── */
  _wrapEmailHTML(body) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:'Georgia',serif;background:#0a0a15;color:#e0e0e0;margin:0;padding:0}.container{max-width:600px;margin:0 auto;padding:40px 30px}.header{border-bottom:2px solid #d4af37;padding-bottom:20px;margin-bottom:30px}.logo{font-size:24px;font-weight:900;color:#d4af37;letter-spacing:.1em}.sub{font-size:11px;color:#888;letter-spacing:.2em;text-transform:uppercase}.body-text{line-height:1.7;color:#ccc;font-size:15px;white-space:pre-wrap}.footer{margin-top:40px;padding-top:20px;border-top:1px solid #222;font-size:11px;color:#555;text-align:center}.cta{display:inline-block;margin:20px 0;padding:12px 28px;background:#d4af37;color:#000;font-weight:700;text-decoration:none;border-radius:6px}</style></head><body><div class="container"><div class="header"><div class="logo">SNAP ADDA</div><div class="sub">Premium Real Estate · Andhra Pradesh</div></div><div class="body-text">${body.replace(/\n/g, '<br>')}</div><a href="https://snapadda.com" class="cta">Browse Properties</a><div class="footer">SnapAdda Real Estate | Andhra Pradesh, India</div></div></body></html>`;
  }
}

export const automationService = new AutomationService();

// Intercept console.error for real-time error streaming to admin
const _origError = console.error.bind(console);
console.error = (...args) => {
  _origError(...args);
  pushLog('error', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
};
