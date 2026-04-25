import { useState, useRef, memo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import {
  Heart, Share2, Eye, Phone, MessageSquare, ShieldCheck, Flame,
  MapPin, Building2, User, Leaf, BedDouble, Bath, Square,
  Compass, IndianRupee, CheckCircle2, Award, TreePine, ArrowRight, Home as HomeIcon,
  SlidersHorizontal
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
import { logUserActivity, ACTIONS } from '../services/activityTracker';

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
  status: propStatus = 'Active', pricePerSqYd
}) => {
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
    likeProperty(propertyId, user._id).then(() => setToast('Saved!'));
  }, [user, propertyId]);

  const handleShare = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) {
      navigate('/login', { state: { from: `/property/${propertyId}` } });
      return;
    }
    const url = `${window.location.origin}/property/${propertyId}`;
    const shareText = `Check out this ${type} in ${location} on SnapAdda.\n\nPrice: ${formatSnapAddaPrice(displayPrice)}\n\nView details:`;
    
    if (navigator.share) {
      navigator.share({ 
        title: `SnapAdda: ${title}`, 
        text: shareText,
        url 
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareText} ${url}`).then(() => setToast('🔗 Details copied!'));
    }
  }, [user, propertyId, title, type, location, displayPrice, navigate]);

  const property_image = image || images?.[0] || gallery?.[0];

  return (
    <>
      <AnimatePresence>{toast && <Toast msg={toast} onDone={() => setToast('')} />}</AnimatePresence>
      <motion.article
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        style={{ perspective: 1000, height: '100%' }}
      >
        <motion.div 
          className="property-card glass-elite" 
          style={{ height: '100%', cursor: 'pointer' }}
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
          {/* Elite Header: Image + Social Floating */}
          <div className="property-image-container" style={{ borderRadius: '24px 24px 0 0', overflow: 'hidden' }}>
            <div className="pc-image-carousel">
              {images && images.length > 0 ? (
                images.slice(0, 3).map((img, idx) => (
                  <img key={idx} src={img} alt={`${title} ${idx+1}`} className="property-image" loading="lazy" />
                ))
              ) : (
                <img src={property_image} alt={title} className="property-image" loading="lazy" />
              )}
            </div>
            {images && images.length > 1 && (
              <div style={{ position: 'absolute', bottom: '10px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '4px', zIndex: 10, pointerEvents: 'none' }}>
                {images.slice(0, 5).map((_, idx) => (
                  <div key={idx} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', boxShadow: '0 1px 3px rgba(0,0,0,0.5)' }} />
                ))}
              </div>
            )}
            <div className="property-image-gradient" style={{ pointerEvents: 'none' }} />

            {/* Senior Analyst: FOMO Pulse Viewer */}
            <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', zIndex: 10 }}>
               <div style={{ width: '6px', height: '6px', background: 'var(--rose)', borderRadius: '50%' }} className="pulse-primary" />
               {liveViewers} {t('card.viewing', 'viewing')}
            </div>
            
            <div className="pc-social-group">
              <button 
                className="pc-social-btn glass-premium" 
                onClick={(e) => {
                  e.preventDefault(); e.stopPropagation();
                  window.dispatchEvent(new CustomEvent('toggle-compare', { detail: { id: propertyId, title, image: property_image, type, price: displayPrice } }));
                }}
                title="Compare"
                style={{ color: 'white' }}
              >
                <SlidersHorizontal size={15} />
              </button>
              <button className="pc-social-btn glass-premium" onClick={(e) => handleLike(e)} title="Like">
                <Heart size={15} fill={initialLiked ? "var(--rose)" : "none"} color={initialLiked ? "var(--rose)" : "white"} />
              </button>
              <button className="pc-social-btn glass-premium" onClick={(e) => handleShare(e)} title="Share" style={{ color: 'white' }}>
                <Share2 size={15} />
              </button>
            </div>

            {/* Price Tag: Professional Elite Look */}
            <div className="pc-floating-price" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div>
                <span className="price-main">
                  {displayPrice ? formatSnapAddaPrice(displayPrice) : 'Price on Request'}
                </span>
                {isAgri && agriTotalValue > 0 && <span className="price-suffix"> Total</span>}
              </div>
              {isPlot && pricePerSqYd && <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'rgba(255,255,255,0.9)', background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.3)', padding: '2px 8px', borderRadius: '4px', marginTop: '4px', textTransform: 'uppercase' }}>₹{pricePerSqYd} / SqYd (Gajam)</span>}
              {isAgri && pricePerAcre > 0 && <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'rgba(255,255,255,0.9)', background: 'rgba(16,217,140,0.15)', border: '1px solid rgba(16,217,140,0.3)', padding: '2px 8px', borderRadius: '4px', marginTop: '4px', textTransform: 'uppercase' }}>{formatSnapAddaPrice(pricePerAcre)} / Acre</span>}
            </div>

             {/* Labels combined with Scarcity */}
            <div className="pc-status-labels" style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', top: '10px', right: '10px', position: 'absolute' }}>
               {iq && <span className="pc-label iq-badge" style={{ background: 'rgba(0,0,0,0.8)', color: iq.color, border: `1px solid ${iq.color}`, backdropFilter: 'blur(10px)', fontSize: '0.6rem', padding: '3px 8px', borderRadius: '6px', fontWeight: 900, boxShadow: `0 4px 15px ${iq.color}44` }}>{iq.label}</span>}
               {isHotAsset && (propStatus || 'Active') !== 'Sold' && <span className="pc-label" style={{ background: 'var(--rose)', color: 'white', fontSize: '0.6rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, boxShadow: '0 4px 10px rgba(240,93,94,0.4)', textTransform: 'uppercase' }}>🔥 {t('card.hot', 'Hot Asset')}</span>}
               {isVerified && (
                 <motion.span 
                   initial={{ scale: 0.8 }}
                   animate={{ scale: [1, 1.05, 1] }}
                   transition={{ repeat: Infinity, duration: 3 }}
                   className="pc-label verified" 
                   style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'linear-gradient(135deg, #e8b84b, #b9933a)', color: '#07070f', fontWeight: 900, boxShadow: '0 4px 12px rgba(232,184,75,0.4)' }}
                 >
                   <ShieldCheck size={10} /> {t('card.verified', 'SNAPADDA VERIFIED')}
                 </motion.span>
               )}
               {(propStatus || 'Active') === 'Sold' && <span className="pc-label" style={{ background: 'var(--emerald)', color: 'white', fontSize: '0.6rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 900, boxShadow: '0 4px 15px rgba(16,217,140,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('card.sold', 'SOLD OUT')}</span>}
            </div>
          </div>

          <div className="property-content">
            <div className="pc-entity-type">
              {typeStyle.icon} <span>{(type || 'Property').toUpperCase()}</span>
            </div>

            <h3 className="pc-title-elite">{title}</h3>
            
            <div className="pc-location-elite">
              <MapPin size={12} /> {location}
            </div>

            {/* Features Row */}
            <div className="pc-specs-grid">
               {isResidential && (bhk || beds) ? (
                 <div className="spec-item">
                   <HomeIcon size={14} /> <span>{bhk || beds} BHK</span>
                 </div>
               ) : null}
               {/* Area display for all types */}
               {areaDisplay && (
                 <div className="spec-item">
                   {isAgri ? <Leaf size={14}/> : <Square size={14}/>} <span>{areaDisplay}</span>
                 </div>
               )}
               {facing && facing !== 'Any' && (
                 <div className="spec-item">
                   <Compass size={14} /> <span>{facing}</span>
                 </div>
               )}
               {authority && authority !== 'N/A' && authority !== 'None' && (
                 <div className="spec-item" style={{ color: isCRDA || authority.includes('CRDA') ? 'var(--gold)' : 'var(--emerald)', fontWeight: 800 }}>
                   <Award size={14} /> <span>{authority}</span>
                 </div>
               )}
            </div>

            {/* Elite Action Bar: Minimalist CTAs for Compressed Card */}
            <div className="pc-elite-actions" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '8px' }}>
              <button onClick={(e) => { 
                e.preventDefault(); e.stopPropagation(); 
                if (!user) { navigate('/login', { state: { from: `/property/${propertyId}` } }); }
                else { navigate(`/property/${propertyId}`); }
              }} className="pc-btn pc-btn-view btn-3d" style={{ padding: '0.5rem', fontSize: '0.7rem' }}>
                <Eye size={13} style={{ marginRight: '4px' }}/> {t('card.details', 'VIEW')}
              </button>
              
              <div style={{ display: 'flex', gap: '6px' }}>
                <a href={`tel:${supportPhone}`} onClick={(e) => e.stopPropagation()} className="pc-btn pc-btn-call" style={{ padding: '0.4rem' }}>
                  <Phone size={13}/>
                </a>
                <a 
                  href={`https://wa.me/${supportWA}?text=Interested in: ${title}`} 
                  onClick={(e) => e.stopPropagation()}
                  target="_blank" rel="noopener noreferrer" 
                  className="pc-btn pc-btn-wa btn-3d-emerald"
                  style={{ padding: '0.4rem', borderRadius: '50%' }}
                >
                  <MessageSquare size={13}/>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.article>
    </>
  );
});

export default PropertyCard;
