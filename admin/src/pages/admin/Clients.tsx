import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Users, UserCheck, Clock, Download, Zap, X, PhoneCall, Map as MapIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../components/ui/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAvatarBorderColor = (client: any) => {
  if (!client.onboardingCompleted) return '#ff8c42'; 
  return '#9b59f5'; 
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin':  return { color: '#f5c842', bg: 'rgba(245,200,66,0.1)',  border: 'rgba(245,200,66,0.2)'  };
    case 'client': return { color: '#9b59f5', bg: 'rgba(155,89,245,0.1)', border: 'rgba(155,89,245,0.2)' };
    default:       return { color: '#71717a', bg: 'rgba(113,113,122,0.1)', border: 'rgba(113,113,122,0.2)' };
  }
};

/* ── User Intelligence Modal ── */
const UserIntelligenceModal = ({ user, onClose }: { user: any; onClose: () => void }) => {
  const activity = user.activityLog || [];
  const locations = user.preferences?.locations || [];

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        style={{ background: '#0a0a14', width: '100%', maxWidth: '580px', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', background: 'rgba(232,184,75,0.1)', color: 'var(--gold)', borderRadius: '10px' }}>
              <Zap size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'white' }}>Intelligence Profile</h3>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.name} | {user.phone || 'Anonymous'}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.5 }}><X size={20}/></button>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
             <div style={{ background: 'rgba(155,89,245,0.05)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(155,89,245,0.1)' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--violet)', marginBottom: '8px', letterSpacing: '0.1em' }}>TARGET MARKETS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                   {locations.length > 0 ? locations.map((l: any) => (
                     <span key={l} style={{ fontSize: '0.7rem', color: 'white', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '6px' }}>{l}</span>
                   )) : <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>No location intent</span>}
                </div>
             </div>
             <div style={{ background: 'rgba(34,217,224,0.05)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(34,217,224,0.1)' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--cyan)', marginBottom: '8px', letterSpacing: '0.1em' }}>BUDGET CAPACITY</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>{user.preferences?.budget || 'Undefined'}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>{user.preferences?.propertyType || 'Multi-category'}</div>
             </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ color: 'var(--emerald)' }}><MapIcon size={18} /></div>
                <div>
                   <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>
                      {user.lastLocation?.city || 'Location Metadata Missing'}
                   </div>
                   <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      GPS: {user.lastLocation?.lat ? `${user.lastLocation.lat.toFixed(3)}, ${user.lastLocation.lng.toFixed(3)}` : 'N/A'}
                   </div>
                </div>
             </div>
          </div>

          <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: '1rem' }}>ACTIVITY TIMELINE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '1.25rem' }}>
             <div style={{ position: 'absolute', left: '6px', top: '5px', bottom: '5px', width: '1px', background: 'rgba(255,255,255,0.08)' }} />
             {activity.length > 0 ? activity.slice(-5).reverse().map((ev: any, idx: number) => (
               <div key={idx} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-19.5px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: ev.type === 'PROPERTY_VIEW' ? 'var(--emerald)' : 'var(--violet)', border: '2px solid #0a0a14' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>
                        {ev.type.replace('_', ' ')}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {ev.payload?.title || ev.payload?.query || 'Platform interaction'}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                      {new Date(ev.timestamp).toLocaleDateString()}
                    </div>
                  </div>
               </div>
             )) : (
               <div style={{ padding: '1rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No recent interactions logged.</div>
             )}
          </div>
        </div>

        <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'flex-end' }}>
           <button onClick={onClose} style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'white', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>CLOSE PROFILE</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AdminClients = () => {
  const { showToast, ToastComponent } = useToast();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('snapadda_admin_token');
      const res = await fetch(`${API_URL}/users`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const d = await res.json();
      setClients(d.data || []);
    } catch {
      showToast('Network error while fetching registry', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleExport = () => {
    const headers = ['Name', 'Email', 'Role', 'Joined'];
    const rows = filtered.map(c => [c.name || 'N/A', c.email || 'N/A', c.role || 'client', c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A']);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `snapadda-clients.csv`;
    a.click();
    showToast('Registry exported successfully! 📂');
  };

  const filtered = useMemo(() => {
    return clients.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || (c.phone || '').includes(q);
      const matchRole = roleFilter === 'All' || c.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [clients, search, roleFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      <ToastComponent />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.2rem', textTransform: 'uppercase', color: 'var(--rose)', marginBottom: '0.5rem' }}>✦ CLIENT REGISTRY</div>
          <h1 style={{ fontWeight: 900, color: 'white', margin: 0 }}>Community Intelligence</h1>
        </div>
        <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Platform Users', val: clients.length, color: 'var(--violet)', icon: Users },
          { label: 'Onboarded', val: clients.filter(c => c.onboardingCompleted).length, color: 'var(--emerald)', icon: UserCheck },
          { label: 'Active (1h)', val: clients.filter(c => c.lastActive && (new Date().getTime() - new Date(c.lastActive).getTime()) < 3600000).length, color: 'var(--cyan)', icon: Clock },
        ].map(m => (
          <div key={m.label} style={{ flex: 1, minWidth: '200px', background: 'var(--bg-glass)', border: '1px solid var(--border)', padding: '1.25rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '10px', background: `${m.color}15`, color: m.color, borderRadius: '12px' }}><m.icon size={20}/></div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>{m.label}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>{m.val}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '24px' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
           <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, contact, or credentials..."
                style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', outline: 'none' }}
              />
           </div>
           <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '12px' }}>
              {['All', 'client', 'admin'].map(r => (
                <button key={r} onClick={() => setRoleFilter(r)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: roleFilter === r ? 'var(--rose)' : 'transparent', color: roleFilter === r ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>{r}</button>
              ))}
           </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: '24px', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Access Level</th>
                <th>Requirements</th>
                <th>Activity Status</th>
                <th>Management</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--gold)', fontWeight: 800 }}>Syncing Client Registry...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>No clients match the current query.</td></tr>
              ) : (
                filtered.map((client) => {
                  const roleStyle = getRoleColor(client.role);
                  return (
                    <tr key={client._id} className="table-row-hover" onClick={() => setSelectedUser(client)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img
                            src={client.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name || 'U')}&background=111&color=9b59f5&bold=true`}
                            alt={client.name}
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${getAvatarBorderColor(client)}` }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>{client.name || 'Anonymous'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{client.email || 'No email provided'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', padding: '4px 12px', borderRadius: '99px', background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}` }}>{client.role || 'client'}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--violet)' }}>{client.preferences?.propertyType || 'Generic'}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--gold)' }}>{client.preferences?.budget || '—'}</div>
                        </div>
                      </td>
                      <td>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {client.onboardingCompleted
                              ? <span style={{ fontSize:'0.6rem', fontWeight:900, color:'var(--emerald)' }}>● ONBOARDED</span>
                              : <span style={{ fontSize:'0.6rem', fontWeight:900, color:'var(--orange)' }}>⏳ PENDING SETUP</span>
                            }
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Seen: {client.lastActive ? new Date(client.lastActive).toLocaleDateString() : 'Never'}</div>
                         </div>
                      </td>
                      <td>
                         <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                            {client.phone && (
                               <a href={`tel:${client.phone}`} style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16,217,140,0.1)', color: 'var(--emerald)', border: '1px solid rgba(16,217,140,0.2)' }}><PhoneCall size={14} /></a>
                            )}
                            <button onClick={() => setSelectedUser(client)} style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}><Zap size={14} /></button>
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
        {selectedUser && <UserIntelligenceModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default AdminClients;
