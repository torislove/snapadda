import React from 'react';
import { Palette } from 'lucide-react';

interface AppearanceSectionProps {
  primaryColor: string;
  setPrimaryColor: (v: string) => void;
  glassOpacity: number;
  setGlassOpacity: (v: number) => void;
  borderRadius: number;
  setBorderRadius: (v: number) => void;
  handleAppearanceSave: (e: React.FormEvent) => void;
  lbl: any;
}

export const AppearanceSection: React.FC<AppearanceSectionProps> = ({
  primaryColor, setPrimaryColor, glassOpacity, setGlassOpacity, borderRadius, setBorderRadius,
  handleAppearanceSave, lbl
}) => (
  <div className="glass-card" style={{ overflow: 'hidden', borderRadius: '24px' }}>
    <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ padding: '10px', background: 'rgba(232,184,75,0.1)', borderRadius: '12px', color: 'var(--gold)' }}>
        <Palette size={20} />
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>Visual Engine</h3>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Adjust the holographic interface parameters.</p>
      </div>
    </div>

    <form onSubmit={handleAppearanceSave} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div>
          <label style={lbl}>Primary Accent Color</label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
            {['#e8b84b', '#9b59f5', '#10d98c', '#22d9e0', '#f5397b'].map(c => (
              <button key={c} type="button" onClick={() => setPrimaryColor(c)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: c, border: primaryColor === c ? '3px solid white' : 'none', cursor: 'pointer', transform: primaryColor === c ? 'scale(1.1)' : 'scale(1)' }} />
            ))}
          </div>
        </div>
        <div>
          <label style={lbl}>Glass Opacity ({Math.round(glassOpacity * 100)}%)</label>
          <input type="range" min="0.05" max="0.4" step="0.01" value={glassOpacity} onChange={e => setGlassOpacity(parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--gold)' }} />
        </div>
        <div>
          <label style={lbl}>Corner Radius ({borderRadius}px)</label>
          <input type="range" min="0" max="40" step="1" value={borderRadius} onChange={e => setBorderRadius(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--gold)' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.06)' }}>
         <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Ultra-Glass Rendering</div>
            <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Enables advanced backdrop-blur and noise textures for premium feel.</p>
         </div>
         <div style={{ width: '48px', height: '24px', background: 'var(--gold)', borderRadius: '12px', padding: '4px', position: 'relative' }}>
            <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', right: '4px' }} />
         </div>
      </div>

      <button type="submit" className="btn-gold" style={{ alignSelf: 'flex-start', padding: '0.8rem 2rem', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 900, background: 'var(--gold)', color: 'black', border: 'none' }}>
        APPLY VISUALS
      </button>
    </form>
  </div>
);
