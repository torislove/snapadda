import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MessageSquare, Search, Target, 
  MoreHorizontal, User,
  Star, LayoutGrid, List
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { ConnectivityBanner } from '../../components/ui/ConnectivityBanner';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; border: string }> = {
  New:       { color: '#9b59f5', bg: 'rgba(155,89,245,0.06)',  border: 'rgba(155,89,245,0.2)', label: 'New'       },
  Contacted: { color: '#22d9e0', bg: 'rgba(34,217,224,0.06)',  border: 'rgba(34,217,224,0.2)', label: 'Contacted' },
  Qualified: { color: '#10d98c', bg: 'rgba(16,217,140,0.06)',  border: 'rgba(16,217,140,0.2)', label: 'Qualified' },
  Lost:      { color: '#f5397b', bg: 'rgba(245,57,123,0.06)',  border: 'rgba(245,57,123,0.2)', label: 'Lost'      },
  Pending:   { color: '#ff8c42', bg: 'rgba(255,140,66,0.06)',  border: 'rgba(255,140,66,0.2)', label: 'Pending'   },
  Answered:  { color: '#10d98c', bg: 'rgba(16,217,140,0.06)',  border: 'rgba(16,217,140,0.2)', label: 'Answered'  },
  'Follow Up': { color: '#e8b84b', bg: 'rgba(232,184,75,0.06)', border: 'rgba(232,184,75,0.2)', label: 'Follow Up' },
  Closed:    { color: '#5b7ea1', bg: 'rgba(91,126,161,0.06)',  border: 'rgba(91,126,161,0.2)', label: 'Closed'    },
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

/* ── Elite Kanban Lead Card ── */
const LeadCard = ({ lead, onStatusChange, onFlag }: { 
  lead: any; 
  onStatusChange: (id: string, s: string) => Promise<void>;
  onFlag: (id: string, flag: boolean) => Promise<void>;
}) => {
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        padding: '1rem',
        marginBottom: '0.75rem',
        opacity: updating ? 0.6 : 1,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        borderLeft: `4px solid ${STATUS_CONFIG[lead.status]?.color || 'var(--violet)'}`
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ fontWeight: 800, color: 'white', fontSize: '0.9rem' }}>{lead.name}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
             <User size={10} style={{ color: 'var(--gold)' }}/> {lead.assignedTo || 'Unassigned'}
          </div>
        </div>
        <div style={{ position: 'relative', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Star 
            size={16} 
            fill={lead.followUpFlag ? 'var(--gold)' : 'none'} 
            color={lead.followUpFlag ? 'var(--gold)' : 'rgba(255,255,255,0.2)'} 
            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => onFlag(lead._id, !lead.followUpFlag)}
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
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                  padding: '0.5rem', width: '160px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
              >
                {['New', 'Contacted', 'Qualified', 'Lost', 'Closed'].filter(s => s !== lead.status).map(s => (
                  <button 
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    style={{ width: '100%', textAlign: 'left', padding: '0.6rem', borderRadius: '8px', border: 'none', background: 'none', color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {s}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
          📞 {lead.phone}
        </div>
        {lead.propertyId?.title && (
          <div style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 700 }}>
            🏠 {lead.propertyId.title}
          </div>
        )}
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '10px' }}>
          {lead.message || 'Standard Inquiry Received.'}
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a href={`tel:${lead.phone}`} style={{ flex: 1, textDecoration: 'none', padding: '8px', borderRadius: '10px', background: 'rgba(16,217,140,0.1)', color: 'var(--emerald)', fontSize: '0.7rem', fontWeight: 800, textAlign: 'center' }}>
            CALL
          </a>
          <a 
            href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
            target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, textDecoration: 'none', padding: '8px', borderRadius: '10px', background: 'rgba(37,211,102,0.1)', color: '#25D366', fontSize: '0.7rem', fontWeight: 800, textAlign: 'center' }}
          >
            WHATSAPP
          </a>
        </div>

        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', fontWeight: 600, textAlign: 'right' }}>
          {new Date(lead.createdAt).toLocaleDateString()}
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
        marginBottom: '0.75rem',
        borderRadius: '16px'
      }}
    >
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ padding: '1rem', cursor: 'pointer', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
      >
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
          background: isPending ? 'rgba(255,140,66,0.1)' : 'rgba(16,217,140,0.1)',
          color: isPending ? '#ff8c42' : '#10d98c',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MessageSquare size={16} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <div style={{ fontWeight: 800, color: 'white', fontSize: '0.9rem' }}>{inq.clientName || 'Inquirer'}</div>
            <StatusBadge status={inq.status || 'Pending'} />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.75rem' }}>
            📞 {inq.clientContact}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '10px' }}>
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
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '1rem', background: 'rgba(0,0,0,0.1)' }}
          >
            {inq.answer ? (
              <div style={{ background: 'rgba(16,217,140,0.05)', border: '1px solid rgba(16,217,140,0.1)', borderRadius: '10px', padding: '1rem' }}>
                <p style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--emerald)', marginBottom: '6px' }}>RESPONSE SENT</p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>{inq.answer}</p>
              </div>
            ) : (
              <div>
                <textarea
                  value={answerText}
                  onChange={e => setAnswerText(e.target.value)}
                  placeholder="Draft your professional response..."
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    color: 'white', borderRadius: '12px', padding: '0.75rem',
                    fontSize: '0.85rem', outline: 'none', resize: 'none', marginBottom: '0.75rem',
                  }}
                  rows={3}
                />
                <button 
                  onClick={handleSave} 
                  disabled={saving || !answerText.trim()} 
                  className="btn btn-violet btn-sm"
                  style={{ width: '100%', borderRadius: '10px' }}
                >
                  {saving ? 'SENDING...' : 'SEND RESPONSE'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const AdminLeads = () => {
  const fetchInquiries = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/inquiries`);
      const data = await res.json();
      if (res.ok) setInquiries(data.data || []);
    } catch (err) { console.error(err); }
  }, []);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/leads`);
      const data = await res.json();
      if (res.ok) setLeads(data.data || []);
    } catch (err) { console.error(err); }
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchInquiries(), fetchLeads()]);
    } finally {
      setLoading(false);
    }
  }, [fetchInquiries, fetchLeads]);

  useTranslation();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'Inquiries' | 'Leads'>('Leads');
  const [viewMode, setViewMode] = useState<'Kanban' | 'List'>('Kanban');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { 
    fetchAllData();
  }, [fetchAllData]);


  const updateLeadFlag = async (id: string, flag: boolean) => {
    try {
      const res = await fetch(`${API_URL}/leads/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followUpFlag: flag })
      });
      if (res.ok) {
        await fetchLeads();
        toast.success(flag ? 'Lead marked for follow-up.' : 'Follow-up flag removed.');
      }
    } catch { toast.error('Failed to update flag.'); }
  };

  const updateLeadStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/leads/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        await fetchLeads();
        toast.success(`Lead moved to ${status}.`);
      }
    } catch { toast.error('Status sync failed.'); }
  };

  const submitAnswer = async (id: string, text: string) => {
    try {
      const res = await fetch(`${API_URL}/inquiries/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: text, status: 'Answered' })
      });
      if (res.ok) {
        await fetchInquiries();
        toast.success('Official response transmitted.');
      }
    } catch { toast.error('Failed to send answer.'); }
  };

  const filteredInquiries = useMemo(() => {
    return inquiries.filter(inq => {
      const q = search.toLowerCase();
      return !q || (inq.clientName || '').toLowerCase().includes(q) || (inq.question || '').toLowerCase().includes(q);
    });
  }, [inquiries, search]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const q = search.toLowerCase();
      return !q || (l.name || '').toLowerCase().includes(q) || (l.message || '').toLowerCase().includes(q) || (l.phone || '').includes(q);
    });
  }, [leads, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '5rem' }}>
      <ConnectivityBanner />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }} className="flex-row-mobile-stack">
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.2rem', textTransform: 'uppercase', color: 'var(--emerald)', marginBottom: '0.5rem' }}>✦ CRM CONSOLE</div>
          <h1 style={{ fontWeight: 900, color: 'white', margin: 0 }}>Lead Intelligence</h1>
        </div>
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '12px' }} className="scroll-x-mobile">
          {[
            { id: 'Kanban', icon: LayoutGrid },
            { id: 'List', icon: List }
          ].map(mode => (
            <button 
              key={mode.id}
              onClick={() => setViewMode(mode.id as any)}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none', 
                background: viewMode === mode.id ? 'var(--gold)' : 'transparent',
                color: viewMode === mode.id ? '#000' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 800, whiteSpace: 'nowrap'
              }}
            >
              <mode.icon size={14} /> {mode.id}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1rem', borderRadius: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '8px' }} className="scroll-x-mobile">
            {[
              { id: 'Leads', icon: Target, count: leads.filter(l => l.status === 'New').length },
              { id: 'Inquiries', icon: MessageSquare, count: inquiries.filter(i => !i.answer).length }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1, padding: '1rem', borderRadius: '16px', border: 'none',
                  background: activeTab === tab.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                  fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  minWidth: '140px'
                }}
              >
                <tab.icon size={18} /> {tab.id}
                {tab.count > 0 && <span style={{ background: 'var(--rose)', color: 'white', borderRadius: '6px', padding: '2px 8px', fontSize: '0.65rem' }}>{tab.count}</span>}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Filter by name, contact..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--gold)', fontWeight: 800 }}>Initializing CRM Hub...</div>
      ) : activeTab === 'Leads' ? (
        viewMode === 'Kanban' ? (
          <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '2rem' }} className="scroll-x-mobile">
            {['New', 'Contacted', 'Qualified', 'Follow Up', 'Closed', 'Lost'].map(status => {
              const columnLeads = filteredLeads.filter(l => (l.status || 'New') === status);
              return (
                <div key={status} style={{ minWidth: '280px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: STATUS_CONFIG[status].color }} />
                      <span style={{ fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase' }}>{status}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.4 }}>{columnLeads.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {columnLeads.map(lead => <LeadCard key={lead._id} lead={lead} onStatusChange={updateLeadStatus} onFlag={updateLeadFlag} />)}
                    {columnLeads.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '16px', opacity: 0.2, fontSize: '0.7rem' }}>EMPTY</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="content-grid">
            {filteredLeads.map(lead => <LeadCard key={lead._id} lead={lead} onStatusChange={updateLeadStatus} onFlag={updateLeadFlag} />)}
          </div>
        )
      ) : (
        <div className="content-grid">
          {filteredInquiries.map(inq => <InquiryCard key={inq._id} inq={inq} onAnswer={submitAnswer} />)}
        </div>
      )}
    </div>
  );
};

export default AdminLeads;
