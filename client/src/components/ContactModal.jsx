import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { submitLead } from '../services/api';

export default function ContactModal({ isOpen, onClose, type }) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await submitLead({ name, phone, type }); }
    catch { console.log('Mock lead', { name, phone, type }); }
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setName(''); setPhone(''); onClose(); }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="glass-heavy modal-container"
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.9, y: 20, opacity: 0 }} 
            animate={{ scale: 1, y: 0, opacity: 1 }} 
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={24} />
            </button>

            {success ? (
              <motion.div style={{ textAlign: 'center', padding: '2rem 0' }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                <h3 style={{ color: 'var(--success)' }}>Success!</h3>
                <p className="text-muted" style={{ marginTop: '8px' }}>We've received your request. Our agent will contact you shortly.</p>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                <h2 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                  {type === 'callback' ? 'Request a Callback' : 'View Owner Contact'}
                </h2>
                <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Please enter your details to proceed.</p>
                <form onSubmit={handleSubmit} className="callback-form">
                  <div className="form-field">
                    <label>Full Name</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" />
                  </div>
                  <div className="form-field">
                    <label>WhatsApp / Phone Number</label>
                    <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 9876543210" />
                  </div>
                  <button type="submit" className="btn btn-primary btn-3d btn-3d-emerald" style={{ marginTop: '1rem', width: '100%' }}>
                    {type === 'callback' ? 'Get Callback Now' : 'Reveal Contact Number'}
                  </button>
                </form>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
