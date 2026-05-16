import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, User, Zap, ShieldCheck, MapPin } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const LeadCaptureModal = ({ isOpen, onClose, preferredLocation }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState(preferredLocation || '');
  const [budget, setBudget] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone) return;

    setSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await axios.post(`${API_URL}/leads`, {
        name,
        phone,
        district,
        budget,
        propertyType,
        source: 'High-Intent Modal',
        message: `High-intent visitor looking for a ${propertyType || 'property'} in ${district || 'Andhra'} with a budget of ${budget || 'flexible'}. Priority Lead.`,
        priority: 'High'
      });
      
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        // Prevent showing again in this session
        sessionStorage.setItem('snapadda_lead_captured', 'true');
      }, 3000);
    } catch (error) {
      console.error('Lead capture failed', error);
      toast.error('Verification system busy. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#050a14] p-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background Glow */}
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-emerald-500/10 blur-[80px]" />
          <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-gold-500/10 blur-[80px]" />

          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-white/40 hover:bg-white/5 hover:text-white"
          >
            <X size={20} />
          </button>

          {success ? (
            <div className="flex flex-col items-center py-10 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <ShieldCheck size={40} />
              </div>
              <h2 className="mb-2 text-2xl font-black text-white">Thank You!</h2>
              <p className="text-white/60">Our senior agent will contact you shortly.</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="mb-3 flex items-center gap-2 text-[0.65rem] font-black tracking-[0.2em] text-emerald-400 uppercase">
                  <Zap size={14} fill="currentColor" /> Priority Access
                </div>
                <h2 className="text-2xl font-black leading-tight text-white">
                  Unlock Premium Listings in {district || 'Andhra'}
                </h2>
                <p className="mt-2 text-sm text-white/50">
                  Get direct access to verified owners and exclusive deals before they hit the market.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <label htmlFor="lcm-name" className="sr-only">Full Name</label>
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input
                    id="lcm-name"
                    name="name"
                    autoComplete="name"
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white outline-none focus:border-emerald-500/50 focus:bg-white/[0.08]"
                  />
                </div>

                <div className="relative">
                  <label htmlFor="lcm-phone" className="sr-only">WhatsApp Number</label>
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input
                    id="lcm-phone"
                    name="phone"
                    autoComplete="tel"
                    type="tel"
                    required
                    placeholder="WhatsApp Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white outline-none focus:border-emerald-500/50 focus:bg-white/[0.08]"
                  />
                </div>

                <div className="relative">
                  <label htmlFor="lcm-district" className="sr-only">Preferred District/City</label>
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input
                    id="lcm-district"
                    name="district"
                    type="text"
                    placeholder="Preferred District/City"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white outline-none focus:border-emerald-500/50 focus:bg-white/[0.08]"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="w-full">
                    <label htmlFor="lcm-property-type" className="sr-only">Property Type</label>
                    <select
                      id="lcm-property-type"
                      name="propertyType"
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 px-4 text-white outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] appearance-none"
                      style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                    >
                      <option value="" disabled className="text-gray-500 bg-[#050a14]">Property Type</option>
                      <option value="Apartment" className="bg-[#050a14]">Apartment</option>
                      <option value="Villa" className="bg-[#050a14]">Villa</option>
                      <option value="Plot" className="bg-[#050a14]">Plot</option>
                      <option value="Commercial" className="bg-[#050a14]">Commercial</option>
                    </select>
                  </div>

                  <div className="w-full">
                    <label htmlFor="lcm-budget" className="sr-only">Budget Range</label>
                    <select
                      id="lcm-budget"
                      name="budget"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 px-4 text-white outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] appearance-none"
                      style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                    >
                      <option value="" disabled className="text-gray-500 bg-[#050a14]">Budget Range</option>
                      <option value="Under 50 Lakhs" className="bg-[#050a14]">Under 50 Lakhs</option>
                      <option value="50 Lakhs - 1 Crore" className="bg-[#050a14]">50 Lakhs - 1 Crore</option>
                      <option value="1 Crore - 5 Crores" className="bg-[#050a14]">1 Crore - 5 Crores</option>
                      <option value="5 Crores+" className="bg-[#050a14]">5 Crores+</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="group relative w-full overflow-hidden rounded-2xl bg-emerald-500 py-4 font-black text-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting ? 'Connecting...' : 'GET INSTANT ACCESS'}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-center gap-2 text-[0.6rem] font-bold text-white/30 uppercase tracking-widest">
                <ShieldCheck size={12} /> Data Protected & Encrypted
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LeadCaptureModal;
