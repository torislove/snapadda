import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, IndianRupee, MapPin, Target, ChevronRight, ChevronLeft, CheckCircle2, LogOut, Sparkles } from 'lucide-react';
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
  const { user, completeOnboarding, logout } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    purpose: '',
    propertyType: '',
    budget: '',
    locations: [],
    additionalNotes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

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
      setStep(STEPS.length - 1);
    } catch (e) {
      console.error(e);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalSignOut = () => {
    logout();
    navigate('/login');
  };

  const activeStep = STEPS[step];

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

      {/* Header */}
      <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
        <Logo size={42} showText />
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem 2rem 4rem' }}>
        <motion.div 
          className="glass-heavy onboarding-card"
          style={{ width: '100%', maxWidth: '640px', borderRadius: '32px', position: 'relative' }}
          layout
        >
          {/* Progress Bar */}
          {!isFinished && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#ffffff08', borderRadius: '4px 4px 0 0', overflow: 'hidden' }}>
              <motion.div 
                style={{ height: '100%', background: 'linear-gradient(90deg, var(--royal-emerald), var(--royal-gold))' }}
                initial={{ width: 0 }}
                animate={{ width: `${(step / (STEPS.length - 2)) * 100}%` }}
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
                  <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>Tailored Experience</h2>
                  <p style={{ color: 'var(--txt-secondary)', lineHeight: 1.8, marginBottom: '2.5rem' }}>
                    Welcome, <b>{user?.name?.split(' ')[0]}</b>. To provide you with the most relevant investment opportunities in Andhra Pradesh, we need to understand your requirements.
                  </p>
                  <button className="btn-3d" onClick={handleNext} style={{ width: '100%', padding: '1.2rem' }}>
                    Get Started <ChevronRight size={18} style={{ marginLeft: '8px' }} />
                  </button>
                </div>
              )}

              {/* --- STEP 1: PURPOSE --- */}
              {step === 1 && (
                <div>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Your Strategy</h3>
                  <p style={{ color: 'var(--txt-muted)', marginBottom: '2rem' }}>What is the primary intent behind this property search?</p>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {PURPOSES.map(p => (
                      <button 
                        key={p}
                        onClick={() => setFormData({...formData, purpose: p})}
                        style={{ 
                          padding: '1.2rem', borderRadius: '18px', border: '1px solid',
                          borderColor: formData.purpose === p ? 'var(--royal-gold)' : 'var(--border-light)',
                          background: formData.purpose === p ? 'var(--gold-dim)' : '#ffffff05',
                          color: formData.purpose === p ? 'var(--royal-gold)' : 'var(--txt-primary)',
                          textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* --- STEP 2: TYPE --- */}
              {step === 2 && (
                <div>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Property Category</h3>
                  <p style={{ color: 'var(--txt-muted)', marginBottom: '2rem' }}>Which asset types are you most interested in?</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {PROPERTY_TYPES.map(t => (
                      <button 
                        key={t}
                        onClick={() => setFormData({...formData, propertyType: t})}
                        style={{ 
                          padding: '1rem', borderRadius: '16px', border: '1px solid',
                          borderColor: formData.propertyType === t ? 'var(--royal-gold)' : 'var(--border-light)',
                          background: formData.propertyType === t ? 'var(--gold-dim)' : '#ffffff05',
                          color: formData.propertyType === t ? 'var(--royal-gold)' : 'var(--txt-primary)',
                          cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem', fontWeight: 600
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* --- STEP 3: BUDGET --- */}
              {step === 3 && (
                <div>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Budget Profile</h3>
                  <p style={{ color: 'var(--txt-muted)', marginBottom: '2rem' }}>What is your planned investment range?</p>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {BUDGETS.map(b => (
                      <button 
                        key={b}
                        onClick={() => setFormData({...formData, budget: b})}
                        style={{ 
                          padding: '1rem', borderRadius: '16px', border: '1px solid',
                          borderColor: formData.budget === b ? 'var(--royal-gold)' : 'var(--border-light)',
                          background: formData.budget === b ? 'var(--gold-dim)' : '#ffffff05',
                          color: formData.budget === b ? 'var(--royal-gold)' : 'var(--txt-primary)',
                          cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600
                        }}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* --- STEP 4: LOCATION --- */}
              {step === 4 && (
                <div style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Preferred Areas</h3>
                  <p style={{ color: 'var(--txt-muted)', marginBottom: '1.5rem' }}>Select the districts or cities you're targeting.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {DISTRICTS.map(d => (
                      <button 
                        key={d}
                        onClick={() => toggleLocation(d)}
                        style={{ 
                          padding: '0.8rem', borderRadius: '12px', border: '1px solid',
                          borderColor: formData.locations.includes(d) ? 'var(--royal-gold)' : 'var(--border-light)',
                          background: formData.locations.includes(d) ? 'var(--gold-dim)' : '#ffffff05',
                          color: formData.locations.includes(d) ? 'var(--royal-gold)' : 'var(--txt-primary)',
                          cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.85rem'
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop: '1.5rem' }}>
                    <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--txt-muted)', display: 'block', marginBottom: '0.5rem' }}>Additional Preferences</label>
                    <textarea 
                      placeholder="e.g. Near main road, North-facing, etc."
                      value={formData.additionalNotes}
                      onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                      style={{ 
                        width: '100%', background: '#ffffff05', border: '1px solid var(--border-light)', 
                        borderRadius: '12px', padding: '1rem', color: '#fff', outline: 'none', resize: 'none', height: '80px'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* --- STEP 5: FINISH --- */}
              {step === 5 && (
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
                  <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--emerald)' }}>Data Secured</h2>
                  <p style={{ color: 'var(--txt-secondary)', lineHeight: 1.8, marginBottom: '2.5rem' }}>
                    Preferences saved. Our advisors will now review your strategy. For security, please sign in again to activate your customized dashboard.
                  </p>
                  <button className="btn-3d" onClick={handleFinalSignOut} style={{ width: '100%', padding: '1.2rem', background: '#fff', color: 'var(--midnight)' }}>
                    Complete & Sign Out <LogOut size={18} style={{ marginLeft: '8px' }} />
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          {step > 0 && step < STEPS.length - 1 && (
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
              
              {step < STEPS.length - 2 ? (
                <button 
                  className="btn-3d" 
                  onClick={handleNext}
                  disabled={!formData[activeStep.id] || (Array.isArray(formData[activeStep.id]) && formData[activeStep.id].length === 0)}
                  style={{ flex: 3, opacity: (!formData[activeStep.id] || (Array.isArray(formData[activeStep.id]) && formData[activeStep.id].length === 0)) ? 0.5 : 1 }}
                >
                  Continue <ChevronRight size={18} style={{ marginLeft: '8px' }} />
                </button>
              ) : (
                <button 
                  className="btn-3d btn-3d-emerald" 
                  onClick={handleFinish}
                  disabled={isSubmitting}
                  style={{ flex: 3 }}
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
