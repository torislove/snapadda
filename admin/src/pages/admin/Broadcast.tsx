import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Trash2, ShieldCheck, AlertTriangle, Bell, Info } from 'lucide-react';
import { fetchSetting, saveSetting } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

const AdminBroadcast = () => {
  const { showToast, ToastComponent } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [broadcast, setBroadcast] = useState({
    message: '',
    type: 'info',
    isActive: false,
    showUntil: ''
  });

  useEffect(() => {
    fetchSetting('broadcast_config')
      .then(data => {
        if (data) setBroadcast(prev => ({ ...prev, ...data }));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSetting('broadcast_config', broadcast);
      showToast('Broadcast grid updated! 📡');
    } catch (err) {
      showToast('Sync failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setBroadcast({ ...broadcast, message: '', isActive: false });
  };

  if (loading) return <div style={{ color: 'white', padding: '2rem' }}>Scanning frequencies...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <ToastComponent />
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>✦ EMERGENCY FREQUENCY</div>
        <h1 style={{ fontWeight: 900, color: 'white', margin: 0 }}>System Broadcast</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Transmit critical alerts or announcements directly to the client portal top-bar.
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ padding: '2.5rem', borderRadius: '28px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div>
            <label className="admin-label">Broadcast Message</label>
            <textarea 
              value={broadcast.message}
              onChange={e => setBroadcast({ ...broadcast, message: e.target.value })}
              className="admin-input"
              rows={4}
              placeholder="e.g. 🔥 New CRDA Plots launched in Amaravati! Contact now for site visit."
              style={{ fontSize: '1rem', padding: '1.25rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
               <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Characters: {broadcast.message.length}</span>
               <button onClick={handleClear} style={{ background: 'none', border: 'none', color: 'var(--rose)', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                 <Trash2 size={12} /> CLEAR MESSAGE
               </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label className="admin-label">Alert Severity</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { id: 'info', icon: <Info size={14} />, color: 'var(--cyan)' },
                  { id: 'success', icon: <ShieldCheck size={14} />, color: 'var(--emerald)' },
                  { id: 'warning', icon: <AlertTriangle size={14} />, color: 'var(--gold)' },
                  { id: 'emergency', icon: <Bell size={14} />, color: 'var(--rose)' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setBroadcast({ ...broadcast, type: t.id })}
                    style={{
                      flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid',
                      borderColor: broadcast.type === t.id ? t.color : 'rgba(255,255,255,0.1)',
                      background: broadcast.type === t.id ? `${t.color}22` : 'rgba(255,255,255,0.03)',
                      color: broadcast.type === t.id ? t.color : 'rgba(255,255,255,0.4)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s'
                    }}
                  >
                    {t.icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="admin-label">System Status</label>
              <button
                onClick={() => setBroadcast({ ...broadcast, isActive: !broadcast.isActive })}
                style={{
                  width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid',
                  borderColor: broadcast.isActive ? 'var(--emerald)' : 'rgba(255,255,255,0.1)',
                  background: broadcast.isActive ? 'rgba(16,217,140,0.1)' : 'rgba(255,255,255,0.03)',
                  color: broadcast.isActive ? 'var(--emerald)' : 'rgba(255,255,255,0.4)',
                  fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: broadcast.isActive ? 'var(--emerald)' : 'rgba(255,255,255,0.2)' }} />
                {broadcast.isActive ? 'TRANSMITTING LIVE' : 'STATION OFFLINE'}
              </button>
            </div>
          </div>

          <div style={{ background: 'rgba(232,184,75,0.05)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(232,184,75,0.1)' }}>
            <h4 style={{ color: 'var(--gold)', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} /> Live Transmission Preview
            </h4>
            <div style={{ 
              padding: '12px 20px', borderRadius: '10px', 
              background: broadcast.type === 'emergency' ? 'var(--rose)' : broadcast.type === 'warning' ? 'var(--gold)' : broadcast.type === 'success' ? 'var(--emerald)' : 'var(--cyan)',
              color: broadcast.type === 'emergency' || broadcast.type === 'warning' || broadcast.type === 'success' ? '#000' : '#000',
              fontWeight: 800, fontSize: '0.85rem', opacity: broadcast.isActive ? 1 : 0.4
            }}>
              {broadcast.message || 'Transmission buffer empty...'}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-violet"
            style={{ width: '100%', padding: '1.25rem', borderRadius: '16px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
          >
            {saving ? 'SYNCING SATELLITE...' : <><Save size={18} /> UPDATE BROADCAST CHANNEL</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminBroadcast;
