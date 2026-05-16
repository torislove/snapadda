import { useState, useRef, memo, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import {
  Heart, Share2, Eye, Phone, MessageSquare, ShieldCheck, Flame,
  MapPin, Building, User, Leaf, BedDouble, Bath, Square,
  Compass, IndianRupee, CheckCircle2, Award, TreePine, ArrowRight, Home as HomeIcon,
  SlidersHorizontal, ChevronLeft, ChevronRight, Image as ImageIcon, Maximize2, X, RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { likeProperty, shareProperty, createInquiry } from '../services/api';
import { useTranslation } from 'react-i18next';
import { 
  formatSnapAddaPrice, 
  formatSnapAddaPriceRange,
  formatLandSize,
  smartAreaConverter,
  calcPricePerUnit,
  getEffectivePricePerUnit,
  calcAgriTotalValue
} from '../utils/priceUtils';
import { logUserActivity, ACTIONS } from '../services/activityTracker';
import { prefetchPropertyData, prioritizeImage } from '../utils/PerformanceUtilities';
import { fetchProperty } from '../services/api';
import { useRealtimeProperties } from '../hooks/useRealtimeProperties';
import { triggerMicroLead } from '../utils/tracker';
import ShareControlCenter from './ShareControlCenter';

const Toast = memo(({ msg, onDone }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="pc-toast"
      onAnimationComplete={() => setTimeout(onDone, 2000)}
    >
      {msg}
    </motion.div>
  );
});

const QuickInquiryModal = memo(({ 
  isOpen, 
  onClose, 
  title, 
  propertyId, 
  questionText, 
  setQuestionText, 
  submittingInquiry, 
  inquirySent, 
  submitQuickInquiry 
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px'
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '420px',
          background: 'rgba(15, 20, 35, 0.98)',
          border: '1px solid rgba(232,184,75,0.2)',
          borderRadius: '24px', padding: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h4 style={{ color: 'white', margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>Ask a Question</h4>
            <div style={{ color: 'var(--gold)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        {inquirySent ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(16,217,140,0.1)', color: '#10d98c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={32} />
            </div>
            <h5 style={{ color: 'white', fontSize: '1rem', margin: '0 0 8px 0' }}>Question Sent!</h5>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>An agent will contact you shortly via WhatsApp.</p>
          </div>
        ) : (
          <form onSubmit={submitQuickInquiry}>
            <label htmlFor={`qi-text-${propertyId}`} className="sr-only">Ask a question about this property</label>
            <textarea
              id={`qi-text-${propertyId}`}
              autoFocus
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Ex: Is the price negotiable? When can I visit?"
              style={{
                width: '100%', height: '120px',
                background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px', padding: '16px', color: 'white',
                fontSize: '0.9rem', outline: 'none', resize: 'none',
                marginBottom: '16px'
              }}
            />
            <button
              type="submit"
              disabled={submittingInquiry || !questionText.trim()}
              style={{
                width: '100%', padding: '14px',
                background: 'var(--gold)', color: 'black',
                border: 'none', borderRadius: '14px',
                fontWeight: 900, fontSize: '0.9rem',
                cursor: 'pointer', opacity: submittingInquiry || !questionText.trim() ? 0.6 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              {submittingInquiry ? <RefreshCw className="animate-spin" size={18} /> : 'Submit Question'}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
});

const PropertyCard = memo((props) => {
  // Real-time synchronization
  const { data: liveData } = useRealtimeProperties(props.id || props._id);
  
  // Merge live data with initial props
  const p = liveData ? { ...props, ...liveData } : props;
  
  const {
    id, _id, image, images, gallery, title, price, location, beds, baths, sqft,
    type = 'Apartment', purpose, measurementUnit = 'Sq.Yds', approval, approvalAuthority, facing,
    areaSize, totalAcres, pricePerAcre, bhk, floorNo, totalFloors,
    isVerified = false, isFeatured = false, isElite = false, isTrustVerified = false,
    vastuCompliant = false,
    listerType = 'Individual Owner', googleMapsLink = '',
    createdAt, likeCount: initialLikeCount = 0, initialLiked = false,
    isGated, cornerProperty, constructionStatus,
    supportPhone: defaultSupportPhone = '+919346793364', supportWA = '919346793364',
    displayContactType = 'Admin', realtor,
    status: propStatus = 'Active', pricePerSqYd, address,
    holographic = true, iridescent = false, propertyCode,
    priceDisplay, // Prioritize pre-formatted price
    isOwnerListing, 
    designTokens, 
    mediaSettings = [],
    priority = false 
  } = p;

  const supportPhone = (displayContactType === 'Lister' && realtor?.phone) 
    ? realtor.phone 
    : defaultSupportPhone;

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [quickInquiryOpen, setQuickInquiryOpen] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const hoverIntervalRef = useRef(null);

  const startImageCycle = () => {
    if (displayImages && displayImages.length > 1) {
      hoverIntervalRef.current = setInterval(() => {
        setActiveImgIdx(prev => (prev + 1) % displayImages.length);
      }, 2000);
    }
  };

  const stopImageCycle = () => {
    if (hoverIntervalRef.current) clearInterval(hoverIntervalRef.current);
    setActiveImgIdx(0);
  };

  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const propertyId = id || _id;

  // Senior Data Analyst: Dynamic Context & FOMO
  const [liveViewers] = useState(() => Math.floor(Math.random() * (45 - 5 + 1) + 5)); // 5 to 45 viewers
  const isHotAsset = initialLikeCount > 5 || isFeatured; // Scarcity Flag


  // Flags & Constants
  const isAgri = ['agricultural land', 'farmhouse'].some(t => (type || '').toLowerCase().includes(t.toLowerCase()));
  const isPlot = ['plot', 'open plot', 'layout plot', 'crda'].some(t => (type || '').toLowerCase().includes(t.toLowerCase()));
  const isCRDA = (type || '').toLowerCase().includes('crda');
  const isIndustrial = ['industrial', 'warehouse', 'factory'].some(t => (type || '').toLowerCase().includes(t.toLowerCase()));
  const isResidential = ['apartment', 'villa', 'independent house'].some(t => (type || '').toLowerCase().includes(t));
  const isNew = createdAt ? (new Date() - new Date(createdAt)) < (7 * 24 * 60 * 60 * 1000) : false;
  const isVastuFacing = ['east', 'north', 'northeast'].some(f => (facing || '').toLowerCase().includes(f));
  const authority = approvalAuthority || approval;

  // Icon & Style Mapping (extended for all AP types)
  const getTypeStyle = (t) => {
    const low = (t || '').toLowerCase();
    if (low.includes('apartment')) return { icon: <Building size={12}/>, accent: '#9b59f5' };
    if (low.includes('villa')) return { icon: <HomeIcon size={12}/>, accent: '#e8b84b' };
    if (low.includes('crda')) return { icon: <HomeIcon size={12}/>, accent: '#e8b84b' };
    if (low.includes('plot') || low.includes('layout')) return { icon: <Square size={12}/>, accent: '#22d9e0' };
    if (low.includes('agri') || low.includes('farm')) return { icon: <Leaf size={12}/>, accent: '#10d98c' };
    if (low.includes('house')) return { icon: <HomeIcon size={12}/>, accent: '#ff8c42' };
    if (low.includes('commercial') || low.includes('showroom') || low.includes('office')) return { icon: <Building size={12}/>, accent: '#22d9e0' };
    if (low.includes('industrial') || low.includes('warehouse') || low.includes('factory')) return { icon: <Maximize2 size={12}/>, accent: '#f5397b' };
    return { icon: <Building size={12}/>, accent: '#fff' };
  };
  const typeStyle = getTypeStyle(type);

  // Robust pricing derivation via standardized utility
  const unitPrices = getEffectivePricePerUnit(p);
  const effectivePricePerAcre = unitPrices?.acre || 0;
  const pricePerCent = unitPrices?.cent || 0;
  const agriTotalValue = calcAgriTotalValue(effectivePricePerAcre, areaSize);
  
  // Area display logic — handles all property types
  const getAreaDisplay = () => {
    const unit = (measurementUnit || '').toLowerCase();
    const size = areaSize || 0;
    if (isAgri) {
      if (areaSize > 0) return formatLandSize(areaSize, false);
      return null;
    }
    if (isPlot || isCRDA) {
      if (size > 0) {
        if (unit.includes('yard') || unit.includes('gajam')) return `${size} Sq.Yards (Gaj.)`;
        if (unit.includes('cent')) return `${size} Cents`;
        if (unit.includes('guntas')) return `${size} Guntas`;
        return `${size} ${measurementUnit || 'Sq.Ft'}`;
      }
      return null;
    }
    return size > 0 ? `${size} ${measurementUnit || 'Sq.Ft'}` : null;
  };
  const areaDisplay = getAreaDisplay();

  // Gajam / Sq.Yard Logic (legacy compat)
  const gajamInfo = smartAreaConverter(areaSize || 0, (measurementUnit?.toLowerCase()?.includes('yard') ? 'sq.yards' : measurementUnit?.toLowerCase()) || 'gajam');
  const displaySqYards = (isPlot && (measurementUnit?.toLowerCase()?.includes('yard') || !measurementUnit)) ? gajamInfo.gajam : null;

  // Effective display price
  const displayPrice = (isAgri && agriTotalValue > 0) ? agriTotalValue : (price > 0 ? price : null);

  // Senior Data Analyst: Asset Intelligence (Investment IQ)
  const cityAvgPrice = {
    'Vijayawada': 6500,
    'Guntur': 4500,
    'Amaravati': 8000,
    'Visakhapatnam': 9500,
    'Kakinada': 3500
  };

  const getInvestmentIQ = () => {
    if (!pricePerSqYd || !cityAvgPrice[location]) return null;
    const currentPrice = Number(String(pricePerSqYd).replace(/,/g, ''));
    const avg = cityAvgPrice[location];
    const discount = ((avg - currentPrice) / avg) * 100;
    
    if (discount > 15) return { label: t('iq.highGrowth', '🌟 High Growth Local'), detail: `${Math.round(discount)}% Value Gap`, color: 'var(--emerald)' };
    if (isVerified && isFeatured) return { label: t('iq.eliteYield', '💎 Institutional Grade'), detail: 'Primary Asset', color: '#e8b84b' };
    return null;
  };

  const iq = getInvestmentIQ();
  const [toast, setToast] = useState('');
  const cardRef = useRef(null);

  const handleHoverPrefetch = () => {
    prefetchPropertyData(propertyId, fetchProperty);
  };

  const handleLike = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) return setToast('Sign in to save properties');
    
    
    likeProperty(propertyId, user._id || user.id)
      .then(res => {
        if (res.status === 'success') {
          setLiked(res.data.liked);
          setLikeCount(res.data.likeCount);
          setToast(res.data.liked ? '❤️ Saved!' : '💔 Removed');
        }
      })
      .catch(() => setToast('⚠️ Try again'));
  }, [user, propertyId]);

  const handleShare = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    setShareModal(true);
  }, []);

  const submitQuickInquiry = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!questionText.trim()) return;
    if (!user) return setToast('Sign in to ask questions');

    setSubmittingInquiry(true);
    try {
      await createInquiry({
        propertyId,
        clientName: user.name || 'User',
        clientContact: user.phone || user.email || 'N/A',
        question: questionText
      });
      setInquirySent(true);
      setQuestionText('');
      
      setQuickInquiryOpen(false);
      setTimeout(() => {
        setInquirySent(false);
      }, 3000);
    } catch (err) {
      setToast('⚠️ Submission failed');
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const isValidImage = (img) => {
    if (!img || typeof img !== 'string') return false;
    if (img.trim() === '' || img.length < 5) return false;
    if (img.includes('placeholder') || img.includes('dummy') || img === 'null' || img === 'undefined') return false;
    return true;
  };

  const rawImages = [
    ...(images || []),
    ...(gallery || []),
    image
  ];
  
  const finalImages = rawImages
    .filter(isValidImage)
    .slice(0, 5);

  const getOptimizedImg = (url, width = designTokens?.imageWidth || 600, height = designTokens?.imageHeight || 450) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;
    
    // Check if this specific URL is set to 'contain' (FIT)
    const isContain = mediaSettings?.find(s => s.url === url)?.objectFit === 'contain';
    const transform = isContain 
      ? `f_auto,q_auto:good,w_${width},c_limit` // c_limit prevents cropping for vertical images
      : `f_auto,q_auto:good,w_${width},h_${height},c_fill`;
      
    return `${parts[0]}/upload/${transform}/${parts[1]}`;
  };
    
  const displayImages = finalImages;
  const isMobile = window.innerWidth <= 600;

  return (
    <>
      <AnimatePresence>{toast && <Toast msg={toast} onDone={() => setToast('')} />}</AnimatePresence>
      <AnimatePresence>
        <QuickInquiryModal 
          isOpen={quickInquiryOpen}
          onClose={() => setQuickInquiryOpen(false)}
          title={title}
          propertyId={propertyId}
          questionText={questionText}
          setQuestionText={setQuestionText}
          submittingInquiry={submittingInquiry}
          inquirySent={inquirySent}
          submitQuickInquiry={submitQuickInquiry}
        />
      </AnimatePresence>
      <ShareControlCenter 
        isOpen={shareModal} 
        onClose={() => setShareModal(false)} 
        property={p} 
      />
      <motion.article
        ref={cardRef}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "20px" }}
        transition={{ duration: 0.3 }}
        style={{ height: isMobile ? '350px' : '380px', padding: isMobile ? '0 4px' : '0' }}
        className="property-card-container"
      >
        <div 
          className="property-card" 
          style={{ 
            height: '100%', 
            borderRadius: isMobile ? '20px' : (designTokens?.borderRadius || '24px'),
            background: 'var(--bg-card)',
            border: isMobile ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--border-light)',
            boxShadow: isMobile ? '0 12px 30px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            transition: 'box-shadow 0.4s var(--ease-3d), border-color 0.4s var(--ease-3d)',
          }}
          onMouseEnter={() => handleHoverPrefetch()}
        >
          <div 
            onClick={(e) => {
              logUserActivity(ACTIONS.PROPERTY_VIEW, { propertyId, title, location }, user?._id);
              triggerMicroLead({ source: 'Property View', propertyId, message: `User viewed ${title} in ${location}` });
              navigate(`/property/${propertyId}`);
            }}
            style={{ position: 'absolute', inset: 0, zIndex: 5, cursor: 'pointer' }}
          />

          {!isMobile && (
            <motion.div
              className="pc-shimmer"
              initial={{ x: '-100%', opacity: 0 }}
              whileHover={{ x: '100%', opacity: 0.15 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                zIndex: 4,
                pointerEvents: 'none'
              }}
            />
          )}

          <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 30, display: 'flex', gap: '4px', background: 'rgba(10, 15, 25, 0.75)', backdropFilter: 'blur(20px)', padding: '3px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickInquiryOpen(true);  }}
              style={{ width: isMobile ? '28px' : '32px', height: isMobile ? '28px' : '32px', borderRadius: '50%', background: 'transparent', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
            >
              <MessageSquare size={isMobile ? 12 : 14} />
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault(); e.stopPropagation();
                window.dispatchEvent(new CustomEvent('toggle-compare', { 
                  detail: { id: propertyId, title, price, image: displayImages[0], isFeatured, isVerified } 
                }));
              }}
              style={{ width: isMobile ? '28px' : '32px', height: isMobile ? '28px' : '32px', borderRadius: '50%', background: 'transparent', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
            >
              <SlidersHorizontal size={isMobile ? 12 : 14} />
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              style={{ width: isMobile ? '28px' : '32px', height: isMobile ? '28px' : '32px', borderRadius: '50%', background: 'transparent', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
            >
              <Share2 size={isMobile ? 12 : 14} />
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              style={{ width: isMobile ? '28px' : '32px', height: isMobile ? '28px' : '32px', borderRadius: '50%', background: 'transparent', color: liked ? 'var(--gold)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
            >
              <Heart size={isMobile ? 12 : 14} fill={liked ? 'currentColor' : 'none'} />
            </motion.button>
          </div>
          
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <div className="pc-image-carousel" 
              onMouseEnter={startImageCycle} 
              onMouseLeave={stopImageCycle}
              style={{ position: 'relative', width: '100%', height: '100%' }}
            >
              {displayImages.length > 0 && displayImages[activeImgIdx % displayImages.length] ? (
                <img 
                  key={activeImgIdx}
                  src={getOptimizedImg(displayImages[activeImgIdx % displayImages.length])} 
                  alt={`${title} | ${type || 'Property'} in ${location || city || 'Andhra Pradesh'}`}
                  title={`${title} - SnapAdda Verified Property`}
                  loading={priority ? "eager" : "lazy"}
                  decoding={priority ? "sync" : "async"}
                  style={{ 
                    position: 'absolute', inset: 0, width: '100%', height: '100%', 
                    objectFit: mediaSettings?.find(s => s.url === displayImages[activeImgIdx % displayImages.length])?.objectFit || 'cover', 
                    cursor: 'grab', 
                    filter: 'brightness(0.9)',
                    transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)'
                  }}
                />
              ) : (
                <div style={{ height: '100%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building size={48} opacity={0.2} />
                </div>
              )}

              <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 25%, transparent 40%, rgba(5,10,20,0.95) 90%, rgba(5,10,20,1) 100%)', zIndex: 1 }} />
              

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', position: 'absolute', top: '64px', right: '16px', zIndex: 10 }}>
                 {iq && <span style={{ background: 'rgba(10,15,25,0.8)', color: iq.color, border: `1px solid ${iq.color}66`, backdropFilter: 'blur(10px)', fontSize: '0.65rem', padding: '4px 10px', borderRadius: '8px', fontWeight: 700 }}>{iq.label}</span>}
                 {isVerified && (
                   <motion.span 
                     initial={{ scale: 0.8 }}
                     animate={{ scale: [1, 1.05, 1] }}
                     transition={{ repeat: Infinity, duration: 3 }}
                     style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(212,175,55,0.15)', color: 'var(--gold)', border: '1px solid var(--gold-border)', backdropFilter: 'blur(10px)', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem' }}
                   >
                     <ShieldCheck size={12} /> Verified
                   </motion.span>
                 )}
                 {isElite && (
                   <motion.span 
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(45deg, #0f172a, #1e293b)', color: '#e8b84b', border: '1px solid #e8b84b', boxShadow: '0 0 15px rgba(232,184,75,0.3)', backdropFilter: 'blur(10px)', fontWeight: 900, padding: '5px 12px', borderRadius: '10px', fontSize: '0.7rem', letterSpacing: '0.05em' }}
                   >
                     <Award size={14} /> ELITE ASSET
                   </motion.span>
                 )}
                 {isTrustVerified && (
                   <motion.span 
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,217,140,0.15)', color: '#10d98c', border: '1px solid rgba(16,217,140,0.4)', backdropFilter: 'blur(10px)', fontWeight: 800, padding: '5px 12px', borderRadius: '10px', fontSize: '0.65rem' }}
                   >
                     <CheckCircle2 size={12} /> TRUST SEAL
                   </motion.span>
                 )}
                 {googleMapsLink && (
                   <a 
                     href={googleMapsLink.trim().startsWith('http') ? googleMapsLink.trim() : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(googleMapsLink.trim())}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     onClick={(e) => e.stopPropagation()}
                     style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(66, 133, 244, 0.15)', color: '#4285F4', border: '1px solid rgba(66, 133, 244, 0.35)', backdropFilter: 'blur(10px)', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem' }}
                   >
                     <MapPin size={10} /> Map Link
                   </a>
                 )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start', position: 'absolute', top: '16px', left: '16px', zIndex: 30 }}>
                 {isOwnerListing && (
                   <span style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(34,217,224,0.15)', color: 'var(--cyan)', border: '1px solid rgba(34,217,224,0.35)', backdropFilter: 'blur(10px)', fontWeight: 900, padding: '4px 10px', borderRadius: '10px', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                     <User size={12} /> DIRECT OWNER
                   </span>
                 )}
                 {listerType === 'Verified Realtor' && (
                   <span style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(155,89,245,0.15)', color: 'var(--violet)', border: '1px solid rgba(155,89,245,0.35)', backdropFilter: 'blur(10px)', fontWeight: 900, padding: '4px 10px', borderRadius: '10px', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                     <ShieldCheck size={12} /> VERIFIED REALTOR
                   </span>
                 )}
                 {isNew && (
                   <span style={{ background: 'rgba(245,57,123,0.15)', color: 'var(--rose)', border: '1px solid rgba(245,57,123,0.35)', backdropFilter: 'blur(10px)', fontWeight: 900, padding: '4px 10px', borderRadius: '10px', fontSize: '0.65rem' }}>
                     NEW ASSET
                   </span>
                 )}
                 {displayImages.length > 1 && (
                    <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: 'white', padding: '4px 10px', borderRadius: '14px', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <ImageIcon size={10} /> {(activeImgIdx % displayImages.length) + 1} / {displayImages.length}
                    </div>
                 )}
              </div>


              {(propertyCode || propertyId) && (
                <div style={{ position: 'absolute', bottom: isMobile ? '135px' : '168px', left: '12px', zIndex: 10, background: 'rgba(232,184,75,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(232,184,75,0.35)', color: 'var(--gold)', padding: '3px 8px', borderRadius: '8px', fontSize: '0.55rem', fontWeight: 900, letterSpacing: '0.08em' }}>
                  {propertyCode || `SNA-${(propertyId || '').toString().slice(-5).toUpperCase()}`}
                </div>
              )}

            </div>
          </div>

          <div 
            className="pc-content"
            onClick={() => navigate(`/property/${propertyId}`)}
            style={{ 
              position: 'absolute', bottom: 0, left: 0, right: 0,
              display: 'flex', flexDirection: 'column', 
              padding: isMobile ? '0.625rem' : '0.875rem', 
              zIndex: 40, 
              background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 60%, transparent 100%)', 
              marginTop: 'auto', 
              cursor: 'pointer' 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.6)', fontSize: isMobile ? '0.65rem' : '0.75rem', fontWeight: 600 }}>
                <MapPin size={isMobile ? 10 : 12} style={{ color: 'var(--gold)' }} /> 
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: isMobile ? '120px' : 'none' }}>{location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', padding: '3px 10px', borderRadius: '8px', fontSize: isMobile ? '0.55rem' : '0.65rem', fontWeight: 800 }}>
                <span style={{ color: typeStyle.accent }}>{typeStyle.icon}</span> 
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t(`types.${(type || 'apartment').toLowerCase()}`)}</span>
              </div>
            </div>

            <h3 style={{ 
              fontSize: isMobile ? '0.85rem' : '1.05rem', 
              fontWeight: 900, 
              color: 'white', 
              margin: '2px 0 10px 0', 
              lineHeight: 1.25,
              height: isMobile ? '2.1rem' : '2.6rem',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              letterSpacing: '-0.01em'
            }}>
              {title}
            </h3>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
              {areaDisplay && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: isMobile ? '0.6rem' : '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
                  {isAgri ? <Leaf size={isMobile ? 10 : 12} style={{ color: 'var(--emerald)' }}/> : <Square size={isMobile ? 10 : 12} style={{ color: 'var(--cyan)' }}/>} <span>{areaDisplay}</span>
                </div>
              )}
              {facing && facing !== 'Any' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: isMobile ? '0.6rem' : '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
                  <Compass size={isMobile ? 10 : 12} style={{ color: 'var(--gold)' }} /> <span>{t(`facing.${facing.toLowerCase()}`)}</span>
                </div>
              )}
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '0 0 12px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: isMobile ? '0.55rem' : '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Total Price</div>
                <div style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 950, color: 'var(--gold)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {priceDisplay || formatSnapAddaPriceRange(p)}
                </div>
              </div>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.stopPropagation(); navigate(`/property/${propertyId}`); }}
                style={{ 
                  padding: isMobile ? '8px 16px' : '10px 20px', 
                  borderRadius: '12px', 
                  background: 'var(--gold)', 
                  color: '#000', 
                  border: 'none', 
                  fontWeight: 900, 
                  fontSize: isMobile ? '0.65rem' : '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 10px 20px rgba(232,184,75,0.2)'
                }}
              >
                VIEW <ArrowRight size={isMobile ? 12 : 14} />
              </motion.button>
            </div>
            </div>
          </div>
        </motion.article>
      </>
    );
  });

export default PropertyCard;
