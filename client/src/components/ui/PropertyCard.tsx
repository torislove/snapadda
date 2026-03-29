import { Phone, PhoneCall, ShieldCheck, Compass, MapPin, Expand, Search, Flame, Users, Zap, Building2, User, ImageOff } from 'lucide-react';
import { Button } from './Button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './PropertyCard.css';

interface PropertyCardProps {
  id?: string;
  _id?: string;
  image?: string;
  images?: string[];
  title: string;
  price: string;
  location: string;
  beds: number;
  baths: number;
  sqft?: number;
  type?: string;
  condition?: string;
  facing?: string;
  approval?: string;
  approvalAuthority?: string;
  measurementUnit?: string;
  areaSize?: number;
  isVerified?: boolean;
  listerType?: string;
  createdAt?: string;
  onTriggerLead?: (type: 'callback' | 'contact') => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  _id,
  image,
  images,
  title,
  price,
  location,
  beds,
  baths,
  sqft,
  type,
  condition,
  facing = 'Any',
  approval,
  approvalAuthority,
  measurementUnit = 'Sq.Ft',
  areaSize,
  isVerified = false,
  listerType = 'Individual Owner',
  createdAt,
  onTriggerLead
}) => {
  const propertyId = id || _id;
  const displayApproval = approval || approvalAuthority;
  const displayImage = image || (images && images.length > 0 ? images[0] : null);

  // FOMO Logic using stable hash
  const isHot = propertyId ? propertyId.charCodeAt(0) % 2 === 0 : false;
  const isSellingFast = propertyId ? propertyId.charCodeAt(propertyId.length - 1) % 3 === 0 : false;
  const viewers = propertyId ? (propertyId.charCodeAt(1 % propertyId.length) % 12) + 3 : 5;

  // Check if recently added (< 7 days)
  const isNew = createdAt ? (Date.now() - new Date(createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000 : false;

  return (
    <motion.div
      className="property-card"
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Link to={propertyId ? `/property/${propertyId}` : '#'} className="property-card-link">
        <div className="property-image-container relative">
          {displayImage ? (
            <img src={displayImage} alt={title} className="property-image" loading="lazy" />
          ) : (
            <div className="property-no-image">
              <ImageOff size={32} />
            </div>
          )}
          <div className="property-price-tag">{price}</div>

          {/* Trust & Vastu Badges */}
          <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 10, alignItems: 'flex-end' }}>
            {displayApproval && displayApproval !== 'N/A' && displayApproval !== 'Pending' && (
              <div style={{ background: 'rgba(201, 168, 76, 0.95)', color: '#111', padding: '3px 10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', fontWeight: 700 }}>
                <ShieldCheck size={11} /> {displayApproval}
              </div>
            )}
            {facing && facing !== 'Any' && (
              <div style={{ background: 'rgba(0, 0, 0, 0.7)', color: '#c9a84c', padding: '3px 10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', fontWeight: 600, border: '1px solid rgba(201,168,76,0.4)' }}>
                <Compass size={11} /> {facing}
              </div>
            )}
          </div>

          {/* FOMO */}
          <div style={{ position: 'absolute', bottom: '12px', right: '12px', zIndex: 10 }}>
            {isHot ? (
              <div style={{ background: 'rgba(231, 76, 60, 0.9)', color: 'white', padding: '3px 10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', fontWeight: 700, animation: 'pulse 2s infinite' }}>
                <Flame size={11} /> Hot Property
              </div>
            ) : isSellingFast ? (
              <div style={{ background: 'rgba(241, 196, 15, 0.9)', color: '#111', padding: '3px 10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', fontWeight: 700 }}>
                <Zap size={11} /> Fast Selling
              </div>
            ) : null}
          </div>

          {/* Verified Badge */}
          {isVerified && (
            <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(46, 204, 113, 0.9)', color: 'white', padding: '3px 10px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', fontWeight: 700 }}>
              <ShieldCheck size={12} /> Verified
            </div>
          )}

          {/* New Listing Badge */}
          {isNew && (
            <div style={{ position: 'absolute', top: isVerified ? '36px' : '12px', left: '12px', background: 'rgba(201, 168, 76, 0.9)', color: '#111', padding: '3px 10px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', fontWeight: 700 }}>
              New
            </div>
          )}

          <div className="property-image-overlay">
            <span className="view-details-btn"><Search size={14} /> View Details</span>
          </div>
        </div>
      </Link>

      <div className="property-content">
        <Link to={propertyId ? `/property/${propertyId}` : '#'} className="property-title-link">
          <h3 className="property-title">{title}</h3>
        </Link>
        <p className="property-location text-muted" style={{ marginBottom: '6px' }}>
          <MapPin size={13} /> {location}
        </p>

        {/* Lister Type */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px', fontSize: '0.72rem', color: listerType === 'Verified Builder' ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
          {listerType === 'Verified Builder' ? <Building2 size={11} /> : <User size={11} />}
          {listerType}
        </div>

        <div className="property-badges">
          {type && <span className="badge type-badge">{type}</span>}
          {condition && condition !== 'N/A' && <span className="badge condition-badge">{condition}</span>}
          {viewers > 0 && (
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', marginLeft: 'auto' }}>
              <Users size={11} /> {viewers} viewing
            </span>
          )}
        </div>

        <div className="property-features">
          {type !== 'Agriculture' && (
            <>
              <div className="feature">
                <span className="feature-value">{beds}</span>
                <span className="feature-label">Beds</span>
              </div>
              <div className="feature-divider"></div>
              <div className="feature">
                <span className="feature-value">{baths}</span>
                <span className="feature-label">Baths</span>
              </div>
              <div className="feature-divider"></div>
            </>
          )}
          <div className="feature">
            <span className="feature-value">
              <Expand size={11} /> {areaSize || sqft}
            </span>
            <span className="feature-label">{measurementUnit}</span>
          </div>
        </div>

        <div className="property-actions">
          <Button variant="primary" className="action-btn" size="sm" onClick={(e: any) => { e.preventDefault(); e.stopPropagation(); onTriggerLead?.('callback'); }}>
            <PhoneCall size={14} className="mr-2" /> Callback
          </Button>
          <Button variant="outline" className="action-btn" size="sm" onClick={(e: any) => { e.preventDefault(); e.stopPropagation(); onTriggerLead?.('contact'); }}>
            <Phone size={14} className="mr-2" /> Contact
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
