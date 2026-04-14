import { useState, useRef, memo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Share2, Eye, Phone, MessageSquare, ShieldCheck, Flame,
  MapPin, Building2, User, Leaf, BedDouble, Bath, Square,
  Compass, IndianRupee, CheckCircle2, Award, TreePine, ArrowRight, Home as HomeIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { likeProperty, shareProperty } from '../services/api';
import { useTranslation } from 'react-i18next';
import { 
  formatSnapAddaPrice, 
  formatLandSize,
  smartAreaConverter,
  calcPricePerCent
} from '../utils/priceUtils';

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
  supportPhone = '+919346793364', supportWA = '919346793364'
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const propertyId = id || _id;

  // Senior Data Analyst: Dynamic Context & FOMO
  const [liveViewers] = useState(() => Math.floor(Math.random() * (45 - 5 + 1) + 5)); // 5 to 45 viewers
  const isHotAsset = initialLikeCount > 5 || isFeatured; // Scarcity Flag


  // Flags & Constants
  const isAgri = (type || '').toLowerCase().includes('agri');
  const isPlot = (type || '').toLowerCase().includes('plot');
  const isResidential = ['apartment', 'villa', 'independent house'].some(t => (type || '').toLowerCase().includes(t));
  const isNew = createdAt ? (new Date() - new Date(createdAt)) < (7 * 24 * 60 * 60 * 1000) : false;
  const isVastuFacing = ['east', 'north', 'northeast'].some(f => (facing || '').toLowerCase().includes(f));
  const authority = approvalAuthority || approval;

  // Icon & Style Mapping
  const getTypeStyle = (t) => {
    const low = (t || '').toLowerCase();
    if (low.includes('apt') || low.includes('apartment')) return { icon: <Building2 size={12}/>, accent: '#9b59f5' };
    if (low.includes('villa')) return { icon: <HomeIcon size={12}/>, accent: '#e8b84b' };
    if (low.includes('plot')) return { icon: <Square size={12}/>, accent: '#22d9e0' };
    if (low.includes('agri')) return { icon: <Leaf size={12}/>, accent: '#10d98c' };
    if (low.includes('house')) return { icon: <HomeIcon size={12}/>, accent: '#ff8c42' };
    return { icon: <Building2 size={12}/>, accent: '#fff' };
  };
  const typeStyle = getTypeStyle(type);

  // Agri / Land logic
  const pricePerCent = pricePerAcre ? calcPricePerCent(pricePerAcre) : 0;
  const agriTotalValue = (pricePerAcre && totalAcres) ? Math.round(Number(pricePerAcre) * Number(totalAcres)) : 0;
  
  // Gajam / Sq.Yard Logic
  const gajamInfo = smartAreaConverter(areaSize || 0, (measurementUnit?.toLowerCase()?.includes('yard') ? 'sq.yards' : measurementUnit?.toLowerCase()) || 'gajam');
  const displaySqYards = (isPlot && (measurementUnit?.toLowerCase()?.includes('yard') || !measurementUnit)) ? gajamInfo.gajam : null;

  // Effective display price
  const displayPrice = (isAgri && agriTotalValue > 0) ? agriTotalValue : price;

  // Realtime Price Per Sq Yd logic for clients
  const pricePerSqYd = (isPlot && displayPrice && displaySqYards) ? Math.round(Number(displayPrice) / Number(displaySqYards)).toLocaleString('en-IN') : null;

  const [toast, setToast] = useState('');

  const handleLike = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) return setToast('Sign in to save properties');
    likeProperty(propertyId, user._id).then(() => setToast('Saved!'));
  }, [user, propertyId]);

  const handleShare = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
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
  }, [propertyId, title, type, location, displayPrice]);

  const property_image = image || images?.[0] || gallery?.[0];

  return (
    <>
      <AnimatePresence>{toast && <Toast msg={toast} onDone={() => setToast('')} />}</AnimatePresence>
      <motion.article
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div 
          className="property-card elite-card shadow-lg" 
          onClick={(e) => { 
            // Only navigate if we aren't clicking a social button or action button
            if (!e.defaultPrevented) navigate(`/property/${propertyId}`);
          }}
          style={{ cursor: 'pointer' }}
        >
          
          {/* Elite Header: Image + Social Floating */}
          <div className="property-image-container">
            <div className="pc-image-carousel" style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', width: '100%', height: '100%', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style>{`.pc-image-carousel::-webkit-scrollbar { display: none; }`}</style>
              {images && images.length > 0 ? (
                images.slice(0, 5).map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', flex: '0 0 100%', scrollSnapAlign: 'start', height: '100%' }}>
                    <img src={img} alt={`${title} ${idx+1}`} className="property-image" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))
              ) : property_image ? (
                <div style={{ flex: '0 0 100%', scrollSnapAlign: 'start', height: '100%' }}>
                  <img src={property_image} alt={title} className="property-image" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div className="property-no-image" style={{ flex: '0 0 100%', height: '100%' }}><Building2 size={40} opacity={0.2}/></div>
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
               {liveViewers} viewing
            </div>
            
            <div className="pc-social-group">
              <button className="pc-social-btn glass-premium" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLike(e); }} title="Like">
                <Heart size={16} fill={initialLiked ? "var(--rose)" : "none"} color={initialLiked ? "var(--rose)" : "white"} />
              </button>
            </div>

            {/* Price Tag: Professional Elite Look */}
            <div className="pc-floating-price" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div>
                <span className="price-main">{formatSnapAddaPrice(displayPrice)}</span>
                {isAgri && <span className="price-suffix">Total</span>}
              </div>
              {pricePerSqYd && <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px', marginTop: '2px' }}>₹{pricePerSqYd} / Sq Yd</span>}
            </div>

            {/* Labels combined with Scarcity */}
            <div className="pc-status-labels" style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end', top: '10px', right: '10px', position: 'absolute' }}>
               {isHotAsset && <span className="pc-label" style={{ background: 'var(--rose)', color: 'white', fontSize: '0.6rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, boxShadow: '0 4px 10px rgba(240,93,94,0.4)', textTransform: 'uppercase' }}>🔥 Hot Asset</span>}
               {isVerified && <span className="pc-label verified">VERIFIED</span>}
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
               {isResidential && (bhk || beds) && (
                 <div className="spec-item">
                   <HomeIcon size={14} /> <span>{bhk || beds} BHK</span>
                 </div>
               )}
               {isAgri && (
                 <div className="spec-item">
                   <Leaf size={14} /> <span>{totalAcres ? formatLandSize(totalAcres) : `${areaSize} Cents`}</span>
                 </div>
               )}
               {isPlot && (
                 <div className="spec-item">
                   <Square size={14} /> <span>{displaySqYards ? `${displaySqYards} SqYds` : `${areaSize} ${measurementUnit}`}</span>
                 </div>
               )}
               {facing && (
                 <div className="spec-item">
                   <Compass size={14} /> <span>{facing}</span>
                 </div>
               )}
            </div>

            {/* Elite Action Bar: Minimalist CTAs for Compressed Card */}
            <div className="pc-elite-actions" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '8px' }}>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/property/${propertyId}`); }} className="pc-btn pc-btn-view btn-3d" style={{ padding: '0.4rem', fontSize: '0.65rem' }}>
                <Eye size={13} style={{ marginRight: '4px' }}/> VIEW
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
        </div>
      </motion.article>
    </>
  );
});

export default PropertyCard;
