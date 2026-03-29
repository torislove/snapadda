import React, { useState } from 'react';
import { Button } from './Button';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitLead } from '../../services/api';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'callback' | 'contact';
}

export const LeadModal: React.FC<LeadModalProps> = ({ isOpen, onClose, type }) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitLead({ name, phone, type });
    } catch (err) {
      console.log("Mock lead submission", { name, phone, type });
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setPhone('');
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(4px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            style={{ backgroundColor: 'var(--bg-secondary)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', maxWidth: '400px', width: '90%', position: 'relative', border: '1px solid var(--accent-gold)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', outline: 'none' }}>
              <X size={24} />
            </button>
            
            {submitted ? (
              <motion.div 
                style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0' }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <h3 style={{ color: 'var(--success)' }}>Success!</h3>
                <p className="text-muted" style={{ marginTop: '8px' }}>We have received your request. Our agent will contact you shortly.</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h2 style={{ marginBottom: 'var(--spacing-xs)', fontFamily: 'var(--font-heading)' }}>
                  {type === 'callback' ? 'Request a Callback' : 'View Owner Contact'}
                </h2>
                <p className="text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>Please enter your details to proceed.</p>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', transition: 'border-color 0.2s' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>WhatsApp / Phone Number</label>
                    <input 
                      type="tel" 
                      required 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', transition: 'border-color 0.2s' }} 
                    />
                  </div>
                  <Button type="submit" variant="primary" style={{ marginTop: 'var(--spacing-md)' }}>
                    {type === 'callback' ? 'Get Callback Now' : 'Reveal Contact Number'}
                  </Button>
                </form>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
