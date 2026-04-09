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
        <div className="property-card elite-card shadow-lg">
          
          {/* Elite Header: Image + Social Floating */}
          <div className="property-image-container">
            {property_image ? (
              <img src={property_image} alt={title} className="property-image" loading="lazy" />
            ) : (
              <div className="property-no-image"><Building2 size={40} opacity={0.2}/></div>
            )}
            
            <div className="property-image-gradient" />
            
            {/* Social Pulse Overlays */}
            <div className="pc-social-group">
              <button className="pc-social-btn glass-premium" onClick={handleLike} title="Like">
                <Heart size={16} fill={initialLiked ? "var(--rose)" : "none"} color={initialLiked ? "var(--rose)" : "white"} />
              </button>
              <button className="pc-social-btn glass-premium" onClick={handleShare} title="Share">
                <Share2 size={16} color="white" />
              </button>
            </div>

            {/* Price Tag: Professional Elite Look */}
            <div className="pc-floating-price">
              <span className="price-main">{formatSnapAddaPrice(displayPrice)}</span>
              {isAgri && <span className="price-suffix">Total</span>}
            </div>

            {/* Labels */}
            <div className="pc-status-labels">
               {isFeatured && <span className="pc-label featured">FEATURED</span>}
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

            {/* Elite Action Bar: Professional CTAs */}
            <div className="pc-elite-actions">
              <button onClick={() => navigate(`/property/${propertyId}`)} className="pc-btn pc-btn-view btn-3d">
                <Eye size={15}/> VIEW
              </button>
              
              <a href={`tel:${supportPhone}`} className="pc-btn pc-btn-call">
                <Phone size={15}/>
              </a>

              <a 
                href={`https://wa.me/${supportWA}?text=Interested in: ${title}`} 
                target="_blank" rel="noopener noreferrer" 
                className="pc-btn pc-btn-wa btn-3d-emerald"
              >
                <MessageSquare size={15}/> WHATSAPP
              </a>
            </div>
          </div>
        </div>
      </motion.article>
    </>
  );
});

export default PropertyCard;
