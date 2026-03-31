import React, { useState } from 'react';
import { 
  Phone, PhoneCall, ShieldCheck, MapPin, Search, 
  Flame, Users, Building2, User, ImageOff, Heart, Share2 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { likeProperty, shareProperty } from '../../services/api';
import './PropertyCard.css';

interface PropertyCardProps {
  id?: string; _id?: string;
  image?: string; images?: string[];
  title: string; price: string | number; location: string;
  beds: number; baths: number; sqft?: number;
  type?: string; condition?: string; facing?: string;
  approval?: string; approvalAuthority?: string;
  measurementUnit?: string; areaSize?: number;
  isVerified?: boolean; isFeatured?: boolean;
  listerType?: string; createdAt?: string;
  likeCount?: number; initialLiked?: boolean;
  onTriggerLead?: (type: 'callback' | 'contact') => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  id, _id, image, images, title, price, location,
  beds, baths, sqft, type, measurementUnit = 'Sq.Ft',
  approval, approvalAuthority,
  facing,
  areaSize, isVerified = false, isFeatured = false,
  listerType = 'Individual Owner', createdAt, onTriggerLead,
  likeCount: initialLikeCount = 0, initialLiked = false
}) => {
  const { user } = useAuth();
  const propertyId = id || _id;
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  const displayApproval = approval || approvalAuthority;
  const allImages = images?.length ? images : image ? [image] : [];
  const displayImage = allImages[0] ?? null;

  const isHot         = propertyId ? propertyId.charCodeAt(0) % 2 === 0 : false;
  const viewers       = propertyId ? (propertyId.charCodeAt(1 % propertyId.length) % 12) + 3 : 5;
  const isNew         = createdAt ? (Date.now() - new Date(createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000 : false;

  const formatPrice = (p: string | number) => {
    const rawPrice = typeof p === 'number' ? p.toString() : p;
    const normalized = rawPrice.replace(/,/g, '').replace(/₹/g, '').trim().toLowerCase();
    const isCrore = /crore/.test(normalized);
    const isLakh = /lakh/.test(normalized);
    const n = parseFloat(normalized.replace(/[^0-9.]/g, ''));
    if (isNaN(n)) return rawPrice;
    if (isCrore) return `₹${n.toFixed(1)} Cr`;
    if (isLakh) return `₹${n.toFixed(1)} L`;
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please sign in to like properties');
      return;
    }
    try {
      if (propertyId) {
        const res = await likeProperty(propertyId, user._id);
        if (res.status === 'success') {
          setLiked(res.data.liked);
          setLikeCount(res.data.likeCount);
        }
      }
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/property/${propertyId}`;
    const shareData = {
      title: `SnapAdda: ${title}`,
      text: `Check out this property in ${location}: ${title}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        if (propertyId) await shareProperty(propertyId, 'native', user?._id);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        if (propertyId) await shareProperty(propertyId, 'clipboard', user?._id);
      }
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  return (
    <div className="scene-3d" style={{ width: '100%', height: '100%' }}>
      <motion.div
        className="property-card card-3d"
      >
        {/* Dynamic Sheen overlay following the mouse */}
        <motion.div
          style={{
            position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none',
            background: 'radial-gradient(400px circle at 50% 50%, rgba(255,255,255,0.12), transparent 40%)'
          }}
        />
        {/* Image segment */}
        <Link to={propertyId ? `/property/${propertyId}` : '#'} className="property-card-link">
          <div className="property-image-container">
            {displayImage ? (
              <motion.img 
                src={displayImage} alt={title} className="property-image" loading="lazy"
                whileHover={{ scale: 1.08 }} transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              />
            ) : (
              <div className="property-no-image"><ImageOff size={36}/></div>
            )}

            <div className="property-image-gradient"/>

            {/* Price Tag with 3D Pop */}
            <div className="property-price-tag" style={{ transform: 'translateZ(40px)' }}>
              <span>{formatPrice(price)}</span>
            </div>

            {/* Multi-image indicators */}
            {allImages.length > 1 && (
              <div className="img-count-dots">
                {allImages.slice(0,5).map((_,i) => <div key={i} className={`img-dot ${i===0?'active':''}`}/>)}
              </div>
            )}

            {/* Floating Badges */}
            <div className="property-tags-top-left" style={{ transform: 'translateZ(30px)' }}>
              {isFeatured && <div className="badge badge-featured">⭐ Featured</div>}
              {isNew && <div className="badge badge-new">✨ New</div>}
            </div>

            <div className="property-tags-top-right" style={{ transform: 'translateZ(30px)' }}>
              {isVerified && <div className="badge badge-verified"><ShieldCheck size={11}/> Verified</div>}
              {isHot && <div className="badge badge-hot"><Flame size={11}/> Hot</div>}
            </div>

            {/* Interaction Layer */}
            <div className="property-image-actions" style={{ transform: 'translateZ(50px)' }}>
              <button 
                className={`img-action-btn like-btn ${liked ? 'active' : ''}`} 
                onClick={handleLike}
                title={liked ? 'Unlike' : 'Like'}
              >
                <Heart size={16} fill={liked ? "currentColor" : "none"} />
                {likeCount > 0 && <span className="action-count">{likeCount}</span>}
              </button>
              <button 
                className="img-action-btn share-btn" 
                onClick={handleShare}
                title="Share Property"
              >
                <Share2 size={16} />
              </button>
            </div>

            <div className="property-image-overlay">
              <span className="view-details-btn"><Search size={13}/> View Property</span>
            </div>
          </div>
        </Link>

        {/* Content Segment */}
        <div className="property-content" style={{ transform: 'translateZ(10px)' }}>
          <Link to={propertyId ? `/property/${propertyId}` : '#'} className="property-title-link">
            <h3 className="property-title text-royal-gold">{title}</h3>
          </Link>

          <div className="property-location text-muted">
            <MapPin size={12}/> {location}
          </div>

          <div className="property-lister" style={{ color: listerType?.includes('Builder') ? 'var(--gold)' : 'var(--txt-muted)' }}>
            {listerType?.includes('Builder') ? <Building2 size={11}/> : <User size={11}/>}
            {listerType}
          </div>

          <div className="property-badges">
            {type && <span className="badge type-badge">{type}</span>}
            {displayApproval && displayApproval !== 'N/A' && displayApproval !== 'Pending' && (
              <span className="badge badge-gold"><ShieldCheck size={10}/> {displayApproval}</span>
            )}
            <span className="viewers-chip" style={{ marginLeft:'auto' }}>
              <Users size={10}/> {viewers}
            </span>
          </div>

          <div className="property-features">
            {type !== 'Agriculture' && (
              <>
                <div className="feature">
                  <span className="feature-value">{beds}</span>
                  <span className="feature-label">Beds</span>
                </div>
                <div className="feature-divider"/>
                <div className="feature">
                  <span className="feature-value">{baths}</span>
                  <span className="feature-label">Baths</span>
                </div>
                <div className="feature-divider"/>
              </>
            )}
            <div className="feature">
              <span className="feature-value">{areaSize || sqft || '—'}</span>
              <span className="feature-label">{measurementUnit}</span>
            </div>
            {facing && (
              <>
                <div className="feature-divider"/>
                <div className="feature">
                  <span className="feature-value">{facing}</span>
                  <span className="feature-label">Facing</span>
                </div>
              </>
            )}
          </div>

          {/* Action Row - New 3D Buttons */}
          <div className="property-actions" style={{ transform: 'translateZ(15px)' }}>
            <button
              className="btn-3d action-btn action-btn-call"
              onClick={e => { e.preventDefault(); e.stopPropagation(); onTriggerLead?.('callback'); }}
            >
              <PhoneCall size={13}/> Callback
            </button>
            <button
              className="btn-3d btn-3d-emerald action-btn action-btn-contact"
              onClick={e => { e.preventDefault(); e.stopPropagation(); onTriggerLead?.('contact'); }}
            >
              <Phone size={13}/> Contact
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
