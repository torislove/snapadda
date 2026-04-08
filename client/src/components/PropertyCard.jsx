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
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="property-card">
          
          {/* Image Zone */}
            <div className="property-image-container">
              {property_image ? (
                <img 
                  src={property_image} 
                  alt={`${title} - ${type} in ${location}`} 
                  className="property-image" 
                  loading="lazy" 
                  width="400" 
                  height="300"
                />
              ) : (
                <div className="property-no-image"><Building2 size={40} opacity={0.2}/></div>
              )}
            
            <div className="property-image-gradient" />
            
            <div className="property-image-overlay">
               <button 
                className="view-details-btn" 
                onClick={() => navigate(`/property/${propertyId}`)}
                aria-label={`View full details of ${title}`}
               >
                  <Eye size={14}/> {t('card.viewDetails', 'View Property')}
               </button>
            </div>

            {/* Like/Share Overlays */}
            <div className="property-tags-top-right">
               <button 
                className="pc-icon-btn pc-like-btn" 
                onClick={handleLike} 
                title="Save"
                aria-label={initialLiked ? "Remove from saved" : "Save property"}
               >
                  <Heart size={16} fill={initialLiked ? "var(--rose)" : "none"} color={initialLiked ? "var(--rose)" : "white"} />
               </button>
               <button 
                className="pc-icon-btn pc-share-btn" 
                onClick={handleShare} 
                title="Share"
                aria-label="Share property details"
               >
                  <Share2 size={16} color="white" />
               </button>
            </div>
            
            {/* Price badge */}
            <div className="property-price-tag">
              <span>{formatSnapAddaPrice(displayPrice)}</span>
              {isAgri && agriTotalValue > 0 && <div className="pc-price-sub">{t('pd.totalVal', 'Total Value')}</div>}
            </div>

            {/* Badges */}
            <div className="property-tags-top-left">
              {isFeatured && <span className="badge badge-featured">⭐ {t('card.featured')}</span>}
              {isNew && <span className="badge badge-new">✨ {t('card.new')}</span>}
              {purpose && (
                <span className="badge" style={{ background: purpose === 'Rent' ? '#22d9e0' : '#10d98c', color: '#000', fontWeight: 900 }}>
                  {purpose === 'Rent' ? t('intent.rent').toUpperCase() : t('intent.buy').toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <div className="property-content">
            <div className="property-badges">
              <span className="badge">
                {typeStyle.icon} {t(`types.${(type || 'apartments').toLowerCase().replace(/\s+/g, '')}`, type)}
              </span>
              {authority && authority !== 'N/A' && (
                <span className="badge badge-verified"><ShieldCheck size={10}/> {authority}</span>
              )}
            </div>

            <Link to={`/property/${propertyId}`} className="pc-title-link">
              <h2 className="pc-title">{title}</h2>
            </Link>

            <div className="property-location">
              <MapPin size={11}/> {location}
            </div>

            {/* FEATURES */}
            <div className="property-features">

              {/* AGRICULTURAL LAND */}
              {isAgri && (
                <>
                  <div className="feature">
                    <span className="feature-value" style={{ color: typeStyle.accent }}>
                      {totalAcres ? formatLandSize(totalAcres) : (areaSize ? `${areaSize} ${t('card.cents')}` : '—')}
                    </span>
                    <span className="feature-label">{t('card.totalArea')}</span>
                  </div>
                  {pricePerAcre > 0 && (
                    <>
                      <div className="feature-divider"/>
                      <div className="feature">
                        <span className="feature-value" style={{ color: 'var(--gold)' }}>{formatSnapAddaPrice(pricePerAcre)}</span>
                        <span className="feature-label">{t('card.perAcre')}</span>
                      </div>
                    </>
                  )}
                  {pricePerCent > 0 && (
                    <>
                      <div className="feature-divider"/>
                      <div className="feature">
                        <span className="feature-value" style={{ color: '#a8ff78' }}>₹{pricePerCent.toLocaleString('en-IN')}</span>
                        <span className="feature-label">{t('card.perCent')}</span>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* PLOTS */}
              {isPlot && (
                <>
                  <div className="feature">
                    <span className="feature-value" style={{ color: typeStyle.accent }}>
                      {displaySqYards ? `${displaySqYards.toLocaleString('en-IN')}` : (areaSize || '—')}
                    </span>
                    <span className="feature-label">{displaySqYards ? t('card.sqyds') : t(`card.${measurementUnit?.toLowerCase()}`, measurementUnit)}</span>
                  </div>
                  {facing && (
                    <>
                      <div className="feature-divider"/>
                      <div className="feature">
                        <span className="feature-value" style={{ color: isVastuFacing ? 'var(--gold)' : 'inherit' }}>
                          {t(`pills.${(facing || '').toLowerCase()}`, facing)} {isVastuFacing && '🧭'}
                        </span>
                        <span className="feature-label">{t('card.facing')}</span>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* RESIDENTIAL */}
              {isResidential && (
                <>
                  {(bhk || beds) && (
                    <div className="feature">
                      <span className="feature-value">{bhk || beds} <span style={{ fontSize: '0.7rem' }}>BHK</span></span>
                      <span className="feature-label">{t('card.config')}</span>
                    </div>
                  )}
                  <div className="feature">
                    <span className="feature-value">{areaSize || sqft || '—'}</span>
                    <span className="feature-label">{t('pd.area')}</span>
                  </div>
                </>
              )}
            </div>

            <div className="property-actions">
              <a 
                href="tel:+919346793364" 
                className="action-btn action-btn-call"
                aria-label="Call SnapAdda Support"
              >
                <Phone size={13}/> {t('card.call')}
              </a>
              <a 
                href={`https://wa.me/919346793364?text=${encodeURIComponent(`Hi SnapAdda! I'm interested in this property:\n\n*${title}*\nType: ${type}\nLocation: ${location}\nPrice: ${formatSnapAddaPrice(displayPrice)}\n\nLink: ${window.location.origin}/property/${propertyId}`)}`}
                target="_blank" rel="noopener noreferrer" className="action-btn action-btn-contact"
                aria-label="Chat with SnapAdda on WhatsApp"
              >
                <MessageSquare size={13}/> {t('card.whatsapp')}
              </a>
              <button 
                onClick={() => navigate(`/property/${propertyId}`)}
                className="action-btn"
                aria-label={`View more information about ${title}`}
              >
                <ArrowRight size={13}/> {t('card.more', 'View')}
              </button>
            </div>
          </div>
        </div>
      </motion.article>
    </>
  );
});

export default PropertyCard;
