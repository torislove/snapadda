import { useState, useRef, memo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import {
  Heart, Share2, Eye, Phone, MessageSquare, ShieldCheck, Flame,
  MapPin, Building2, User, Leaf, BedDouble, Bath, Square,
  Compass, IndianRupee, CheckCircle2, Award, TreePine, ArrowRight, Home as HomeIcon,
  SlidersHorizontal, ChevronLeft, ChevronRight, Image as ImageIcon, Maximize2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { likeProperty, shareProperty } from '../services/api';
import { useTranslation } from 'react-i18next';
import { 
  formatSnapAddaPrice, 
  formatLandSize,
  smartAreaConverter,
  calcPricePerUnit
} from '../utils/priceUtils';
import tr from '../utils/teluguTranslations';
import { logUserActivity, ACTIONS } from '../services/activityTracker';
import HolographicWrapper from './HolographicWrapper';
import { triggerHaptic } from '../utils/haptics';

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

const PropertyCard = memo(({
  id, _id, image, images, gallery, title, price, location, beds, baths, sqft,
  type = 'Apartment', purpose, measurementUnit = 'Sq.Yds', approval, approvalAuthority, facing,
  areaSize, totalAcres, pricePerAcre, bhk, floorNo, totalFloors,
  isVerified = false, isFeatured = false, vastuCompliant = false,
  listerType = 'Individual Owner', googleMapsLink = '',
  createdAt, likeCount: initialLikeCount = 0, initialLiked = false,
  isGated, cornerProperty, constructionStatus,
  supportPhone = '+919346793364', supportWA = '919346793364',
  status: propStatus = 'Active', pricePerSqYd, address,
  holographic = true, iridescent = false
}) => {
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
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
    if (!user) {
      navigate('/login', { state: { from: `/property/${propertyId}` } });
      return;
    }
    
    triggerHaptic('success');
    const url = `${window.location.origin}/property/${propertyId}`;
    const shareText = `Check out this ${type} in ${location} on SnapAdda.\n\nPrice: ${formatSnapAddaPrice(displayPrice)}\n\nView details:`;
    
    if (navigator.share) {
      navigator.share({ 
        title: `SnapAdda: ${title}`, 
        text: shareText,
        url 
      }).catch(() => null);
    } else {
      navigator.clipboard.writeText(`${shareText} ${url}`).then(() => setToast('🔗 Details copied!'));
    }
  }, [user, propertyId, title, type, location, displayPrice, navigate]);

  // Elite Image Priority logic: Strict validation for Cloudinary/Uploads only
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
    
  const displayImages = finalImages;
  const isMobile = window.innerWidth <= 600;

  return (
    <>
      <AnimatePresence>{toast && <Toast msg={toast} onDone={() => setToast('')} />}</AnimatePresence>
      <motion.article
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        style={{ perspective: 1000, height: isMobile ? '420px' : '460px', padding: isMobile ? '0 8px' : '0' }}
      >
        <HolographicWrapper
          intensity={holographic ? 1.5 : 0}
          iridescent={iridescent || isFeatured}
          tilt={!isMobile}
          style={{ height: '100%', borderRadius: isMobile ? '28px' : '24px' }}
        >
        <motion.div 
          className="property-card" 
          whileTap={{ scale: 0.98 }}
          style={{ 
            height: '100%', 
            cursor: 'pointer',
            borderRadius: 'inherit',
            background: '#050a14',
            border: isMobile ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--border-light)',
            boxShadow: isMobile ? '0 15px 35px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={(e) => { 
            if (!e.defaultPrevented) {
              if (!user) navigate('/login', { state: { from: `/property/${propertyId}` } });
              else {
                logUserActivity(ACTIONS.PROPERTY_VIEW, { propertyId, title, location }, user?._id);
                navigate(`/property/${propertyId}`);
              }
            }
          }}
        >
          {/* FULL BLEED BACKGROUND IMAGE */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <div className="pc-image-carousel" 
              onMouseEnter={startImageCycle} 
              onMouseLeave={stopImageCycle}
              style={{ position: 'relative', width: '100%', height: '100%' }}
            >
              {displayImages.length > 0 && displayImages[activeImgIdx % displayImages.length] ? (
                <AnimatePresence initial={false} custom={activeImgIdx}>
                  <motion.img 
                    key={activeImgIdx}
                    custom={activeImgIdx}
                    initial={{ opacity: 0.8, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0.8, x: -20 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.4}
                    onDragEnd={(e, { offset }) => {
                      e.preventDefault(); e.stopPropagation();
                      const swipe = offset.x;
                      if (swipe < -50) {
                        setActiveImgIdx(prev => (prev + 1) % displayImages.length);
                      } else if (swipe > 50) {
                        setActiveImgIdx(prev => (prev - 1 + displayImages.length) % displayImages.length);
                      }
                    }}
                    src={displayImages[activeImgIdx % displayImages.length]} 
                    alt={`${title}`} 
                    loading="lazy" 
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', cursor: 'grab' }}
                    whileTap={{ cursor: 'grabbing' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </AnimatePresence>
              ) : (
                <div style={{ height: '100%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={48} opacity={0.2} />
                </div>
              )}

              {/* Holographic Gradient Overlay to ensure text pops */}
              <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 25%, transparent 40%, rgba(5,10,20,0.95) 90%, rgba(5,10,20,1) 100%)', zIndex: 1 }} />
              
              {/* E-Commerce Image Counter */}
              {displayImages.length > 1 && (
                <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: 'white', padding: '4px 10px', borderRadius: '14px', fontSize: '0.65rem', fontWeight: 800, zIndex: 10, display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <ImageIcon size={10} /> {(activeImgIdx % displayImages.length) + 1} / {displayImages.length}
                </div>
              )}

              {/* Advanced Gallery Navigation */}
              {displayImages.length > 1 && (
                <>
                  <div 
                    className="pc-nav pc-nav-left" 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveImgIdx(prev => (prev - 1 + displayImages.length) % displayImages.length); }}
                    style={{ position: 'absolute', left: 0, top: 0, bottom: '40%', width: '25%', zIndex: 5, display: 'flex', alignItems: 'center', paddingLeft: '12px', cursor: 'pointer' }}
                  >
                    <div className="pc-nav-btn" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', color: 'white', borderRadius: '50%', padding: '6px', opacity: 0, transition: 'opacity 0.2s' }}><ChevronLeft size={18} /></div>
                  </div>
                  <div 
                    className="pc-nav pc-nav-right" 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveImgIdx(prev => (prev + 1) % displayImages.length); }}
                    style={{ position: 'absolute', right: 0, top: 0, bottom: '40%', width: '25%', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '12px', cursor: 'pointer' }}
                  >
                    <div className="pc-nav-btn" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', color: 'white', borderRadius: '50%', padding: '6px', opacity: 0, transition: 'opacity 0.2s' }}><ChevronRight size={18} /></div>
                  </div>
                  <style>{`.pc-image-carousel:hover .pc-nav-btn { opacity: 1 !important; }`}</style>
                </>
              )}

              {/* Floating Action Pill */}
              <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 20, display: 'flex', gap: '4px', background: 'rgba(10, 15, 25, 0.65)', backdropFilter: 'blur(20px)', padding: '4px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    window.dispatchEvent(new CustomEvent('toggle-compare', { 
                      detail: { id: propertyId, title, price, image: displayImages[0], isFeatured, isVerified } 
                    }));
                  }}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'transparent', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
                  title="Compare"
                >
                  <SlidersHorizontal size={14} />
                </motion.button>
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={handleShare}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'transparent', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
                  title="Share"
                >
                  <Share2 size={14} />
                </motion.button>
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLike}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'transparent', color: liked ? 'var(--gold)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
                  title="Save"
                >
                  <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
                </motion.button>
              </div>

              {/* Status Labels Top Right below Actions */}
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

              {/* Dot Indicators */}
              {finalImages.length > 1 && (
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '6px', zIndex: 10, pointerEvents: 'none' }}>
                  {finalImages.map((_, idx) => (
                    <div key={idx} style={{ 
                      width: activeImgIdx === idx ? '16px' : '6px', 
                      height: '4px', 
                      borderRadius: '2px', 
                      background: activeImgIdx === idx ? 'var(--gold)' : 'rgba(255,255,255,0.4)', 
                      boxShadow: '0 2px 4px rgba(0,0,0,0.8)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* FLOATING CONTENT AT BOTTOM */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.25rem', zIndex: 20, display: 'flex', flexDirection: 'column' }}>
            
            {/* Price Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 900, color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                  {displayPrice ? formatSnapAddaPrice(displayPrice) : 'Price on Request'}
                </span>
                {isAgri && agriTotalValue > 0 && <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>Total</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '4px 10px', borderRadius: '12px' }}>
                <span style={{ color: typeStyle.accent }}>{typeStyle.icon}</span> <span>{tr(type) || 'ప్రాపర్టీ'}</span>
                {purpose && <span style={{ marginLeft: '4px', color: purpose === 'Rent' ? 'var(--cyan)' : 'var(--emerald)' }}>{purpose}</span>}
              </div>
            </div>

            {/* Title */}
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', fontWeight: 800, color: 'white', margin: '0 0 4px 0', lineHeight: 1.3, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{title}</h3>
            
            {/* Location */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '12px', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
              <MapPin size={14} style={{ color: 'var(--gold)' }} /> {location}
            </div>

            {/* Advanced Specs Grid */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
               {isResidential && (bhk || beds) ? (
                 <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'white', fontWeight: 600 }}>
                   <BedDouble size={14} style={{ color: 'var(--gold)' }} /> <span>{bhk || beds} BHK</span>
                 </div>
               ) : null}
               {areaDisplay && (
                 <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'white', fontWeight: 600 }}>
                   {isAgri ? <Leaf size={14} style={{ color: 'var(--emerald)' }}/> : <Square size={14} style={{ color: 'var(--cyan)' }}/>} <span>{areaDisplay}</span>
                 </div>
               )}
               {facing && facing !== 'Any' && (
                 <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'white', fontWeight: 600 }}>
                   <Compass size={14} style={{ color: 'var(--gold)' }} /> <span>{tr(facing)}</span>
                 </div>
               )}
               {/* View Similar Action */}
               <button 
                  onClick={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    navigate(`/search?type=${type}&city=${location}`);
                  }}
                  style={{ background: 'rgba(212,175,55,0.2)', backdropFilter: 'blur(12px)', border: '1px solid var(--gold-border)', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 700, cursor: 'pointer', marginLeft: 'auto' }}
                >
                 <SlidersHorizontal size={14} /> Find Similar
               </button>
            </div>

            {/* Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '8px' }}>
              <button onClick={(e) => { 
                e.preventDefault(); e.stopPropagation(); 
                if (!user) { navigate('/login', { state: { from: `/property/${propertyId}` } }); }
                else { navigate(`/property/${propertyId}`); }
              }} className="pc-btn" style={{ background: 'var(--gold)', color: 'var(--midnight)', border: 'none', borderRadius: '12px', padding: '0.7rem', fontSize: '0.85rem', fontWeight: 800, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>
                View Details <ArrowRight size={16} />
              </button>
              
              <a href={`tel:${supportPhone}`} onClick={(e) => e.stopPropagation()} style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', color: 'white', transition: 'all 0.2s' }} title="Call">
                <Phone size={18}/>
              </a>
              <a 
                href={`https://wa.me/${supportWA}?text=Hi! I'm interested in this property: ${title}`} 
                onClick={(e) => e.stopPropagation()}
                target="_blank" rel="noopener noreferrer" 
                style={{ background: 'rgba(39,201,125,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(39,201,125,0.4)', color: 'var(--emerald)', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', transition: 'all 0.2s' }}
                title="WhatsApp"
              >
                <MessageSquare size={18}/>
              </a>
            </div>
          </div>
        </motion.div>
        </HolographicWrapper>
      </motion.article>
    </>
  );
});

export default PropertyCard;
