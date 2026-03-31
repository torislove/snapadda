import { useState } from 'react';
import { Button } from '../../components/ui/Button';

const MOCK_CITIES = [
  { id: 1, name: 'Amaravati Region', count: 142, status: 'Active' },
  { id: 2, name: 'Vijayawada', count: 89, status: 'Active' },
  { id: 3, name: 'Guntur', count: 64, status: 'Active' },
  { id: 4, name: 'Mangalagiri', count: 35, status: 'Active' },
];

const AdminCities = () => {
  const [cities] = useState(MOCK_CITIES);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h1>Andhra Regions & Cities</h1>
        <Button size="sm">Add New City</Button>
      </div>

      <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: 'var(--spacing-md)' }}>ID</th>
              <th style={{ padding: 'var(--spacing-md)' }}>City Name</th>
              <th style={{ padding: 'var(--spacing-md)' }}>Listed Properties</th>
              <th style={{ padding: 'var(--spacing-md)' }}>Status</th>
              <th style={{ padding: 'var(--spacing-md)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((city) => (
              <tr key={city.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: 'var(--spacing-md)', color: 'var(--text-muted)' }}>#{city.id}</td>
                <td style={{ padding: 'var(--spacing-md)', fontWeight: 500 }}>{city.name}</td>
                <td style={{ padding: 'var(--spacing-md)' }}>{city.count}</td>
                <td style={{ padding: 'var(--spacing-md)' }}>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    fontSize: '0.75rem', 
                    backgroundColor: city.status === 'Active' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(241, 196, 15, 0.2)',
                    color: city.status === 'Active' ? 'var(--success)' : '#f1c40f'
                  }}>
                    {city.status}
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

export default AdminCities;
