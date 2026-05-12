import { useState, useEffect, memo, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, MapPin, IndianRupee, Camera, CheckCircle2, 
  ChevronRight, ChevronLeft, Send, Home, Info, 
  ShieldCheck, AlertCircle, Phone, User, Square, Leaf, Compass,
  Layers, Ruler, Trash2, Plus, Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { submitProperty, uploadMedia } from '../services/api';
import { useTranslation } from 'react-i18next';
import LocationAutocomplete from '../components/LocationAutocomplete';
import { fetchSetting } from '../services/api';
import { MessageSquare } from 'lucide-react';

// --- Sub-components for Form Steps (Memoized for Snappiness) ---

const StepBasics = memo(({ formData, handleChange, formErrors, t, PROPERTY_TYPES }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    <div className={`field-group ${formErrors.includes('title') ? 'error' : ''}`}>
      <label htmlFor="pp-title" className="elite-lbl">
        {t('post.propTitle')} <span className="required-asterisk">*</span>
      </label>
      <input id="pp-title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. 3BHK Ultra Luxury Villa" className="elite-input" />
    </div>
    
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div className="field-group">
        <label htmlFor="pp-type" className="elite-lbl">{t('post.assetType')}</label>
        <div style={{ position: 'relative' }}>
          <select id="pp-type" name="type" value={formData.type} onChange={handleChange} className="elite-input" style={{ appearance: 'none' }}>
            {PROPERTY_TYPES.map(pt => <option key={pt}>{pt}</option>)}
          </select>
          <Building size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
        </div>
      </div>
      <div className="field-group">
        <label htmlFor="pp-subType" className="elite-lbl">Sub-Category / Structure</label>
        <input id="pp-subType" name="subType" value={formData.subType} onChange={handleChange} placeholder="e.g. Gated Community, Penthouse" className="elite-input" />
      </div>
    </div>

    <div className="field-group">
      <label htmlFor="pp-purpose" className="elite-lbl">{t('post.transaction')}</label>
      <select id="pp-purpose" name="purpose" value={formData.purpose} onChange={handleChange} className="elite-input">
        <option value="Sale">{t('post.sell')}</option>
        <option value="Rent">{t('post.giveRent')}</option>
      </select>
    </div>

    <div className="field-group">
      <label htmlFor="pp-description" className="elite-lbl">{t('post.desc')}</label>
      <textarea id="pp-description" name="description" value={formData.description} onChange={handleChange} rows={5} placeholder="Describe the premium features..." className="elite-input" style={{ resize: 'none' }} />
    </div>
  </motion.div>
));

const StepTechnicals = memo(({ formData, handleChange, setFormData, t }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div className="field-group">
        <label htmlFor="pp-areaSize" className="elite-lbl">{t('post.size')}</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input id="pp-areaSize" name="areaSize" type="number" value={formData.areaSize} onChange={handleChange} placeholder="Value" className="elite-input" style={{ flex: 1 }} />
          <label htmlFor="pp-measurementUnit" className="sr-only">Measurement Unit</label>
          <select id="pp-measurementUnit" name="measurementUnit" value={formData.measurementUnit} onChange={handleChange} className="elite-input" style={{ width: '130px' }}>
            <option>Sq.Yds</option>
            <option>Acres</option>
            <option>Cents</option>
            <option>SqFt</option>
            <option>Guntas</option>
          </select>
        </div>
      </div>
      <div className="field-group">
        <label htmlFor="pp-facing" className="elite-lbl">{t('post.facing')}</label>
        <select id="pp-facing" name="facing" value={formData.facing} onChange={handleChange} className="elite-input">
          <option>East</option><option>West</option><option>North</option><option>South</option>
          <option>North-East</option><option>South-East</option><option>North-West</option><option>South-West</option>
        </select>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
      <div className="field-group">
        <label htmlFor="pp-bhk" className="elite-lbl">{t('post.bhk')}</label>
        <input id="pp-bhk" name="bhk" type="number" value={formData.bhk} onChange={handleChange} placeholder="e.g. 3" className="elite-input" />
      </div>
      <div className="field-group">
        <label htmlFor="pp-baths" className="elite-lbl">{t('post.baths')}</label>
        <input id="pp-baths" name="baths" type="number" value={formData.baths} onChange={handleChange} placeholder="e.g. 2" className="elite-input" />
      </div>
      <div className="field-group">
        <label className="elite-lbl">{t('post.vastu')}</label>
        <div style={{ height: '54px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '0 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <input id="pp-vastuCompliant" type="checkbox" name="vastuCompliant" checked={formData.vastuCompliant} onChange={handleChange} style={{ width: '20px', height: '20px', accentColor: 'var(--gold)' }} />
          <label htmlFor="pp-vastuCompliant" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>Vastu Verified</label>
        </div>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div className="field-group">
        <label htmlFor="pp-propertyAge" className="elite-lbl">{t('post.age')}</label>
        <select id="pp-propertyAge" name="propertyAge" value={formData.propertyAge} onChange={handleChange} className="elite-input">
          <option value="N/A">N/A</option>
          <option value="0-1 yrs">New / 0-1 Years</option>
          <option value="1-5 yrs">1-5 Years</option>
          <option value="5-10 yrs">5-10 Years</option>
          <option value="10+ yrs">10+ Years</option>
        </select>
      </div>
      <div className="field-group">
        <label htmlFor="pp-constructionStatus" className="elite-lbl">{t('post.status')}</label>
        <select id="pp-constructionStatus" name="constructionStatus" value={formData.constructionStatus} onChange={handleChange} className="elite-input">
          <option>Ready to Move</option>
          <option>Under Construction</option>
          <option>New Launch</option>
        </select>
      </div>
    </div>

    <div className="field-group">
      <label className="elite-lbl">Amenities</label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        {['Lift', 'Security', 'Swimming Pool', 'Gym', 'Club House', 'Power Backup', 'Water Supply', 'Play Area', 'Park', 'Gated Community'].map(amn => (
          <label key={amn} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
            <input 
              type="checkbox" 
              checked={formData.amenities?.includes(amn)} 
              onChange={(e) => {
                const newAmn = e.target.checked 
                  ? [...(formData.amenities || []), amn]
                  : (formData.amenities || []).filter(a => a !== amn);
                setFormData(prev => ({ ...prev, amenities: newAmn }));
              }}
              style={{ width: '16px', height: '16px', accentColor: 'var(--gold)' }} 
            />
            {amn}
          </label>
        ))}
      </div>
    </div>
  </motion.div>
));

const StepLocation = memo(({ formData, handleChange, setFormData, formErrors, t, DISTRICTS }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    <div className="field-group">
      <label htmlFor="pp-district" className="elite-lbl">{t('post.district')}</label>
      <select id="pp-district" name="district" value={formData.district} onChange={handleChange} className="elite-input">
        {DISTRICTS.map(d => <option key={d}>{d}</option>)}
      </select>
    </div>
    
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <div className="field-group">
        <label htmlFor="pp-pincode" className="elite-lbl">Pincode <span className="required-asterisk">*</span></label>
        <input id="pp-pincode" name="pincode" value={formData.pincode || ''} onChange={handleChange} placeholder="6-digit code" className="elite-input" maxLength={6} />
      </div>
      <div className="field-group">
        <label htmlFor="pp-mandal" className="elite-lbl">Mandal / Tahsil</label>
        <input id="pp-mandal" name="mandal" value={formData.mandal || ''} onChange={handleChange} placeholder="e.g. Mangalagiri" className="elite-input" />
      </div>
    </div>

    <div className="field-group">
      <label htmlFor="pp-village" className="elite-lbl">Village / Locality</label>
      <input id="pp-village" name="village" value={formData.village || ''} onChange={handleChange} placeholder="e.g. Navuluru" className="elite-input" />
    </div>

    <div className="field-group">
      <label className="elite-lbl">Intelligent Location Search <span className="required-asterisk">*</span></label>
      <LocationAutocomplete 
        value={formData.city || ''} 
        onChange={(val) => setFormData(prev => ({ ...prev, city: val }))}
        onSelect={(loc) => {
          setFormData(prev => ({ 
            ...prev, 
            city: loc.name, 
            district: loc.district || prev.district,
            location: loc.name,
            mandal: loc.mandal || prev.mandal,
            pincode: loc.pincode || prev.pincode,
            village: loc.village || prev.village,
            state: loc.state || 'Andhra Pradesh'
          }));
          
        }}
        placeholder="Type Mandal, City or Village (e.g. Tenali, Benz Circle...)"
      />
      <p style={{ fontSize: '0.65rem', color: 'rgba(232,184,75,0.4)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Sparkles size={10} /> Smart auto-fill active for Andhra Pradesh
      </p>
    </div>

    <div className="field-group">
      <label htmlFor="pp-location" className="elite-lbl">{t('post.area')} / Landmark</label>
      <input id="pp-location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Near Bus Stand" className="elite-input" />
    </div>


    <div className="field-group">
      <label htmlFor="pp-googleMapsLink" className="elite-lbl">Google Maps Link</label>
      <input id="pp-googleMapsLink" name="googleMapsLink" value={formData.googleMapsLink} onChange={handleChange} placeholder="https://goo.gl/maps/..." className="elite-input" />
    </div>
    <div className="field-group">
      <label htmlFor="pp-address" className="elite-lbl">{t('post.address')}</label>
      <textarea id="pp-address" name="address" value={formData.address} onChange={handleChange} placeholder="Detailed address for admin review..." className="elite-input" rows={2} style={{ resize: 'none' }} />
    </div>
  </motion.div>
));

const StepMedia = memo(({ formData, handleImageUpload, removeImage, t, formErrors, handleChange }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    <div className={`field-group ${formErrors.includes('price') ? 'error' : ''}`}>
      <label htmlFor="pp-price" className="elite-lbl">{t('post.price')} <span className="required-asterisk">*</span></label>
      <div style={{ position: 'relative' }}>
        <IndianRupee size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)' }} />
        <input id="pp-price" name="price" type="number" value={formData.price} onChange={handleChange} placeholder="e.g. 8500000" className="elite-input" style={{ paddingLeft: '44px' }} />
      </div>
    </div>

    <div className="field-group">
      <label className="elite-lbl">{t('post.photos')}</label>
      <div 
        className="upload-dropzone"
        onClick={() => document.getElementById('imgInput').click()}
        style={{ 
          border: '2px dashed rgba(232,184,75,0.2)', 
          borderRadius: '24px', padding: '4rem 2rem', 
          textAlign: 'center', cursor: 'pointer',
          background: 'rgba(232,184,75,0.02)', transition: 'all 0.3s'
        }}
      >
        <Camera size={32} style={{ margin: '0 auto 1.5rem', color: 'var(--gold)' }} />
        <h4 style={{ color: 'white', marginBottom: '8px' }}>{t('post.upload')}</h4>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{t('post.uploadSub')}</p>
        <input id="imgInput" type="file" multiple hidden onChange={handleImageUpload} accept="image/*" />
      </div>

      {formData.images.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px', marginTop: '1.5rem' }}>
          {formData.images.map((img, i) => (
            <div key={i} style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', height: '100px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button 
                onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                style={{ position: 'absolute', top: '4px', right: '4px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(245,57,123,0.8)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  </motion.div>
));

// --- Main Page Component ---

export default function PostProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState([]);
  const [success, setSuccess] = useState(false);
  const [supportInfo, setSupportInfo] = useState({ phone: '+919346793364', whatsapp: '919346793364' });

  useEffect(() => {
    fetchSetting('support_info').then(d => d && setSupportInfo(d));
  }, []);

  const STEPS = [
    { id: 'basics', title: t('post.basics'), icon: <Building size={20} /> },
    { id: 'technicals', title: t('post.technicals'), icon: <Layers size={20} /> },
    { id: 'location', title: t('post.location'), icon: <MapPin size={20} /> },
    { id: 'media', title: t('post.media'), icon: <Camera size={20} /> },
    { id: 'preview', title: t('post.review'), icon: <ShieldCheck size={20} /> },
  ];

  const PROPERTY_TYPES = [
    'Apartment', 'Independent House', 'Villa', 'Gated Community Plot', 'Residential Plot',
    'CRDA Approved Plot', 'Open Plot', 'Layout Plot',
    'Commercial Plot', 'Commercial Space', 'Office Space', 'Showroom',
    'Agricultural Land', 'Farmhouse', 'Industrial Shed', 'Warehouse', 'Factory'
  ];

  const DISTRICTS = [
    'NTR', 'Krishna', 'Guntur', 'Palnadu', 'Bapatla', 
    'Visakhapatnam', 'Anakapalli', 'Vizianagaram', 'Srikakulam',
    'East Godavari', 'West Godavari', 'Kakinada', 'Konaseema', 'Eluru',
    'Prakasam', 'Nellore', 'Tirupati', 'Chittoor', 'Annamayya', 'Kadapa',
    'Nandyal', 'Kurnool', 'Anantapur', 'Sri Sathya Sai'
  ];

  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem('postPropertyData');
    if (saved) {
      try { return { ...JSON.parse(saved), imageFiles: [], images: [] }; } catch (e) {}
    }
    return {
      title: '', description: '', type: 'Apartment', purpose: 'Sale', subType: '',
      price: '', areaSize: '', measurementUnit: 'Sq.Yds', location: '', city: '',
      district: 'Guntur', mandal: '', village: '', pincode: '', state: 'Andhra Pradesh', 
      images: [], facing: 'East', furnishing: 'N/A',

      vastuCompliant: true, bhk: '', beds: '', baths: '', amenities: [],
      constructionStatus: 'Ready to Move', listerType: 'Individual Owner',
      posterName: user?.name || '', posterPhone: user?.phone || '',
      address: '', googleMapsLink: '', reraId: '', approvalAuthority: 'N/A',
      totalAcres: '', pricePerAcre: '', surveyNo: '', waterSource: 'N/A',
      roadType: 'N/A', roadWidth: '', carpetArea: '', totalFloors: '',
      floorNo: '', propertyAge: 'N/A', ownershipType: 'Freehold',
      parking: 'Available', cornerProperty: false, boundaryWall: false,
      imageFiles: [],
    };
  });

  useEffect(() => {
    const toSave = { ...formData };
    delete toSave.imageFiles; delete toSave.images;
    sessionStorage.setItem('postPropertyData', JSON.stringify(toSave));
  }, [formData]);

  useEffect(() => {
    return () => formData.images.forEach(url => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => {
    if (!user) navigate('/login', { state: { from: '/post-property' } });
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (formErrors.includes(name)) setFormErrors(prev => prev.filter(f => f !== name));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 10) {
      toast('Maximum 10 images allowed', 'error'); return;
    }
    const newImgs = files.map(f => URL.createObjectURL(f));
    setFormData(prev => ({ 
      ...prev, 
      images: [...prev.images, ...newImgs],
      imageFiles: [...prev.imageFiles, ...files] 
    }));
    
  };

  const removeImage = (index) => {
    if (formData.images[index]) URL.revokeObjectURL(formData.images[index]);
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imageFiles: prev.imageFiles.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    const missing = [];
    if (step === 0 && !formData.title) missing.push('title');
    if (step === 2 && !formData.city) missing.push('city');
    if (step === 2 && !formData.location) missing.push('location');
    if (step === 3 && !formData.price) missing.push('price');
    
    if (missing.length > 0) {
      setFormErrors(missing);
      toast(`Required: ${missing.join(', ')}`, 'error');
      return;
    }
    
    const nextS = Math.min(step + 1, STEPS.length - 1);
    setIsTransitioning(true);
    setTimeout(() => {
      startTransition(() => {
        setStep(nextS);
        setIsTransitioning(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }, 150);
  };
  
  const prevStep = () => {
    const prevS = Math.max(step - 1, 0);
    setIsTransitioning(true);
    setTimeout(() => {
      startTransition(() => {
        setStep(prevS);
        setIsTransitioning(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }, 150);
  };

  const handleSubmit = async () => {
    if (!formData.price || !formData.posterPhone) {
      toast('Required: Price & Contact', 'error'); return;
    }
    setLoading(true);
    try {
      let uploadedUrls = [];
      if (formData.imageFiles.length > 0) {
        const uploadResult = await uploadMedia(formData.imageFiles);
        if (uploadResult.status === 'success') uploadedUrls = uploadResult.data;
        else throw new Error('Upload failed');
      }

      const payload = {
        ...formData, images: uploadedUrls, image: uploadedUrls[0] || '',
        submittedBy: user?._id || user?.id, status: 'Pending', isVerified: false,
      };
      delete payload.imageFiles;

      const res = await submitProperty(payload);
      if (res.status === 'success') {
         setSuccess(true);
         const pCode = res.data?.propertyCode || 'SNA-PENDING';
         toast(`Listing sent for audit. Ref: ${pCode}`, 'success');
      } else throw new Error(res.message);
    } catch (err) {
      toast(err.message || 'Submission failed.', 'error');
    } finally { setLoading(false); }
  };

  if (success) {
    sessionStorage.removeItem('postPropertyData');
    return (
      <div className="container" style={{ paddingTop: '120px', textAlign: 'center', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel" style={{ maxWidth: '500px', padding: '4rem 2rem', borderRadius: '40px' }}>
          <CheckCircle2 size={48} style={{ color: '#10d98c', margin: '0 auto 2.5rem' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 950, marginBottom: '1rem' }}>Success!</h2>
          <p style={{ color: 'var(--txt-muted)', marginBottom: '2.5rem' }}>Listing sent for audit.</p>
          <button onClick={() => navigate('/dashboard')} className="hero-btn hero-btn-primary" style={{ width: '100%', padding: '1.2rem' }}>DASHBOARD</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '120px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '3.5rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 950, marginBottom: '0.5rem' }}>{t('post.title')}</h1>
          <p style={{ color: 'var(--txt-muted)' }}>{t('post.subtitle')}</p>
        </div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '24px', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          {STEPS.map((s, i) => (
            <div key={s.id} onClick={() => i < step && setStep(i)} style={{ position: 'relative', zIndex: 1, cursor: i < step ? 'pointer' : 'default' }}>
              <motion.div animate={{ background: i <= step ? 'var(--gold)' : 'rgba(10,15,30,0.8)', scale: i === step ? 1.15 : 1 }}
                style={{ width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: i <= step ? 'black' : 'white' }}>
                {i < step ? <CheckCircle2 size={20} /> : s.icon}
              </motion.div>
            </div>
          ))}
        </div>

        <motion.div className="glass-panel" style={{ padding: '3rem', borderRadius: '32px', background: 'rgba(5,10,20,0.6)', minHeight: '400px', position: 'relative' }}>
          <AnimatePresence mode="wait">
            {!isTransitioning && (
              <div key={step}>
                {step === 0 && <StepBasics formData={formData} handleChange={handleChange} formErrors={formErrors} t={t} PROPERTY_TYPES={PROPERTY_TYPES} />}
                {step === 1 && <StepTechnicals formData={formData} handleChange={handleChange} setFormData={setFormData} t={t} />}
                {step === 2 && <StepLocation formData={formData} handleChange={handleChange} setFormData={setFormData} formErrors={formErrors} t={t} DISTRICTS={DISTRICTS} />}
                {step === 3 && <StepMedia formData={formData} handleImageUpload={handleImageUpload} removeImage={removeImage} t={t} formErrors={formErrors} handleChange={handleChange} />}
                {step === 4 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    <div style={{ background: 'rgba(232,184,75,0.08)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(232,184,75,0.2)' }}>
                      <p>{t('post.audit')}</p>
                    </div>
                    <div className="field-group">
                      <label htmlFor="pp-posterPhone" className="elite-lbl">Mobile Contact</label>
                      <input id="pp-posterPhone" name="posterPhone" value={formData.posterPhone} onChange={handleChange} className="elite-input" placeholder="Enter number" />
                    </div>
                  </motion.div>
                )}
              </div>
            )}
            {isTransitioning && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={32} className="pulse-primary" style={{ color: 'var(--gold)' }} />
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4rem', gap: '1.5rem' }}>
            <button onClick={prevStep} disabled={step === 0} className="hero-btn hero-btn-outline" style={{ flex: 1, opacity: step === 0 ? 0.2 : 1 }}>BACK</button>
            {step === STEPS.length - 1 ? (
              <button onClick={handleSubmit} disabled={loading} className="hero-btn hero-btn-primary" style={{ flex: 2 }}>{loading ? 'SYNCING...' : 'FINISH'}</button>
            ) : (
              <button onClick={nextStep} className="hero-btn hero-btn-primary" style={{ flex: 2 }}>PROCEED</button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>NEED HELP?</p>
            <a href={`tel:${supportInfo.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 800 }}>
              <Phone size={14} /> CALL SUPPORT
            </a>
            <a href={`https://wa.me/${supportInfo.whatsapp}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10d98c', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 800 }}>
              <MessageSquare size={14} /> WHATSAPP
            </a>
          </div>
        </motion.div>

        {error && <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'rgba(245,57,123,0.1)', color: '#f5397b', borderRadius: '20px' }}>{error}</div>}
      </div>

      <style>{`
        .elite-lbl { display: block; font-size: 0.72rem; font-weight: 900; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.85rem; }
        .elite-input { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 14px 18px; color: white; font-size: 1rem; outline: none; transition: all 0.3s; }
        .elite-input:focus { border-color: var(--gold); }
        .upload-dropzone:hover { border-color: var(--gold) !important; transform: translateY(-2px); }
      `}</style>
    </div>
  );
}
