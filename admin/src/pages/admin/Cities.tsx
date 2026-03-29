import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { fetchCities } from '../../services/api';

const MOCK_CITIES = [
  { id: 1, name: 'Amaravati Region', count: 142, status: 'Active' },
  { id: 2, name: 'Vijayawada', count: 89, status: 'Active' },
  { id: 3, name: 'Guntur', count: 64, status: 'Active' },
  { id: 4, name: 'Mangalagiri', count: 35, status: 'Active' },
];

const AdminCities = () => {
  const [cities, setCities] = useState<any[]>(MOCK_CITIES);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchCities().then(data => {
      if (data && data.data && data.data.length > 0) setCities(data.data);
      else if (Array.isArray(data) && data.length > 0) setCities(data);
    }).catch(() => {
      console.log("Using local mock cities.");
    });
  }, []);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h1>Andhra Regions & Cities</h1>
        <Button size="sm" onClick={() => setIsAdding(!isAdding)}>{isAdding ? 'Close Form' : 'Add New City'}</Button>
      </div>

      {isAdding && (
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-xl)', border: '1px solid var(--border-subtle)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Add New Region</h2>
          <form onSubmit={handleAddSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>City/Region Name</label>
              <input type="text" required placeholder="e.g. Vizag" style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'white' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Status</label>
              <select style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'white' }}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Image URL (Cloudinary)</label>
              <input type="url" required placeholder="https://res.cloudinary.com/..." style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'white' }} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)' }}>
              <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit">Save Region</Button>
            </div>
          </form>
        </div>
      )}

      <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
      <div className="table-responsive">
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
    </div>
  );
};

export default AdminCities;
