import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, MapPin, IndianRupee, Camera, CheckCircle2, 
  ChevronRight, ChevronLeft, Send, Home, Info, 
  ShieldCheck, AlertCircle, Phone, User, Square, Leaf, Compass,
  Layers, Ruler, Trash2, Plus, Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { submitProperty, uploadMedia } from '../services/api';
import { triggerHaptic } from '../utils/haptics';
import { useTranslation } from 'react-i18next';

export default function PostProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState([]);
  const [success, setSuccess] = useState(false);

  const STEPS = [
    { id: 'basics', title: t('post.basics'), icon: <Building2 size={20} /> },
    { id: 'technicals', title: t('post.technicals'), icon: <Layers size={20} /> },
    { id: 'location', title: t('post.location'), icon: <MapPin size={20} /> },
    { id: 'media', title: t('post.media'), icon: <Camera size={20} /> },
    { id: 'preview', title: t('post.review'), icon: <ShieldCheck size={20} /> },
  ];

  const PROPERTY_TYPES = [
    'Apartment', 'Independent House', 'Villa', 'Gated Community Plot', 'Residential Plot',
    'CRDA Approved Plot', 'Open Plot', 'Layout Plot',
    'Commercial Plot', 'Commercial Space', 'Office Space', 'Showroom',
    'Agricultural Land', 'Farmhouse',
    'Industrial Shed', 'Warehouse', 'Factory'
  ];

  const DISTRICTS = [
    'NTR', 'Krishna', 'Guntur', 'Palnadu', 'Bapatla', 
    'Visakhapatnam', 'Anakapalli', 'Vizianagaram', 'Srikakulam',
    'East Godavari', 'West Godavari', 'Kakinada', 'Konaseema', 'Eluru',
    'Prakasam', 'Nellore', 'Tirupati', 'Chittoor', 'Annamayya', 'Kadapa',
    'Nandyal', 'Kurnool', 'Anantapur', 'Sri Sathya Sai'
  ];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Apartment',
    purpose: 'Sale',
    price: '',
    areaSize: '',
    measurementUnit: 'Sq.Yds',
    location: '',
    city: '',
    district: 'Guntur',
    images: [],
    facing: 'East',
    vastuCompliant: true,
    bhk: '',
    beds: '',
    baths: '',
    constructionStatus: 'Ready to Move',
    listerType: 'Individual Owner',
    posterName: user?.name || '',
    posterPhone: user?.phone || '',
    address: '',
    googleMapsLink: '',
    reraId: '',
    approvalAuthority: 'N/A',
    totalAcres: '',
    pricePerAcre: '',
    surveyNo: '',
    waterSource: 'N/A',
    roadType: 'N/A',
    roadWidth: '',
    carpetArea: '',
    totalFloors: '',
    floorNo: '',
    propertyAge: 'N/A',
    ownershipType: 'Freehold',
    parking: 'Available',
    cornerProperty: false,
    boundaryWall: false,
    imageFiles: [],
  });

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/post-property' } });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    // Clear error for this field
    if (formErrors.includes(name)) {
      setFormErrors(prev => prev.filter(f => f !== name));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 10) {
      setError('Maximum 10 images allowed');
      return;
    }
    const newImgs = files.map(f => URL.createObjectURL(f));
    setFormData(prev => ({ 
      ...prev, 
      images: [...prev.images, ...newImgs],
      imageFiles: [...prev.imageFiles, ...files] 
    }));
    triggerHaptic('light');
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imageFiles: prev.imageFiles.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    setError('');
    const missing = [];
    if (step === 0 && !formData.title) missing.push('title');
    if (step === 2 && !formData.city) missing.push('city');
    if (step === 2 && !formData.location) missing.push('location');
    
    if (missing.length > 0) {
      setFormErrors(missing);
      setError(`Please fill all required fields: ${missing.join(', ')}`);
      triggerHaptic('error');
      return;
    }
    
    triggerHaptic('medium');
    setStep(s => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const prevStep = () => {
    triggerHaptic('light');
    setStep(s => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    const missing = [];
    if (!formData.price) missing.push('price');
    if (!formData.posterPhone) missing.push('posterPhone');

    if (missing.length > 0) {
      setFormErrors(missing);
      setError(`Required: ${missing.join(', ')}`);
      triggerHaptic('error');
      return;
    }

    setLoading(true);
    setError('');
    try {
      let uploadedUrls = [];
      if (formData.imageFiles.length > 0) {
        const uploadResult = await uploadMedia(formData.imageFiles);
        if (uploadResult.status === 'success') {
          uploadedUrls = uploadResult.data;
        }
      }

      const payload = {
        ...formData,
        images: uploadedUrls,
        image: uploadedUrls.length > 0 ? uploadedUrls[0] : '',
        submittedBy: user?._id || user?.id,
        status: 'Pending',
        verificationStatus: 'Draft',
        isVerified: false,
      };

      delete payload.imageFiles;

      const res = await submitProperty(payload);
      
      if (res.status === 'success') {
        triggerHaptic('success');
        setSuccess(true);
      } else {
        throw new Error(res.message || 'Submission failed');
      }
    } catch (err) {
      console.error('SUBMIT_ERROR:', err);
      setError(err.message || 'Failed to submit property.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container" style={{ paddingTop: '120px', textAlign: 'center', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel" style={{ maxWidth: '500px', padding: '4rem 2rem', borderRadius: '40px', border: '1px solid var(--gold-royal-dim)' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(16,217,140,0.1)', color: '#10d98c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem', border: '1px solid rgba(16,217,140,0.3)' }}>
            <CheckCircle2 size={48} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 950, marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>{t('post.success')}</h2>
          <p style={{ color: 'var(--txt-muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            {t('post.successSub')}
          </p>
          <button onClick={() => navigate('/dashboard')} className="hero-btn hero-btn-primary" style={{ width: '100%', padding: '1.2rem' }}>
            {t('dashboard.overview')} <ChevronRight size={18} />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '120px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '3.5rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(232,184,75,0.08)', borderRadius: '30px', border: '1px solid rgba(232,184,75,0.2)', marginBottom: '1.5rem' }}>
            <Sparkles size={14} style={{ color: 'var(--gold)' }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--gold)' }}>INSTITUTIONAL REGISTRY</span>
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 950, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>{t('post.title')}</h1>
          <p style={{ color: 'var(--txt-muted)', fontSize: '1.1rem' }}>{t('post.subtitle')}</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4rem', position: 'relative', padding: '0 1rem' }}>
          <div style={{ position: 'absolute', top: '24px', left: '1rem', right: '1rem', height: '1px', background: 'rgba(255,255,255,0.08)', zIndex: 0 }} />
          <div style={{ position: 'absolute', top: '24px', left: '1rem', width: `calc(${(step / (STEPS.length - 1)) * 100}% - 2rem)`, height: '1px', background: 'var(--gold)', zIndex: 0, transition: 'width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
          
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <motion.div 
                animate={{ 
                  scale: i === step ? 1.15 : 1,
                  background: i <= step ? 'var(--gold)' : 'rgba(10,15,30,0.8)',
                  borderColor: i <= step ? 'var(--gold)' : 'rgba(255,255,255,0.1)'
                }}
                style={{ 
                  width: '48px', height: '48px', borderRadius: '16px', 
                  color: i <= step ? 'black' : 'rgba(255,255,255,0.3)',
                  border: '1px solid',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: i === step ? '0 0 25px rgba(232,184,75,0.2)' : 'none'
                }}
                onClick={() => i < step && setStep(i)}
              >
                {i < step ? <CheckCircle2 size={22} /> : s.icon}
              </motion.div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: i <= step ? 'white' : 'rgba(255,255,255,0.3)' }}>{s.title}</span>
            </div>
          ))}
        </div>

        <motion.div 
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel" 
          style={{ padding: '3rem', borderRadius: '32px', background: 'rgba(5,10,20,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className={`field-group ${formErrors.includes('title') ? 'error' : ''}`}>
                  <label className="elite-lbl">
                    {t('post.propTitle')} <span className="required-asterisk">*</span>
                  </label>
                  <input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. 3BHK Ultra Luxury Villa" className="elite-input" />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div className="field-group">
                    <label className="elite-lbl">{t('post.assetType')}</label>
                    <div style={{ position: 'relative' }}>
                      <select name="type" value={formData.type} onChange={handleChange} className="elite-input" style={{ appearance: 'none' }}>
                        {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                      <Building2 size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                    </div>
                  </div>
                  <div className="field-group">
                    <label className="elite-lbl">{t('post.transaction')}</label>
                    <select name="purpose" value={formData.purpose} onChange={handleChange} className="elite-input">
                      <option value="Sale">{t('post.sell')}</option>
                      <option value="Rent">{t('post.giveRent')}</option>
                    </select>
                  </div>
                </div>

                <div className="field-group">
                  <label className="elite-lbl">{t('post.desc')}</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={5} placeholder="Describe the premium features..." className="elite-input" style={{ resize: 'none' }} />
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div className="field-group">
                    <label className="elite-lbl">{t('post.size')}</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input name="areaSize" type="number" value={formData.areaSize} onChange={handleChange} placeholder="Value" className="elite-input" style={{ flex: 1 }} />
                      <select name="measurementUnit" value={formData.measurementUnit} onChange={handleChange} className="elite-input" style={{ width: '130px' }}>
                        <option>Sq.Yds</option>
                        <option>Acres</option>
                        <option>Cents</option>
                        <option>SqFt</option>
                        <option>Guntas</option>
                      </select>
                    </div>
                  </div>
                  <div className="field-group">
                    <label className="elite-lbl">{t('post.facing')}</label>
                    <select name="facing" value={formData.facing} onChange={handleChange} className="elite-input">
                      <option>East</option>
                      <option>West</option>
                      <option>North</option>
                      <option>South</option>
                      <option>North-East</option>
                      <option>South-East</option>
                      <option>North-West</option>
                      <option>South-West</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                  <div className="field-group">
                    <label className="elite-lbl">{t('post.bhk')}</label>
                    <input name="bhk" type="number" value={formData.bhk} onChange={handleChange} placeholder="e.g. 3" className="elite-input" />
                  </div>
                  <div className="field-group">
                    <label className="elite-lbl">{t('post.baths')}</label>
                    <input name="baths" type="number" value={formData.baths} onChange={handleChange} placeholder="e.g. 2" className="elite-input" />
                  </div>
                  <div className="field-group">
                    <label className="elite-lbl">{t('post.vastu')}</label>
                    <div style={{ height: '54px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '0 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <input type="checkbox" name="vastuCompliant" checked={formData.vastuCompliant} onChange={handleChange} style={{ width: '20px', height: '20px', accentColor: 'var(--gold)' }} />
                      <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Vastu Verified</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div className="field-group">
                    <label className="elite-lbl">{t('post.age')}</label>
                    <select name="propertyAge" value={formData.propertyAge} onChange={handleChange} className="elite-input">
                      <option value="N/A">N/A</option>
                      <option value="0-1 yrs">New / 0-1 Years</option>
                      <option value="1-5 yrs">1-5 Years</option>
                      <option value="5-10 yrs">5-10 Years</option>
                      <option value="10+ yrs">10+ Years</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="elite-lbl">{t('post.status')}</label>
                    <select name="constructionStatus" value={formData.constructionStatus} onChange={handleChange} className="elite-input">
                      <option>Ready to Move</option>
                      <option>Under Construction</option>
                      <option>New Launch</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div className="field-group">
                    <label className="elite-lbl">{t('post.ownership')}</label>
                    <select name="ownershipType" value={formData.ownershipType} onChange={handleChange} className="elite-input">
                      <option value="Freehold">Freehold</option>
                      <option value="Leasehold">Leasehold</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="elite-lbl">{t('post.parking')}</label>
                    <select name="parking" value={formData.parking} onChange={handleChange} className="elite-input">
                      <option value="Available">Available</option>
                      <option value="None">None</option>
                      <option value="Reserved">Reserved</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'white', fontSize: '0.85rem' }}>
                    <input name="cornerProperty" type="checkbox" checked={formData.cornerProperty} onChange={handleChange} style={{ width: '18px', height: '18px', accentColor: 'var(--gold)' }} />
                    {t('post.corner')}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'white', fontSize: '0.85rem' }}>
                    <input name="boundaryWall" type="checkbox" checked={formData.boundaryWall} onChange={handleChange} style={{ width: '18px', height: '18px', accentColor: 'var(--gold)' }} />
                    {t('post.boundary')}
                  </label>
                </div>

                {formData.type === 'Agricultural Land' && (
                  <div style={{ padding: '2rem', background: 'rgba(16,217,140,0.05)', borderRadius: '24px', border: '1px solid rgba(16,217,140,0.15)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.8rem', color: '#10d98c', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Agricultural Specifics</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div className="field-group">
                        <label className="elite-lbl">{t('post.surveyNo')}</label>
                        <input name="surveyNo" value={formData.surveyNo} onChange={handleChange} placeholder="e.g. 123/A" className="elite-input" />
                      </div>
                      <div className="field-group">
                        <label className="elite-lbl">{t('post.water')}</label>
                        <select name="waterSource" value={formData.waterSource} onChange={handleChange} className="elite-input">
                          <option value="N/A">N/A</option>
                          <option value="Borewell">Borewell</option>
                          <option value="Canal">Canal</option>
                          <option value="Both">Both</option>
                        </select>
                      </div>
                      <div className="field-group">
                        <label className="elite-lbl">{t('post.roadType')}</label>
                        <select name="roadType" value={formData.roadType} onChange={handleChange} className="elite-input">
                          <option value="N/A">N/A</option>
                          <option value="NH">National Highway</option>
                          <option value="SH">State Highway</option>
                          <option value="CC Road">CC Road</option>
                          <option value="Mud Road">Mud Road</option>
                        </select>
                      </div>
                      <div className="field-group">
                        <label className="elite-lbl">{t('post.roadWidth')}</label>
                        <input name="roadWidth" type="number" value={formData.roadWidth} onChange={handleChange} placeholder="e.g. 30" className="elite-input" />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div className="field-group">
                        <label className="elite-lbl">{t('post.totalAcres')}</label>
                        <input name="totalAcres" type="number" step="0.01" value={formData.totalAcres} onChange={handleChange} placeholder="e.g. 6.5" className="elite-input" />
                      </div>
                      <div className="field-group">
                        <label className="elite-lbl">{t('post.pricePerAcre')}</label>
                        <input name="pricePerAcre" type="number" value={formData.pricePerAcre} onChange={handleChange} placeholder="e.g. 5000000" className="elite-input" />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="field-group">
                  <label className="elite-lbl">{t('post.district')}</label>
                  <select name="district" value={formData.district} onChange={handleChange} className="elite-input">
                    {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div className={`field-group ${formErrors.includes('city') ? 'error' : ''}`}>
                    <label className="elite-lbl">{t('post.city')} <span className="required-asterisk">*</span></label>
                    <input name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Vijayawada" className="elite-input" />
                  </div>
                  <div className={`field-group ${formErrors.includes('location') ? 'error' : ''}`}>
                    <label className="elite-lbl">{t('post.area')} <span className="required-asterisk">*</span></label>
                    <input name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Benz Circle" className="elite-input" />
                  </div>
                </div>
                <div className="field-group">
                  <label className="elite-lbl">{t('post.address')}</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Detailed address for admin review..." className="elite-input" rows={2} style={{ resize: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div className="field-group">
                    <label className="elite-lbl">{t('post.approval')}</label>
                    <select name="approvalAuthority" value={formData.approvalAuthority} onChange={handleChange} className="elite-input">
                      <option value="N/A">N/A / Others</option>
                      <option value="CRDA">CRDA</option>
                      <option value="DTCP">DTCP</option>
                      <option value="VMRDA">VMRDA</option>
                      <option value="Gram Panchayat">Gram Panchayat</option>
                      <option value="Revenue">Revenue Layout</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="elite-lbl">{t('post.rera')}</label>
                    <input name="reraId" value={formData.reraId} onChange={handleChange} placeholder="P0..." className="elite-input" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className={`field-group ${formErrors.includes('price') ? 'error' : ''}`}>
                  <label className="elite-lbl">{t('post.price')} <span className="required-asterisk">*</span></label>
                  <div style={{ position: 'relative' }}>
                    <IndianRupee size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)' }} />
                    <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="e.g. 8500000" className="elite-input" style={{ paddingLeft: '44px' }} />
                  </div>
                </div>

                <div className="field-group">
                  <label className="elite-lbl">{t('post.photos')}</label>
                  <div 
                    className="upload-dropzone"
                    onClick={() => document.getElementById('imgInput').click()}
                    style={{ 
                      border: '2px dashed rgba(232,184,75,0.2)', 
                      borderRadius: '24px', 
                      padding: '4rem 2rem', 
                      textAlign: 'center', 
                      cursor: 'pointer',
                      background: 'rgba(232,184,75,0.02)',
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(232,184,75,0.1)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                      <Camera size={32} />
                    </div>
                    <h4 style={{ color: 'white', marginBottom: '8px' }}>{t('post.upload')}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>{t('post.uploadSub')}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 800 }}>{t('post.photoHint')}</p>
                    <input id="imgInput" type="file" multiple hidden onChange={handleImageUpload} accept="image/*" />
                  </div>

                  {formData.images.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px', marginTop: '1.5rem' }}>
                      {formData.images.map((img, i) => (
                        <div key={i} style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', height: '100px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                            style={{ position: 'absolute', top: '4px', right: '4px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(245,57,123,0.8)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <div style={{ background: 'linear-gradient(135deg, rgba(232,184,75,0.08) 0%, rgba(16,217,140,0.05) 100%)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(232,184,75,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem', color: 'var(--gold)' }}>
                    <ShieldCheck size={24} />
                    <span style={{ fontWeight: 950, fontSize: '1.1rem', letterSpacing: '0.05em' }}>{t('post.validation')}</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.7', color: 'rgba(255,255,255,0.8)' }}>
                    {t('post.audit')}
                  </p>
                </div>

                <div className={`field-group ${formErrors.includes('posterPhone') ? 'error' : ''}`}>
                  <label className="elite-lbl">{t('post.contact')} <span className="required-asterisk">*</span></label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)' }} />
                    <input name="posterPhone" value={formData.posterPhone} onChange={handleChange} className="elite-input" style={{ paddingLeft: '44px' }} placeholder="Mobile number" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4rem', gap: '1.5rem' }}>
            <button onClick={prevStep} disabled={step === 0} className="hero-btn hero-btn-outline" style={{ flex: 1, padding: '1.1rem', opacity: step === 0 ? 0.2 : 1 }}>
              <ChevronLeft size={18} /> BACK
            </button>
            {step === STEPS.length - 1 ? (
              <button onClick={handleSubmit} disabled={loading} className="hero-btn hero-btn-primary" style={{ flex: 2, padding: '1.1rem' }}>
                {loading ? 'SYNCING...' : t('post.submit')} <Send size={18} style={{ marginLeft: '8px' }} />
              </button>
            ) : (
              <button onClick={nextStep} className="hero-btn hero-btn-primary" style={{ flex: 2, padding: '1.1rem' }}>
                PROCEED <ChevronRight size={18} style={{ marginLeft: '8px' }} />
              </button>
            )}
          </div>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ marginTop: '2rem', padding: '1.25rem', background: 'rgba(245,57,123,0.1)', border: '1px solid rgba(245,57,123,0.25)', borderRadius: '20px', color: '#f5397b', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', fontWeight: 700 }}>
            <AlertCircle size={20} /> {error}
          </motion.div>
        )}
      </div>

      <style>{`
        .elite-lbl { display: block; font-size: 0.72rem; font-weight: 900; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.85rem; }
        .elite-input { 
          width: 100%; background: rgba(255,255,255,0.03); 
          border: 1px solid rgba(255,255,255,0.08); 
          border-radius: 16px; padding: 14px 18px; 
          color: white; font-size: 1rem; outline: none; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
        }
        .elite-input:focus { border-color: var(--gold); background: rgba(232,184,75,0.03); }
        .upload-dropzone:hover { border-color: var(--gold) !important; background: rgba(232,184,75,0.05) !important; transform: translateY(-2px); }
      `}</style>
    </div>
  );
}
