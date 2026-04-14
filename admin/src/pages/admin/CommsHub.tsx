import { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Send, RefreshCcw, Wifi, WifiOff,
  Terminal, Bot, Bell, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAIService } from '../../services/aiService';

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
  const [activeTab, setActiveTab] = useState<'logs' | 'chat' | 'push'>('chat');
  
  // Chat Specific State
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const activeChatRef = useRef<string | null>(null);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushLink, setPushLink] = useState('');
  const [pushImage, setPushImage] = useState('');
  const [sending, setSending] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [whatsappBody, setWhatsappBody] = useState('');
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
      const source = new EventSource(`${API_URL}/automation/logs/stream`);
      source.onopen = () => setSseConnected(true);
      source.onmessage = (e) => {
        if (e.data === ': heartbeat') return;
        const entry = JSON.parse(e.data);
        
        if (entry.type === 'history') {
          setLogs(entry.logs);
        } else {
          setLogs(prev => [entry, ...prev].slice(0, 100));
          // Real-time chat update
          if (entry.type === 'whatsapp' && entry.meta?.chatMessage) {
            const newMsg = entry.meta.chatMessage;
            fetchChats(); // Refresh sidebar for last message
            if (activeChatRef.current === newMsg.number) {
               setChatHistory(prev => [...prev, newMsg]);
            }
          }
        }
      };
      source.onerror = () => {
        setSseConnected(false);
        source.close();
        setTimeout(connect, 5000);
      };
      eventSourceRef.current = source;
    };

    connect();
    fetchChats();
    const statusPoll = setInterval(fetchStatus, 15000);
    const chatPoll = setInterval(fetchChats, 60000); // Periodic chat list refresh

    return () => {
      eventSourceRef.current?.close();
      clearInterval(statusPoll);
      clearInterval(chatPoll);
    };
  }, []);

  const fetchChats = async () => {
    try {
      const res = await fetch(`${API_URL}/automation/chat/list`);
      const data = await res.json();
      if (data.status === 'success') setChats(data.data);
    } catch {}
  };

  const loadHistory = async (number: string) => {
    setIsHistoryLoading(true);
    setActiveChat(number);
    try {
      const res = await fetch(`${API_URL}/automation/chat/history/${number}`);
      const data = await res.json();
      if (data.status === 'success') setChatHistory(data.data);
    } catch {}
    finally { setIsHistoryLoading(false); }
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSendWhatsApp = async () => {
    if (!activeChat || !whatsappBody) return;
    setSending('whatsapp');
    try {
      const res = await fetch(`${API_URL}/automation/send-whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: activeChat, message: whatsappBody }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast('✅ Message sent');
        setWhatsappBody('');
        loadHistory(activeChat); // Refresh local view
      } else {
        showToast(`❌ Failed: ${data.data?.reason}`);
      }
    } catch { showToast('❌ Connection error'); }
    finally { setSending(''); }
  };

  const handleDraftPush = async () => {
    setAiLoading(true);
    try {
      const text = await adminAIService.generate(`Short engaging push notification about a new property or market update`, 'draft_email');
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length > 1) {
        setPushTitle(lines[0].replace(/Title: /i, '').trim());
        setPushBody(lines.slice(1).join(' ').trim());
      } else {
        setPushTitle('SnapAdda Update 🏠');
        setPushBody(text);
      }
    } catch { showToast('❌ AI Draft failed'); }
    finally { setAiLoading(false); }
  };

  const handleSendPush = async () => {
    if (!pushTitle || !pushBody) return;
    setSending('push');
    try {
      const res = await fetch(`${API_URL}/automation/send-push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: pushTitle, 
          body: pushBody, 
          link: pushLink,
          imageUrl: pushImage 
        }),
      });
      const data = await res.json();
      showToast(data.status === 'success' ? `✅ Push sent!` : `❌ Failed: ${data.data?.reason}`);
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
          Direct Chat · SIM-Based Automation · Push Notifications · Real-time System Logs
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

        {/* FCM Status */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(245,57,123,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--rose)' }}>
            <Bell size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Push (FCM)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <StatusDot active={status?.fcm?.enabled ?? false} />
              <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{status?.fcm?.enabled ? `Active` : 'Not Initialized'}</span>
            </div>
          </div>
        </div>

        {/* AI Model (Local Migration) */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={async () => {
          setAiLoading(true);
          try { await adminAIService.init((p) => setAiProgress(Math.floor(p * 100))); } finally { setAiLoading(false); }
        }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>
            <Bot size={20} className={aiLoading ? 'animate-spin' : ''} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI Engine (Local)</div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', marginTop: '2px', color: 'var(--gold)' }}>
              {aiLoading ? `Loading ${aiProgress}%` : 'Transformers.js'}
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Browser-Native (Free)</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {[
            { id: 'chat', label: 'WhatsApp Chat', icon: MessageCircle },
            { id: 'push', label: 'Push Broadcast', icon: Bell },
            { id: 'logs', label: 'System Logs', icon: Terminal },
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

          {/* WHATSAPP CHAT TAB */}
          {activeTab === 'chat' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '1rem', height: '600px' }}>
              
              {/* Sidebar: Chat List */}
              <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--emerald)', marginBottom: '0.5rem', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={12} /> ACTIVE CONVERSATIONS
                </div>
                {chats.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.3, fontSize: '0.8rem' }}>No conversations yet.</div>
                ) : chats.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => loadHistory(c._id)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '1rem', borderRadius: '12px',
                      background: activeChat === c._id ? 'rgba(16,217,140,0.1)' : 'rgba(255,255,255,0.02)',
                      border: activeChat === c._id ? '1px solid var(--emerald)' : '1px solid rgba(255,255,255,0.05)',
                      transition: 'all 0.2s', cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'white', marginBottom: '4px' }}>{c.senderName || c._id}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                       {c.fromMe ? 'You: ' : ''}{c.lastMessage}
                    </div>
                  </button>
                ))}
              </div>

              {/* Main: Message Window */}
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(255,255,255,0.01)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                {!activeChat ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                    <MessageCircle size={48} style={{ marginBottom: '1rem' }} />
                    <p style={{ fontWeight: 700 }}>Select a lead to start chatting</p>
                  </div>
                ) : (
                  <>
                    <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{activeChat}</div>
                      <div style={{ fontSize: '0.7rem', color: isHistoryLoading ? 'var(--emerald)' : 'var(--text-muted)' }}>
                        {isHistoryLoading ? 'Loading history...' : 'Chat Sync Active'}
                      </div>
                    </div>

                    <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {chatHistory.map((m, i) => (
                        <div key={i} style={{ 
                          maxWidth: '80%', padding: '0.75rem 1rem', borderRadius: '16px',
                          alignSelf: m.fromMe ? 'flex-end' : 'flex-start',
                          background: m.fromMe ? 'var(--emerald)' : 'rgba(255,255,255,0.08)',
                          color: m.fromMe ? 'black' : 'white',
                          fontWeight: m.fromMe ? 600 : 500,
                          fontSize: '0.88rem',
                          boxShadow: m.fromMe ? '0 4px 12px rgba(16,217,140,0.2)' : 'none',
                          borderTopRightRadius: m.fromMe ? '4px' : '16px',
                          borderTopLeftRadius: m.fromMe ? '16px' : '4px'
                        }}>
                          {m.body}
                          <div style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: '4px', textAlign: m.fromMe ? 'right' : 'left' }}>
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '10px' }}>
                      <textarea 
                        className="admin-input" 
                        rows={2} 
                        value={whatsappBody}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendWhatsApp(); } }}
                        onChange={(e) => setWhatsappBody(e.target.value)}
                        placeholder="Type a message..."
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}
                      />
                      <button 
                         onClick={handleSendWhatsApp}
                         disabled={!!sending || !whatsappBody}
                         style={{ padding: '0 1.5rem', borderRadius: '12px', background: 'var(--emerald)', color: 'black', border: 'none', cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                         {sending === 'whatsapp' ? <RefreshCcw size={18} className="animate-spin" /> : <Send size={18} />}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* PUSH NOTIFICATIONS TAB */}
          {activeTab === 'push' && (
            <div style={{ maxWidth: '600px' }}>
              <div style={{ background: 'rgba(245,57,123,0.04)', border: '1px solid rgba(245,57,123,0.15)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--rose)', marginBottom: '8px', letterSpacing: '0.1em' }}>🔔 FIREBASE PUSH NOTIFICATIONS</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                  Send real-time alerts to all registered client devices.<br/>
                  Total registered tokens: <strong style={{ color: 'var(--rose)' }}>{status?.fcm?.tokenCount || 'Calculating...'}</strong>
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="admin-label">Notification Title</label>
                    <input
                      className="admin-input"
                      value={pushTitle}
                      onChange={(e) => setPushTitle(e.target.value)}
                      placeholder="e.g. New Luxury Villa! 🏠"
                    />
                  </div>
                  <div>
                    <label className="admin-label">Action URL (Click Action)</label>
                    <input
                      className="admin-input"
                      value={pushLink}
                      onChange={(e) => setPushLink(e.target.value)}
                      placeholder="e.g. /properties/123"
                    />
                  </div>
                </div>

                <div>
                  <label className="admin-label">Notification Body</label>
                  <textarea 
                    className="admin-input" 
                    rows={3} 
                    value={pushBody} 
                    onChange={(e) => setPushBody(e.target.value)}
                    placeholder="Brief & engaging message..."
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button 
                      type="button" 
                      onClick={handleDraftPush}
                      className="btn-ghost" 
                      style={{ fontSize: '0.7rem', color: 'var(--rose)', border: '1px solid var(--rose)', padding: '4px 12px', borderRadius: '6px' }}
                    >
                      {aiLoading ? 'DRAFTING...' : '⚡ AI SMART DRAFT'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="admin-label">Image URL (Optional)</label>
                  <input
                    className="admin-input"
                    value={pushImage}
                    onChange={(e) => setPushImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>PREVIEW</div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--rose)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Bell size={20} color="white" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{pushTitle || 'Project Title'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{pushBody || 'Notification body content will appear here...'}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSendPush}
                  disabled={!!sending || !pushTitle || !pushBody}
                  className="btn"
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', padding: '12px', width: '100%',
                    background: 'var(--rose)', color: 'white'
                  }}
                >
                  {sending === 'push' ? <RefreshCcw size={16} className="animate-spin" /> : <Send size={16} />}
                  {sending === 'push' ? 'Broadcasting...' : 'Send Broadcast Notification'}
                </button>
                
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  This will send a notification to ALL registered tokens concurrently.
                </p>
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
