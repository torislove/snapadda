import { useState, useEffect, useMemo } from 'react';
import { MessageSquare, Search, ChevronDown, ChevronUp, Target, Send, X, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  New:       { color: '#9b59f5', bg: 'rgba(155,89,245,0.1)',  label: 'New'       },
  Contacted: { color: '#22d9e0', bg: 'rgba(34,217,224,0.1)',  label: 'Contacted' },
  Qualified: { color: '#10d98c', bg: 'rgba(16,217,140,0.1)',  label: 'Qualified' },
  Lost:      { color: '#f5397b', bg: 'rgba(245,57,123,0.1)',  label: 'Lost'      },
  Pending:   { color: '#ff8c42', bg: 'rgba(255,140,66,0.1)',  label: 'Pending'   },
  Answered:  { color: '#10d98c', bg: 'rgba(16,217,140,0.1)',  label: 'Answered'  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
      padding: '3px 10px', borderRadius: '99px',
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30`,
    }}>{cfg.label}</span>
  );
};

/* ── Expandable Lead Card (Contact Request) ── */
const LeadCard = ({ lead, onDelete }: { lead: any; onDelete: (id: string) => Promise<void> }) => {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    setDeleting(true);
    await onDelete(lead._id);
    setDeleting(false);
  };

  return (
    <div style={{
      border: '1px solid rgba(155,89,245,0.15)',
      borderRadius: '14px', overflow: 'hidden',
      background: 'rgba(255,255,255,0.02)',
      transition: 'all 0.25s ease',
    }}>
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ padding: '1rem 1.1rem', cursor: 'pointer', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}
      >
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
          background: 'rgba(155,89,245,0.1)', color: '#9b59f5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Target size={15} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{lead.name}</div>
            <StatusBadge status={lead.status || 'New'} />
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
            <span style={{ color: 'var(--text-muted)', marginRight: '0.75rem' }}>📞 {lead.phone}</span>
            {lead.email && <span style={{ color: 'var(--text-muted)', marginRight: '0.75rem' }}>✉️ {lead.email}</span>}
            {lead.propertyId?.title && <span>🏠 {lead.propertyId.title}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            onClick={handleDelete}
            disabled={deleting}
            style={{ background: 'none', border: 'none', color: 'var(--rose)', cursor: 'pointer', padding: '4px' }}
          >
            <Trash2 size={14} />
          </button>
          <div style={{ color: 'var(--text-muted)' }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '1rem 1.1rem', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Message:</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.5 }}>
              {lead.message || 'No message provided.'}
            </p>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Received: {new Date(lead.createdAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Expandable Inquiry Card ── */
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
    <div style={{
      border: `1px solid ${isPending ? 'rgba(255,140,66,0.2)' : 'rgba(16,217,140,0.12)'}`,
      borderRadius: '14px', overflow: 'hidden',
      background: 'rgba(255,255,255,0.02)',
      transition: 'all 0.25s ease',
      boxShadow: isPending ? '0 0 0 0 rgba(255,140,66,0)' : 'none',
    }}>
      {/* Card header — always visible */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ padding: '1rem 1.1rem', cursor: 'pointer', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}
      >
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
          background: isPending ? 'rgba(255,140,66,0.1)' : 'rgba(16,217,140,0.1)',
          color: isPending ? '#ff8c42' : '#10d98c',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MessageSquare size={15} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{inq.clientName || 'Anonymous'}</div>
            <StatusBadge status={inq.status || 'Pending'} />
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
            {inq.clientContact && <span style={{ color: 'var(--text-muted)', marginRight: '0.75rem' }}>📞 {inq.clientContact}</span>}
            {inq.propertyId?.title && <span>🏠 {inq.propertyId.title}</span>}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            "{inq.question}"
          </div>
        </div>
        <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '1rem 1.1rem', background: 'rgba(0,0,0,0.2)' }}>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Q:</strong> {inq.question}
          </p>
          {inq.answer ? (
            <div style={{
              background: 'rgba(16,217,140,0.06)', border: '1px solid rgba(16,217,140,0.15)',
              borderRadius: '10px', padding: '0.75rem',
            }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--emerald)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>✓ Answered</p>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{inq.answer}</p>
            </div>
          ) : (
            <div>
              <textarea
                value={answerText}
                onChange={e => setAnswerText(e.target.value)}
                rows={3}
                placeholder="Type your reply here..."
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                  color: 'var(--text-primary)', borderRadius: '10px', padding: '0.6rem 0.9rem',
                  fontSize: '0.83rem', outline: 'none', resize: 'none', marginBottom: '0.75rem',
                  fontFamily: 'var(--font-body)',
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setExpanded(false)} className="btn btn-ghost btn-sm">
                  <X size={12} /> Cancel
                </button>
                <button type="button" onClick={handleSave} disabled={saving || !answerText.trim()} className="btn btn-violet btn-sm">
                  {saving ? 'Saving...' : <><Send size={12} /> Post Answer</>}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════ MAIN ═══════════════════════════ */
const AdminLeads = () => {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'Inquiries' | 'Leads'>('Leads');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

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

  const submitAnswer = async (id: string, text: string) => {
    try {
      const res = await fetch(`${API_URL}/inquiries/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: text })
      });
      if (res.ok) await fetchInquiries();
    } catch (err) { console.error(err); }
  };

  const filteredInquiries = useMemo(() => {
    return inquiries.filter(inq => {
      const q = search.toLowerCase();
      const matchSearch = !q || (inq.clientName || '').toLowerCase().includes(q) || (inq.question || '').toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || inq.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [inquiries, search, statusFilter]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const q = search.toLowerCase();
      const matchSearch = !q || (l.name || '').toLowerCase().includes(q) || (l.message || '').toLowerCase().includes(q) || (l.phone || '').includes(q);
      const matchStatus = statusFilter === 'All' || l.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [leads, search, statusFilter]);

  const pendingInqCount = inquiries.filter(i => !i.answer).length;
  const newLeadsCount = leads.filter(l => l.status === 'New').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--emerald)', marginBottom: '0.25rem', fontFamily: 'var(--font-mono)' }}>✦ CRM Tracker</div>
          <h1 style={{ fontSize: '1.8rem', background: 'linear-gradient(135deg,#10d98c,#22d9e0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.2rem' }}>Leads & Inquiries</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Manage, answer, and track all property inquiries and contact leads.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveTab('Leads')}
          style={{
            background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer',
            color: activeTab === 'Leads' ? 'var(--emerald)' : 'var(--text-muted)',
            borderBottom: activeTab === 'Leads' ? '2px solid var(--emerald)' : 'none',
            fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Target size={16} /> Property Leads {newLeadsCount > 0 && <span style={{ background: 'var(--rose)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{newLeadsCount}</span>}
        </button>
        <button 
          onClick={() => setActiveTab('Inquiries')}
          style={{
            background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer',
            color: activeTab === 'Inquiries' ? 'var(--violet)' : 'var(--text-muted)',
            borderBottom: activeTab === 'Inquiries' ? '2px solid var(--violet)' : 'none',
            fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <MessageSquare size={16} /> Client Questions {pendingInqCount > 0 && <span style={{ background: 'var(--orange)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pendingInqCount}</span>}
        </button>
      </div>

      {/* Search + Status filter */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: '200px' }}>
          <Search size={15} />
          <input
            type="text"
            placeholder={`Search ${activeTab.toLowerCase()}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="admin-select"
          style={{ minWidth: '140px' }}
        >
          <option value="All">All Statuses</option>
          {activeTab === 'Leads' ? (
            <>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Lost">Lost</option>
            </>
          ) : (
            <>
              <option value="Pending">Pending</option>
              <option value="Answered">Answered</option>
            </>
          )}
        </select>
        <button onClick={fetchAllData} className="btn btn-ghost" style={{ padding: '0 1rem' }}>Refresh</button>
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1,2,3].map(i => <div key={i} style={{ height: '80px', borderRadius: '14px', background: 'var(--bg-glass)', border: '1px solid var(--border)', animation: 'pulse 1.5s infinite' }} />)}
          </div>
        ) : (activeTab === 'Leads' ? (
          filteredLeads.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-glass)', borderRadius: '14px', border: '1px dashed var(--border)' }}>
              <Target size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>No property leads found matching your criteria.</p>
            </div>
          ) : (
            filteredLeads.map(l => <LeadCard key={l._id} lead={l} onDelete={deleteLead} />)
          )
        ) : (
          filteredInquiries.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-glass)', borderRadius: '14px', border: '1px dashed var(--border)' }}>
              <MessageSquare size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>No inquiries found matching your criteria.</p>
            </div>
          ) : (
            filteredInquiries.map(inq => <InquiryCard key={inq._id} inq={inq} onAnswer={submitAnswer} />)
          )
        ))}
      </div>
    </div>
  );
};

export default AdminLeads;
