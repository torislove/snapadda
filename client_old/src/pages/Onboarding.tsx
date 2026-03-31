import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchSetting } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Check } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import './Onboarding.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DEFAULT_ONBOARDING_QUESTIONS = [
  {
    id: 'phone',
    key: 'phone',
    title: 'What is your phone number?',
    type: 'phone',
    options: [],
    helper: 'Enter the number we can reach you on for property updates.',
    enabled: true
  },
  {
    id: 'whatsapp',
    key: 'whatsapp',
    title: 'WhatsApp number',
    type: 'phone',
    options: [],
    helper: 'Use the number where you want WhatsApp alerts and messages.',
    enabled: true
  },
  {
    id: 'propertyType',
    key: 'propertyType',
    title: 'I am looking for',
    type: 'options',
    options: ['Apartment', 'Villa', 'Agriculture Land', 'Commercial', 'Plot'],
    helper: 'Choose the property type you want most.',
    enabled: true
  },
  {
    id: 'budget',
    key: 'budget',
    title: 'My budget is',
    type: 'options',
    options: ['Under 50 Lakhs', '50L - 1 Crore', '1Cr - 5 Crore', '5 Crore+'],
    helper: 'Pick the budget range that fits your plan.',
    enabled: true
  },
  {
    id: 'purpose',
    key: 'purpose',
    title: 'Preferred purpose',
    type: 'options',
    options: ['Personal Use', 'Investment', 'Agriculture'],
    helper: 'What do you need this property for?',
    enabled: true
  },
  {
    id: 'additionalNotes',
    key: 'additionalNotes',
    title: 'Tell us more',
    type: 'text',
    options: [],
    helper: 'Share any extra details or property preferences.',
    enabled: true
  }
];


const Onboarding = () => {
  const navigate = useNavigate();
  const { user, completeOnboarding } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [questions, setQuestions] = useState(DEFAULT_ONBOARDING_QUESTIONS);
  const [formData, setFormData] = useState<Record<string, string>>({
    phone: '',
    whatsapp: '',
    propertyType: '',
    budget: '',
    purpose: '',
    additionalNotes: ''
  });
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSetting('onboarding_questions')
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setQuestions(data);
        }
      })
      .catch(() => {
        // Keep fallback default questions
      });
  }, []);

  const enabledQuestions = questions.filter(q => q.enabled);
  const activeQuestion = enabledQuestions[currentStep - 1] || enabledQuestions[0] || DEFAULT_ONBOARDING_QUESTIONS[0];
  const totalSteps = Math.max(enabledQuestions.length, 1);

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setDirection(1);
      setCurrentStep(s => s + 1);
    } else {
      await submitPreferences();
    }
  };

  const submitPreferences = async () => {
    if (!user?._id) return;
    setIsSubmitting(true);
    
    try {
      const standardFields = {
        propertyType: formData.propertyType || '',
        budget: formData.budget || '',
        purpose: formData.purpose || '',
        additionalNotes: formData.additionalNotes || ''
      };

      const extraAnswers = Object.entries(formData).reduce<Record<string, string>>((acc, [key, value]) => {
        if (!['propertyType', 'budget', 'purpose', 'additionalNotes'].includes(key)) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const res = await fetch(`${API_URL}/users/${user._id}/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...standardFields, extraAnswers })
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

  const handleSelection = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (activeQuestion?.type === 'options' && currentStep < totalSteps) {
      setTimeout(() => {
        setDirection(1);
        setCurrentStep(s => Math.min(s + 1, totalSteps));
      }, 250);
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep(s => Math.max(s - 1, 1));
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="onboarding-page">
      <div className="onboarding-nav">
        <div className="brand">
          <Logo size={42} showText />
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
            key={activeQuestion.key}
            initial={{ opacity: 0, x: direction > 0 ? 40 : -40, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction > 0 ? -40 : 40, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="step-content glass-heavy tilt-3d"
            style={{ padding: '2.5rem', borderRadius: '18px', margin: 'auto', maxWidth: '640px', minHeight: '420px', transformStyle: 'preserve-3d' }}
          >
            <div className="step-header">
              <span className="step-badge">Step {currentStep} of {totalSteps}</span>
              <h2 className="step-title">{activeQuestion.title}</h2>
              <p className="step-description">{activeQuestion.helper}</p>
            </div>

            <div className="options-grid">
              {activeQuestion.type === 'options' && activeQuestion.options.map(option => (
                <button
                  key={option}
                  className={`option-btn tilt-3d ${formData[activeQuestion.key] === option ? 'selected' : ''}`}
                  onClick={() => handleSelection(activeQuestion.key, option)}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <span>{option}</span>
                  {formData[activeQuestion.key] === option && <Check size={18} className="text-gold check-icon" />}
                </button>
              ))}

              {(activeQuestion.type === 'text' || activeQuestion.type === 'phone') && (
                <div className="textarea-container">
                  {activeQuestion.type === 'text' ? (
                    <textarea
                      value={formData[activeQuestion.key] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [activeQuestion.key]: e.target.value }))}
                      placeholder="E.g. I need a corner plot with east facing... (Optional)"
                      rows={6}
                    />
                  ) : (
                    <input
                      type="tel"
                      value={formData[activeQuestion.key] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [activeQuestion.key]: e.target.value }))}
                      placeholder={activeQuestion.key === 'phone' ? 'Enter your phone number' : 'Enter your WhatsApp number'}
                      className="onboarding-input"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="step-actions">
              {currentStep > 1 && (
                <button className="back-btn" onClick={handleBack}>Back</button>
              )}
              <Button
                className="btn-3d"
                onClick={handleNext}
                disabled={isSubmitting}
                style={{ marginLeft: currentStep > 1 ? 'auto' : '0' }}
              >
                {currentStep === totalSteps ? (isSubmitting ? 'Saving...' : 'Finish') : 'Continue'}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
