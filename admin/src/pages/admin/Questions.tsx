import React, { useState, useEffect, useCallback } from 'react';
import { fetchQuestions, answerQuestion } from '../../services/api';
import { MessageSquare, X, Send, Activity } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export default function AdminQuestions() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [replyModal, setReplyModal] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchQuestions();
      setQuestions(res.data || []);
    } catch {
      showToast('Connection to query grid failed', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const syncQuestions = useCallback(async () => {
    try {
      setIsSyncing(true);
      const res = await fetchQuestions();
      setQuestions(res.data || []);
      setTimeout(() => setIsSyncing(false), 2000);
    } catch {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
    const pollInterval = setInterval(() => {
      syncQuestions();
    }, 45000); // Slightly longer poll for stability
    return () => clearInterval(pollInterval);
  }, [loadQuestions, syncQuestions]);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !replyModal) return;
    try {
      await answerQuestion(replyModal._id, replyText, 'Answered');
      showToast('Response published to client panel! ✨');
      setReplyModal(null);
      setReplyText('');
      loadQuestions();
    } catch {
      showToast('Failed to sync response', 'error');
    }
  };

  const filteredQuestions = questions.filter(q => {
    if (filter === 'All') return true;
    return q.status === filter;
  });

  return (
    <div style={{ position: 'relative' }}>
      <ToastComponent />
      
      <div style={{ background: 'rgba(232,184,75,0.05)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(232,184,75,0.1)', marginBottom: '2rem' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 600 }}>
          💡 <strong>Help:</strong> Respond to client inquiries about specific properties. Published answers appear directly on the property details page.
        </p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Client Inquiries</h1>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '0.9rem' }}>Real-time Q&A grid for property leads.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '0.6rem 1.2rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Activity size={14} style={{ color: isSyncing ? 'var(--gold)' : 'var(--emerald)', animation: isSyncing ? 'pulse 1s infinite' : 'none' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {isSyncing ? 'SYNCING DATA' : 'GRID CONNECTED'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '4px' }}>
        {['All', 'Pending', 'Answered', 'Rejected'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.6rem 1.25rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.75rem',
              background: filter === f ? 'var(--gold)' : 'rgba(255,255,255,0.03)',
              color: filter === f ? '#000' : 'var(--text-muted)', transition: 'all 0.2s', textTransform: 'uppercase'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1,2,3].map(i => <div key={i} className="glass-card" style={{ height: '120px', animation: 'pulse 1.5s infinite' }} />)}
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div style={{ padding: '5rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1.5px dashed rgba(255,255,255,0.1)' }}>
          <MessageSquare size={40} style={{ opacity: 0.2, marginBottom: '1rem', color: 'var(--text-muted)' }} />
          <h3 style={{ color: 'white', margin: 0 }}>Silence in the inquiries grid</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No client questions match your current filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredQuestions.map(q => (
            <div key={q._id} className="glass-card" style={{ 
              padding: '1.5rem',
              borderLeft: `4px solid ${q.status === 'Pending' ? 'var(--orange)' : q.status === 'Answered' ? 'var(--emerald)' : 'var(--rose)'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, color: 'white' }}>{q.clientName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{q.clientContact}</span>
                    <div style={{ 
                      fontSize: '0.65rem', padding: '3px 10px', borderRadius: '6px', textTransform: 'uppercase', fontWeight: 900,
                      background: q.status === 'Pending' ? 'rgba(255, 165, 0, 0.1)' : q.status === 'Answered' ? 'rgba(16, 217, 140, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                      color: q.status === 'Pending' ? 'var(--orange)' : q.status === 'Answered' ? 'var(--emerald)' : 'var(--rose)',
                      border: '1px solid currentColor'
                    }}>
                      {q.status}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 700 }}>
                    🎯 Property: {q.propertyId?.title || 'Unknown Property'}
                  </div>
                </div>
                {q.status !== 'Answered' && (
                  <button 
                    onClick={() => setReplyModal(q)}
                    style={{ background: 'var(--gold)', color: '#000', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 900, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Send size={14} /> RESOLVE
                  </button>
                )}
              </div>
              
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--gold)', marginRight: '8px' }}>CLIENT:</strong> {q.question}
                </p>
              </div>

              {q.answer && (
                <div style={{ marginTop: '0.75rem', background: 'rgba(16, 217, 140, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(16, 217, 140, 0.1)' }}>
                  <p style={{ margin: 0, color: 'var(--emerald)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    <strong style={{ opacity: 0.8, marginRight: '8px' }}>HOLOGRAPHIC RESPONSE:</strong> {q.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {replyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '500px', background: '#0a0a0f', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Resolve Inquiry</h2>
              <button onClick={() => setReplyModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleReplySubmit} style={{ padding: '1.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                "{replyModal.question}"
              </div>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Type your authoritative response..."
                rows={5}
                required
                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', fontSize: '0.9rem', marginBottom: '1.5rem', resize: 'none' }}
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setReplyModal(null)} style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'white', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: 'none', background: 'var(--gold)', color: 'black', fontWeight: 900, cursor: 'pointer' }}>Publish Answer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
