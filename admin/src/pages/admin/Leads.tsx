import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MessageSquare, Search, Target, 
  MoreHorizontal, User, Bot, Sparkles, AlertCircle, RefreshCcw,
  Star, LayoutGrid, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Clock } from 'lucide-react';
import { ConnectivityBanner } from '../../components/ui/ConnectivityBanner';
import { triggerHaptic } from '../../utils/haptics';

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
        <Sparkles size={12} /> AI ANALYSIS
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
              <Bot size={12} /> AI REPORT
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

/* ── Lead Activity Timeline ── */
const LeadTimeline = ({ lead }: { lead: any }) => {
  const events = [
    { type: 'CREATE', label: 'Lead Generated', time: lead.createdAt, icon: <Zap size={10} />, color: 'var(--violet)' },
    ...(lead.status !== 'New' ? [{ type: 'STATUS', label: `Status → ${lead.status}`, time: lead.updatedAt, icon: <Activity size={10} />, color: 'var(--emerald)' }] : []),
    ...(lead.intentProfile || []).map((p: any) => ({
      type: 'INTENT',
      label: p.type === 'VIEW' ? 'Viewed Property' : 'Refined Search',
      time: p.timestamp,
      icon: <Search size={10} />,
      color: 'var(--gold)'
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '1rem', letterSpacing: '0.1em' }}>CONVERSION TIMELINE</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
        <div style={{ position: 'absolute', left: '7px', top: '5px', bottom: '5px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
        {events.map((ev, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', position: 'relative' }}>
            <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: ev.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', zIndex: 1, boxShadow: `0 0 8px ${ev.color}` }}>
              {ev.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>{ev.label}</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{new Date(ev.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Elite Kanban Lead Card ── */
const LeadCard = ({ lead, onDelete, onStatusChange, onFlag }: { 
  lead: any; 
  onDelete: (id: string) => Promise<void>; 
  onStatusChange: (id: string, s: string) => Promise<void>;
  onFlag: (id: string, flag: boolean) => Promise<void>;
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Data Analyst: Lead Quality Algorithm
  const leadScore = useMemo(() => {
    let score = 0;
    if (lead.propertyId) score += 30;
    if (lead.message) score += 20;
    if (lead.message?.length > 40) score += 10;
    if (lead.intentProfile?.length > 0) score += 20;
    if (lead.phone?.length >= 10) score += 20;
    return score;
  }, [lead]);

  const handleStatusChange = async (newStatus: string) => {
    triggerHaptic('medium');
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
        padding: '1rem',
        marginBottom: '0.75rem',
        opacity: updating ? 0.6 : 1,
        borderLeft: `3px solid ${STATUS_CONFIG[lead.status]?.color || 'var(--violet)'}`
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontWeight: 800, color: 'white', fontSize: '0.875rem' }}>{lead.name}</div>
            {(lead.intentProfile?.length > 0 || lead.source?.includes('Intent')) && (
              <motion.span
                animate={{ opacity: [1, 0.5, 1], scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{
                  fontSize: '0.55rem', fontWeight: 900, background: 'var(--gold)', color: 'black',
                  padding: '1px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px',
                  boxShadow: '0 0 10px rgba(232,184,75,0.4)'
                }}
              >
                <Zap size={8} fill="currentColor" /> HOT
              </motion.span>
            )}
          </div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
             <User size={10} style={{ color: 'var(--gold)' }}/> {lead.assignedTo || 'Super Admin'}
          </div>
        </div>
        <div style={{ position: 'relative', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Star 
            size={14} 
            fill={lead.followUpFlag ? 'var(--gold)' : 'none'} 
            color={lead.followUpFlag ? 'var(--gold)' : 'rgba(255,255,255,0.2)'} 
            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={(e) => { 
              e.stopPropagation(); 
              triggerHaptic('light');
              onFlag(lead._id, !lead.followUpFlag); 
            }}
          />
          <button 
            onClick={() => setShowActions(!showActions)}
            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', borderRadius: '8px' }}
          >
            <MoreHorizontal size={14} />
          </button>
          
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                style={{
                  position: 'absolute', top: '100%', right: 0, zIndex: 10,
                  background: '#0a0a14', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
                  padding: '0.6rem', width: '180px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                }}
              >
                <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.4rem', letterSpacing: '0.1em' }}>Move Pipeline</div>
                {['New', 'Contacted', 'Qualified', 'Lost'].filter(s => s !== lead.status).map(s => (
                  <button 
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    style={{ width: '100%', textAlign: 'left', padding: '0.6rem 0.75rem', borderRadius: '10px', border: 'none', background: 'none', color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    {s}
                  </button>
                ))}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '0.4rem', paddingTop: '0.4rem' }}>
                  <button 
                    onClick={() => { if(window.confirm('Delete lead?')) onDelete(lead._id); }}
                    style={{ width: '100%', textAlign: 'left', padding: '0.6rem 0.75rem', borderRadius: '10px', border: 'none', background: 'none', color: 'var(--rose)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Delete Lead
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontWeight: 600 }}>
            📞 {lead.phone}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <span style={{ fontSize: '0.6rem', fontWeight: 900, color: leadScore > 70 ? 'var(--emerald)' : 'var(--text-muted)' }}>{leadScore} Pts</span>
             <div style={{ width: '30px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
               <div style={{ width: `${leadScore}%`, height: '100%', background: leadScore > 70 ? 'var(--emerald)' : 'var(--gold)' }} />
             </div>
          </div>
        </div>
        {lead.propertyId?.title && (
          <div style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            🏠 {lead.propertyId.title}
          </div>
        )}
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.02)', padding: '0.6rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)', lineHeight: 1.5 }}>
          {lead.message || 'Standard Inquiry Received.'}
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowTimeline(!showTimeline); triggerHaptic('light'); }}
            style={{ flex: 1, padding: '7px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Clock size={12} /> {showTimeline ? 'HIDE' : 'HISTORY'}
          </button>
          <a 
            href={`tel:${lead.phone}`}
            style={{ flex: 1, textDecoration: 'none', padding: '7px', borderRadius: '10px', border: '1px solid var(--emerald)', background: 'rgba(16,217,140,0.1)', color: 'var(--emerald)', fontSize: '0.65rem', fontWeight: 800, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            CALL NOW
          </a>
        </div>

        {showTimeline && <LeadTimeline lead={lead} />}
        {lead.message && <LeadAIInsight text={lead.message} />}

        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', fontWeight: 600, marginTop: '2px' }}>
          {new Date(lead.createdAt).toLocaleDateString()} at {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
        background: isPending ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.015)',
        marginBottom: '0.75rem'
      }}
    >
      <div
        onClick={() => { setExpanded(e => !e); triggerHaptic('light'); }}
        style={{ padding: '1rem', cursor: 'pointer', display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}
      >
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
          background: isPending ? 'rgba(255,140,66,0.1)' : 'rgba(16,217,140,0.1)',
          color: isPending ? '#ff8c42' : '#10d98c',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MessageSquare size={16} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <div style={{ fontWeight: 800, color: 'white', fontSize: '0.9rem' }}>{inq.clientName || 'Inquirer'}</div>
            <StatusBadge status={inq.status || 'Pending'} />
          </div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem' }}>
            📞 {inq.clientContact}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', padding: '0.6rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
            "{inq.question}"
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '1rem', background: 'rgba(0,0,0,0.2)' }}
          >
            {inq.answer ? (
              <div style={{ background: 'rgba(16,217,140,0.05)', border: '1px solid rgba(16,217,140,0.1)', borderRadius: '10px', padding: '0.875rem' }}>
                <p style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--emerald)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OFFICIAL RESPONSE</p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{inq.answer}</p>
              </div>
            ) : (
              <div>
                <textarea
                  value={answerText}
                  onChange={e => setAnswerText(e.target.value)}
                  rows={4}
                  placeholder="Draft your professional response..."
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    color: 'white', borderRadius: '12px', padding: '0.875rem',
                    fontSize: '0.875rem', outline: 'none', resize: 'none', marginBottom: '0.875rem',
                  }}
                />
                <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={handleSave} disabled={saving || !answerText.trim()} className="btn btn-violet btn-sm" style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', fontSize: '0.75rem' }}>
                    {saving ? 'SENDING...' : 'TRANSMIT ANSWER'}
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

const ActivityPulse = () => {
  const activities = [
    { type: 'VIEW', user: 'Premium Client (8801)', asset: '2 Acre Agri Plot', time: '2m ago' },
    { type: 'SAVE', user: 'Institutional Lead', asset: 'Guntur Villa', time: '15m ago' },
    { type: 'SEARCH', user: 'New Visitor', sector: 'Amaravati Corridor', time: '22m ago' },
    { type: 'VIEW', user: 'Verified Client', asset: 'Vijayawada Flat', time: '1h ago' },
  ];

  return (
    <div className="glass-card" style={{ padding: '1.5rem', width: '300px', flexShrink: 0, height: 'fit-content', position: 'sticky', top: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', color: 'var(--gold)', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.1em' }}>
        <Activity size={16} className="pulse-primary" /> LIVE ACTIVITY
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {activities.map((a, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ position: 'absolute', left: '-4.5px', top: '0', width: '8px', height: '8px', borderRadius: '50%', background: a.type === 'SAVE' ? 'var(--rose)' : 'var(--emerald)', boxShadow: `0 0 10px ${a.type === 'SAVE' ? 'var(--rose)' : 'var(--emerald) '}` }} />
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'white' }}>{a.user}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{a.type}: {a.asset || a.sector}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--gold)', marginTop: '4px' }}>{a.time}</div>
          </motion.div>
        ))}
      </div>
      <div style={{ marginTop: '2.5rem', padding: '1rem', background: 'rgba(232,184,75,0.05)', borderRadius: '12px', border: '1px solid rgba(232,184,75,0.1)' }}>
         <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--gold)', marginBottom: '8px' }}>LIQUIDITY INDEX</div>
         <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: '74%', height: '100%', background: 'var(--gold)' }} />
         </div>
         <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>Current Market Velocity: 0.85/s</div>
      </div>
    </div>
  );
};

/* ── MAIN ── */
const AdminLeads = () => {
  const { t } = useTranslation();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'Inquiries' | 'Leads'>('Leads');
  const [viewMode, setViewMode] = useState<'Kanban' | 'List'>('Kanban');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');

  useEffect(() => { 
    fetchAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const updateLeadFlag = async (id: string, flag: boolean) => {
    try {
      const res = await fetch(`${API_URL}/leads/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followUpFlag: flag })
      });
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
      const matchDistrict = districtFilter === 'All' || l.district === districtFilter;
      return matchSearch && matchDistrict;
    });
  }, [leads, search, districtFilter]);

  const pendingInqCount = inquiries.filter(i => !i.answer).length;
  const newLeadsCount = leads.filter(l => l.status === 'New').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '5rem' }}>
      <ConnectivityBanner />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.2rem', textTransform: 'uppercase', color: 'var(--emerald)', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>✦ CRM HUB</div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, background: 'linear-gradient(135deg,#fff,#10d98c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.2rem', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>{t('leads.title', 'Management')}</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <button 
            onClick={() => { setViewMode('Kanban'); triggerHaptic('light'); }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: viewMode === 'Kanban' ? 'rgba(255,255,255,0.1)' : 'transparent', color: viewMode === 'Kanban' ? 'white' : 'rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700 }}
          >
            <LayoutGrid size={14} /> Kanban
          </button>
          <button 
            onClick={() => { setViewMode('List'); triggerHaptic('light'); }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: viewMode === 'List' ? 'rgba(255,255,255,0.1)' : 'transparent', color: viewMode === 'List' ? 'white' : 'rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700 }}
          >
            <List size={14} /> List
          </button>
        </div>
      </div>

      {/* Tabs / Filters Panel */}
      <div className="glass-card" style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255,255,255,0.03)', padding: '0.3rem', borderRadius: '14px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {[
              { id: 'Leads', icon: Target, label: t('nav.leads', 'Leads'), color: 'var(--emerald)', count: newLeadsCount },
              { id: 'Inquiries', icon: MessageSquare, label: t('nav.messages', 'Inquiries'), color: 'var(--violet)', count: pendingInqCount }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); triggerHaptic('light'); }}
                style={{
                  background: activeTab === tab.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                  border: 'none',
                  padding: '0.6rem 1.25rem', borderRadius: '12px', cursor: 'pointer',
                  color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.3)',
                  fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '10px',
                  transition: 'all 0.2s', flex: 1, justifyContent: 'center'
                }}
              >
                <tab.icon size={16} /> {tab.label}
                {tab.count > 0 && <span style={{ background: tab.color, color: 'black', borderRadius: '6px', padding: '1px 6px', fontSize: '0.6rem', fontWeight: 900 }}>{tab.count}</span>}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
             <div className="search-input-wrap" style={{ flex: 1, minWidth: '180px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                <Search size={14} style={{ opacity: 0.4 }} />
                <input
                  type="text"
                  placeholder={`Search registry...`}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ border: 'none', background: 'none', color: 'white', padding: '12px', fontSize: '0.9rem', width: '100%', outline: 'none' }}
                />
              </div>
              <select 
                value={districtFilter}
                onChange={e => setDistrictFilter(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', borderRadius: '14px', padding: '0 1rem', fontSize: '0.85rem', fontWeight: 700, outline: 'none', minHeight: '48px', appearance: 'none', cursor: 'pointer' }}
              >
                <option value="All">All Districts</option>
                <option value="Vijayawada">Vijayawada</option>
                <option value="Amaravati">Amaravati</option>
                <option value="Visakhapatnam">Visakhapatnam</option>
                <option value="Guntur">Guntur</option>
                <option value="Tirupati">Tirupati</option>
              </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: '240px', borderRadius: '20px', background: 'var(--bg-glass)', border: '1px solid var(--border)', animation: 'pulse 1.5s infinite' }} />)}
          </div>
        ) : (activeTab === 'Leads' ? (
          viewMode === 'Kanban' ? (
            /* Kanban Board View */
            <div className="kanban-scroll-container" style={{ 
              display: 'flex', 
              gap: '1rem', 
              overflowX: 'auto', 
              paddingBottom: '1rem',
              minHeight: '600px',
              WebkitOverflowScrolling: 'touch'
            }}>
              {['New', 'Contacted', 'Qualified', 'Lost'].map(status => {
                const columnLeads = filteredLeads.filter(l => (l.status || 'New') === status);
                return (
                  <div key={status} style={{ minWidth: '280px', maxWidth: '320px', flex: 1 }}>
                    <div style={{ 
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                      padding: '0.875rem 1.25rem', marginBottom: '1rem', 
                      background: 'rgba(255,255,255,0.02)', borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.04)',
                      position: 'sticky', top: 0, zIndex: 5, backdropFilter: 'blur(10px)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: STATUS_CONFIG[status].color, boxShadow: `0 0 10px ${STATUS_CONFIG[status].color}` }} />
                        <span style={{ fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{status}</span>
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontWeight: 800 }}>{columnLeads.length}</span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <AnimatePresence>
                        {columnLeads.length === 0 ? (
                          <div style={{ padding: '3rem 1rem', textAlign: 'center', opacity: 0.2, border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '20px' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>RESTING</span>
                          </div>
                        ) : (
                          columnLeads.map(lead => (
                            <LeadCard 
                              key={lead._id} 
                              lead={lead} 
                              onDelete={deleteLead} 
                              onStatusChange={updateLeadStatus}
                              onFlag={updateLeadFlag}
                            />
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View for Leads */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               {filteredLeads.length === 0 ? (
                 <div style={{ padding: '5rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '24px' }}>
                   <p style={{ opacity: 0.3 }}>No leads found.</p>
                 </div>
               ) : (
                 filteredLeads.map(lead => (
                   <LeadCard 
                      key={lead._id} 
                      lead={lead} 
                      onDelete={deleteLead} 
                      onStatusChange={updateLeadStatus}
                      onFlag={updateLeadFlag}
                   />
                 ))
               )}
            </div>
          )
        ) : (
          /* Inquiries List View */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: '1rem' }}>
            {filteredInquiries.length === 0 ? (
              <div style={{ padding: '5rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', gridColumn: '1 / -1' }}>
                <MessageSquare size={40} style={{ opacity: 0.1, marginBottom: '1rem', color: 'var(--violet)' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Registry is empty.</p>
              </div>
            ) : (
              filteredInquiries.map(inq => <InquiryCard key={inq._id} inq={inq} onAnswer={submitAnswer} />)
            )}
          </div>
        ))}
        </div>

        <div className="desktop-only" style={{ width: '300px', flexShrink: 0 }}>
           <ActivityPulse />
        </div>
      </div>
    </div>
  );
};

export default AdminLeads;
