import { useState, useEffect, useMemo } from 'react';
import { Mail, Calendar, Search, Users, UserCheck, Clock, Download, Zap, X, PhoneCall, MessageSquare, Map as MapIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

/* ── User Intelligence Modal ── */
const UserIntelligenceModal = ({ user, onClose }: { user: any; onClose: () => void }) => {
  const activity = user.activityLog || [];
  const locations = user.preferences?.locations || [];

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        style={{ background: '#0a0a0f', width: '100%', maxWidth: '600px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: 'rgba(232,184,75,0.1)', color: 'var(--gold)', borderRadius: '12px' }}>
              <Zap size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>Intelligence Profile</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.name} ({user.phone || 'Anonymous'})</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
             <div style={{ background: 'rgba(155,89,245,0.05)', padding: '1.25rem', borderRadius: '20px', border: '1px solid rgba(155,89,245,0.1)' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--violet)', marginBottom: '8px', letterSpacing: '0.1em' }}>TARGET MARKETS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                   {locations.length > 0 ? locations.map((l: any) => (
                     <span key={l} style={{ fontSize: '0.7rem', color: 'white', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '8px' }}>{l}</span>
                   )) : <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>No location intent yet</span>}
                </div>
             </div>
             <div style={{ background: 'rgba(34,217,224,0.05)', padding: '1.25rem', borderRadius: '20px', border: '1px solid rgba(34,217,224,0.1)' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--cyan)', marginBottom: '8px', letterSpacing: '0.1em' }}>BUDGET CAPACITY</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: 'white' }}>{user.preferences?.budget || 'Undefined'}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>Interest: {user.preferences?.propertyType || 'Multi-category'}</div>
             </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2.5rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--emerald)', letterSpacing: '0.1em' }}>GEOGRAPHICAL TRACKING</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Status: Active</div>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ color: 'var(--emerald)' }}><MapIcon size={20} /></div>
                <div>
                   <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>
                      {user.lastLocation?.lat ? `${user.lastLocation.lat.toFixed(4)}, ${user.lastLocation.lng.toFixed(4)}` : 'No coordinate data'}
                   </div>
                   <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Tracked from: {user.lastLocation?.city || 'Browser Geolocation API'}
                   </div>
                </div>
             </div>
          </div>

          <div style={{ marginBottom: '1rem', fontSize: '0.75rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.15em' }}>ACTIVITY TIMELINE (కార్యకలాపాలు)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingLeft: '1.5rem' }}>
             <div style={{ position: 'absolute', left: '7px', top: '5px', bottom: '5px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
             {activity.length > 0 ? activity.slice().reverse().map((ev: any, idx: number) => (
               <div key={idx} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-22.5px', top: '4px', width: '14px', height: '14px', borderRadius: '50%', background: ev.type === 'PROPERTY_VIEW' ? 'var(--emerald)' : 'var(--violet)', border: '3px solid #0a0a0f' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>
                        {ev.type === 'PROPERTY_VIEW' ? 'Viewed Property' : ev.type === 'SEARCH' ? 'Performed Search' : ev.type}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {ev.payload?.title || ev.payload?.query || 'General platform interaction'}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {new Date(ev.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
               </div>
             )) : (
               <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recent activity logs available.</div>
             )}
          </div>
        </div>

        <div style={{ padding: '1.5rem 2rem', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
           <button onClick={onClose} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'white', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}>CLOSE REGISTRY</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AdminClients = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('snapadda_admin_token');
    fetch(`${API_URL}/users`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.json())
      .then(d => setClients(d.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return clients.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || 
        (c.name || '').toLowerCase().includes(q) || 
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.whatsapp || '').includes(q);
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

      {/* Live Now Active Users (Logged in within last hour) */}
      {clients.filter(c => c.lastActive && (new Date().getTime() - new Date(c.lastActive).getTime()) < 3600000).length > 0 && (
        <div style={{ background: 'rgba(16,217,140,0.05)', border: '1px solid rgba(16,217,140,0.2)', padding: '1rem', borderRadius: '16px', display: 'flex', gap: '1rem', overflowX: 'auto', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald)', fontWeight: 900, fontSize: '0.8rem', paddingRight: '1rem', borderRight: '1px solid rgba(16,217,140,0.2)' }}>
            <div className="pulse-dot" style={{ width: '10px', height: '10px', background: 'var(--emerald)', borderRadius: '50%', boxShadow: '0 0 10px var(--emerald)' }}></div>
            LIVE NOW
          </div>
          {clients.filter(c => c.lastActive && (new Date().getTime() - new Date(c.lastActive).getTime()) < 3600000).map(c => (
             <div key={c._id} onClick={() => setSelectedUser(c)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '99px', cursor: 'pointer', flexShrink: 0 }}>
               <img src={c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || 'U')}&background=111&color=fff`} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
               <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'white' }}>{c.name || c.phone}</span>
             </div>
          ))}
        </div>
      )}

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

      {/* Desktop Table View */}
      <div className="desktop-only" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: '18px', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Client Profile</th>
                <th>Role</th>
                <th>Contact Info</th>
                <th>Requirement</th>
                <th>Status / Last Seen</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading clients...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No clients found.</td></tr>
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                           <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>{client.phone || 'No Phone'}</div>
                           {client.whatsapp && <div style={{ fontSize: '0.65rem', color: '#25D366', fontWeight: 600 }}>WA: {client.whatsapp}</div>}
                        </div>
                      </td>
                      <td>
                        {client.onboardingCompleted ? (
                          <div>
                            <div style={{ fontSize: '0.83rem', fontWeight: 500, color: 'var(--violet)' }}>{client.preferences?.propertyType || 'Any'}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--gold)' }}>Budget: {client.preferences?.budget || '—'}</div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: 'rgba(255,140,66,0.1)', color: 'var(--orange)', border: '1px solid rgba(255,140,66,0.2)' }}>
                            Pending Setup
                          </span>
                        )}
                      </td>
                      <td>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {client.onboardingCompleted
                              ? <span style={{ fontSize:'0.6rem', fontWeight:900, padding:'2px 8px', borderRadius:'6px', background:'rgba(16,217,140,0.1)', color:'var(--emerald)', border:'1px solid rgba(16,217,140,0.2)', width: 'fit-content' }}>● ACTIVE</span>
                              : <span style={{ fontSize:'0.6rem', fontWeight:900, padding:'2px 8px', borderRadius:'6px', background:'rgba(255,140,66,0.1)', color:'var(--orange)', border:'1px solid rgba(255,140,66,0.2)', width: 'fit-content' }}>⏳ PENDING</span>
                            }
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                               Seen: {client.lastActive ? new Date(client.lastActive).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Never'}
                            </div>
                         </div>
                      </td>
                      <td>
                         <div style={{ display: 'flex', gap: '8px' }}>
                            {client.phone && (
                               <a href={`tel:${client.phone}`} className="btn-ghost" style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--emerald)', color: 'var(--emerald)' }}>
                                  <PhoneCall size={14} />
                               </a>
                            )}
                            {client.whatsapp && (
                               <a href={`https://wa.me/${client.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="btn-ghost" style={{ padding: '8px', borderRadius: '8px', border: '1px solid #25D366', color: '#25D366' }}>
                                  <MessageSquare size={14} />
                               </a>
                            )}
                            <button className="btn-ghost" style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--gold)', color: 'var(--gold)' }} onClick={() => setSelectedUser(client)}>
                               <Zap size={14} />
                            </button>
                         </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedUser && (
          <UserIntelligenceModal user={selectedUser} onClose={() => setSelectedUser(null)} />
        )}
      </AnimatePresence>

      {/* Mobile Card List View */}
      <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Syncing encrypted records...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Zero matches found.</div>
        ) : (
          filtered.map((client) => {
            const roleStyle = getRoleColor(client.role);
            return (
              <div key={client._id} className="glass-card" style={{ padding: '1.25rem', borderLeft: `3px solid ${getAvatarBorderColor(client)}` }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <img
                    src={client.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name || 'U')}&background=111&color=9b59f5&bold=true`}
                    alt={client.name}
                    style={{
                      width: '44px', height: '44px', borderRadius: '12px', objectFit: 'cover',
                      border: `2px solid ${getAvatarBorderColor(client)}`,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem' }}>{client.name || 'Unknown'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{client.email}</div>
                    <span style={{
                      fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase',
                      padding: '2px 8px', borderRadius: '4px',
                      background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}`,
                    }}>{client.role || 'client'}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '2px' }}>REQUIREMENT</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--violet)', fontWeight: 700 }}>{client.preferences?.propertyType || 'Unspecified'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '2px' }}>BUDGET</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 700 }}>{client.preferences?.budget || '—'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                   <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> Joined {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : '—'}
                   </div>
                   {client.onboardingCompleted
                      ? <span style={{ fontSize:'0.65rem', fontWeight:800, color:'var(--emerald)' }}>✓ ACTIVE</span>
                      : <span style={{ fontSize:'0.65rem', fontWeight:800, color:'var(--orange)' }}>⏳ PENDING</span>
                   }
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminClients;
