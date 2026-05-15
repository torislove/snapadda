import React from 'react';
import { Cpu, Shield, AlertTriangle } from 'lucide-react';

interface AutomationSectionProps {
  onboardingQuestions: any[];
  setOnboardingQuestions: (v: any[]) => void;
  siteMaintenance: boolean;
  setSiteMaintenance: (v: boolean) => void;
  siteStats: any[];
  setSiteStats: (v: any[]) => void;
  handleAutomationSave: (e: React.FormEvent) => void;
  inp: any;
}

export const AutomationSection: React.FC<AutomationSectionProps> = ({
  onboardingQuestions, setOnboardingQuestions, siteMaintenance, setSiteMaintenance,
  siteStats, setSiteStats,
  handleAutomationSave, inp
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    <div style={{ background: 'rgba(155,89,245,0.05)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(155,89,245,0.1)', marginBottom: '1rem' }}>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--violet)', fontWeight: 600 }}>
        💡 <strong>Help:</strong> This page lets you control the "User Survey" (the questions users see when they join) and the "Website Numbers" shown on the home page. You can also turn on "Maintenance Mode" if you want to temporarily hide the site.
      </p>
    </div>

    {/* Live Stats Section */}
    <div className="glass-card" style={{ overflow: 'hidden', borderRadius: '24px' }}>
      <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '10px', background: 'rgba(34,217,224,0.1)', borderRadius: '12px', color: 'var(--cyan)' }}>
          <Shield size={20} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>Website Numbers</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Change the numbers shown on the home page (e.g. 1,200+ Listings).</p>
        </div>
      </div>
      <div style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {(siteStats.length > 0 ? siteStats : [
            { label: 'Verified Listings', value: '1,200+' },
            { label: 'Cities Covered', value: '18+' },
            { label: 'Happy Clients', value: '2,400+' },
            { label: 'Approved Properties', value: 'CRDA/RERA' }
          ]).map((stat, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <input 
                type="text" 
                value={stat.label} 
                onChange={e => {
                  const newStats = [...siteStats];
                  newStats[i] = { ...newStats[i], label: e.target.value };
                  setSiteStats(newStats);
                }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 800, width: '100%', marginBottom: '4px', textTransform: 'uppercase' }}
                placeholder="LABEL"
              />
              <input 
                type="text" 
                value={stat.value} 
                onChange={e => {
                  const newStats = siteStats.length > 0 ? [...siteStats] : [
                    { label: 'Verified Listings', value: '1,200+' },
                    { label: 'Cities Covered', value: '18+' },
                    { label: 'Happy Clients', value: '2,400+' },
                    { label: 'Approved Properties', value: 'CRDA/RERA' }
                  ];
                  newStats[i] = { ...newStats[i], value: e.target.value };
                  setSiteStats(newStats);
                }}
                style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1rem', fontWeight: 900, width: '100%' }}
                placeholder="VALUE"
              />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* AI & Onboarding */}
    <div className="glass-card" style={{ overflow: 'hidden', borderRadius: '24px' }}>
      <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '10px', background: 'rgba(155,89,245,0.1)', borderRadius: '12px', color: 'var(--violet)' }}>
          <Cpu size={20} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>User Questions</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Configure the questions users answer when they first join.</p>
        </div>
      </div>
      <div style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {onboardingQuestions.map((q, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 15px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: 'var(--violet)', fontWeight: 900, fontSize: '0.8rem', width: '25px' }}>Q{i+1}</div>
              <input 
                type="text" 
                value={q.text} 
                onChange={(e) => {
                  const newQ = [...onboardingQuestions];
                  newQ[i].text = e.target.value;
                  setOnboardingQuestions(newQ);
                }} 
                style={{ ...inp, border: 'none', background: 'transparent' }} 
              />
              <button onClick={() => setOnboardingQuestions(onboardingQuestions.filter((_, idx) => idx !== i))} style={{ background: 'transparent', border: 'none', color: '#f5397b', cursor: 'pointer' }}>
                <AlertTriangle size={14} />
              </button>
            </div>
          ))}
          <button 
            type="button" 
            onClick={() => setOnboardingQuestions([...onboardingQuestions, { text: '', type: 'text' }])}
            style={{ padding: '10px', borderRadius: '12px', border: '1px dashed var(--violet)', color: 'var(--violet)', background: 'transparent', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800 }}
          >
            + ADD QUESTION
          </button>
        </div>
      </div>
    </div>

    {/* Platform Controls */}
    <div className="glass-card" style={{ overflow: 'hidden', borderRadius: '24px' }}>
      <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '10px', background: 'rgba(245,57,123,0.1)', borderRadius: '12px', color: '#f5397b' }}>
          <Shield size={20} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>Maintenance</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Turn on Maintenance Mode if you are working on the site.</p>
        </div>
      </div>
      <div style={{ padding: '1.5rem' }}>
        <div 
          onClick={() => setSiteMaintenance(!siteMaintenance)}
          style={{ display: 'flex', gap: '1rem', background: siteMaintenance ? 'rgba(245,57,123,0.08)' : 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '18px', border: siteMaintenance ? '1px solid rgba(245,57,123,0.3)' : '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}
        >
           <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: siteMaintenance ? '#f5397b' : 'white' }}>Website Maintenance Mode</div>
              <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>If turned on, regular users will see a "Under Maintenance" message.</p>
           </div>
           <div style={{ width: '48px', height: '24px', background: siteMaintenance ? '#f5397b' : 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '4px', position: 'relative', transition: 'all 0.3s' }}>
              <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', right: siteMaintenance ? '4px' : '28px', transition: 'all 0.3s' }} />
           </div>
        </div>
      </div>
    </div>

    <button onClick={handleAutomationSave} className="btn-violet btn-3d-liquid" style={{ alignSelf: 'flex-start', padding: '0.8rem 2.5rem', borderRadius: '14px', fontSize: '1rem', fontWeight: 900, background: 'var(--violet)', color: 'white', border: 'none' }}>
      SYNC ENGINE STATE
    </button>
  </div>
);
