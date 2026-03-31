import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ArrowUp, ArrowDown, Activity, Settings as SettingsIcon, Type, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { fetchSetting, saveSetting } from '../../services/api';

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
  ]
};

// Available icons to choose from
const ICON_OPTIONS = ['MapPin', 'ShieldCheck', 'Building2', 'Home', 'Square', 'Compass', 'IndianRupee', 'Award', 'CheckCircle2', 'Landmark', 'TrendingUp', 'Star'];

export default function AdminMarquee() {
  const [settings, setSettings] = useState<MarqueeSetting>(DEFAULT_STRIPS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSetting('marquee_strips')
      .then((res: any) => {
        if (res.data && res.data.band1) {
          setSettings(res.data);
        }
      })
      .catch((err: any) => console.error("Could not fetch marquee settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await saveSetting('marquee_strips', settings);
      setMessage({ type: 'success', text: 'Marquee settings saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save settings' });
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

  const updateItem = (band: 'band1' | 'band2', id: string, field: keyof MarqueeItem, value: string) => {
    setSettings(prev => ({
      ...prev,
      [band]: prev[band].map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const deleteItem = (band: 'band1' | 'band2', id: string) => {
    setSettings(prev => ({
      ...prev,
      [band]: prev[band].filter(item => item.id !== id)
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

  if (loading) return <div style={{ padding: '2rem' }}>Loading settings...</div>;

  const renderBandEditor = (bandName: 'band1' | 'band2', title: string, speedKey: 'speed1' | 'speed2') => (
    <div style={{ background: 'var(--bg-glass)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} style={{ color: 'var(--gold)' }} /> {title}
          </h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Configure the items scrolling on this band.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SettingsIcon size={14} style={{ color: 'var(--text-muted)' }} />
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Animation Speed (s):</label>
            <input 
              type="number" 
              value={settings[speedKey]} 
              onChange={e => setSettings(prev => ({ ...prev, [speedKey]: Number(e.target.value) }))}
              style={{ width: '60px', padding: '0.4rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }}
            />
          </div>
          <button className="btn btn-sm btn-outline" onClick={() => addItem(bandName)}>
            <Plus size={14} /> Add Item
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {settings[bandName].map((item, idx) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <button onClick={() => moveItem(bandName, idx, 'up')} disabled={idx === 0} style={{ background: 'none', border: 'none', color: idx === 0 ? 'var(--border)' : 'var(--text-muted)', cursor: idx === 0 ? 'default' : 'pointer' }}><ArrowUp size={16}/></button>
              <button onClick={() => moveItem(bandName, idx, 'down')} disabled={idx === settings[bandName].length - 1} style={{ background: 'none', border: 'none', color: idx === settings[bandName].length - 1 ? 'var(--border)' : 'var(--text-muted)', cursor: idx === settings[bandName].length - 1 ? 'default' : 'pointer' }}><ArrowDown size={16}/></button>
            </div>

            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 150px', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', textTransform:'uppercase', letterSpacing:'0.05em' }}><Type size={12}/> Label</label>
                <input 
                  type="text" 
                  value={item.label} 
                  onChange={e => updateItem(bandName, item.id, 'label', e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'white' }}
                  placeholder="e.g. Amaravati Homes"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', textTransform:'uppercase', letterSpacing:'0.05em' }}><LinkIcon size={12}/> Link (URL or Hash)</label>
                <input 
                  type="text" 
                  value={item.link} 
                  onChange={e => updateItem(bandName, item.id, 'link', e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'white' }}
                  placeholder="e.g. #cities"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', textTransform:'uppercase', letterSpacing:'0.05em' }}><ImageIcon size={12}/> Icon</label>
                <select 
                  value={item.icon} 
                  onChange={e => updateItem(bandName, item.id, 'icon', e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'white' }}
                >
                  <option value="">None</option>
                  {ICON_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            <button 
              onClick={() => deleteItem(bandName, item.id)}
              style={{ padding: '0.6rem', background: 'rgba(240,93,94,0.1)', color: 'var(--rose)', border: '1px solid rgba(240,93,94,0.2)', borderRadius: '8px', cursor: 'pointer', alignSelf: 'flex-end', height: '40px' }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {settings[bandName].length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
            No items in this band.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>Marquee Settings</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Configure the animated scrolling strips on the client home page.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {message.type && (
        <div style={{
          padding: '1rem', marginBottom: '1.5rem', borderRadius: '12px',
          background: message.type === 'success' ? 'rgba(16,217,140,0.1)' : 'rgba(240,93,94,0.1)',
          color: message.type === 'success' ? '#10d98c' : 'var(--rose)',
          border: `1px solid ${message.type === 'success' ? 'rgba(16,217,140,0.2)' : 'rgba(240,93,94,0.2)'}`
        }}>
          {message.text}
        </div>
      )}

      {renderBandEditor('band1', 'Top Band (Flows Left)', 'speed1')}
      {renderBandEditor('band2', 'Bottom Band (Flows Right)', 'speed2')}

    </div>
  );
}
