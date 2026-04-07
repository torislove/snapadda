import { useState, useEffect, useRef } from 'react';
import { 
  Mail, MessageCircle, Wifi, WifiOff, Send, RefreshCcw,
  Terminal, Bot, Activity, Phone, AtSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Log type colors & icons
const LOG_TYPE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  email:    { color: '#22d9e0', bg: 'rgba(34,217,224,0.08)',  label: 'EMAIL'    },
  whatsapp: { color: '#10d98c', bg: 'rgba(16,217,140,0.08)',  label: 'WHATSAPP' },
  lead:     { color: '#9b59f5', bg: 'rgba(155,89,245,0.08)', label: 'LEAD'     },
  inquiry:  { color: '#ff8c42', bg: 'rgba(255,140,66,0.08)', label: 'INQUIRY'  },
  error:    { color: '#f5397b', bg: 'rgba(245,57,123,0.08)', label: 'ERROR'    },
  system:   { color: '#d4af37', bg: 'rgba(212,175,55,0.08)',  label: 'SYSTEM'   },
};

const LogEntry = ({ entry }: { entry: any }) => {
  const cfg = LOG_TYPE_CONFIG[entry.type] || LOG_TYPE_CONFIG.system;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      style={{ 
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        padding: '8px 12px', borderRadius: '8px', background: cfg.bg,
        borderLeft: `3px solid ${cfg.color}`, marginBottom: '6px'
      }}
    >
      <span style={{ 
        fontSize: '0.55rem', fontWeight: 900, color: cfg.color, 
        background: `${cfg.bg}`, border: `1px solid ${cfg.color}33`,
        padding: '2px 6px', borderRadius: '4px', flexShrink: 0, 
        letterSpacing: '0.08em', marginTop: '2px'
      }}>{cfg.label}</span>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', flex: 1, lineHeight: 1.4 }}>
        {entry.message}
      </span>
      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', flexShrink: 0 }}>
        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
    </motion.div>
  );
};

const CommsHub = () => {
  const [status, setStatus] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [sseConnected, setSseConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'email' | 'whatsapp'>('logs');
  const [testEmail, setTestEmail] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [sending, setSending] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const logsEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Fetch initial status
  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/automation/status`);
      const data = await res.json();
      if (data.status === 'success') setStatus(data.data);
    } catch (err) { console.error('Status fetch failed', err); }
  };

  // SSE connection for real-time logs
  useEffect(() => {
    fetchStatus();

    const connect = () => {
      const es = new EventSource(`${API_URL}/automation/logs/stream`);
      eventSourceRef.current = es;

      es.onopen = () => setSseConnected(true);

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'history') {
            setLogs(data.logs);
          } else {
            setLogs(prev => [data, ...prev].slice(0, 100));
          }
        } catch {}
      };

      es.onerror = () => {
        setSseConnected(false);
        es.close();
        setTimeout(connect, 5000); // Auto-reconnect
      };
    };

    connect();
    const statusPoll = setInterval(fetchStatus, 15000);

    return () => {
      eventSourceRef.current?.close();
      clearInterval(statusPoll);
    };
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleTestEmail = async () => {
    if (!testEmail) return;
    setSending('email');
    try {
      const res = await fetch(`${API_URL}/automation/test-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmail }),
      });
      const data = await res.json();
      showToast(data.status === 'success' ? '✅ Test email sent!' : `❌ Failed: ${data.data?.reason}`);
    } catch { showToast('❌ Connection error'); }
    finally { setSending(''); }
  };

  const handleTestWhatsApp = async () => {
    if (!testPhone) return;
    setSending('whatsapp');
    try {
      const res = await fetch(`${API_URL}/automation/test-whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhone }),
      });
      const data = await res.json();
      showToast(data.status === 'success' ? '✅ WhatsApp message sent!' : `❌ Failed: ${data.data?.reason}`);
    } catch { showToast('❌ Connection error'); }
    finally { setSending(''); }
  };

  const StatusDot = ({ active }: { active: boolean }) => (
    <span style={{ 
      width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
      background: active ? 'var(--emerald)' : 'var(--rose)',
      boxShadow: active ? '0 0 8px var(--emerald)' : 'none',
      display: 'inline-block'
    }} />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--emerald)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
          ✦ AUTOMATION INTELLIGENCE
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, background: 'linear-gradient(135deg, #10d98c, #22d9e0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.3rem', fontFamily: 'var(--font-heading)' }}>
          Comms Hub
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          WhatsApp · Brevo Email · Real-time System Logs — Powered by Gemma 4
        </p>
      </div>

      {/* Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* SSE Connection */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: sseConnected ? 'rgba(16,217,140,0.1)' : 'rgba(245,57,123,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: sseConnected ? 'var(--emerald)' : 'var(--rose)' }}>
            {sseConnected ? <Wifi size={20} /> : <WifiOff size={20} />}
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Log Stream</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <StatusDot active={sseConnected} />
              <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{sseConnected ? 'Connected' : 'Reconnecting...'}</span>
            </div>
          </div>
        </div>

        {/* Email Status */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(34,217,224,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)' }}>
            <Mail size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Brevo Email</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <StatusDot active={status?.email?.enabled ?? false} />
              <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{status?.email?.enabled ? `Active` : 'Not Configured'}</span>
            </div>
            {status?.email?.fromAddress && (
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>{status.email.fromAddress}</div>
            )}
          </div>
        </div>

        {/* WhatsApp Status */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16,217,140,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald)' }}>
            <MessageCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>WhatsApp</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <StatusDot active={status?.whatsapp?.connected ?? false} />
              <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                {status?.whatsapp?.connected ? 'Connected' : status?.whatsapp?.pendingQR ? 'Scan QR' : 'Offline'}
              </span>
            </div>
            {status?.whatsapp?.pendingQR && (
              <div style={{ fontSize: '0.62rem', color: 'var(--gold)', marginTop: '2px' }}>⚡ QR ready in server terminal</div>
            )}
          </div>
        </div>

        {/* AI Model */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>
            <Bot size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI Engine</div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', marginTop: '2px', color: 'var(--gold)' }}>{status?.aiModel || 'Gemma 4'}</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>via Ollama (Free)</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {[
            { id: 'logs', label: 'Live Logs', icon: Activity },
            { id: 'email', label: 'Email Test', icon: Mail },
            { id: 'whatsapp', label: 'WhatsApp Test', icon: MessageCircle },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: 1, padding: '1rem', border: 'none', cursor: 'pointer',
                background: activeTab === tab.id ? 'rgba(255,255,255,0.04)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                fontWeight: 700, fontSize: '0.82rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                borderBottom: activeTab === tab.id ? '2px solid var(--emerald)' : '2px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              <tab.icon size={15} /> {tab.label}
              {tab.id === 'logs' && sseConnected && (
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--emerald)', animation: 'pulse 2s infinite', boxShadow: '0 0 6px var(--emerald)' }} />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: '1.5rem' }}>
          
          {/* LIVE LOGS TAB */}
          {activeTab === 'logs' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {sseConnected ? (
                    <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>⚡ Streaming live — {logs.length} events</span>
                  ) : (
                    <span style={{ color: 'var(--rose)' }}>⏸ Reconnecting to stream...</span>
                  )}
                </div>
                <button
                  onClick={() => setLogs([])}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.7rem', cursor: 'pointer' }}
                >
                  Clear
                </button>
              </div>

              <div style={{ height: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse' }}>
                {logs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.3 }}>
                    <Terminal size={40} style={{ marginBottom: '1rem' }} />
                    <p style={{ fontSize: '0.85rem' }}>Waiting for events...</p>
                  </div>
                ) : (
                  <div>
                    <AnimatePresence>
                      {logs.map((log, i) => <LogEntry key={i} entry={log} />)}
                    </AnimatePresence>
                    <div ref={logsEndRef} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EMAIL TEST TAB */}
          {activeTab === 'email' && (
            <div style={{ maxWidth: '520px' }}>
              <div style={{ background: 'rgba(34,217,224,0.04)', border: '1px solid rgba(34,217,224,0.15)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--cyan)', marginBottom: '8px', letterSpacing: '0.1em' }}>📧 BREVO SMTP — FREE PLAN</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                  <strong style={{ color: 'var(--text-secondary)' }}>300 free emails/day.</strong> No credit card required.<br/>
                  Setup: Register at <a href="https://www.brevo.com" target="_blank" style={{ color: 'var(--cyan)' }}>brevo.com</a> → SMTP &amp; API → Generate SMTP key → add to <code style={{ background: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: '4px' }}>.env</code>
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="admin-label"><AtSign size={12} style={{ marginRight: '4px' }} />Recipient Email</label>
                  <input
                    type="email"
                    className="admin-input"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="client@example.com"
                  />
                </div>
                <button
                  onClick={handleTestEmail}
                  disabled={!!sending || !testEmail}
                  className="btn btn-gold"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', padding: '12px' }}
                >
                  {sending === 'email' ? <RefreshCcw size={16} className="animate-spin" /> : <Send size={16} />}
                  {sending === 'email' ? 'Sending...' : 'Send Test Email'}
                </button>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Gemma 4 will draft a professional confirmation email
                </p>
              </div>

              <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--gold)', marginBottom: '8px', letterSpacing: '0.1em' }}>⚙️ REQUIRED .ENV VARIABLES</div>
                <pre style={{ fontSize: '0.72rem', color: 'var(--emerald)', margin: 0, lineHeight: 1.6, fontFamily: 'var(--font-mono)' }}>
{`BREVO_SMTP_LOGIN=your@email.com
BREVO_SMTP_KEY=xsmtpXXXXXXXXXXXXXX`}
                </pre>
              </div>
            </div>
          )}

          {/* WHATSAPP TEST TAB */}
          {activeTab === 'whatsapp' && (
            <div style={{ maxWidth: '520px' }}>
              <div style={{ background: 'rgba(16,217,140,0.04)', border: '1px solid rgba(16,217,140,0.15)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--emerald)', marginBottom: '8px', letterSpacing: '0.1em' }}>📱 WHATSAPP — FREE (YOUR SIM)</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                  Uses <strong style={{ color: 'var(--text-secondary)' }}>your existing WhatsApp</strong> number — no API cost.<br/>
                  Enable by adding to <code style={{ background: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: '4px' }}>.env</code>, then scan the QR in the server terminal once.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: status?.whatsapp?.connected ? 'var(--emerald)' : 'var(--rose)', boxShadow: status?.whatsapp?.connected ? '0 0 8px var(--emerald)' : 'none' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                    {status?.whatsapp?.connected ? 'Phone linked & active' : status?.whatsapp?.pendingQR ? 'QR code waiting in server terminal' : 'Disabled — set WHATSAPP_ENABLED=true'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="admin-label"><Phone size={12} style={{ marginRight: '4px' }} />Phone Number (Indian)</label>
                  <input
                    type="tel"
                    className="admin-input"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="9876543210"
                  />
                </div>
                <button
                  onClick={handleTestWhatsApp}
                  disabled={!!sending || !testPhone || !status?.whatsapp?.connected}
                  className="btn btn-emerald"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', padding: '12px' }}
                >
                  {sending === 'whatsapp' ? <RefreshCcw size={16} className="animate-spin" /> : <MessageCircle size={16} />}
                  {sending === 'whatsapp' ? 'Sending...' : 'Send Test WhatsApp'}
                </button>
                {!status?.whatsapp?.connected && (
                  <p style={{ fontSize: '0.72rem', color: 'var(--rose)', textAlign: 'center' }}>
                    ⚠ WhatsApp not connected. Check server terminal for QR code.
                  </p>
                )}
              </div>

              <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--gold)', marginBottom: '8px', letterSpacing: '0.1em' }}>⚙️ REQUIRED .ENV VARIABLES</div>
                <pre style={{ fontSize: '0.72rem', color: 'var(--emerald)', margin: 0, lineHeight: 1.6, fontFamily: 'var(--font-mono)' }}>
{`WHATSAPP_ENABLED=true`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(14,14,26,0.98)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px', padding: '12px 24px',
              color: 'white', fontWeight: 700, fontSize: '0.88rem',
              backdropFilter: 'blur(20px)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              zIndex: 9999
            }}
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommsHub;
