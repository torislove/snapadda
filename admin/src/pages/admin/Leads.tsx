import { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, Search, ChevronDown, ChevronUp, Target, Send, 
  MoreHorizontal, User, Calendar, Building, Bot, Sparkles, AlertCircle, RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; border: string }> = {
  New:       { color: '#9b59f5', bg: 'rgba(155,89,245,0.06)',  border: 'rgba(155,89,245,0.2)', label: 'New'       },
  Contacted: { color: '#22d9e0', bg: 'rgba(34,217,224,0.06)',  border: 'rgba(34,217,224,0.2)', label: 'Contacted' },
  Qualified: { color: '#10d98c', bg: 'rgba(16,217,140,0.06)',  border: 'rgba(16,217,140,0.2)', label: 'Qualified' },
  Lost:      { color: '#f5397b', bg: 'rgba(245,57,123,0.06)',  border: 'rgba(245,57,123,0.2)', label: 'Lost'      },
  Pending:   { color: '#ff8c42', bg: 'rgba(255,140,66,0.06)',  border: 'rgba(255,140,66,0.2)', label: 'Pending'   },
  Answered:  { color: '#10d98c', bg: 'rgba(16,217,140,0.06)',  border: 'rgba(16,217,140,0.2)', label: 'Answered'  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  return (
    <span style={{
      fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
      padding: '3px 10px', borderRadius: '6px',
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
    }}>{cfg.label}</span>
  );
};

/* ── AI Insight Component ── */
const LeadAIInsight = ({ text }: { text: string }) => {
  const [insight, setInsight] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${API_URL}/ai/analyze-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiry: text })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setInsight(data.data);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (!insight && !loading && !error) {
    return (
      <button 
        onClick={handleAnalyze}
        style={{
          marginTop: '8px', width: '100%', padding: '6px', borderRadius: '8px',
          background: 'rgba(16,217,140,0.05)', border: '1px solid rgba(16,217,140,0.15)',
          color: 'var(--emerald)', fontSize: '0.65rem', fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          cursor: 'pointer', transition: 'all 0.2s'
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(16,217,140,0.1)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(16,217,140,0.05)')}
      >
        <Sparkles size={12} /> GET AI INSIGHT
      </button>
    );
  }

  return (
    <div style={{
      marginTop: '8px', padding: '10px', borderRadius: '10px',
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
      animation: 'fadeInUp 0.3s ease'
    }}>
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          <RefreshCcw size={12} className="animate-spin" /> Gemma is analyzing intent...
        </div>
      ) : error ? (
        <div style={{ fontSize: '0.65rem', color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={10} /> AI Analysis Unavailable
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', fontWeight: 800, color: 'var(--gold)' }}>
              <Bot size={12} /> GEMMA ANALYTICS
            </div>
            <span style={{ 
              fontSize: '0.55rem', padding: '1px 6px', borderRadius: '4px',
              background: insight.status === 'HOT' ? 'var(--rose)' : insight.status === 'WARM' ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
              color: 'black', fontWeight: 900
            }}>{insight.status}</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '4px 0' }}>{insight.insight}</p>
          <div style={{ fontSize: '0.7rem', color: 'var(--emerald)', fontWeight: 600, marginTop: '6px' }}>
            💡 Action: {insight.suggestedAction}
          </div>
        </>
      )}
    </div>
  );
};

/* ── Elite Kanban Lead Card ── */
const LeadCard = ({ lead, onDelete, onStatusChange }: { lead: any; onDelete: (id: string) => Promise<void>; onStatusChange: (id: string, s: string) => Promise<void> }) => {
  const [showActions, setShowActions] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    await onStatusChange(lead._id, newStatus);
    setUpdating(false);
    setShowActions(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="glass-card"
      style={{
        padding: '1.25rem',
        marginBottom: '1rem',
        cursor: 'grab',
        opacity: updating ? 0.6 : 1,
        borderLeft: `3px solid ${STATUS_CONFIG[lead.status]?.color || 'var(--violet)'}`
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>{lead.name}</div>
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowActions(!showActions)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <MoreHorizontal size={16} />
          </button>
          
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                style={{
                  position: 'absolute', top: '100%', right: 0, zIndex: 10,
                  background: 'rgba(14,14,26,0.95)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                  padding: '0.5rem', width: '160px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
              >
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.5rem' }}>Move Status</div>
                {['New', 'Contacted', 'Qualified', 'Lost'].filter(s => s !== lead.status).map(s => (
                  <button 
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: '8px', border: 'none', background: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    {s}
                  </button>
                ))}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                  <button 
                    onClick={() => { if(window.confirm('Delete lead?')) onDelete(lead._id); }}
                    style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: '8px', border: 'none', background: 'none', color: 'var(--rose)', fontSize: '0.8rem', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,57,123,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    Delete Lead
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User size={14} style={{ opacity: 0.6 }} /> {lead.phone}
        </div>
        {lead.propertyId?.title && (
          <div style={{ fontSize: '0.78rem', color: 'var(--violet)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building size={14} /> {lead.propertyId.title}
          </div>
        )}
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {lead.message || 'No specific inquiries.'}
        </div>
        
        {lead.message && <LeadAIInsight text={lead.message} />}

        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
          <Calendar size={12} /> {new Date(lead.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
        </div>
      </div>
    </motion.div>
  );
};

/* ── Elite Inquiry Card ── */
const InquiryCard = ({ inq, onAnswer }: { inq: any; onAnswer: (id: string, text: string) => Promise<void> }) => {
  const [expanded, setExpanded] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [saving, setSaving] = useState(false);
  const isPending = !inq.answer;

  const handleSave = async () => {
    if (!answerText.trim()) return;
    setSaving(true);
    await onAnswer(inq._id, answerText);
    setSaving(false);
    setAnswerText('');
    setExpanded(false);
  };

  return (
    <motion.div
      layout
      className="glass-card"
      style={{
        overflow: 'hidden',
        borderLeft: `4px solid ${isPending ? 'var(--orange)' : 'var(--emerald)'}`,
        background: isPending ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.015)'
      }}
    >
      {/* Card header — always visible */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
      >
        <div style={{
          width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
          background: isPending ? 'rgba(255,140,66,0.1)' : 'rgba(16,217,140,0.1)',
          color: isPending ? '#ff8c42' : '#10d98c',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 15px ${isPending ? 'rgba(255,140,66,0.1)' : 'rgba(16,217,140,0.1)'}`
        }}>
          <MessageSquare size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{inq.clientName || 'Market Inquirer'}</div>
            <StatusBadge status={inq.status || 'Pending'} />
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {inq.clientContact && <span>📞 {inq.clientContact}</span>}
            {inq.propertyId?.title && <span style={{ color: 'var(--violet)' }}>🏠 {inq.propertyId.title}</span>}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
            "{inq.question}"
          </div>
        </div>
        <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {/* Expanded body */}
      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '1.25rem', background: 'rgba(0,0,0,0.2)' }}
          >
            {inq.answer ? (
              <div style={{
                background: 'rgba(16,217,140,0.06)', border: '1px solid rgba(16,217,140,0.15)',
                borderRadius: '12px', padding: '1rem',
              }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--emerald)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>✓ Official Response</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{inq.answer}</p>
              </div>
            ) : (
              <div>
                <textarea
                  value={answerText}
                  onChange={e => setAnswerText(e.target.value)}
                  rows={4}
                  placeholder="Provide a formal response to this inquiry..."
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                    color: 'var(--text-primary)', borderRadius: '12px', padding: '1rem',
                    fontSize: '0.9rem', outline: 'none', resize: 'none', marginBottom: '1rem',
                    fontFamily: 'var(--font-body)',
                  }}
                />
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setExpanded(false)} className="btn btn-ghost btn-sm">
                    Cancel
                  </button>
                  <button type="button" onClick={handleSave} disabled={saving || !answerText.trim()} className="btn btn-violet btn-sm">
                    {saving ? 'Transmitting...' : <><Send size={14} /> Send Official Answer</>}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ── MAIN ── */
const AdminLeads = () => {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'Inquiries' | 'Leads'>('Leads');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { 
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchInquiries(), fetchLeads()]);
    setLoading(false);
  };

  const fetchInquiries = async () => {
    try {
      const res = await fetch(`${API_URL}/inquiries`);
      const data = await res.json();
      if (res.ok) setInquiries(data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API_URL}/leads`);
      const data = await res.json();
      if (res.ok) setLeads(data.data || []);
    } catch (err) { console.error(err); }
  };

  const deleteLead = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/leads/${id}`, { method: 'DELETE' });
      if (res.ok) await fetchLeads();
    } catch (err) { console.error(err); }
  };

  const updateLeadStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/leads/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) await fetchLeads();
    } catch (err) { console.error(err); }
  };

  const submitAnswer = async (id: string, text: string) => {
    try {
      const res = await fetch(`${API_URL}/inquiries/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: text, status: 'Answered' })
      });
      if (res.ok) await fetchInquiries();
    } catch (err) { console.error(err); }
  };

  const filteredInquiries = useMemo(() => {
    return inquiries.filter(inq => {
      const q = search.toLowerCase();
      const matchSearch = !q || (inq.clientName || '').toLowerCase().includes(q) || (inq.question || '').toLowerCase().includes(q);
      return matchSearch;
    });
  }, [inquiries, search]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const q = search.toLowerCase();
      const matchSearch = !q || (l.name || '').toLowerCase().includes(q) || (l.message || '').toLowerCase().includes(q) || (l.phone || '').includes(q);
      return matchSearch;
    });
  }, [leads, search]);

  const pendingInqCount = inquiries.filter(i => !i.answer).length;
  const newLeadsCount = leads.filter(l => l.status === 'New').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--emerald)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>✦ CRM INTELLIGENCE</div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, background: 'linear-gradient(135deg,#10d98c,#22d9e0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.3rem', fontFamily: 'var(--font-heading)' }}>Leads & CRM</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Real-time conversion pipeline and client communication matrix.</p>
        </div>
      </div>

      {/* Tabs / Filters Panel */}
      <div className="glass-card" style={{ padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '12px' }}>
            {[
              { id: 'Leads', icon: Target, label: 'Lead Board', color: 'var(--emerald)', count: newLeadsCount },
              { id: 'Inquiries', icon: MessageSquare, label: 'Inquiries', color: 'var(--violet)', count: pendingInqCount }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  background: activeTab === tab.id ? 'rgba(255,255,255,0.07)' : 'transparent',
                  border: activeTab === tab.id ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                  padding: '0.6rem 1.25rem', borderRadius: '10px', cursor: 'pointer',
                  color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px',
                  transition: 'all 0.2s'
                }}
              >
                <tab.icon size={16} /> {tab.label}
                {tab.count > 0 && <span style={{ background: tab.color, color: 'black', borderRadius: '6px', padding: '1px 6px', fontSize: '0.65rem' }}>{tab.count}</span>}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', flex: 1, justifyContent: 'flex-end' }}>
             <div className="search-input-wrap" style={{ maxWidth: '300px' }}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder={`Search ${activeTab.toLowerCase()}...`}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ fontSize: '0.9rem' }}
                />
              </div>
              <button onClick={fetchAllData} className="btn btn-ghost" style={{ padding: '0 1rem', borderRadius: '10px' }}>Refresh</button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: '300px', borderRadius: '18px', background: 'var(--bg-glass)', border: '1px solid var(--border)', animation: 'pulse 1.5s infinite' }} />)}
          </div>
        ) : (activeTab === 'Leads' ? (
          /* Kanban Board View */
          <div style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            overflowX: 'auto', 
            paddingBottom: '1rem',
            minHeight: '600px'
          }}>
            {['New', 'Contacted', 'Qualified', 'Lost'].map(status => {
              const columnLeads = filteredLeads.filter(l => (l.status || 'New') === status);
              return (
                <div key={status} style={{ minWidth: '300px', flex: 1 }}>
                  <div style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    padding: '0.75rem 1rem', marginBottom: '1.25rem', 
                    background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: STATUS_CONFIG[status].color }} />
                      <span style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{status}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>{columnLeads.length}</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <AnimatePresence>
                      {columnLeads.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.3, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '14px' }}>
                          <span style={{ fontSize: '0.75rem' }}>No {status} leads</span>
                        </div>
                      ) : (
                        columnLeads.map(l => (
                          <LeadCard key={l._id} lead={l} onDelete={deleteLead} onStatusChange={updateLeadStatus} />
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Inquiries List View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredInquiries.length === 0 ? (
              <div style={{ padding: '5rem', textAlign: 'center', background: 'var(--bg-glass)', borderRadius: '24px', border: '1px dashed var(--border)' }}>
                <MessageSquare size={50} style={{ opacity: 0.1, marginBottom: '1.5rem', color: 'var(--violet)' }} />
                <p style={{ color: 'var(--text-muted)' }}>No signals detected in this sector.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.25rem' }}>
                {filteredInquiries.map(inq => <InquiryCard key={inq._id} inq={inq} onAnswer={submitAnswer} />)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminLeads;
