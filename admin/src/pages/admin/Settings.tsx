import React, { useState, useEffect, Suspense, lazy } from 'react';
import {
  RefreshCw, Shield,
  User, Palette, Globe, Cpu
} from 'lucide-react';
import {
  changeAdminPassword,
  fetchSetting, saveSetting,
  updateAdminProfile, uploadMedia
} from '../../services/api';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { toast } from 'react-hot-toast';

// Lazy Components
const ProfileSection = lazy(() => import('./settings/ProfileSection'));
const AppearanceSection = lazy(() => import('./settings/AppearanceSection'));
const MarketingSection = lazy(() => import('./settings/MarketingSection'));
const AutomationSection = lazy(() => import('./settings/AutomationSection'));
const SecuritySection = lazy(() => import('./settings/SecuritySection'));

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

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

  const { adminUser, updateAdminUser } = useAdminAuth();

  // Profile
  const [profileName, setProfileName] = useState(adminUser?.name || '');
  const [profileAvatar, setProfileAvatar] = useState(adminUser?.avatar || '');
  const [profileStatus, setProfileStatus] = useState<SaveStatus>('idle');
  const [isUploading, setIsUploading] = useState(false);

  // Appearance
  const [primaryColor, setPrimaryColor] = useState('#e8b84b');
  const [glassOpacity, setGlassOpacity] = useState(0.1);
  const [borderRadius, setBorderRadius] = useState(20);
  const [ultraGlass, setUltraGlass] = useState(true);

  // Marketing
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [gaId, setGaId] = useState('');
  const [fbPixel, setFbPixel] = useState('');
  const [waNumber, setWaNumber] = useState('');
  const [waMessage, setWaMessage] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');

  // Hero Content
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');

  // Automation
  const [onboardingQuestions, setOnboardingQuestions] = useState<any[]>([]);
  const [siteMaintenance, setSiteMaintenance] = useState(false);
  const [siteStats, setSiteStats] = useState<any[]>([]);

  // Security
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwStatus, setPwStatus] = useState<SaveStatus>('idle');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [prof, app, mkt, auto, hero] = await Promise.all([
          fetchSetting('admin_profile'),
          fetchSetting('appearance'),
          fetchSetting('marketing_settings'),
          fetchSetting('automation_settings'),
          fetchSetting('hero_content')
        ]);
        if (prof?.name) setProfileName(prof.name || '');
        if (app?.primaryColor) { 
          setPrimaryColor(app.primaryColor || '#e8b84b'); 
          setGlassOpacity(app.glassOpacity || 0.1); 
          setBorderRadius(app.borderRadius || 20);
          setUltraGlass(app.ultraGlass !== undefined ? app.ultraGlass : true);
        }
        if (mkt?.seoTitle !== undefined) {
          setSeoTitle(mkt.seoTitle || ''); setSeoDesc(mkt.seoDesc || '');
          setGaId(mkt.gaId || ''); setFbPixel(mkt.fbPixel || '');
          setWaNumber(mkt.waNumber || ''); setWaMessage(mkt.waMessage || '');
          setSupportEmail(mkt.supportEmail || '');
          setSupportPhone(mkt.supportPhone || '');
        }
        if (Array.isArray(auto?.questions)) { setOnboardingQuestions(auto.questions || []); setSiteMaintenance(auto.maintenanceMode || false); setSiteStats(auto.stats || []); }
        if (hero?.title) { setHeroTitle(hero.title || ''); setHeroSubtitle(hero.subtitle || ''); }
      } catch (err) { console.error('Settings load error', err); }
    };
    load();
  }, []);

  const onImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const res = await uploadMedia([file]);
      if (res.data?.[0]?.url) {
        setProfileAvatar(res.data[0].url);
        toast.success('Profile holographic image uplinked.');
      } else if (res.urls?.[0]) {
        setProfileAvatar(res.urls[0]);
        toast.success('Profile holographic image uplinked.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Image uplink failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus('saving');
    try {
      // 1. Update the actual Admin User Record
      await updateAdminProfile(profileName, profileAvatar);
      
      // 2. Update Global Setting for Client Panel reference
      await saveSetting('admin_profile', { name: profileName, avatar: profileAvatar });
      
      // 3. Update Local Auth Context (Sidebar/Layout UI)
      updateAdminUser({ name: profileName, avatar: profileAvatar });
      
      setProfileStatus('success');
      toast.success('Identity profile synchronized across all nodes.');
      setTimeout(() => { setProfileStatus('idle'); }, 3000);
    } catch (err: any) { 
      setProfileStatus('error'); 
      toast.error(err.message || 'Profile sync failed.');
    }
  };

  const handleAppearanceSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveSetting('appearance', { primaryColor, glassOpacity, borderRadius, ultraGlass });
      toast.success('Visual engine parameters updated.');
    } catch { toast.error('Appearance sync failed.'); }
  };

  const handleMarketingSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Promise.all([
        saveSetting('marketing_settings', { seoTitle, seoDesc, gaId, fbPixel, waNumber, waMessage, supportEmail, supportPhone }),
        saveSetting('hero_content', { title: heroTitle, subtitle: heroSubtitle })
      ]);
      toast.success('Global channels and Hero content updated.');
    } catch { toast.error('Marketing sync failed.'); }
  };

  const handleAutomationSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveSetting('automation_settings', { questions: onboardingQuestions, maintenanceMode: siteMaintenance, stats: siteStats });
      toast.success('Automation engine and Live Stats synced.');
    } catch { toast.error('Automation save failed.'); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return; }
    setPwStatus('saving');
    try {
      await changeAdminPassword(currentPw, newPw);
      setPwStatus('success');
      toast.success('Security credentials rotated successfully.');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => { setPwStatus('idle'); }, 3000);
    } catch (err: any) { 
      setPwStatus('error'); 
      toast.error(err.message || 'Security rotation failed.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '5rem' }}>

      <div className="flex-row-mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.18em', color: 'var(--gold)', marginBottom: '0.6rem', fontFamily: 'var(--font-mono)' }}>✦ SYSTEM CONFIGURATION</div>
          <h1 style={{ fontWeight: 800, color: 'white', background: 'linear-gradient(135deg, #ffffff 0%, var(--gold) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Portal Core Settings</h1>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Navigation Sidebar */}
        <aside className="scroll-x-mobile" style={{ 
          width: '100%', 
          maxWidth: '1200px',
          display: 'flex', 
          flexDirection: 'row', 
          gap: '8px',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          marginBottom: '1rem',
          flexShrink: 0
        }}>
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
                display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px', borderRadius: '14px',
                background: activeSection === item.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: '1px solid', borderColor: activeSection === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeSection === item.id ? 'white' : 'var(--text-muted)',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', fontWeight: activeSection === item.id ? 800 : 600, fontSize: '0.8rem',
                whiteSpace: 'nowrap'
              }}
            >
              <item.icon size={16} strokeWidth={activeSection === item.id ? 2.5 : 2} />
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
                profileAvatar={profileAvatar}
                profileStatus={profileStatus} handleProfileSave={handleProfileSave} 
                onImageUpload={onImageUpload} isUploading={isUploading}
                lbl={lbl} inp={inp} inputWrap={inputWrap}
              />
            )}
            {activeSection === 'appearance' && (
              <AppearanceSection 
                primaryColor={primaryColor} setPrimaryColor={setPrimaryColor}
                glassOpacity={glassOpacity} setGlassOpacity={setGlassOpacity}
                borderRadius={borderRadius} setBorderRadius={setBorderRadius}
                ultraGlass={ultraGlass} setUltraGlass={setUltraGlass}
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
                supportPhone={supportPhone} setSupportPhone={setSupportPhone}
                heroTitle={heroTitle} setHeroTitle={setHeroTitle}
                heroSubtitle={heroSubtitle} setHeroSubtitle={setHeroSubtitle}
                handleMarketingSave={handleMarketingSave}
                lbl={lbl} inp={inp} inputWrap={inputWrap}
              />
            )}
            {activeSection === 'automation' && (
              <AutomationSection 
                onboardingQuestions={onboardingQuestions} setOnboardingQuestions={setOnboardingQuestions}
                siteMaintenance={siteMaintenance} setSiteMaintenance={setSiteMaintenance}
                siteStats={siteStats} setSiteStats={setSiteStats}
                handleAutomationSave={handleAutomationSave}
                inp={inp}
              />
            )}
            {activeSection === 'security' && (
              <SecuritySection 
                currentPw={currentPw} setCurrentPw={setCurrentPw} newPw={newPw} setNewPw={setNewPw} confirmPw={confirmPw} setConfirmPw={setConfirmPw}
                showCurrent={showCurrent} setShowCurrent={setShowCurrent} showNew={showNew} setShowNew={setShowNew}
                pwStatus={pwStatus} pwError={pwError} handlePasswordChange={handlePasswordChange}
                lbl={lbl} inp={inp} inputWrap={inputWrap} 
              />
            )}
          </Suspense>

        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
