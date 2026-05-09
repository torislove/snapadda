import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, MapPin, IndianRupee, Camera, CheckCircle2, 
  ChevronRight, ChevronLeft, Send, Home, Info, 
  ShieldCheck, AlertCircle, Phone, User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { submitProperty } from '../services/api';

const STEPS = [
  { id: 'basics', title: 'Basic Info', icon: <Info size={20} /> },
  { id: 'location', title: 'Location', icon: <MapPin size={20} /> },
  { id: 'media', title: 'Photos & Price', icon: <Camera size={20} /> },
  { id: 'preview', title: 'Review', icon: <CheckCircle2 size={20} /> },
];

export default function PostProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Apartment',
    purpose: 'Buy',
    price: '',
    areaSize: '',
    measurementUnit: 'Sq.Yds',
    location: '',
    city: '',
    district: 'Guntur',
    images: [],
    facing: 'East',
    posterName: user?.name || '',
    posterPhone: user?.phone || '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/post-property' } });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // In a real app, you'd upload to Cloudinary/S3 here
    // For now, we'll use base64 or just mock it
    const newImgs = files.map(f => URL.createObjectURL(f));
    setFormData(prev => ({ ...prev, images: [...prev.images, ...newImgs] }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      // Mock API call - in production this would hit /api/properties/public-submit
      // const res = await submitProperty({ ...formData, submittedBy: user.id, status: 'Pending' });
      
      // Artificial delay for effect
      await new Promise(r => setTimeout(r, 2000));
      setSuccess(true);
    } catch (err) {
      setError('Failed to submit property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container" style={{ paddingTop: '120px', textAlign: 'center' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16,217,140,0.1)', color: '#10d98c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <CheckCircle2 size={40} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>ప్రాపర్టీ సమర్పించబడింది!</h2>
          <p style={{ color: 'var(--txt-secondary)', marginBottom: '2rem' }}>మీ ప్రాపర్టీ సమీక్షలో ఉంది. అడ్మిన్ ఆమోదించిన తర్వాత ఇది వెబ్‌సైట్‌లో కనిపిస్తుంది.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-3d-glass" style={{ width: '100%' }}>Dashboard కి వెళ్ళండి</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Post Your Property</h1>
          <p style={{ color: 'var(--txt-secondary)' }}>మీ ప్రాపర్టీ వివరాలను ఇక్కడ నమోదు చేయండి</p>
        </div>

        {/* Progress Tracker */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '20px', left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.05)', zIndex: 0 }} />
          <div style={{ position: 'absolute', top: '20px', left: 0, width: `${(step / (STEPS.length - 1)) * 100}%`, height: '2px', background: 'var(--gold)', zIndex: 0, transition: 'width 0.4s' }} />
          
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '12px', 
                background: i <= step ? 'var(--gold)' : 'rgba(5,10,20,0.8)', 
                color: i <= step ? 'black' : 'rgba(255,255,255,0.3)',
                border: `1px solid ${i <= step ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: '0.3s'
              }}>
                {i < step ? <CheckCircle2 size={18} /> : s.icon}
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: i <= step ? 'white' : 'rgba(255,255,255,0.3)' }}>{s.title}</span>
            </div>
          ))}
        </div>

        <motion.div 
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel" 
          style={{ padding: '2.5rem' }}
        >
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label className="form-label">Property Title / పేరు</label>
                <input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. 2BHK Luxury Flat in Guntur" className="form-input" />
              </div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Type / రకం</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="form-input">
                    <option>Apartment</option>
                    <option>Independent House</option>
                    <option>Villa</option>
                    <option>Plot</option>
                    <option>Agriculture Land</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Purpose / ఉద్దేశ్యం</label>
                  <select name="purpose" value={formData.purpose} onChange={handleChange} className="form-input">
                    <option>Buy</option>
                    <option>Rent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Description / వివరణ</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Tell us more about the property..." className="form-input" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label className="form-label">City / పట్టణం</label>
                <input name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Vijayawada" className="form-input" />
              </div>
              <div>
                <label className="form-label">Location / ఏరియా</label>
                <input name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Benz Circle" className="form-input" />
              </div>
              <div>
                <label className="form-label">District / జిల్లా</label>
                <select name="district" value={formData.district} onChange={handleChange} className="form-input">
                  <option>Guntur</option>
                  <option>Krishna</option>
                  <option>NTR</option>
                  <option>Palnadu</option>
                  <option>Visakhapatnam</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Price / ధర (₹)</label>
                  <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Total price" className="form-input" />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Area / విస్తీర్ణం</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input name="areaSize" type="number" value={formData.areaSize} onChange={handleChange} placeholder="Size" className="form-input" style={{ flex: 1 }} />
                    <select name="measurementUnit" value={formData.measurementUnit} onChange={handleChange} className="form-input" style={{ width: '100px' }}>
                      <option>Sq.Yds</option>
                      <option>Acres</option>
                      <option>Cents</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="form-label">Photos / ఫోటోలు</label>
                <div style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '20px', padding: '3rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => document.getElementById('imgInput').click()}>
                  <Camera size={40} style={{ color: 'var(--gold)', marginBottom: '1rem', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Click to upload property photos</p>
                  <input id="imgInput" type="file" multiple hidden onChange={handleImageUpload} />
                </div>
                {formData.images.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '1rem', flexWrap: 'wrap' }}>
                    {formData.images.map((img, i) => (
                      <img key={i} src={img} alt="" style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ background: 'rgba(212,175,55,0.05)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(212,175,55,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', color: 'var(--gold)' }}>
                  <ShieldCheck size={20} />
                  <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Verification Notice</span>
                </div>
                <p style={{ fontSize: '0.8rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.7)' }}>
                  మీరు సమర్పించిన ప్రతి ప్రాపర్టీ మా అడ్మిన్ టీమ్ ద్వారా వెరిఫై చేయబడుతుంది. వెరిఫికేషన్ తర్వాత మాత్రమే ఇది పబ్లిక్ లో కనిపిస్తుంది.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="preview-item">
                  <span className="preview-lbl">Title</span>
                  <span className="preview-val">{formData.title || 'Untitled'}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-lbl">Price</span>
                  <span className="preview-val">₹{formData.price || '0'}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-lbl">Location</span>
                  <span className="preview-val">{formData.location}, {formData.city}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-lbl">Type</span>
                  <span className="preview-val">{formData.type}</span>
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label className="form-label">Contact Phone / ఫోన్ నంబర్</label>
                <input name="posterPhone" value={formData.posterPhone} onChange={handleChange} className="form-input" placeholder="Your mobile number" />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', gap: '1.5rem' }}>
            <button onClick={prevStep} disabled={step === 0} className="btn-3d-glass-dark" style={{ flex: 1, padding: '14px', opacity: step === 0 ? 0.3 : 1 }}>
              <ChevronLeft size={20} /> Back
            </button>
            {step === STEPS.length - 1 ? (
              <button onClick={handleSubmit} disabled={loading} className="btn-3d-glass" style={{ flex: 2, padding: '14px', background: 'var(--gold)', color: 'black' }}>
                {loading ? 'Submitting...' : 'Submit Property'} <Send size={18} style={{ marginLeft: '8px' }} />
              </button>
            ) : (
              <button onClick={nextStep} className="btn-3d-glass" style={{ flex: 2, padding: '14px' }}>
                Next Step <ChevronRight size={18} style={{ marginLeft: '8px' }} />
              </button>
            )}
          </div>
        </motion.div>

        {error && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '15px', color: '#ff5050', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}
      </div>

      <style>{`
        .form-label { display: block; font-size: 0.75rem; font-weight: 800; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; }
        .form-input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 12px 16px; color: white; font-size: 0.95rem; outline: none; transition: 0.2s; }
        .form-input:focus { border-color: var(--gold); background: rgba(255,255,255,0.08); }
        .preview-item { display: flex; flexDirection: column; gap: 4px; }
        .preview-lbl { font-size: 0.65rem; color: rgba(255,255,255,0.4); text-transform: uppercase; font-weight: 800; }
        .preview-val { font-size: 0.95rem; color: white; font-weight: 600; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.3); border-radius: 10px; }
      `}</style>
    </div>
  );
}
