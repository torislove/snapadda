import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, CheckCircle, AlertCircle, Phone,
  RefreshCw, Shield, Camera, Lock, Eye, EyeOff,
  User, KeyRound, Palette, Image as ImageIcon, Sparkles,
  Trash2, UploadCloud, Mail, MapPin, Activity, Link
} from 'lucide-react';
import {
  fetchWhatsappSettings, saveWhatsappSettings,
  updateAdminProfile, changeAdminPassword, uploadMedia,
  fetchSetting, saveSetting
} from '../../services/api';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

interface OnboardingQuestion {
  id: string;
  key: string;
  title: string;
  type: 'options' | 'text';
  options: string[];
  enabled: boolean;
}

const DEFAULT_ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  { id: 'propertyType', key: 'propertyType', title: 'I am looking for', type: 'options', options: ['Apartment', 'Villa', 'Agriculture Land', 'Commercial', 'Plot'], enabled: true },
  { id: 'budget', key: 'budget', title: 'My budget is', type: 'options', options: ['Under 50 Lakhs', '50L - 1 Crore', '1Cr - 5 Crore', '5 Crore+'], enabled: true },
  { id: 'purpose', key: 'purpose', title: 'Preferred purpose', type: 'options', options: ['Personal Use', 'Investment', 'Agriculture'], enabled: true },
  { id: 'additionalNotes', key: 'additionalNotes', title: 'Additional details', type: 'text', options: [], enabled: true }
];

/* ── Reusable status alert ── */
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

const AdminSettings = () => {
  const { adminUser, updateAdminUser } = useAdminAuth();

  // Profile state
  const [profileName, setProfileName] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [profileStatus, setProfileStatus] = useState<SaveStatus>('idle');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Password state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwStatus, setPwStatus] = useState<SaveStatus>('idle');
  const [pwError, setPwError] = useState('');

  // WhatsApp state
  const [waNumber, setWaNumber] = useState('');
  const [waMessage, setWaMessage] = useState('');
  const [waStatus, setWaStatus] = useState<SaveStatus>('idle');

  // Support state
  const [supportPhone, setSupportPhone] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportAddress, setSupportAddress] = useState('');
  const [supportHours, setSupportHours] = useState('');
  const [supportStatus, setSupportStatus] = useState<SaveStatus>('idle');

  // Onboarding questions state
  const [onboardingQuestions, setOnboardingQuestions] = useState<OnboardingQuestion[]>(DEFAULT_ONBOARDING_QUESTIONS);
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<'options' | 'text'>('options');
  const [newQuestionOptions, setNewQuestionOptions] = useState('');
  const [questionsStatus, setQuestionsStatus] = useState<SaveStatus>('idle');

  // Appearance state (Royal Overhaul)
  const [bgUrl, setBgUrl] = useState('');
  const [themeMode, setThemeMode] = useState<'standard' | 'royal'>('standard');
  const [primaryColor, setPrimaryColor] = useState('#e8b84b');
  const [enable3D, setEnable3D] = useState(true);
  const [glassIntensity, setGlassIntensity] = useState('medium');
  const [appearanceStatus, setAppearanceStatus] = useState<SaveStatus>('idle');
  const [bgUploading, setBgUploading] = useState(false);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const [seoTitle, setSeoTitle] = useState('SnapAdda — Plots, Apartments, Villas & Agriculture Land in Andhra Pradesh');
  const [seoDescription, setSeoDescription] = useState('Buy verified plots, apartments, villas, houses and agriculture land across Amaravati, Vijayawada, Guntur, Mangalagiri, Tenali and all Andhra Pradesh districts.');
  const [seoKeywords, setSeoKeywords] = useState('SnapAdda, Andhra Pradesh real estate, AP plots, Vijayawada apartments, Amaravati land, Guntur villas, agriculture land, CRDA approved properties');
  const [seoImageUrl, setSeoImageUrl] = useState('https://snapadda.com/favicon.svg');
  const [seoCanonicalUrl, setSeoCanonicalUrl] = useState('https://snapadda.com/');
  const [seoRobots, setSeoRobots] = useState('index, follow');
  const [seoStatus, setSeoStatus] = useState<SaveStatus>('idle');

  const [activeSection, setActiveSection] = useState<'appearance' | 'hero' | 'seo' | 'profile' | 'password' | 'support' | 'whatsapp' | 'questions' | 'danger'>('appearance');

  // Hero section state
  const [heroEyebrow, setHeroEyebrow] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroCTA1Text, setHeroCTA1Text] = useState('');
  const [heroCTA1Url, setHeroCTA1Url] = useState('');
  const [heroCTA2Text, setHeroCTA2Text] = useState('');
  const [heroCTA2Url, setHeroCTA2Url] = useState('');
  const [heroStatus, setHeroStatus] = useState<SaveStatus>('idle');

  // Stats section state
  const [siteStats, setSiteStats] = useState<{ label: string; value: string; icon: string }[]>([]);
  const [statsStatus, setStatsStatus] = useState<SaveStatus>('idle');

  // Load data
  useEffect(() => {
    if (adminUser) { setProfileName(adminUser.name || ''); setProfileAvatar(adminUser.avatar || ''); }
  }, [adminUser]);

  useEffect(() => {
    // Load WhatsApp
    fetchWhatsappSettings()
      .then(d => { if (d?.data) { setWaNumber(d.data.number || ''); setWaMessage(d.data.message || ''); }})
      .catch(console.error);

    // Load Appearance
    fetchSetting('appearance')
      .then(d => {
        if (d?.data) {
          setBgUrl(d.data.bgUrl || '');
          setThemeMode(d.data.themeMode || 'standard');
          setPrimaryColor(d.data.primaryColor || '#e8b84b');
          setEnable3D(d.data.enable3D ?? true);
          setGlassIntensity(d.data.glassIntensity || 'medium');
        }
      })
      .catch(console.error);

    // Load Support Info
    fetchSetting('support_info')
      .then(d => {
        if (d?.data) {
          setSupportPhone(d.data.phone || '');
          setSupportEmail(d.data.email || '');
          setSupportAddress(d.data.address || '');
          setSupportHours(d.data.workingHours || '');
        }
      })
      .catch(console.error);

    // Load Hero Content
    fetchSetting('hero_content')
      .then(d => {
        if (d?.data) {
          setHeroEyebrow(d.data.eyebrow || '');
          setHeroTitle(d.data.title || '');
          setHeroSubtitle(d.data.subtitle || '');
          setHeroCTA1Text(d.data.cta1Text || '');
          setHeroCTA1Url(d.data.cta1Url || '');
          setHeroCTA2Text(d.data.cta2Text || '');
          setHeroCTA2Url(d.data.cta2Url || '');
        }
      })
      .catch(console.error);

    // Load Site Stats
    fetchSetting('site_stats')
      .then(d => {
        if (d?.data && Array.isArray(d.data)) {
          setSiteStats(d.data);
        }
      })
      .catch(console.error);

    fetchSetting('seo')
      .then(d => {
        if (d?.data) {
          setSeoTitle(d.data.title || 'SnapAdda — Plots, Apartments, Villas & Agriculture Land in Andhra Pradesh');
          setSeoDescription(d.data.description || 'Buy verified plots, apartments, villas, houses and agriculture land across Amaravati, Vijayawada, Guntur, Mangalagiri, Tenali and all Andhra Pradesh districts.');
          setSeoKeywords(d.data.keywords || 'SnapAdda, Andhra Pradesh real estate, AP plots, Vijayawada apartments, Amaravati land, Guntur villas, agriculture land, CRDA approved properties');
          setSeoImageUrl(d.data.image || 'https://snapadda.com/favicon.svg');
          setSeoCanonicalUrl(d.data.canonical || 'https://snapadda.com/');
          setSeoRobots(d.data.robots || 'index, follow');
        }
      })
      .catch(console.error);

    fetchSetting('onboarding_questions')
      .then(d => {
        if (d?.data && Array.isArray(d.data) && d.data.length > 0) {
          setOnboardingQuestions(d.data);
        }
      })
      .catch(() => {
        // keep defaults if there is no custom onboarding config yet
      });
  }, []);

  /* ── Handlers ── */
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setAvatarUploading(true);
    try {
      const res = await uploadMedia(Array.from(e.target.files));
      const urls = res?.data || res?.urls || [];
      if (Array.isArray(urls) && urls.length) setProfileAvatar(urls[0]);
    } catch {
      alert('Image upload failed');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setBgUploading(true);
    try {
      const res = await uploadMedia(Array.from(e.target.files));
      const urls = res?.data || res?.urls || [];
      if (Array.isArray(urls) && urls.length) setBgUrl(urls[0]);
    } catch {
      alert('Background upload failed');
    } finally {
      setBgUploading(false);
    }
  };

  const handleProfileSave = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setProfileStatus('saving');
    try {
      const res = await updateAdminProfile(profileName, profileAvatar);
      updateAdminUser({ name: res.user.name, avatar: res.user.avatar });
      setProfileStatus('success');
      setTimeout(() => setProfileStatus('idle'), 3000);
    } catch { setProfileStatus('error'); setTimeout(() => setProfileStatus('idle'), 4000); }
  };

  const handlePasswordChange = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setPwError('');
    if (newPw !== confirmPw) { setPwError('New passwords do not match'); return; }
    if (newPw.length < 8) { setPwError('Password must be at least 8 characters'); return; }
    setPwStatus('saving');
    try {
      await changeAdminPassword(currentPw, newPw);
      setPwStatus('success');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => setPwStatus('idle'), 3000);
    } catch (err: any) { setPwError(err.message || 'Failed'); setPwStatus('error'); setTimeout(() => setPwStatus('idle'), 4000); }
  };

  const handleWaSave = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setWaStatus('saving');
    try {
      await saveWhatsappSettings(waNumber, waMessage);
      setWaStatus('success');
      setTimeout(() => setWaStatus('idle'), 3000);
    } catch { setWaStatus('error'); setTimeout(() => setWaStatus('idle'), 4000); }
  };

  const handleAppearanceSave = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setAppearanceStatus('saving');
    try {
      await saveSetting('appearance', { bgUrl, themeMode, primaryColor, enable3D, glassIntensity });
      setAppearanceStatus('success');
      setTimeout(() => setAppearanceStatus('idle'), 3000);
    } catch { setAppearanceStatus('error'); setTimeout(() => setAppearanceStatus('idle'), 4000); }
  };

  const handleSupportSave = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSupportStatus('saving');
    try {
      await saveSetting('support_info', {
        phone: supportPhone,
        email: supportEmail,
        address: supportAddress,
        workingHours: supportHours,
        whatsapp: waNumber // This syncs the number to the global support record
      });
      setSupportStatus('success');
      setTimeout(() => setSupportStatus('idle'), 3000);
    } catch { setSupportStatus('error'); setTimeout(() => setSupportStatus('idle'), 4000); }
  };

  const handleSeoSave = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSeoStatus('saving');
    try {
      await saveSetting('seo', {
        title: seoTitle,
        description: seoDescription,
        keywords: seoKeywords,
        image: seoImageUrl,
        canonical: seoCanonicalUrl,
        robots: seoRobots
      });
      setSeoStatus('success');
      setTimeout(() => setSeoStatus('idle'), 3000);
    } catch { setSeoStatus('error'); setTimeout(() => setSeoStatus('idle'), 4000); }
  };

  const handleHeroSave = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setHeroStatus('saving');
    try {
      await saveSetting('hero_content', {
        eyebrow: heroEyebrow,
        title: heroTitle,
        subtitle: heroSubtitle,
        cta1Text: heroCTA1Text,
        cta1Url: heroCTA1Url,
        cta2Text: heroCTA2Text,
        cta2Url: heroCTA2Url
      });
      setHeroStatus('success');
      setTimeout(() => setHeroStatus('idle'), 3000);
    } catch { setHeroStatus('error'); setTimeout(() => setHeroStatus('idle'), 4000); }
  };

  const handleStatsSave = async () => {
    setStatsStatus('saving');
    try {
      await saveSetting('site_stats', siteStats);
      setStatsStatus('success');
      setTimeout(() => setStatsStatus('idle'), 3000);
    } catch { setStatsStatus('error'); setTimeout(() => setStatsStatus('idle'), 4000); }
  };

  const updateStat = (index: number, field: string, val: string) => {
    const next = [...siteStats];
    (next[index] as any)[field] = val;
    setSiteStats(next);
  };

  const handleAddQuestion = () => {
    if (!newQuestionTitle.trim()) return;
    const newQuestion: OnboardingQuestion = {
      id: `custom_${Date.now()}`,
      key: `custom_${Date.now()}`,
      title: newQuestionTitle.trim(),
      type: newQuestionType,
      options: newQuestionType === 'options'
        ? newQuestionOptions.split(',').map(opt => opt.trim()).filter(Boolean)
        : [],
      enabled: true
    };
    setOnboardingQuestions(prev => [...prev, newQuestion]);
    setNewQuestionTitle('');
    setNewQuestionOptions('');
  };

  const handleToggleQuestion = (id: string) => {
    setOnboardingQuestions(prev => prev.map(question => question.id === id ? { ...question, enabled: !question.enabled } : question));
  };

  const handleUpdateQuestionTitle = (id: string, title: string) => {
    setOnboardingQuestions(prev => prev.map(question => question.id === id ? { ...question, title } : question));
  };

  const handleUpdateQuestionOptions = (id: string, options: string) => {
    setOnboardingQuestions(prev => prev.map(question => question.id === id ? { ...question, options: options.split(',').map(opt => opt.trim()).filter(Boolean) } : question));
  };

  const handleRemoveQuestion = (id: string) => {
    setOnboardingQuestions(prev => prev.filter(question => question.id !== id));
  };

  const handleSaveQuestions = async () => {
    setQuestionsStatus('saving');
    try {
      await saveSetting('onboarding_questions', onboardingQuestions);
      setQuestionsStatus('success');
      setTimeout(() => setQuestionsStatus('idle'), 3000);
    } catch {
      setQuestionsStatus('error');
      setTimeout(() => setQuestionsStatus('idle'), 4000);
    }
  };

  /* ── Styles ── */
  const card = (accent: string) => ({
    background: 'var(--bg-glass)', border: '1px solid rgba(255,255,255,0.07)',
    borderTop: `3px solid ${accent}`, borderRadius: '18px', overflow: 'hidden' as const,
  });
  const cardHeader = (icon: React.ReactNode, title: string, sub: string, bg: string, color: string) => (
    <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', gap:'0.75rem' }}>
      <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:bg, display:'flex', alignItems:'center', justifyContent:'center', color }}>{icon}</div>
      <div>
        <h3 style={{ margin:0, fontFamily:'var(--font-body)', fontSize:'0.95rem', fontWeight:700, color:'var(--text-primary)' }}>{title}</h3>
        <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-muted)' }}>{sub}</p>
      </div>
    </div>
  );
  const inputWrap = (icon: React.ReactNode, children: React.ReactNode) => (
    <div style={{ position:'relative' }}>
      <span style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', display:'flex' }}>{icon}</span>
      {children}
    </div>
  );
  const inp: React.CSSProperties = {
    width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)',
    color:'var(--text-primary)', borderRadius:'10px', padding:'0.65rem 1rem 0.65rem 2.5rem',
    fontSize:'0.875rem', outline:'none', fontFamily:'var(--font-body)',
  };
  const lbl: React.CSSProperties = {
    display:'block', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.1em',
    textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'0.45rem',
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem', maxWidth:'720px', paddingBottom:'4rem' }}>

      {/* Page header */}
      <div>
        <div style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--violet)', marginBottom:'0.25rem', fontFamily:'var(--font-mono)' }}>✦ Configuration</div>
        <h1 style={{ fontSize:'1.8rem', background:'linear-gradient(135deg,#9b59f5,#22d9e0)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:'0.2rem' }}>Settings</h1>
        <p style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>Manage your profile, security, and platform appearance.</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'0.75rem', marginTop:'1rem', marginBottom:'1.5rem' }}>
        {[
          { key: 'appearance', label: 'Appearance' },
          { key: 'hero', label: 'Hero & Home' },
          { key: 'seo', label: 'SEO' },
          { key: 'profile', label: 'Profile' },
          { key: 'password', label: 'Password' },
          { key: 'support', label: 'Support' },
          { key: 'whatsapp', label: 'WhatsApp' },
          { key: 'questions', label: 'Questions' },
          { key: 'danger', label: 'Danger Zone' }
        ].map(section => {
          const isActive = activeSection === section.key;
          return (
            <button
              type="button"
              key={section.key}
              onClick={() => setActiveSection(section.key as any)}
              className="btn"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.95rem 1rem',
                borderRadius: '16px',
                border: isActive ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.12)',
                background: isActive ? 'rgba(212,175,55,0.14)' : 'rgba(255,255,255,0.03)',
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              {section.label}
            </button>
          );
        })}
      </div>

      {activeSection === 'appearance' && (
        <div style={card('var(--gold)')}>
          {cardHeader(<Palette size={17}/>, 'Platform Appearance', 'Control themes, backgrounds, and 3D effects.', 'var(--gold-dim)', 'var(--gold)')}
          <form onSubmit={handleAppearanceSave} style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1.5rem' }}>
            
            {/* Global Background */}
            <div>
              <label style={lbl}>Global Site Background</label>
              <div style={{ 
                height:'140px', borderRadius:'14px', border:'2px dashed rgba(255,255,255,0.1)', 
                background: bgUrl ? `url(${bgUrl}) center/cover no-repeat` : 'rgba(255,255,255,0.02)',
                position:'relative', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center'
              }}>
                {!bgUrl && !bgUploading && (
                  <div style={{ textAlign:'center', color:'var(--text-muted)' }}>
                    <ImageIcon size={24} style={{ marginBottom:'8px', opacity:0.5 }}/>
                    <div style={{ fontSize:'0.75rem' }}>No background selected</div>
                  </div>
                )}
                {bgUploading && <RefreshCw size={24} style={{ color:'var(--gold)', animation:'spin 1s linear infinite' }}/>}
                
                <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)', opacity:0, transition:'opacity 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }} 
                     onMouseEnter={e => (e.currentTarget.style.opacity = '1')} 
                     onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                  <button type="button" onClick={() => bgInputRef.current?.click()} className="btn btn-gold btn-sm"><UploadCloud size={14}/> {bgUrl ? 'Replace' : 'Upload'}</button>
                  {bgUrl && <button type="button" onClick={() => setBgUrl('')} className="btn btn-rose btn-sm"><Trash2 size={14}/></button>}
                </div>
              </div>
              <input ref={bgInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleBgUpload}/>
              <p style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginTop:'8px' }}>Large landscape images (1920x1080+) work best for parallax.</p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>
              {/* Theme Mode & Brand Color Container */}
              <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                <div>
                  <label style={lbl}>Core Theme</label>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button type="button" onClick={() => setThemeMode('standard')} 
                            style={{ flex:1, padding:'0.65rem', borderRadius:'10px', background: themeMode === 'standard' ? 'var(--bg-secondary)' : 'transparent', border: themeMode === 'standard' ? '1px solid var(--violet)' : '1px solid rgba(255,255,255,0.1)', color: themeMode === 'standard' ? 'var(--violet)' : 'var(--text-muted)', fontSize:'0.8rem', fontWeight:600 }}>Standard</button>
                    <button type="button" onClick={() => setThemeMode('royal')} 
                            style={{ flex:1, padding:'0.65rem', borderRadius:'10px', background: themeMode === 'royal' ? 'var(--gold-dim)' : 'transparent', border: themeMode === 'royal' ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)', color: themeMode === 'royal' ? 'var(--gold)' : 'var(--text-muted)', fontSize:'0.8rem', fontWeight:600 }}>Royal</button>
                  </div>
                </div>

                <div>
                  <label style={lbl}>Main Brand Color</label>
                  <div style={{ display:'flex', gap:'8px' }}>
                    {[
                      { c: '#e8b84b', name: 'Royal Gold' },
                      { c: '#064e3b', name: 'Emerald' },
                      { c: '#450a0a', name: 'Burgundy' },
                    ].map(color => (
                      <button key={color.c} type="button" onClick={() => setPrimaryColor(color.c)}
                        style={{
                          width: '32px', height: '32px', borderRadius: '50%', background: color.c,
                          border: primaryColor === color.c ? '2px solid white' : '2px solid transparent',
                          boxShadow: primaryColor === color.c ? `0 0 12px ${color.c}88` : 'none',
                          cursor: 'pointer', transition: 'all 0.2s', alignSelf:'center'
                        }}
                        title={color.name}
                      />
                    ))}
                    <div style={{ marginLeft:'8px', display:'flex', alignItems:'center', fontSize:'0.8rem', color:'var(--text-muted)' }}>
                      Curated Royal Palette
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 3D Toggle */}
              <div>
                <label style={lbl}>Interactive 3D</label>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', height:'42px' }}>
                  <button type="button" onClick={() => setEnable3D(!enable3D)} 
                          style={{ width:'48px', height:'24px', borderRadius:'12px', background: enable3D ? 'var(--gold)' : 'rgba(255,255,255,0.1)', position:'relative', transition:'all 0.2s' }}>
                    <div style={{ width:'18px', height:'18px', borderRadius:'50%', background:'#fff', position:'absolute', top:'3px', left: enable3D ? '27px' : '3px', transition:'all 0.2s' }}/>
                  </button>
                  <span style={{ fontSize:'0.85rem', color: enable3D ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight:500 }}>
                    {enable3D ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            <StatusAlert status={appearanceStatus} successMsg="Appearance updated!" errorMsg="Failed to save appearance." />
            <button type="submit" disabled={appearanceStatus === 'saving'} className="btn btn-gold" style={{ alignSelf:'flex-start' }}>
              {appearanceStatus === 'saving' ? <><RefreshCw size={14} style={{ animation:'spin 1s linear infinite' }}/> Updating...</> : <><Sparkles size={14}/> Update Design</>}
            </button>
          </form>
        </div>
      )}

      {activeSection === 'hero' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={card('var(--gold)')}>
            {cardHeader(<Sparkles size={17} />, 'Hero Section Content', 'Update the main greeting and calls to action.', 'var(--gold-dim)', 'var(--gold)')}
            <form onSubmit={handleHeroSave} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={lbl}>Hero Eyebrow (Small text above title)</label>
                {inputWrap(<Sparkles size={14} />, <input type="text" value={heroEyebrow} onChange={e => setHeroEyebrow(e.target.value)} style={inp} placeholder="Andhra's Leading Property Platform" />)}
              </div>
              <div>
                <label style={lbl}>Main Hero Title</label>
                {inputWrap(<MapPin size={14} />, <input type="text" value={heroTitle} onChange={e => setHeroTitle(e.target.value)} style={inp} placeholder="Discover Your Dream Place in Andhra" required />)}
              </div>
              <div>
                <label style={lbl}>Hero Subtitle</label>
                <textarea value={heroSubtitle} onChange={e => setHeroSubtitle(e.target.value)} rows={3} style={{ ...inp, paddingLeft: '1rem', height: 'auto', resize: 'vertical', paddingTop: '0.65rem' }} placeholder="Tell your visitors why they should choose SnapAdda..." required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={lbl}>Primary CTA Text</label>
                  <input type="text" value={heroCTA1Text} onChange={e => setHeroCTA1Text(e.target.value)} style={{ ...inp, paddingLeft: '1rem' }} placeholder="e.g. BROWSE PROPERTIES" />
                </div>
                <div>
                  <label style={lbl}>Primary CTA URL</label>
                  <input type="text" value={heroCTA1Url} onChange={e => setHeroCTA1Url(e.target.value)} style={{ ...inp, paddingLeft: '1rem' }} placeholder="e.g. #search" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={lbl}>Secondary CTA Text</label>
                  <input type="text" value={heroCTA2Text} onChange={e => setHeroCTA2Text(e.target.value)} style={{ ...inp, paddingLeft: '1rem' }} placeholder="e.g. CALL EXPERT" />
                </div>
                <div>
                  <label style={lbl}>Secondary CTA URL (use 'callback' for lead modal)</label>
                  <input type="text" value={heroCTA2Url} onChange={e => setHeroCTA2Url(e.target.value)} style={{ ...inp, paddingLeft: '1rem' }} placeholder="e.g. callback" />
                </div>
              </div>
              <StatusAlert status={heroStatus} successMsg="Hero content saved!" errorMsg="Failed to save hero content." />
              <button type="submit" disabled={heroStatus === 'saving'} className="btn btn-gold" style={{ alignSelf: 'flex-start' }}>
                {heroStatus === 'saving' ? 'Saving...' : 'Update Hero Content'}
              </button>
            </form>
          </div>

          <div style={card('var(--violet)')}>
            {cardHeader(<Activity size={17} />, 'Site Statistics', 'Display impressive numbers on your home page.', 'var(--violet-dim)', 'var(--violet)')}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                {siteStats.map((stat, i) => (
                  <div key={i} style={{ padding: '1rem', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div>
                        <label style={{ ...lbl, fontSize: '0.6rem' }}>Label</label>
                        <input type="text" value={stat.label} onChange={e => updateStat(i, 'label', e.target.value)} style={{ ...inp, paddingLeft: '0.75rem', padding: '0.4rem 0.75rem' }} />
                      </div>
                      <div>
                        <label style={{ ...lbl, fontSize: '0.6rem' }}>Value</label>
                        <input type="text" value={stat.value} onChange={e => updateStat(i, 'value', e.target.value)} style={{ ...inp, paddingLeft: '0.75rem', padding: '0.4rem 0.75rem' }} />
                      </div>
                      <div>
                        <label style={{ ...lbl, fontSize: '0.6rem' }}>Icon (Lucide Name)</label>
                        <input type="text" value={stat.icon} onChange={e => updateStat(i, 'icon', e.target.value)} style={{ ...inp, paddingLeft: '0.75rem', padding: '0.4rem 0.75rem' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <StatusAlert status={statsStatus} successMsg="Stats updated!" errorMsg="Failed to save stats." />
              <button type="button" onClick={handleStatsSave} disabled={statsStatus === 'saving'} className="btn btn-violet" style={{ alignSelf: 'flex-start' }}>
                {statsStatus === 'saving' ? 'Saving...' : 'Update Site Stats'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'seo' && (
        <div style={card('var(--emerald)')}>
          {cardHeader(<Sparkles size={17}/>, 'Advanced SEO Settings', 'Control homepage metadata, social previews, and canonical SEO values from the admin panel.', 'rgba(16,217,140,0.1)', 'var(--emerald)')}
          <form onSubmit={handleSeoSave} style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <div>
              <label style={lbl}>Page Title</label>
              {inputWrap(<Sparkles size={14}/>, <input type="text" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} style={inp} placeholder="Enter SEO title for homepage" required />)}
            </div>
            <div>
              <label style={lbl}>Meta Description</label>
              <textarea value={seoDescription} onChange={e => setSeoDescription(e.target.value)} rows={3} style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', color:'var(--text-primary)', borderRadius:'10px', padding:'0.85rem 1rem', fontSize:'0.95rem', fontFamily:'var(--font-body)', resize:'vertical' }} placeholder="Craft a compelling homepage description" required />
            </div>
            <div>
              <label style={lbl}>Keywords</label>
              {inputWrap(<Activity size={14}/>, <input type="text" value={seoKeywords} onChange={e => setSeoKeywords(e.target.value)} style={inp} placeholder="Separate keywords with commas" />)}
            </div>
            <div>
              <label style={lbl}>Social Preview Image</label>
              {inputWrap(<ImageIcon size={14}/>, <input type="text" value={seoImageUrl} onChange={e => setSeoImageUrl(e.target.value)} style={inp} placeholder="https://snapadda.com/path/to/og-image.png" />)}
            </div>
            <div>
              <label style={lbl}>Canonical URL</label>
              {inputWrap(<Link size={14}/>, <input type="text" value={seoCanonicalUrl} onChange={e => setSeoCanonicalUrl(e.target.value)} style={inp} placeholder="https://snapadda.com/" />)}
            </div>
            <div>
              <label style={lbl}>Robots Directive</label>
              <select value={seoRobots} onChange={e => setSeoRobots(e.target.value)} style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', color:'var(--text-primary)', borderRadius:'10px', padding:'0.85rem 1rem', fontSize:'0.95rem', fontFamily:'var(--font-body)' }}>
                <option value="index, follow">index, follow</option>
                <option value="noindex, nofollow">noindex, nofollow</option>
                <option value="index, nofollow">index, nofollow</option>
              </select>
            </div>
            <StatusAlert status={seoStatus} successMsg="SEO settings saved!" errorMsg="Failed to save SEO settings." />
            <button type="submit" disabled={seoStatus === 'saving'} className="btn btn-emerald" style={{ alignSelf:'flex-start' }}>
              {seoStatus === 'saving' ? 'Saving...' : 'Save SEO Settings'}
            </button>
          </form>
        </div>
      )}

      {activeSection === 'questions' && (
        <div style={card('var(--emerald)')}>
          {cardHeader(<MessageSquare size={17}/>, 'Onboarding Questions', 'Add, edit, or disable the questions users see after login.', 'var(--emerald-dim)', 'var(--emerald)')}
        <div style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
          {onboardingQuestions.map((question, index) => (
            <div key={question.id} style={{ display:'grid', gap:'0.85rem', padding:'0.95rem 0', borderBottom: index < onboardingQuestions.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
              <div style={{ display:'flex', justifyContent:'space-between', gap:'1rem', alignItems:'flex-start' }}>
                <div style={{ flex:'1 1 0' }}>
                  <input
                    value={question.title}
                    onChange={(e) => handleUpdateQuestionTitle(question.id, e.target.value)}
                    style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'0.85rem 1rem', color:'var(--text-primary)', fontSize:'0.95rem' }}
                  />
                  <div style={{ marginTop:'0.5rem', color:'var(--text-muted)', fontSize:'0.78rem' }}>
                    Type: {question.type === 'options' ? 'Options' : 'Text input'}
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', alignItems:'flex-end' }}>
                  <button type="button" onClick={() => handleToggleQuestion(question.id)}
                    style={{ padding:'0.65rem 1rem', borderRadius:'12px', border:'none', background: question.enabled ? 'var(--emerald)' : 'rgba(255,255,255,0.08)', color: question.enabled ? '#08121f' : 'var(--text-muted)', cursor:'pointer' }}>
                    {question.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                  <button type="button" onClick={() => handleRemoveQuestion(question.id)}
                    style={{ padding:'0.65rem 1rem', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.12)', background:'transparent', color:'var(--rose)', cursor:'pointer' }}>
                    Remove
                  </button>
                </div>
              </div>
              {question.type === 'options' && (
                <input
                  value={question.options.join(', ')}
                  onChange={(e) => handleUpdateQuestionOptions(question.id, e.target.value)}
                  placeholder="Enter options separated by commas"
                  style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'0.85rem 1rem', color:'var(--text-primary)', fontSize:'0.9rem' }}
                />
              )}
            </div>
          ))}

          <div style={{ padding:'1rem', borderRadius:'18px', border:'1px dashed rgba(255,255,255,0.12)', display:'flex', flexDirection:'column', gap:'0.9rem' }}>
            <div style={{ fontWeight:700, color:'var(--text-primary)' }}>Create a new onboarding question</div>
            <input
              placeholder="Question text"
              value={newQuestionTitle}
              onChange={(e) => setNewQuestionTitle(e.target.value)}
              style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'0.85rem 1rem', color:'var(--text-primary)', fontSize:'0.95rem' }}
            />
            <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
              <select
                value={newQuestionType}
                onChange={(e) => setNewQuestionType(e.target.value as 'options' | 'text')}
                style={{ flex:'1 1 220px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'0.85rem 1rem', color:'var(--text-primary)' }}
              >
                <option value="options">Options</option>
                <option value="text">Text input</option>
              </select>
              {newQuestionType === 'options' && (
                <input
                  placeholder="Comma-separated options"
                  value={newQuestionOptions}
                  onChange={(e) => setNewQuestionOptions(e.target.value)}
                  style={{ flex:'2 1 320px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'0.85rem 1rem', color:'var(--text-primary)' }}
                />
              )}
            </div>
            <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
              <button type="button" onClick={handleAddQuestion} className="btn btn-violet" style={{ minWidth:'160px' }}>Add Question</button>
              <button type="button" onClick={handleSaveQuestions} className="btn btn-emerald" style={{ minWidth:'160px' }}>
                {questionsStatus === 'saving' ? 'Saving...' : 'Save Question Settings'}
              </button>
            </div>
            {questionsStatus === 'success' && <div style={{ color:'var(--emerald)', fontSize:'0.9rem' }}>Question settings saved successfully.</div>}
            {questionsStatus === 'error' && <div style={{ color:'var(--rose)', fontSize:'0.9rem' }}>Unable to save question settings.</div>}
          </div>
        </div>
      </div>

      )}

      {activeSection === 'profile' && (
        <div style={card('var(--violet)')}>
        {cardHeader(<User size={17}/>, 'Admin Profile', 'Update your name and profile picture.', 'var(--violet-dim)', 'var(--violet)')}
        <form onSubmit={handleProfileSave} style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'1.25rem' }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <img
                src={profileAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileName||'Admin')}&background=9b59f5&color=fff&bold=true`}
                alt="avatar"
                style={{ width:'72px', height:'72px', borderRadius:'50%', objectFit:'cover', border:'2.5px solid var(--violet)', boxShadow:'0 0 20px rgba(155,89,245,0.35)' }}
              />
              <button type="button" onClick={() => avatarInputRef.current?.click()} style={{ position:'absolute', bottom:'0', right:'0', width:'24px', height:'24px', borderRadius:'50%', background:'var(--violet)', border:'2px solid var(--bg-secondary)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff' }}>
                {avatarUploading ? <RefreshCw size={11} style={{ animation:'spin 1s linear infinite' }}/> : <Camera size={11}/>}
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatarUpload}/>
            </div>
            <div>
              <div style={{ fontWeight:600, color:'var(--text-primary)', fontSize:'0.95rem' }}>{profileName || 'Admin'}</div>
              <div style={{ fontSize:'0.75rem', color:'var(--violet)', marginBottom:'6px' }}>● Administrator</div>
              <button type="button" onClick={() => avatarInputRef.current?.click()} className="btn btn-ghost btn-sm" style={{ fontSize:'0.72rem', padding:'0.3rem 0.75rem' }}>
                <Camera size={11}/> Change Photo
              </button>
            </div>
          </div>
          <div>
            <label style={lbl}>Display Name</label>
            {inputWrap(<User size={14}/>, <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} style={inp} placeholder="Your display name" required />)}
          </div>
          <StatusAlert status={profileStatus} successMsg="Profile saved!" errorMsg="Could not save profile." />
          <button type="submit" disabled={profileStatus === 'saving'} className="btn btn-violet" style={{ alignSelf:'flex-start' }}>{profileStatus === 'saving' ? 'Saving...' : 'Save Profile'}</button>
        </form>
      </div>
      )}

      {activeSection === 'password' && (
        <div style={card('var(--rose)')}>
        {cardHeader(<KeyRound size={17}/>, 'Change Password', 'Update your credentials.', 'var(--rose-dim)', 'var(--rose)')}
        <form onSubmit={handlePasswordChange} style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1.1rem' }}>
          <div>
            <label style={lbl}>Current Password</label>
            <div style={{ position:'relative' }}>
              <Lock size={14} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
              <input type={showCurrent ? 'text' : 'password'} value={currentPw} onChange={e => setCurrentPw(e.target.value)} style={{ ...inp, paddingRight:'2.5rem' }} placeholder="Enter current password" required />
              <button type="button" onClick={() => setShowCurrent(v => !v)} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', cursor:'pointer' }}>{showCurrent ? <EyeOff size={15}/> : <Eye size={15}/>}</button>
            </div>
          </div>
          <div>
            <label style={lbl}>New Password</label>
            <div style={{ position:'relative' }}>
              <Lock size={14} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
              <input type={showNew ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} style={{ ...inp, paddingRight:'2.5rem' }} placeholder="Min 8 characters" required />
              <button type="button" onClick={() => setShowNew(v => !v)} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', cursor:'pointer' }}>{showNew ? <EyeOff size={15}/> : <Eye size={15}/>}</button>
            </div>
          </div>
          <div>
            <label style={lbl}>Confirm New Password</label>
            {inputWrap(<Lock size={14}/>, <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} style={inp} placeholder="Repeat new password" required />)}
          </div>
          {pwError && <div style={{ fontSize:'0.8rem', color:'var(--rose)', display:'flex', alignItems:'center', gap:'6px' }}><AlertCircle size={13}/>{pwError}</div>}
          <StatusAlert status={pwStatus} successMsg="Password changed!" errorMsg="Failed to change password." />
          <button type="submit" disabled={pwStatus === 'saving'} className="btn btn-rose" style={{ alignSelf:'flex-start' }}>Change Password</button>
        </form>
      </div>
      )}

      {activeSection === 'support' && (
        <div style={card('var(--violet)')}>
        {cardHeader(<Activity size={17}/>, 'Support & Contact Information', 'Manage public contact details.', 'rgba(155,89,245,0.1)', 'var(--violet)')}
        <form onSubmit={handleSupportSave} style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div>
              <label style={lbl}>Support Phone</label>
              {inputWrap(<Phone size={14}/>, <input type="text" value={supportPhone} onChange={e => setSupportPhone(e.target.value)} style={inp} placeholder="+91 999 999 9999" />)}
            </div>
            <div>
              <label style={lbl}>Support Email</label>
              {inputWrap(<Mail size={14}/>, <input type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} style={inp} placeholder="info@snapadda.com" />)}
            </div>
          </div>
          <div>
            <label style={lbl}>Office Address</label>
            {inputWrap(<MapPin size={14}/>, <textarea value={supportAddress} onChange={e => setSupportAddress(e.target.value)} rows={2} style={{ ...inp, paddingLeft:'2.5rem', height:'auto', resize:'none', paddingTop:'0.65rem' }} placeholder="Full street address..." />)}
          </div>
          <div>
            <label style={lbl}>Working Hours</label>
            {inputWrap(<Activity size={14}/>, <input type="text" value={supportHours} onChange={e => setSupportHours(e.target.value)} style={inp} placeholder="Mon-Sat 9 AM - 7 PM" />)}
          </div>
          <StatusAlert status={supportStatus} successMsg="Support info updated!" errorMsg="Failed to save." />
          <button type="submit" disabled={supportStatus === 'saving'} className="btn btn-violet" style={{ alignSelf:'flex-start' }}>Update Support Info</button>
        </form>
      </div>
      )}

      {activeSection === 'whatsapp' && (
        <div style={card('var(--emerald)')}>
        {cardHeader(<MessageSquare size={17}/>, 'WhatsApp Integration', 'Contact button settings.', 'rgba(16,217,140,0.1)', 'var(--emerald)')}
        <form onSubmit={handleWaSave} style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div>
            <label style={lbl}>WhatsApp Number</label>
            {inputWrap(<Phone size={14}/>, <input type="text" value={waNumber} onChange={e => setWaNumber(e.target.value)} style={inp} placeholder="919876543210" required/>)}
          </div>
          <div>
            <label style={lbl}>Pre-filled Message</label>
            <textarea value={waMessage} onChange={e => setWaMessage(e.target.value)} rows={3} placeholder="Hello..." style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', color:'var(--text-primary)', borderRadius:'10px', padding:'0.65rem 1rem', fontSize:'0.875rem', outline:'none', fontFamily:'var(--font-body)', resize:'none' }} />
          </div>
          <StatusAlert status={waStatus} successMsg="Settings saved!" errorMsg="Failed to save."/>
          <button type="submit" disabled={waStatus === 'saving'} className="btn btn-cyan" style={{ alignSelf:'flex-start' }}>Save Settings</button>
        </form>
      </div>
      )}

      {activeSection === 'danger' && (
        <div style={{ ...card('var(--rose)'), borderColor:'rgba(245,57,123,0.2)' }}>
        {cardHeader(<Shield size={17}/>, 'Danger Zone', 'Security-sensitive actions.', 'var(--rose-dim)', 'var(--rose)')}
        <div style={{ padding:'1.5rem' }}>
          <a href="/admin/login" className="btn btn-rose btn-sm">Sign Out</a>
        </div>
      </div>
      )}

    </div>
  );
};

export default AdminSettings;
