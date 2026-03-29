import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Check, Home as HomeIcon } from 'lucide-react';
import './Onboarding.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const STEPS = [
  { id: 1, title: 'I am looking for' },
  { id: 2, title: 'My budget is' },
  { id: 3, title: 'Preferred purpose' },
  { id: 4, title: 'Additional Notes' }
];

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Agriculture Land', 'Commercial', 'Plot'];
const BUDGETS = ['Under 50 Lakhs', '50L - 1 Crore', '1Cr - 5 Crore', '5 Crore+'];
const PURPOSES = ['Personal Use', 'Investment', 'Agriculture'];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, completeOnboarding } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    propertyType: '',
    budget: '',
    purpose: '',
    additionalNotes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(s => s + 1);
    } else {
      await submitPreferences();
    }
  };

  const submitPreferences = async () => {
    if (!user?._id) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${API_URL}/users/${user._id}/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        completeOnboarding();
        navigate('/');
      } else {
        alert("Failed to save preferences. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelection = (key: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Auto-advance on select for fast UX (except text area)
    if (currentStep < STEPS.length) {
      setTimeout(() => setCurrentStep(s => s + 1), 300);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="onboarding-page">
      <div className="onboarding-nav">
        <div className="brand">
          <HomeIcon className="text-gold" />
          <span>SnapAdda</span>
        </div>
        <div className="user-pill">
          {user?.avatar && <img src={user.avatar} alt="Profile" className="avatar" />}
          <span>{user?.name || 'Welcome'}</span>
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="onboarding-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="step-content"
          >
            <h2 className="step-title">{STEPS[currentStep - 1].title}</h2>
            
            <div className="options-grid">
              {currentStep === 1 && PROPERTY_TYPES.map(pt => (
                <button 
                  key={pt} 
                  className={`option-btn ${formData.propertyType === pt ? 'selected' : ''}`}
                  onClick={() => handleSelection('propertyType', pt)}
                >
                  {pt}
                  {formData.propertyType === pt && <Check size={18} className="text-gold check-icon" />}
                </button>
              ))}

              {currentStep === 2 && BUDGETS.map(b => (
                <button 
                  key={b} 
                  className={`option-btn ${formData.budget === b ? 'selected' : ''}`}
                  onClick={() => handleSelection('budget', b)}
                >
                  {b}
                  {formData.budget === b && <Check size={18} className="text-gold check-icon" />}
                </button>
              ))}

              {currentStep === 3 && PURPOSES.map(p => (
                <button 
                  key={p} 
                  className={`option-btn ${formData.purpose === p ? 'selected' : ''}`}
                  onClick={() => handleSelection('purpose', p)}
                >
                  {p}
                  {formData.purpose === p && <Check size={18} className="text-gold check-icon" />}
                </button>
              ))}

              {currentStep === 4 && (
                <div className="textarea-container">
                  <textarea 
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData(p => ({ ...p, additionalNotes: e.target.value }))}
                    placeholder="E.g. I need a corner plot with east facing... (Optional)"
                    rows={6}
                  />
                </div>
              )}
            </div>

            <div className="step-actions">
              {currentStep > 1 && (
                <button className="back-btn" onClick={() => setCurrentStep(s => s - 1)}>Back</button>
              )}
              {currentStep === 4 && (
                <Button 
                  variant="primary" 
                  onClick={handleNext} 
                  disabled={isSubmitting}
                  style={{ marginLeft: 'auto' }}
                >
                  {isSubmitting ? 'Saving...' : 'Complete Profile'}
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
