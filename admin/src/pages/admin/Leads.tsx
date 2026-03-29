import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';

const MOCK_LEADS = [
  { id: 101, name: 'Eleanor Vance', email: 'eleanor@example.com', propertyId: 1, status: 'New' },
  { id: 102, name: 'Arthur Pendelton', email: 'arthur.p@example.com', propertyId: 3, status: 'Contacted' },
  { id: 103, name: 'Sophia Sterling', email: 'sophia@example.com', propertyId: 2, status: 'Qualified' },
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminLeads = () => {
  const [leads] = useState(MOCK_LEADS);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const res = await fetch(`${API_URL}/inquiries`);
      const data = await res.json();
      if (res.ok) setInquiries(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const submitAnswer = async (id: string) => {
    if (!answerText) return;
    try {
      const res = await fetch(`${API_URL}/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: answerText })
      });
      if (res.ok) {
        setAnsweringId(null);
        setAnswerText('');
        fetchInquiries();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>Lead Tracker</h1>
      
      <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
      <div className="table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: 'var(--spacing-md)' }}>Lead ID</th>
              <th style={{ padding: 'var(--spacing-md)' }}>Name</th>
              <th style={{ padding: 'var(--spacing-md)' }}>Contact Info</th>
              <th style={{ padding: 'var(--spacing-md)' }}>Interest (Prop ID)</th>
              <th style={{ padding: 'var(--spacing-md)' }}>Status</th>
              <th style={{ padding: 'var(--spacing-md)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: 'var(--spacing-md)', color: 'var(--text-muted)' }}>#{lead.id}</td>
                <td style={{ padding: 'var(--spacing-md)', fontWeight: 500 }}>{lead.name}</td>
                <td style={{ padding: 'var(--spacing-md)' }}>{lead.email}</td>
                <td style={{ padding: 'var(--spacing-md)' }}>#{lead.propertyId}</td>
                <td style={{ padding: 'var(--spacing-md)' }}>
                  <select 
                    defaultValue={lead.status}
                    style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Lost">Lost</option>
                  </select>
                </td>
                <td style={{ padding: 'var(--spacing-md)' }}>
                  <Button variant="outline" size="sm">Send Email</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
    
    {/* Q&A Section */}
    <h1 style={{ marginTop: 'var(--spacing-2xl)', marginBottom: 'var(--spacing-xl)' }}>Property Q&A (Inquiries)</h1>
    <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
      <div className="table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: 'var(--spacing-md)' }}>Client</th>
              <th style={{ padding: 'var(--spacing-md)' }}>Property</th>
              <th style={{ padding: 'var(--spacing-md)' }}>Question</th>
              <th style={{ padding: 'var(--spacing-md)' }}>Status</th>
              <th style={{ padding: 'var(--spacing-md)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 'var(--spacing-md)', textAlign: 'center', color: 'gray' }}>No pending inquiries</td></tr>
            )}
            {inquiries.map((inq) => (
              <tr key={inq._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: 'var(--spacing-md)' }}>
                  <div>{inq.clientName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'gray' }}>{inq.clientContact}</div>
                </td>
                <td style={{ padding: 'var(--spacing-md)' }}>{inq.propertyId?.title || 'Unknown'}</td>
                <td style={{ padding: 'var(--spacing-md)', maxWidth: '300px' }}>
                  <div style={{ fontWeight: 500, marginBottom: '4px' }}>Q: {inq.question}</div>
                  {inq.answer && <div style={{ color: 'var(--accent-gold)' }}>A: {inq.answer}</div>}
                  
                  {answeringId === inq._id && (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Type answer..."
                        style={{ flex: 1, padding: '4px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'white' }}
                      />
                      <Button size="sm" onClick={() => submitAnswer(inq._id)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setAnsweringId(null)}>Cancel</Button>
                    </div>
                  )}
                </td>
                <td style={{ padding: 'var(--spacing-md)' }}>
                  <span style={{ 
                    padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', 
                    backgroundColor: inq.status === 'Answered' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(241, 196, 15, 0.2)',
                    color: inq.status === 'Answered' ? 'var(--success)' : '#f1c40f'
                  }}>
                    {inq.status}
                  </span>
                </td>
                <td style={{ padding: 'var(--spacing-md)' }}>
                  {!inq.answer && answeringId !== inq._id && (
                    <Button variant="outline" size="sm" onClick={() => { setAnsweringId(inq._id); setAnswerText(''); }}>Answer</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    
    </div>
  );
};

export default AdminLeads;
