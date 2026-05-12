import React, { useState, useEffect, Suspense, lazy } from 'react';
import {
  CheckCircle, AlertCircle, RefreshCw, Shield,
  User, Palette, Trash2, X, Globe, Cpu
} from 'lucide-react';
import {
  changeAdminPassword,
  fetchSetting, saveSetting 
} from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy Components
const ProfileSection = lazy(() => import('./settings/ProfileSection').then(m => ({ default: m.ProfileSection })));
const AppearanceSection = lazy(() => import('./settings/AppearanceSection').then(m => ({ default: m.AppearanceSection })));
const MarketingSection = lazy(() => import('./settings/MarketingSection').then(m => ({ default: m.MarketingSection })));
const AutomationSection = lazy(() => import('./settings/AutomationSection').then(m => ({ default: m.AutomationSection })));
const SecuritySection = lazy(() => import('./settings/SecuritySection').then(m => ({ default: m.SecuritySection })));

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50, x: '-50%' }}
    animate={{ opacity: 1, y: 0, x: '-50%' }}
    exit={{ opacity: 0, y: 20, x: '-50%' }}
    style={{ 
      position: 'fixed', bottom: '30px', left: '50%', zIndex: 9999,
      background: type === 'success' ? 'var(--emerald)' : 'var(--rose)',
      color: type === 'success' ? '#000' : '#fff',
      padding: '12px 24px', borderRadius: '14px', fontWeight: 800,
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      display: 'flex', alignItems: 'center', gap: '12px',
      fontSize: '0.9rem', letterSpacing: '0.02em',
      cursor: 'pointer'
    }}
    onClick={onClose}
  >
    {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
    <span style={{ flex: 1 }}>{message}</span>
    <X size={14} style={{ opacity: 0.5 }} />
  </motion.div>
);

const StatusAlert = ({ status, successMsg, errorMsg }: { status: SaveStatus; successMsg: string; errorMsg: string }) => {
  if (status === 'success') return (
    <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'0.65rem 1rem', borderRadius:'10px', background:'rgba(16,217,140,0.08)', border:'1px solid rgba(16,217,140,0.2)', color:'var(--emerald)', fontSize:'0.83rem', fontWeight:600 }}>
      <CheckCircle size={14}/> {successMsg}
    </div>
  );
  if (status === 'error') return (
    <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'0.65rem 1rem', borderRadius:'10px', background:'rgba(245,57,123,0.08)', border:'1px solid rgba(245,57,123,0.2)', color:'var(--rose)', fontSize:'0.83rem', fontWeight:600 }}>
      <AlertCircle size={14}/> {errorMsg}
    </div>
  );
  return null;
};

const inputWrap = (icon: React.ReactNode, children: React.ReactNode) => (
  <div style={{ position:'relative' }}>
    <span style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', display:'flex' }}>{icon}</span>
    {children}
  </div>
);

const SectionLoader = () => (
  <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>
    <RefreshCw className="spin" size={32} />
    <p style={{ marginTop: '1rem', fontSize: '0.8rem', fontWeight: 800 }}>Initializing holographic sub-module...</p>
  </div>
);

const AdminSettings = () => {
  const [activeSection, setActiveSection] = useState<'profile' | 'appearance' | 'marketing' | 'automation' | 'security'>('profile');

  // Unified styles
  const lbl = { display: 'block', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' };
  const inp = { width: '100%', padding: '10px 12px 10px 38px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: '0.875rem', outline: 'none' };

  // Profile
  const [profileName, setProfileName] = useState('');
  const [profileStatus, setProfileStatus] = useState<SaveStatus>('idle');

  // Appearance
  const [primaryColor, setPrimaryColor] = useState('#e8b84b');
  const [glassOpacity, setGlassOpacity] = useState(0.1);
  const [borderRadius, setBorderRadius] = useState(20);

  // Marketing
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [gaId, setGaId] = useState('');
  const [fbPixel, setFbPixel] = useState('');
  const [waNumber, setWaNumber] = useState('');
  const [waMessage, setWaMessage] = useState('');
  const [supportEmail, setSupportEmail] = useState('');

  // Automation
  const [onboardingQuestions, setOnboardingQuestions] = useState<any[]>([]);
  const [siteMaintenance, setSiteMaintenance] = useState(false);

  // Security
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwStatus, setPwStatus] = useState<SaveStatus>('idle');
  const [pwError, setPwError] = useState('');

  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [prof, app, mkt, auto] = await Promise.all([
          fetchSetting('admin_profile'),
          fetchSetting('appearance'),
          fetchSetting('marketing_settings'),
          fetchSetting('automation_settings')
        ]);
        if (prof?.data) setProfileName(prof.data.name || '');
        if (app?.data) { setPrimaryColor(app.data.primaryColor || '#e8b84b'); setGlassOpacity(app.data.glassOpacity || 0.1); setBorderRadius(app.data.borderRadius || 20); }
        if (mkt?.data) {
          setSeoTitle(mkt.data.seoTitle || ''); setSeoDesc(mkt.data.seoDesc || '');
          setGaId(mkt.data.gaId || ''); setFbPixel(mkt.data.fbPixel || '');
          setWaNumber(mkt.data.waNumber || ''); setWaMessage(mkt.data.waMessage || '');
          setSupportEmail(mkt.data.supportEmail || '');
        }
        if (auto?.data) { setOnboardingQuestions(auto.data.questions || []); setSiteMaintenance(auto.data.maintenanceMode || false); }
      } catch (err) { console.error('Settings load error', err); }
    };
    load();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus('saving');
    try {
      await saveSetting('admin_profile', { name: profileName });
      setProfileStatus('success');
      setTimeout(() => setProfileStatus('idle'), 3000);
    } catch { setProfileStatus('error'); }
  };

  const handleAppearanceSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveSetting('appearance', { primaryColor, glassOpacity, borderRadius });
      setToast({ message: 'Visual engine parameters updated.', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch { setToast({ message: 'Appearance sync failed.', type: 'error' }); }
  };

  const handleMarketingSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveSetting('marketing_settings', { seoTitle, seoDesc, gaId, fbPixel, waNumber, waMessage, supportEmail });
      setToast({ message: 'Global channels updated.', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch { setToast({ message: 'Marketing sync failed.', type: 'error' }); }
  };

  const handleAutomationSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveSetting('automation_settings', { questions: onboardingQuestions, maintenanceMode: siteMaintenance });
      setToast({ message: 'Automation engine state synced.', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch { setToast({ message: 'Automation save failed.', type: 'error' }); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return; }
    setPwStatus('saving');
    try {
      await changeAdminPassword(currentPw, newPw);
      setPwStatus('success');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => setPwStatus('idle'), 3000);
    } catch { setPwStatus('error'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '5rem' }}>
      <AnimatePresence>{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}</AnimatePresence>

      <div className="flex-row-mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.18em', color: 'var(--gold)', marginBottom: '0.6rem', fontFamily: 'var(--font-mono)' }}>✦ SYSTEM CONFIGURATION</div>
          <h1 style={{ fontWeight: 800, color: 'white', background: 'linear-gradient(135deg, #ffffff 0%, var(--gold) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Portal Core Settings</h1>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Navigation Sidebar */}
        <aside style={{ width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { id: 'profile', label: 'Identity Profile', icon: User },
            { id: 'appearance', label: 'Visual Engine', icon: Palette },
            { id: 'marketing', label: 'Marketing Hub', icon: Globe },
            { id: 'automation', label: 'Automation', icon: Cpu },
            { id: 'security', label: 'Security Shield', icon: Shield },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as any)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderRadius: '16px',
                background: activeSection === item.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: '1px solid', borderColor: activeSection === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeSection === item.id ? 'white' : 'var(--text-muted)',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', fontWeight: activeSection === item.id ? 800 : 600, fontSize: '0.85rem'
              }}
            >
              <item.icon size={18} strokeWidth={activeSection === item.id ? 2.5 : 2} />
              {item.label}
            </button>
          ))}
        </aside>

        {/* Dynamic Section Area */}
        <div style={{ flex: 1, minWidth: '320px' }}>
          <Suspense fallback={<SectionLoader />}>
            {activeSection === 'profile' && (
              <ProfileSection 
                profileName={profileName} setProfileName={setProfileName} 
                profileStatus={profileStatus} handleProfileSave={handleProfileSave} 
                lbl={lbl} inp={inp} inputWrap={inputWrap} StatusAlert={StatusAlert} 
              />
            )}
            {activeSection === 'appearance' && (
              <AppearanceSection 
                primaryColor={primaryColor} setPrimaryColor={setPrimaryColor}
                glassOpacity={glassOpacity} setGlassOpacity={setGlassOpacity}
                borderRadius={borderRadius} setBorderRadius={setBorderRadius}
                handleAppearanceSave={handleAppearanceSave}
                lbl={lbl}
              />
            )}
            {activeSection === 'marketing' && (
              <MarketingSection 
                seoTitle={seoTitle} setSeoTitle={setSeoTitle} seoDesc={seoDesc} setSeoDesc={setSeoDesc}
                gaId={gaId} setGaId={setGaId} fbPixel={fbPixel} setFbPixel={setFbPixel}
                waNumber={waNumber} setWaNumber={setWaNumber} waMessage={waMessage} setWaMessage={setWaMessage}
                supportEmail={supportEmail} setSupportEmail={setSupportEmail}
                handleMarketingSave={handleMarketingSave}
                lbl={lbl} inp={inp} inputWrap={inputWrap}
              />
            )}
            {activeSection === 'automation' && (
              <AutomationSection 
                onboardingQuestions={onboardingQuestions} setOnboardingQuestions={setOnboardingQuestions}
                siteMaintenance={siteMaintenance} setSiteMaintenance={setSiteMaintenance}
                handleAutomationSave={handleAutomationSave}
                inp={inp}
              />
            )}
            {activeSection === 'security' && (
              <SecuritySection 
                currentPw={currentPw} setCurrentPw={setCurrentPw} newPw={newPw} setNewPw={setNewPw} confirmPw={confirmPw} setConfirmPw={setConfirmPw}
                showCurrent={showCurrent} setShowCurrent={setShowCurrent} showNew={showNew} setShowNew={setShowNew}
                pwStatus={pwStatus} pwError={pwError} handlePasswordChange={handlePasswordChange}
                lbl={lbl} inp={inp} inputWrap={inputWrap} StatusAlert={StatusAlert} 
              />
            )}
          </Suspense>

          {/* Danger Zone */}
          <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'rgba(245,57,123,0.03)', borderRadius: '24px', border: '1px solid rgba(245,57,123,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f5397b', marginBottom: '10px' }}>
              <Trash2 size={18} />
              <h4 style={{ margin: 0, fontWeight: 900 }}>Danger Protocol</h4>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'rgba(245,57,123,0.6)', marginBottom: '1.5rem' }}>These actions are irreversible and will wipe core system data.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline" style={{ borderColor: '#f5397b', color: '#f5397b', fontSize: '0.7rem', borderRadius: '10px', padding: '8px 16px', background: 'transparent' }}>WIPE CACHE</button>
              <button className="btn btn-outline" style={{ borderColor: '#f5397b', color: '#f5397b', fontSize: '0.7rem', borderRadius: '10px', padding: '8px 16px', background: 'transparent' }}>RESET ANALYTICS</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
