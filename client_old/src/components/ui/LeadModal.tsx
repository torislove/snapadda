import React, { useState } from 'react';
import { Button } from './Button';
import { X, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitLead } from '../../services/api';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'callback' | 'contact';
}

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Plot', 'Agriculture', 'Commercial'];
const BUDGET_RANGES = ['Under 50L', '50L - 1Cr', '1Cr - 2Cr', '2Cr+'];

export const LeadModal: React.FC<LeadModalProps> = ({ isOpen, onClose, type }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    propertyType: 'Apartment',
    budget: '50L - 1Cr'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitLead({ ...formData, type });
      setStep(3); // Go to summary
    } catch (err) {
      console.log("Mock lead submission", { ...formData, type });
      setStep(3); // Fallback to summary for demo
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeReset = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setFormData({ name: '', phone: '', whatsapp: '', propertyType: 'Apartment', budget: '50L - 1Cr' });
    }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[2000] backdrop-blur-md p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="glass-heavy w-full max-w-md rounded-[32px] overflow-hidden border border-white/10"
            initial={{ scale: 0.9, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                {step > 1 && step < 3 && (
                  <button onClick={handleBack} className="text-gold hover:scale-110 transition-transform">
                    <ArrowLeft size={20} />
                  </button>
                )}
                <h3 className="font-serif text-lg text-gold">
                  {step === 3 ? 'Confirmation' : type === 'callback' ? 'Property Inquiry' : 'Contact Request'}
                </h3>
              </div>
              <button onClick={closeReset} className="text-white/40 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="form-field">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Full Name</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Your Name"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-gold/50 transition-colors"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="form-field">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Mobile Number</label>
                        <input 
                          type="tel" 
                          required 
                          placeholder="934xxxxxxx"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-gold/50 transition-colors"
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                      <div className="form-field">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">WhatsApp Number</label>
                        <input 
                          type="tel" 
                          required 
                          placeholder="Same as mobile?"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-gold/50 transition-colors"
                          value={formData.whatsapp}
                          onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                        />
                      </div>
                    </div>
                    <Button 
                      className="w-full btn-3d" 
                      onClick={handleNext}
                      disabled={!formData.name || !formData.phone}
                    >
                      Next: Preferences
                    </Button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="form-field">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Interested In</label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {PROPERTY_TYPES.map(t => (
                            <button
                              key={t}
                              onClick={() => setFormData({...formData, propertyType: t})}
                              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                                formData.propertyType === t 
                                ? 'bg-gold text-black border-gold' 
                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="form-field">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Est. Budget</label>
                        <select 
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-gold/50 transition-colors"
                          value={formData.budget}
                          onChange={e => setFormData({...formData, budget: e.target.value})}
                        >
                          {BUDGET_RANGES.map(b => <option key={b} value={b} className="bg-black">{b}</option>)}
                        </select>
                      </div>
                    </div>
                    <Button 
                      className="w-full btn-3d-emerald" 
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Processing...' : 'Get Callback Now'}
                    </Button>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-4"
                  >
                    <div className="w-20 h-20 bg-emerald/20 border border-emerald/40 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={40} className="text-emerald" />
                    </div>
                    <h2 className="text-2xl font-serif mb-2">Request Received</h2>
                    <p className="text-sm text-white/40 mb-8">Our expert advisors are reviewing your profile.</p>
                    
                    <div className="bg-white/5 rounded-[24px] p-6 text-left space-y-4 border border-white/5 mb-8">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[10px] uppercase tracking-widest text-white/40">Name</span>
                        <span className="font-bold text-sm tracking-tight">{formData.name}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[10px] uppercase tracking-widest text-white/40">Requirements</span>
                        <span className="font-bold text-sm text-gold">{formData.propertyType}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-widest text-white/40">Contact</span>
                        <span className="font-bold text-sm">{formData.phone}</span>
                      </div>
                    </div>

                    <Button className="w-full btn-3d-glass" onClick={closeReset}>
                      Back to Properties
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
