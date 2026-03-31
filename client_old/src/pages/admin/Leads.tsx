import { useState } from 'react';
import { Button } from '../../components/ui/Button';

const MOCK_LEADS = [
  { id: 101, name: 'Eleanor Vance', email: 'eleanor@example.com', propertyId: 1, status: 'New' },
  { id: 102, name: 'Arthur Pendelton', email: 'arthur.p@example.com', propertyId: 3, status: 'Contacted' },
  { id: 103, name: 'Sophia Sterling', email: 'sophia@example.com', propertyId: 2, status: 'Qualified' },
];

const AdminLeads = () => {
  const [leads] = useState(MOCK_LEADS);

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>Lead Tracker</h1>
      
      <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
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
  );
};

export default AdminLeads;
