import React, { useState, useEffect } from 'react';
import { fetchQuestions, answerQuestion, deleteQuestion } from '../../services/api';
import { MessageSquare, Trash2, X, Send } from 'lucide-react';

export default function AdminQuestions() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  
  const [replyModal, setReplyModal] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadQuestions();
    
    // Real-time Sync: Poll every 30s
    const pollInterval = setInterval(() => {
      syncQuestions();
    }, 30000);

    return () => clearInterval(pollInterval);
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const res = await fetchQuestions();
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const syncQuestions = async () => {
    try {
      setIsSyncing(true);
      const res = await fetchQuestions();
      setQuestions(res.data);
      setTimeout(() => setIsSyncing(false), 2000);
    } catch (err) {
      console.error('Real-time sync failed:', err);
      setIsSyncing(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !replyModal) return;
    try {
      await answerQuestion(replyModal._id, replyText, 'Answered');
      setReplyModal(null);
      setReplyText('');
      loadQuestions();
    } catch (err) {
      console.error('Failed to answer question', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client question?')) return;
    try {
      await deleteQuestion(id);
      loadQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredQuestions = questions.filter(q => {
    if (filter === 'All') return true;
    return q.status === filter;
  });

  return (
    <div className="admin-page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Client Questions (Q&A)</h1>
          <p style={{ color: 'var(--text-muted)' }}>Answer client questions to build property FAQs automatically.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 1rem', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ 
            width: '8px', height: '8px', borderRadius: '50%', 
            background: isSyncing ? 'var(--gold)' : 'var(--emerald)',
            boxShadow: isSyncing ? '0 0 10px var(--gold)' : '0 0 10px var(--emerald)',
            animation: isSyncing ? 'none' : 'pulse 2s infinite'
          }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em', color: isSyncing ? 'var(--gold)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
            {isSyncing ? 'Syncing...' : 'Live Sync Active'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '12px', width: 'max-content' }}>
        {['All', 'Pending', 'Answered', 'Rejected'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              background: filter === f ? 'var(--gold)' : 'transparent',
              color: filter === f ? '#000' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
      ) : filteredQuestions.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--border-subtle)' }}>
          <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-secondary)' }}>No Client Questions Found</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredQuestions.map(q => (
            <div key={q._id} style={{ 
              background: 'rgba(10,10,18,0.6)', 
              border: '1px solid var(--border-subtle)',
              borderLeft: `4px solid ${q.status === 'Pending' ? 'var(--orange)' : q.status === 'Answered' ? 'var(--emerald)' : 'var(--rose)'}`,
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ 
                      fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(34, 217, 224, 0.1)', color: 'var(--cyan)', fontWeight: 800, border: '1px solid rgba(34, 217, 224, 0.2)'
                    }}>LEAD</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{q.clientName}</span>
                    {q.authType && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 600 }}>via {q.authType}</span>
                    )}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone: {q.clientContact}</span>
                    <span style={{ 
                      fontSize: '0.7rem', padding: '2px 8px', borderRadius: '99px', textTransform: 'uppercase', fontWeight: 700,
                      background: q.status === 'Pending' ? 'rgba(255, 165, 0, 0.1)' : q.status === 'Answered' ? 'rgba(16, 217, 140, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                      color: q.status === 'Pending' ? 'var(--orange)' : q.status === 'Answered' ? 'var(--emerald)' : 'var(--rose)'
                    }}>
                      {q.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--cyan)' }}>
                    Property: {q.propertyId ? `${q.propertyId.title} (${q.propertyId.location})` : 'Unknown Property'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {q.status !== 'Answered' && (
                    <button 
                      onClick={() => setReplyModal(q)}
                      style={{ background: 'var(--gold)', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Send size={14} /> Answer
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(q._id)}
                    style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--rose)', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', marginBottom: q.answer ? '1rem' : 0 }}>
                <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  <strong style={{ color: 'var(--text-muted)', marginRight: '8px' }}>Q:</strong> {q.question}
                </p>
              </div>

              {q.answer && (
                <div style={{ background: 'rgba(16, 217, 140, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16, 217, 140, 0.1)' }}>
                  <p style={{ margin: 0, color: 'var(--emerald)', fontSize: '0.95rem' }}>
                    <strong style={{ opacity: 0.7, marginRight: '8px' }}>A:</strong> {q.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {replyModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '16px', width: '500px', maxWidth: '90%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Answer Question</h2>
              <button onClick={() => setReplyModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{replyModal.question}</p>
            </div>

            <form onSubmit={handleReplySubmit}>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Write your public answer here... (This will appear on the property page)"
                rows={5}
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', padding: '1rem', fontSize: '0.9rem', marginBottom: '1.5rem' }}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setReplyModal(null)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: 'var(--gold)', color: '#000', fontWeight: 600, cursor: 'pointer' }}>Publish Answer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
