import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, IndianRupee, MapPin, Target, ChevronRight, ChevronLeft, CheckCircle2, LogOut, Sparkles, MessageSquare, HelpCircle } from 'lucide-react';
import { fetchSetting } from '../services/api';
import { useTranslation } from 'react-i18next';
import Logo from '../components/Logo';

const STEPS = [
  { id: 'welcome', title: 'Welcome' },
  { id: 'purpose', title: 'Strategy', icon: Target },
  { id: 'propertyType', title: 'Category', icon: Home },
  { id: 'budget', title: 'Budget', icon: IndianRupee },
  { id: 'locations', title: 'Search Area', icon: MapPin },
  { id: 'finish', title: 'Finish' }
];

const PROPERTY_TYPES = ['Apartment', 'Independent House', 'Villa', 'Residential Plot', 'Agriculture Land', 'Commercial Space'];
const PURPOSES = ['Personal Use', 'Investment', 'Agriculture'];
const BUDGETS = ['Below 50L', '50L - 1Cr', '1Cr - 3Cr', '3Cr - 5Cr', 'Above 5Cr'];
const DISTRICTS = ['Amaravati', 'Vijayawada', 'Guntur', 'Mangalagiri', 'Tenali', 'Visakhapatnam', 'Tirupati', 'Nellore'];

export default function Onboarding() {
  const { t } = useTranslation();
  const { user, completeOnboarding, logout } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Fetch dynamic questions
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const res = await fetchSetting('onboarding_questions');
        // Filter out disabled ones
        const dataArray = Array.isArray(res) ? res : [];
        const active = dataArray.filter(q => q && q.enabled);
        
        // Build initial form data
        const initial = {};
        active.forEach(q => {
          if (q.key) initial[q.key] = q.type === 'options' ? '' : '';
        });
        
        setQuestions(active);
        setFormData(initial);
      } catch (err) {
        console.error('Failed to load onboarding questions:', err);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, []);

  useEffect(() => { 
    if (user?.onboardingCompleted && !isFinished) navigate('/'); 
  }, [user, navigate, isFinished]);

  const handleNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  const toggleLocation = (loc) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.includes(loc) 
        ? prev.locations.filter(l => l !== loc)
        : [...prev.locations, loc]
    }));
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding(formData);
      setIsFinished(true);
      setStep(questions.length + 1); // Move to final step
    } catch (e) {
      console.error(e);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    navigate('/');
  };

  const getIcon = (key) => {
    switch(key) {
      case 'propertyType': return <Home size={32} />;
      case 'budget': return <IndianRupee size={32} />;
      case 'purpose': return <Target size={32} />;
      case 'locations': return <MapPin size={32} />;
      default: return <HelpCircle size={32} />;
    }
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--midnight)' }}>
      <div className="loader" />
    </div>
  );

  const totalSteps = questions.length + 2; // Welcome + Questions + Finish
  const isFinalStep = step === questions.length + 1;

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'var(--midnight)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Decor */}
      <div style={{ 
        position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', 
        background: 'radial-gradient(circle, var(--royal-emerald) 0%, transparent 70%)', opacity: 0.15, filter: 'blur(80px)' 
      }} />
      <div style={{ 
        position: 'absolute', bottom: '-5%', right: '-5%', width: '30%', height: '30%', 
        background: 'radial-gradient(circle, var(--royal-gold) 0%, transparent 70%)', opacity: 0.1, filter: 'blur(100px)' 
      }} />

      <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Logo size={42} showText />
        </Link>
        <button 
          onClick={() => navigate('/')}
          className="glass-heavy btn-3d"
          style={{ 
            border: '1px solid rgba(212,175,55,0.4)', 
            color: 'var(--gold)', padding: '0.6rem 1.4rem', borderRadius: '12px', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px',
            textTransform: 'uppercase', letterSpacing: '0.05em'
          }}
        >
          <ChevronLeft size={16} /> {t('dashboard.backToSite')}
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem 2rem 4rem' }}>
        <motion.div 
          className="glass-heavy onboarding-card"
          style={{ width: '100%', maxWidth: '520px', borderRadius: '28px', position: 'relative', overflow: 'hidden' }}
          layout
        >
          {/* Progress Bar */}
          {!isFinished && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#ffffff08', borderRadius: '4px 4px 0 0', overflow: 'hidden' }}>
              <motion.div 
                style={{ height: '100%', background: 'linear-gradient(90deg, var(--royal-emerald), var(--royal-gold))' }}
                initial={{ width: 0 }}
                animate={{ width: `${(step / (questions.length + 1)) * 100}%` }}
              />
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              {/* --- STEP 0: WELCOME --- */}
              {step === 0 && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', padding: '1rem', background: 'var(--gold-dim)', borderRadius: '20px', color: 'var(--royal-gold)', marginBottom: '2rem' }}>
                    <Sparkles size={32} />
                  </div>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>{t('onboarding.welcomeTitle', 'Tailored Experience')}</h2>
                  <p style={{ color: 'var(--txt-secondary)', lineHeight: 1.8, marginBottom: '2.5rem' }}>
                    {t('onboarding.welcomeText', { name: user?.name?.split(' ')[0] || 'Explorer' })}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button className="btn-3d" onClick={handleNext} style={{ width: '100%', padding: '1.2rem' }}>
                      {t('onboarding.getStarted', 'Get Started')} <ChevronRight size={18} style={{ marginLeft: '8px' }} />
                    </button>
                    <button 
                      onClick={() => navigate('/')}
                      style={{ 
                        background: 'transparent', border: 'none', color: 'var(--txt-muted)', 
                        fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline' 
                      }}
                    >
                      {t('dashboard.backToSite')}
                    </button>
                  </div>
                </div>
              )}

              {/* --- DYNAMIC QUESTIONS --- */}
              {step > 0 && step <= questions.length && (
                <div>
                  <div style={{ display: 'inline-flex', padding: '1rem', background: 'var(--gold-dim)', borderRadius: '20px', color: 'var(--royal-gold)', marginBottom: '1.5rem' }}>
                    {getIcon(questions[step-1].key)}
                  </div>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>{t(`onboarding.q.${questions[step-1].key}`, questions[step-1].title)}</h3>
                  <p style={{ color: 'var(--txt-muted)', marginBottom: '2rem' }}>{t('onboarding.selectPref', 'Select your preference below.')}</p>
                  
                  {questions[step-1].type === 'options' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem' }}>
                      {questions[step-1].options.map(opt => {
                        const isSelected = formData[questions[step-1].key] === opt;
                        return (
                          <button 
                            key={opt}
                            onClick={() => setFormData({...formData, [questions[step-1].key]: opt})}
                            style={{ 
                              padding: '1.1rem 1.4rem', borderRadius: '16px', border: '1.5px solid',
                              borderColor: isSelected ? 'var(--royal-gold)' : 'rgba(255,255,255,0.08)',
                              background: isSelected ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.03)',
                              color: isSelected ? 'var(--royal-gold)' : 'var(--txt-primary)',
                              textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', fontWeight: 600,
                              fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}
                          >
                            <span>{t(`onboarding.opt.${opt.replace(/\s+/g, '')}`, opt)}</span>
                            {isSelected && <CheckCircle2 size={18} />}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ marginTop: '1rem' }}>
                      <textarea 
                        placeholder={t('onboarding.placeholder', 'Type your answer here...')}
                        value={formData[questions[step-1].key] || ''}
                        onChange={(e) => setFormData({...formData, [questions[step-1].key]: e.target.value})}
                        style={{ 
                          width: '100%', background: '#ffffff05', border: '1px solid var(--border-light)', 
                          borderRadius: '12px', padding: '1rem', color: '#fff', outline: 'none', resize: 'none', height: '140px'
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* --- STEP FINISH --- */}
              {step === questions.length + 1 && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 2rem' }}>
                    <motion.div 
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      style={{ 
                        width: '100%', height: '100%', background: 'var(--royal-emerald)', 
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                      }}
                    >
                      <CheckCircle2 size={42} />
                    </motion.div>
                  </div>
                  <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--emerald)' }}>{t('dashboard.overview')} {t('onboarding.finishTitle', 'Strategy Optimized')}</h2>
                  <p style={{ color: 'var(--txt-secondary)', lineHeight: 1.8, marginBottom: '2.5rem' }}>
                    {t('onboarding.finishText', 'Welcome to the Inner Circle. Your investment strategy has been secured. You can now explore properties and growth hotspots tailored to your profile.')}
                  </p>
                  <button className="btn-3d" onClick={handleContinue} style={{ width: '100%', padding: '1.2rem', background: 'var(--royal-emerald)', color: '#fff' }}>
                    {t('dashboard.backToSite')} <ChevronRight size={18} style={{ marginLeft: '8px' }} />
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          {step > 0 && step < questions.length + 1 && (
            <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}>
              <button 
                onClick={handleBack} 
                style={{ 
                  flex: 1, padding: '1.2rem', borderRadius: '18px', border: '1.5px solid var(--border-light)',
                  background: 'transparent', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <ChevronLeft size={20} />
              </button>
              
              {step < questions.length ? (
                <button 
                  className="btn-3d" 
                  onClick={handleNext}
                  disabled={!formData[questions[step-1].key]}
                  style={{ flex: 3, opacity: !formData[questions[step-1].key] ? 0.5 : 1 }}
                >
                  Continue <ChevronRight size={18} style={{ marginLeft: '8px' }} />
                </button>
              ) : (
                <button 
                  className="btn-3d btn-3d-emerald" 
                  onClick={handleFinish}
                  disabled={isSubmitting || !formData[questions[step-1].key]}
                  style={{ flex: 3, opacity: (!formData[questions[step-1].key]) ? 0.5 : 1 }}
                >
                  {isSubmitting ? 'Syncing...' : 'Save Strategy'} <ChevronRight size={18} style={{ marginLeft: '8px' }} />
                </button>
              )}
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
}
