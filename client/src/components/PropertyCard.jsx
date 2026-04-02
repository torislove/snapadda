import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Share2, Eye, Phone, MessageSquare, ShieldCheck, Flame, MapPin, Building2, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { likeProperty, shareProperty } from '../services/api';
import { useTranslation } from 'react-i18next';

function formatPrice(price) {
  const s = typeof price === 'number' ? price.toString() : price;
  if (!s) return s;
  const n = s.replace(/,/g, '').replace(/₹/g, '').trim().toLowerCase();
  const isCrore = /crore/.test(n);
  const isLakh = /lakh/.test(n);
  const val = parseFloat(n.replace(/[^0-9.]/g, ''));
  if (isNaN(val)) return s;
  if (isCrore) return `₹${val.toFixed(1)} Cr`;
  if (isLakh) return `₹${val.toFixed(1)} L`;
  if (val >= 1e7) return `₹${(val / 1e7).toFixed(1)} Cr`;
  if (val >= 1e5) return `₹${(val / 1e5).toFixed(1)} L`;
  return `₹${val.toLocaleString('en-IN')}`;
}

export default function PropertyCard({
  id, _id, image, images, title, price, location, beds, baths, sqft,
  type, purpose, measurementUnit = 'Sq.Yds', approval, approvalAuthority, facing,
  areaSize, isVerified = false, isFeatured = false, listerType = 'Individual Owner',
  createdAt, onTriggerLead, likeCount: initialLikeCount = 0, initialLiked = false,
}) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const propertyId = id || _id;
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  const allImages = images?.length ? images : image ? [image] : [];
  const mainImage = allImages[0] ?? null;
  const authority = approval || approvalAuthority;
  const isHot = propertyId ? propertyId.charCodeAt(0) % 2 === 0 : false;
  const viewers = propertyId ? propertyId.charCodeAt(1 % propertyId.length) % 12 + 3 : 5;
  const isNew = createdAt ? Date.now() - new Date(createdAt).getTime() < 10080 * 60 * 1000 : false;

  const handleLike = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { alert('Please sign in to like properties'); return; }
    try {
      if (propertyId) {
        const res = await likeProperty(propertyId, user._id);
        if (res.status === 'success') { setLiked(res.data.liked); setLikeCount(res.data.likeCount); }
      }
    } catch (err) { console.error('Like failed', err); }
  };

  const handleShare = async (e) => {
    e.preventDefault(); e.stopPropagation();
    const url = `${window.location.origin}/property/${propertyId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `SnapAdda: ${title}`, text: `Check out this property in ${location}`, url });
        if (propertyId) await shareProperty(propertyId, 'native', user?._id);
      } else {
        await navigator.clipboard.writeText(url);
        alert('Link copied!');
        if (propertyId) await shareProperty(propertyId, 'clipboard', user?._id);
      }
    } catch (err) { console.error('Share failed', err); }
  };

  const isVastuPreferred = facing && ['east', 'north', 'north-east'].includes(facing.toLowerCase());

  return (
    <motion.div 
      className="scene-3d" 
      style={{ width: '100%', height: '100%', perspective: '1200px' }}
      initial={{ opacity: 0, y: 60, rotateX: 15, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ type: 'spring', stiffness: 90, damping: 15, mass: 1 }}
    >
      <motion.div className="property-card card-3d">
        <motion.div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none', background: 'radial-gradient(400px circle at 50% 50%, rgba(255,255,255,0.12), transparent 40%)' }} />

        <Link to={propertyId ? `/property/${propertyId}` : '#'} className="property-card-link">
          <div className="property-image-container">
            {mainImage
              ? <motion.img src={mainImage} alt={title} className="property-image" loading="lazy" whileHover={{ scale: 1.08 }} transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }} />
              : <div className="property-no-image"><Building2 size={36} /></div>
            }
            <div className="property-image-gradient" />
            <div className="property-price-tag" style={{ transform: 'translateZ(40px)' }}>
              <span>{formatPrice(price)}</span>
            </div>
            {allImages.length > 1 && (
              <div className="img-count-dots">
                {allImages.slice(0, 5).map((_, i) => (
                  <div key={i} className={`img-dot ${i === 0 ? 'active' : ''}`} />
                ))}
              </div>
            )}
            <div className="property-tags-top-left" style={{ transform: 'translateZ(30px)' }}>
              {isFeatured && <div className="badge badge-featured">⭐ {t('card.featured')}</div>}
              {isNew && <div className="badge badge-new">✨ {t('card.new')}</div>}
              {purpose && (
                <div className="badge" style={{ 
                  background: purpose === 'Rent' ? 'var(--cyan)' : 'var(--emerald)', 
                  color: '#000', 
                  fontWeight: 900,
                  fontSize: '0.65rem'
                }}>
                  {purpose === 'Rent' ? 'FOR RENT' : 'FOR SALE'}
                </div>
              )}
            </div>
            <div className="property-tags-top-right" style={{ transform: 'translateZ(30px)' }}>
              {isHot && <div className="scarcity-badge" style={{ position: 'relative', top: 'auto', right: 'auto' }}>Only {Math.floor((propertyId?.charCodeAt(1) || 0) % 3) + 1} Left!</div>}
              {isVerified && <div className="badge badge-verified"><ShieldCheck size={11} /> {t('card.verified', 'Verified')}</div>}
              {type === 'Agricultural Land' && isVerified && (
                <div className="badge badge-lpm" style={{ backgroundColor: '#065f46', color: '#fff', border: 'none' }}>
                  📄 LPM Copy
                </div>
              )}
              {isHot && <div className="badge badge-hot"><Flame size={11} /> {t('card.hot', 'Hot')}</div>}
            </div>
            <div className="property-image-actions" style={{ transform: 'translateZ(50px)' }}>
              <button className={`img-action-btn like-btn ${liked ? 'active' : ''}`} onClick={handleLike} title={liked ? 'Unlike' : 'Like'}>
                <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                {likeCount > 0 && <span className="action-count">{likeCount}</span>}
              </button>
              <button className="img-action-btn share-btn" onClick={handleShare} title="Share Property">
                <Share2 size={16} />
              </button>
            </div>
            <div className="property-image-overlay">
              <span className="view-details-btn"><Eye size={13} /> {t('card.details')}</span>
            </div>
          </div>
        </Link>

        <div className="property-content" style={{ transform: 'translateZ(10px)' }}>
          <Link to={propertyId ? `/property/${propertyId}` : '#'} className="property-title-link">
            <h3 className="property-title text-royal-gold">{title}</h3>
          </Link>
          <div className="property-location text-muted"><MapPin size={12} /> {location}</div>
          <div className="property-lister" style={{ color: listerType?.includes('Builder') ? 'var(--gold)' : 'var(--txt-muted)' }}>
            {listerType?.includes('Builder') ? <Building2 size={11} /> : <User size={11} />} {listerType}
          </div>
          <div className="property-badges">
            {type && <span className="badge type-badge">{type}</span>}
            {authority && authority !== 'N/A' && authority !== 'Pending' && (
              <span className="badge badge-gold"><ShieldCheck size={10} /> {authority}</span>
            )}
            <span className="viewers-chip" style={{ marginLeft: 'auto' }}><Eye size={10} /> {viewers}</span>
          </div>
          <div className="property-features">
            {type !== 'Agriculture' && (
              <>
                <div className="feature"><span className="feature-value">{beds}</span><span className="feature-label">Beds</span></div>
                <div className="feature-divider" />
                <div className="feature"><span className="feature-value">{baths}</span><span className="feature-label">Baths</span></div>
                <div className="feature-divider" />
              </>
            )}
            <div className="feature"><span className="feature-value">{areaSize || sqft || '—'}</span><span className="feature-label">{measurementUnit}</span></div>
            {facing && (
              <>
                <div className="feature-divider" />
                <div className="feature" style={{ color: isVastuPreferred ? 'var(--gold)' : 'inherit', position: 'relative' }}>
                  <span className="feature-value" style={{ color: isVastuPreferred ? 'var(--gold)' : 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {facing} {isVastuPreferred && <span title="Vastu Preferred" style={{ fontSize: '10px' }}>🧭</span>}
                  </span>
                  <span className="feature-label" style={{ fontWeight: isVastuPreferred ? '800' : 'normal' }}>{t('card.facing', 'Facing')}</span>
                </div>
              </>
            )}
          </div>

          <div className="property-actions" style={{ transform: 'translateZ(15px)' }}>
            <Link to="/request-callback" className="btn-3d action-btn action-btn-call" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <Phone size={13} /> {t('card.call')}
            </Link>
            <Link to="/request-callback" className="btn-3d btn-3d-emerald action-btn action-btn-contact" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <MessageSquare size={13} /> {t('card.contact')}
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
