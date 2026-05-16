import { useState, useEffect } from 'react';
import { Save, Plus, ArrowUp, ArrowDown, Activity, Settings as SettingsIcon, Trash2 } from 'lucide-react';
import { fetchSetting, saveSetting } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

interface MarqueeItem {
  id: string;
  label: string;
  link?: string;
  icon?: string;
}

interface MarqueeSetting {
  band1: MarqueeItem[];
  band2: MarqueeItem[];
  speed1: number;
  speed2: number;
  citiesSpeed: number;
  reviewsSpeed: number;
}

const DEFAULT_STRIPS: MarqueeSetting = {
  speed1: 30,
  speed2: 35,
  band1: [
    { id: '1', label: 'Amaravati Region', link: '#cities', icon: 'MapPin' },
    { id: '2', label: 'Verified Listings ✅', link: '#properties', icon: 'ShieldCheck' },
  ],
  band2: [
    { id: '3', label: 'Invest in Plots ✨', link: '#search', icon: 'Square' },
    { id: '4', label: 'Under 50 Lakhs 🔥', link: '#search', icon: 'IndianRupee' },
  ],
  citiesSpeed: 80,
  reviewsSpeed: 100
};

const ICON_OPTIONS = ['MapPin', 'ShieldCheck', 'Building2', 'Home', 'Square', 'Compass', 'IndianRupee', 'Award', 'CheckCircle2', 'Landmark', 'TrendingUp', 'Star'];

export default function AdminMarquee() {
  const [settings, setSettings] = useState<MarqueeSetting>(DEFAULT_STRIPS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    fetchSetting('marquee_strips')
      .then((res: any) => {
        if (res && res.band1) {
          setSettings(res);
        }
      })
      .catch(() => showToast('Failed to load marquee settings', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSetting('marquee_strips', settings);
      showToast('Marquee bands synchronized across the grid! 🎞️');
    } catch (error: any) {
      showToast(error.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addItem = (band: 'band1' | 'band2') => {
    const newItem: MarqueeItem = {
      id: Date.now().toString(),
      label: 'New Banner Item',
      link: '#',
      icon: 'Star'
    };
    setSettings(prev => ({
      ...prev,
      [band]: [...prev[band], newItem]
    }));
  };

  const removeItem = (band: 'band1' | 'band2', id: string) => {
    setSettings(prev => ({
      ...prev,
      [band]: prev[band].filter(item => item.id !== id)
    }));
  };

  const updateItem = (band: 'band1' | 'band2', id: string, field: keyof MarqueeItem, value: string) => {
    setSettings(prev => ({
      ...prev,
      [band]: prev[band].map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const moveItem = (band: 'band1' | 'band2', index: number, direction: 'up' | 'down') => {
    setSettings(prev => {
      const arr = [...prev[band]];
      if (direction === 'up' && index > 0) {
        [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      } else if (direction === 'down' && index < arr.length - 1) {
        [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
      }
      return { ...prev, [band]: arr };
    });
  };

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Initializing marquee data...</div>;

  const renderBandEditor = (bandName: 'band1' | 'band2', title: string, speedKey: 'speed1' | 'speed2') => (
    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={20} style={{ color: 'var(--gold)' }} /> {title}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Scrolling items configuration.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <SettingsIcon size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Speed</span>
            <input 
              type="number" 
              value={settings[speedKey]} 
              onChange={e => setSettings(prev => ({ ...prev, [speedKey]: Number(e.target.value) }))}
              style={{ width: '50px', background: 'none', border: 'none', color: 'white', fontWeight: 800, textAlign: 'center', outline: 'none' }}
            />
          </div>
          <button onClick={() => addItem(bandName)} style={{ background: 'var(--gold)', color: 'black', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} /> ADD ITEM
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {settings[bandName].map((item, idx) => (
          <div key={item.id} className="glass-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button onClick={() => moveItem(bandName, idx, 'up')} disabled={idx === 0} style={{ background: 'none', border: 'none', color: idx === 0 ? 'rgba(255,255,255,0.05)' : 'var(--text-muted)', cursor: 'pointer' }}><ArrowUp size={16}/></button>
              <button onClick={() => moveItem(bandName, idx, 'down')} disabled={idx === settings[bandName].length - 1} style={{ background: 'none', border: 'none', color: idx === settings[bandName].length - 1 ? 'rgba(255,255,255,0.05)' : 'var(--text-muted)', cursor: 'pointer' }}><ArrowDown size={16}/></button>
            </div>

            <div style={{ flex: 1, minWidth: '200px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Display Label</label>
                <input 
                  type="text" 
                  value={item.label} 
                  onChange={e => updateItem(bandName, item.id, 'label', e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Action Link</label>
                <input 
                  type="text" 
                  value={item.link} 
                  onChange={e => updateItem(bandName, item.id, 'link', e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Icon</label>
                <select 
                  value={item.icon} 
                  onChange={e => updateItem(bandName, item.id, 'icon', e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.85rem' }}
                >
                  <option value="">No Icon</option>
                  {ICON_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            <button onClick={() => removeItem(bandName, item.id)} style={{ padding: '10px', borderRadius: '10px', background: 'rgba(245,57,123,0.05)', border: 'none', color: 'var(--rose)', cursor: 'pointer' }}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative' }}>
      <ToastComponent />
      
      <div style={{ background: 'rgba(232,184,75,0.05)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(232,184,75,0.1)', marginBottom: '2rem' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 600 }}>
          💡 <strong>Help:</strong> Marquee bands create a dynamic feel on the home page. Configure top and bottom scrolling strips below.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Marquee Logic</h1>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '0.9rem' }}>Real-time scrolling banners on the client panel.</p>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ background: 'var(--gold)', color: 'black', border: 'none', padding: '12px 24px', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Save size={18} /> {saving ? 'SYNCING...' : 'SAVE SETTINGS'}
        </button>
      </div>

      {renderBandEditor('band1', 'Top Band (Left Flow)', 'speed1')}
      {renderBandEditor('band2', 'Bottom Band (Right Flow)', 'speed2')}

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 1rem', fontWeight: 800 }}>System Marquees</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px' }}>Cities Speed (s)</label>
            <input 
              type="number" 
              value={settings.citiesSpeed || 80} 
              onChange={e => setSettings(prev => ({ ...prev, citiesSpeed: Number(e.target.value) }))}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px' }}>Reviews Speed (s)</label>
            <input 
              type="number" 
              value={settings.reviewsSpeed || 100} 
              onChange={e => setSettings(prev => ({ ...prev, reviewsSpeed: Number(e.target.value) }))}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
