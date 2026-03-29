import { useState } from 'react';
import { Button } from '../../components/ui/Button';

const MOCK_PROPERTIES = [
  { id: 1, title: 'Modern Glass Villa', price: '$4,500,000', status: 'Active' },
  { id: 2, title: 'Minimalist Hilltop Estate', price: '$3,850,000', status: 'Pending' },
  { id: 3, title: 'Oceanfront Penthouse', price: '$7,200,000', status: 'Active' },
];

const AdminProperties = () => {
  const [properties] = useState(MOCK_PROPERTIES);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h1>Property Management</h1>
        <Button size="sm">Add New Property</Button>
      </div>

      <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: 'var(--spacing-md)' }}>ID</th>
              <th style={{ padding: 'var(--spacing-md)' }}>Title</th>
              <th style={{ padding: 'var(--spacing-md)' }}>Price</th>
              <th style={{ padding: 'var(--spacing-md)' }}>Status</th>
              <th style={{ padding: 'var(--spacing-md)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((prop) => (
              <tr key={prop.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: 'var(--spacing-md)', color: 'var(--text-muted)' }}>#{prop.id}</td>
                <td style={{ padding: 'var(--spacing-md)', fontWeight: 500 }}>{prop.title}</td>
                <td style={{ padding: 'var(--spacing-md)' }}>{prop.price}</td>
                <td style={{ padding: 'var(--spacing-md)' }}>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    fontSize: '0.75rem', 
                    backgroundColor: prop.status === 'Active' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(241, 196, 15, 0.2)',
                    color: prop.status === 'Active' ? 'var(--success)' : '#f1c40f'
                  }}>
                    {prop.status}
                  </span>
                </td>
                <td style={{ padding: 'var(--spacing-md)' }}>
                  <Button variant="ghost" size="sm">Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProperties;
