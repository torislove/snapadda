import { useState, useRef, memo, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import {
  Heart, Share2, Eye, Phone, MessageSquare, ShieldCheck, Flame,
  MapPin, Building2, User, Leaf, BedDouble, Bath, Square,
  Compass, IndianRupee, CheckCircle2, Award, TreePine, ArrowRight, Home as HomeIcon,
  SlidersHorizontal, ChevronLeft, ChevronRight, Image as ImageIcon, Maximize2, X, RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { likeProperty, shareProperty, createInquiry } from '../services/api';
import { useTranslation } from 'react-i18next';
import { 
  formatSnapAddaPrice, 
  formatLandSize,
  smartAreaConverter,
  calcPricePerUnit
} from '../utils/priceUtils';
import tr from '../utils/teluguTranslations';
import { logUserActivity, ACTIONS } from '../services/activityTracker';
import { triggerHaptic } from '../utils/haptics';
import { prefetchPropertyData, prioritizeImage } from '../utils/PerformanceUtilities';
import { fetchProperty } from '../services/api';
import { useRealtimeProperties } from '../hooks/useRealtimeProperties';

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

const PropertyCard = memo((props) => {
  // Real-time synchronization
  const { data: liveData } = useRealtimeProperties(props.id || props._id);
  
  // Merge live data with initial props
  const p = liveData ? { ...props, ...liveData } : props;
  
  const {
    id, _id, image, images, gallery, title, price, location, beds, baths, sqft,
    type = 'Apartment', purpose, measurementUnit = 'Sq.Yds', approval, approvalAuthority, facing,
    areaSize, totalAcres, pricePerAcre, bhk, floorNo, totalFloors,
    isVerified = false, isFeatured = false, vastuCompliant = false,
    listerType = 'Individual Owner', googleMapsLink = '',
    createdAt, likeCount: initialLikeCount = 0, initialLiked = false,
    isGated, cornerProperty, constructionStatus,
    supportPhone = '+919346793364', supportWA = '919346793364',
    status: propStatus = 'Active', pricePerSqYd, address,
    holographic = true, iridescent = false, propertyCode,
    designTokens // Dynamic Institutional Tokens
  } = p;
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [quickInquiryOpen, setQuickInquiryOpen] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
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
    if (low.includes('apartment')) return { icon: <Building2 size={12}/>, accent: '#9b59f5' };
    if (low.includes('villa')) return { icon: <HomeIcon size={12}/>, accent: '#e8b84b' };
    if (low.includes('crda')) return { icon: <Square size={12}/>, accent: '#e8b84b' };
    if (low.includes('plot') || low.includes('layout')) return { icon: <Square size={12}/>, accent: '#22d9e0' };
    if (low.includes('agri') || low.includes('farm')) return { icon: <Leaf size={12}/>, accent: '#10d98c' };
    if (low.includes('house')) return { icon: <HomeIcon size={12}/>, accent: '#ff8c42' };
    if (low.includes('commercial') || low.includes('showroom') || low.includes('office')) return { icon: <Building2 size={12}/>, accent: '#22d9e0' };
    if (low.includes('industrial') || low.includes('warehouse') || low.includes('factory')) return { icon: <Maximize2 size={12}/>, accent: '#f5397b' };
    return { icon: <Building2 size={12}/>, accent: '#fff' };
  };
  const typeStyle = getTypeStyle(type);

  // Agri / Land logic
  const agriTotalValue = (pricePerAcre && totalAcres) ? Math.round(Number(pricePerAcre) * Number(totalAcres)) : 0;
  
  // Area display logic — handles all property types
  const getAreaDisplay = () => {
    const unit = (measurementUnit || '').toLowerCase();
    const size = areaSize || 0;
    if (isAgri) {
      if (totalAcres > 0) return `${Number(totalAcres).toFixed(2)} Acres`;
      if (size > 0) return `${size} ${measurementUnit || 'Acres'}`;
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
    if (isIndustrial && size > 0) return `${size.toLocaleString()} ${measurementUnit || 'Sq.Ft'}`;
    if (size > 0) return `${size.toLocaleString()} sq.ft`;
    return null;
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
    if (isVerified && isFeatured) return { label: t('iq.eliteYield', '💎 Institutional Grade'), detail: 'Primary Asset', color: 'var(--gold)' };
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
    
    triggerHaptic('medium');
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
    triggerHaptic('success');
    const url = `${window.location.origin}/property/${propertyId}`;
    const shareText = `Check out this ${type} in ${location} on SnapAdda.\n\nPrice: ${formatSnapAddaPrice(displayPrice)}\n\nView details:`;
    
    if (navigator.share) {
      navigator.share({ 
        title: `SnapAdda: ${title}`, 
        text: shareText,
        url 
      }).catch(() => {
        navigator.clipboard.writeText(`${shareText} ${url}`).then(() => setToast('🔗 Details copied!'));
      });
    } else {
      navigator.clipboard.writeText(`${shareText} ${url}`).then(() => setToast('🔗 Link copied!'));
    }
  }, [propertyId, title, type, location, displayPrice]);

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
      triggerHaptic('success');
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
    return `${parts[0]}/upload/f_auto,q_auto:good,w_${width},h_${height},c_fill/${parts[1]}`;
  };
    
  const displayImages = finalImages;
  const isMobile = window.innerWidth <= 600;

  const QuickInquiryModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { e.stopPropagation(); setQuickInquiryOpen(false); }}
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
            onClick={() => setQuickInquiryOpen(false)}
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
            <textarea
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

  return (
    <>
      <AnimatePresence>{toast && <Toast msg={toast} onDone={() => setToast('')} />}</AnimatePresence>
      <AnimatePresence>{quickInquiryOpen && <QuickInquiryModal />}</AnimatePresence>
      <motion.article
        ref={cardRef}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "20px" }}
        transition={{ duration: 0.3 }}
        style={{ height: isMobile ? '380px' : '440px', padding: isMobile ? '0 4px' : '0' }}
        className="property-card-container"
      >
        <div 
          className="property-card" 
          style={{ 
            height: '100%', 
            borderRadius: isMobile ? '20px' : (designTokens?.borderRadius || '24px'),
            background: '#050a14',
            border: isMobile ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--border-light)',
            boxShadow: isMobile ? '0 12px 30px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
          }}
          onMouseEnter={(e) => {
            handleHoverPrefetch();
            if (!isMobile) {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(232,184,75,0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isMobile) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
            }
          }}
        >
          <div 
            onClick={(e) => {
              if (!user) {
                e.preventDefault();
                e.stopPropagation();
                sessionStorage.setItem('snapadda_redirect', `/property/${propertyId}`);
                navigate('/login');
                return;
              }
              logUserActivity(ACTIONS.PROPERTY_VIEW, { propertyId, title, location }, user?._id);
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

          <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 30, display: 'flex', gap: '6px', background: 'rgba(10, 15, 25, 0.75)', backdropFilter: 'blur(20px)', padding: '4px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickInquiryOpen(true); triggerHaptic('light'); }}
              style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'transparent', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
            >
              <MessageSquare size={18} />
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault(); e.stopPropagation();
                window.dispatchEvent(new CustomEvent('toggle-compare', { 
                  detail: { id: propertyId, title, price, image: displayImages[0], isFeatured, isVerified } 
                }));
              }}
              style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'transparent', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
            >
              <SlidersHorizontal size={18} />
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'transparent', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
            >
              <Share2 size={18} />
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'transparent', color: liked ? 'var(--gold)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
            >
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
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
                  alt={title}
                  loading="lazy"
                  decoding="async"
                  style={{ 
                    position: 'absolute', inset: 0, width: '100%', height: '100%', 
                    objectFit: 'cover', cursor: 'grab', 
                    filter: 'brightness(0.9)',
                    transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)'
                  }}
                />
              ) : (
                <div style={{ height: '100%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={48} opacity={0.2} />
                </div>
              )}

              <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 25%, transparent 40%, rgba(5,10,20,0.95) 90%, rgba(5,10,20,1) 100%)', zIndex: 1 }} />
              
              {displayImages.length > 1 && (
                <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: 'white', padding: '4px 10px', borderRadius: '14px', fontSize: '0.65rem', fontWeight: 800, zIndex: 10, display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <ImageIcon size={10} /> {(activeImgIdx % displayImages.length) + 1} / {displayImages.length}
                </div>
              )}

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
              </div>

              {(propertyCode || propertyId) && (
                <div style={{ position: 'absolute', bottom: '168px', left: '14px', zIndex: 10, background: 'rgba(232,184,75,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(232,184,75,0.35)', color: 'var(--gold)', padding: '3px 8px', borderRadius: '8px', fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.08em' }}>
                  {propertyCode || `SNA-${(propertyId || '').toString().slice(-5).toUpperCase()}`}
                </div>
              )}
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: isMobile ? '0.6rem' : (designTokens?.padding || '0.8rem'), zIndex: 40, display: 'flex', flexDirection: 'column', background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', fontWeight: 600 }}>
                <MapPin size={10} style={{ color: 'var(--gold)' }} /> <span>{location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', padding: '2px 6px', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 800 }}>
                <span style={{ color: typeStyle.accent }}>{typeStyle.icon}</span> <span>{tr(type) || 'Property'}</span>
              </div>
            </div>

            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 800, color: 'white', margin: '0 0 6px 0', lineHeight: 1.2 }}>{title}</h3>
            
            <div style={{ display: 'flex', gap: designTokens?.gap || '6px', flexWrap: 'wrap', marginBottom: '8px', overflowX: 'auto' }} className="hide-scrollbar">
               {isResidential && (bhk || beds) ? (
                 <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: 'white', fontWeight: 700 }}>
                   <BedDouble size={10} style={{ color: 'var(--gold)' }} /> <span>{bhk || beds} BHK</span>
                 </div>
               ) : null}
               {areaSize && (
                 <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.05)', padding: '5px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'white', fontWeight: 700 }}>
                   {isAgri ? <Leaf size={12} style={{ color: 'var(--emerald)' }}/> : <Square size={12} style={{ color: 'var(--cyan)' }}/>} <span>{formatLandSize(areaSize, measurementUnit)}</span>
                 </div>
               )}
               {facing && facing !== 'Any' && (
                 <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.05)', padding: '5px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'white', fontWeight: 700 }}>
                   <Compass size={12} style={{ color: 'var(--gold)' }} /> <span>{tr(facing)}</span>
                 </div>
               )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price Starts From</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 900, color: 'var(--gold)', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                  {displayPrice ? formatSnapAddaPrice(displayPrice) : 'On Request'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <a href={`tel:${supportPhone}`} onClick={(e) => e.stopPropagation()} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', color: 'white', transition: 'all 0.2s' }}>
                  <Phone size={16}/>
                </a>
                <button 
                  onClick={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    if (!user) navigate('/login');
                    else navigate(`/property/${propertyId}`);
                  }}
                  className="btn-3d-liquid"
                  style={{ background: 'var(--gold)', color: 'black', border: 'none', borderRadius: '12px', padding: '0 18px', height: '42px', fontSize: '0.8rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                >
                  VIEW <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.article>
    </>
  );
});

export default PropertyCard;
