import { useState, useEffect, useMemo } from 'react';
import { Mail, Calendar, Search, Users, UserCheck, Clock, Download, MapPin } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAvatarBorderColor = (client: any) => {
  if (!client.onboardingCompleted) return '#ff8c42'; // orange = pending
  return '#9b59f5'; // violet = complete
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin':  return { color: '#f5c842', bg: 'rgba(245,200,66,0.1)',  border: 'rgba(245,200,66,0.2)'  };
    case 'client': return { color: '#9b59f5', bg: 'rgba(155,89,245,0.1)', border: 'rgba(155,89,245,0.2)' };
    default:       return { color: '#71717a', bg: 'rgba(113,113,122,0.1)', border: 'rgba(113,113,122,0.2)' };
  }
};

const exportCSV = (clients: any[]) => {
  const headers = ['Name', 'Email', 'Role', 'Property Type', 'Budget', 'Locations', 'Joined'];
  const rows = clients.map(c => [
    c.name || '', c.email || '', c.role || '',
    c.preferences?.propertyType || '',
    c.preferences?.budget || '',
    (c.preferences?.locations || []).join('; '),
    c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '',
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `snapadda-clients-${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
};

const AdminClients = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  useEffect(() => {
    fetch(`${API_URL}/users`)
      .then(r => r.json())
      .then(d => setClients(d.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return clients.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q);
      const matchRole = roleFilter === 'All' || c.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [clients, search, roleFilter]);

  const onboardedCount = clients.filter(c => c.onboardingCompleted).length;
  const pendingCount = clients.filter(c => !c.onboardingCompleted).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--rose)', marginBottom: '0.25rem', fontFamily: 'var(--font-mono)' }}>✦ User Base</div>
          <h1 style={{ fontSize: '1.8rem', background: 'linear-gradient(135deg,#f5397b,#9b59f5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.2rem' }}>Registered Clients</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>All platform users and their real estate preferences.</p>
        </div>
        <button
          onClick={() => exportCSV(filtered)}
          className="btn btn-ghost"
          style={{ gap: '6px' }}
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Metric pills */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Clients', val: clients.length, color: 'var(--violet)', icon: <Users size={14}/> },
          { label: 'Onboarded',     val: onboardedCount, color: 'var(--emerald)', icon: <UserCheck size={14}/> },
          { label: 'Pending',       val: pendingCount,   color: 'var(--orange)',  icon: <Clock size={14}/> },
        ].map(m => (
          <div key={m.label} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1rem', borderRadius: '99px',
            background: 'var(--bg-glass)', border: '1px solid var(--border)',
          }}>
            <span style={{ color: m.color }}>{m.icon}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.label}</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: m.color, fontFamily: 'var(--font-mono)' }}>{m.val}</span>
          </div>
        ))}
      </div>

      {/* Search + filter row */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: '200px' }}>
          <Search size={15} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." />
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['All', 'client', 'admin'].map(r => (
            <button key={r} type="button"
              onClick={() => setRoleFilter(r)}
              className={roleFilter === r ? 'btn btn-rose btn-sm' : 'btn btn-ghost btn-sm'}
              style={{ textTransform: 'capitalize' }}
            >{r}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: '18px', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Client Profile</th>
                <th>Role</th>
                <th>Property Requirement</th>
                <th>Budget</th>
                <th>Target Area</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading clients...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No clients found.</td></tr>
              ) : (
                filtered.map((client, idx) => {
                  const roleStyle = getRoleColor(client.role);
                  return (
                    <tr key={client._id} style={{ animation: `fadeInUp 0.3s ease-out ${idx * 0.04}s both` }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={client.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name || 'U')}&background=111&color=9b59f5&bold=true`}
                            alt={client.name}
                            style={{
                              width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover',
                              border: `2px solid ${getAvatarBorderColor(client)}`,
                              boxShadow: `0 0 8px ${getAvatarBorderColor(client)}44`,
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.86rem' }}>{client.name || 'Unknown'}</div>
                            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Mail size={10} /> {client.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                          padding: '3px 10px', borderRadius: '99px',
                          background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}`,
                        }}>{client.role || 'client'}</span>
                      </td>
                      <td>
                        {client.onboardingCompleted ? (
                          <div>
                            <div style={{ fontSize: '0.83rem', fontWeight: 500, color: 'var(--violet)' }}>{client.preferences?.propertyType || 'Any'}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{client.preferences?.purpose || 'Not specified'}</div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: 'rgba(255,140,66,0.1)', color: 'var(--orange)', border: '1px solid rgba(255,140,66,0.2)' }}>
                            Pending Setup
                          </span>
                        )}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--gold)' }}>
                        {client.preferences?.budget || '—'}
                      </td>
                      <td style={{ fontSize: '0.78rem' }}>
                        {client.preferences?.locations?.length > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--cyan)' }}>
                            <MapPin size={11} />
                            {client.preferences.locations.slice(0, 2).join(', ')}
                            {client.preferences.locations.length > 2 && <span style={{ color: 'var(--text-muted)' }}>+{client.preferences.locations.length - 2}</span>}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Any Location</span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={12} />
                          {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : '—'}
                        </div>
                      </td>
                      <td>
                        {client.onboardingCompleted
                          ? <span style={{ fontSize:'0.65rem', fontWeight:700, padding:'3px 10px', borderRadius:'99px', background:'rgba(16,217,140,0.1)', color:'var(--emerald)', border:'1px solid rgba(16,217,140,0.2)' }}>● Active</span>
                          : <span style={{ fontSize:'0.65rem', fontWeight:700, padding:'3px 10px', borderRadius:'99px', background:'rgba(255,140,66,0.1)', color:'var(--orange)', border:'1px solid rgba(255,140,66,0.2)' }}>○ Pending</span>
                        }
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminClients;
