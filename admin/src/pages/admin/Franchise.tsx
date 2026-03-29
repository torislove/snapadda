import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, MapPin, Plus, Trash2, Power, X, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

type FAdmin = {
  _id: string; name: string; email: string; phone: string;
  regions: string[]; permissions: string[]; isActive: boolean; createdAt: string;
};

const PERMISSION_OPTIONS = [
  { key: 'properties', label: 'Properties', color: '#c9a84c' },
  { key: 'contacts', label: 'Contacts', color: '#5b7ea1' },
  { key: 'leads', label: 'Leads', color: '#2ecc71' },
  { key: 'inquiries', label: 'Inquiries', color: '#e67e22' },
];

const AdminFranchise = () => {
  const [admins, setAdmins] = useState<FAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', regions: '' as string, permissions: ['properties', 'contacts']
  });

  useEffect(() => { fetchAdmins(); }, []);

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${API_URL}/franchise/admins`);
      const data = await res.json();
      if (data.status === 'success') setAdmins(data.data);
    } catch { } finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, regions: form.regions.split(',').map(r => r.trim()).filter(Boolean) };
    await fetch(`${API_URL}/franchise/admins`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setShowModal(false);
    setForm({ name: '', email: '', password: '', phone: '', regions: '', permissions: ['properties', 'contacts'] });
    fetchAdmins();
  };

  const handleToggleActive = async (admin: FAdmin) => {
    await fetch(`${API_URL}/franchise/admins/${admin._id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !admin.isActive })
    });
    fetchAdmins();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this franchise admin?')) return;
    await fetch(`${API_URL}/franchise/admins/${id}`, { method: 'DELETE' });
    fetchAdmins();
  };

  const togglePermission = (perm: string) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h1>Franchise Partners</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage franchise admin panels for different regions</p>
        </div>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Plus size={14} /> Create Franchise
        </Button>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--spacing-lg)' }}>
          {[1,2,3].map(i => <div key={i} style={{ height: '200px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', animation: 'pulse 1.5s infinite' }} />)}
        </div>
      ) : admins.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <Shield size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <h3 style={{ fontFamily: 'var(--font-body)' }}>No franchise admins yet</h3>
          <p>Create your first franchise partner to manage properties in a specific region.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--spacing-lg)' }}>
          <AnimatePresence>
            {admins.map(admin => (
              <motion.div
                key={admin._id} layout
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)', padding: '24px', position: 'relative',
                  opacity: admin.isActive ? 1 : 0.6
                }}
              >
                {/* Status Toggle */}
                <button onClick={() => handleToggleActive(admin)} style={{
                  position: 'absolute', top: '16px', right: '16px',
                  background: admin.isActive ? 'rgba(46,204,113,0.15)' : 'rgba(231,76,60,0.15)',
                  color: admin.isActive ? 'var(--success)' : 'var(--error)',
                  border: 'none', borderRadius: 'var(--radius-full)', padding: '6px 12px',
                  fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <Power size={12} /> {admin.isActive ? 'Active' : 'Inactive'}
                </button>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: 'rgba(201,168,76,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--accent-gold)', fontWeight: 700, fontSize: '1.1rem'
                  }}>
                    {admin.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{admin.name}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{admin.email}</div>
                  </div>
                </div>

                {/* Regions */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Regions</div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {admin.regions.map((r, i) => (
                      <span key={i} style={{
                        fontSize: '0.75rem', padding: '3px 10px', borderRadius: '10px',
                        background: 'rgba(201,168,76,0.1)', color: 'var(--accent-gold)', border: '1px solid var(--border-gold)',
                        display: 'flex', alignItems: 'center', gap: '3px'
                      }}>
                        <MapPin size={10} /> {r}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Permissions */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Permissions</div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {admin.permissions.map((p, i) => {
                      const opt = PERMISSION_OPTIONS.find(o => o.key === p);
                      return (
                        <span key={i} style={{
                          fontSize: '0.72rem', padding: '3px 8px', borderRadius: '8px',
                          background: `${opt?.color || '#666'}15`, color: opt?.color || '#666',
                          fontWeight: 500
                        }}>
                          {opt?.label || p}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Joined {new Date(admin.createdAt).toLocaleDateString()}
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(admin._id)} style={{ color: 'var(--error)' }}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '32px', maxWidth: '500px', width: '100%', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Create Franchise Admin</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input placeholder="Name *" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              <input placeholder="Email *" type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              <div style={{ position: 'relative' }}>
                <input placeholder="Password *" type={showPass ? 'text' : 'password'} required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} style={{ paddingRight: '40px', width: '100%' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <input placeholder="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              <input placeholder="Regions (comma separated, e.g. Guntur, Vijayawada)" value={form.regions} onChange={e => setForm(p => ({ ...p, regions: e.target.value }))} />

              <div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Permissions</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {PERMISSION_OPTIONS.map(p => (
                    <button key={p.key} type="button" onClick={() => togglePermission(p.key)} style={{
                      padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.82rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                      background: form.permissions.includes(p.key) ? `${p.color}20` : 'var(--bg-tertiary)',
                      color: form.permissions.includes(p.key) ? p.color : 'var(--text-muted)',
                      border: `1px solid ${form.permissions.includes(p.key) ? `${p.color}40` : 'var(--border-subtle)'}`,
                      fontWeight: 500, transition: 'all 0.2s'
                    }}>
                      {form.permissions.includes(p.key) && <Check size={12} />} {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" style={{ width: '100%' }}>
                <Shield size={16} /> Create Franchise
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminFranchise;
