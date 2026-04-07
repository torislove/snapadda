import React, { useState } from 'react';
import { 
  Heart, Share2, Eye, Phone, MessageSquare, ShieldCheck, 
  MapPin, Building2, User, Leaf, Square,
  TreePine, Award, CheckCircle2
} from 'lucide-react';
import './PropertyCard.css';
import { 
  formatSnapAddaPrice, 
  formatLandSize,
  smartAreaConverter 
} from '../../../../client/src/utils/priceUtils';

// Type-specific accent colors (synchronized with client)
const TYPE_COLORS: Record<string, any> = {
  'Agricultural Land': { accent: '#10d98c', bg: 'rgba(16,217,140,0.06)', border: 'rgba(16,217,140,0.2)', icon: <Leaf size={12}/> },
  'Residential Plot':  { accent: '#22d9e0', bg: 'rgba(34,217,224,0.06)', border: 'rgba(34,217,224,0.2)', icon: <Square size={12}/> },
  'Commercial Plot':   { accent: '#f5397b', bg: 'rgba(245,57,123,0.06)', border: 'rgba(245,57,123,0.2)', icon: <Building2 size={12}/> },
  'Apartment':         { accent: '#9b59f5', bg: 'rgba(155,89,245,0.06)', border: 'rgba(155,89,245,0.2)', icon: <Building2 size={12}/> },
  'Villa':             { accent: '#e8b84b', bg: 'rgba(232,184,75,0.06)', border: 'rgba(232,184,75,0.2)', icon: <CheckCircle2 size={12}/> },
  'Independent House': { accent: '#ff8c42', bg: 'rgba(255,140,66,0.06)', border: 'rgba(255,140,66,0.2)', icon: <User size={12}/> },
  'Commercial Space':  { accent: '#f5397b', bg: 'rgba(245,57,123,0.06)', border: 'rgba(245,57,123,0.2)', icon: <Building2 size={12}/> },
  'Farmhouse':         { accent: '#a8ff78', bg: 'rgba(168,255,120,0.06)', border: 'rgba(168,255,120,0.2)', icon: <TreePine size={12}/> },
};
const DEFAULT_COLOR = { accent: '#e8b84b', bg: 'rgba(232,184,75,0.06)', border: 'rgba(232,184,75,0.2)', icon: <Square size={12}/> };

interface LivePreviewCardProps {
  id?: string;
  image?: string;
  images?: string[];
  title?: string;
  price?: string | number;
  location?: string;
  beds?: number | string;
  baths?: number | string;
  areaSize?: number | string;
  sqft?: number | string;
  type?: string;
  purpose?: string;
  measurementUnit?: string;
  approval?: string;
  approvalAuthority?: string;
  facing?: string;
  totalAcres?: number | string;
  pricePerAcre?: number | string;
  bhk?: string;
  floorNo?: string | number;
  totalFloors?: string | number;
  isVerified?: boolean;
  isFeatured?: boolean;
  vastuCompliant?: boolean;
  listerType?: string;
  googleMapsLink?: string;
  createdAt?: string;
  isGated?: boolean;
  constructionStatus?: string;
}

export const LivePreviewCard: React.FC<LivePreviewCardProps> = (props) => {
  const {
    image, images = [], title = 'Property Title', price = 0, location = 'Location', 
    beds, bhk, type = 'Apartment', purpose = 'Sale', measurementUnit = 'Sq.Ft',
    sqft, areaSize, totalAcres, pricePerAcre,
    approval, approvalAuthority, facing,
    isVerified, isFeatured, vastuCompliant, listerType, isGated, constructionStatus
  } = props;

  const [imgIdx, setImgIdx] = useState(0);

  const allImages = (Array.isArray(images) && images.length > 0) 
    ? images 
    : (image ? [image] : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80']);
  
  const mainImage = allImages[imgIdx] || allImages[0];
  const typeStyle = TYPE_COLORS[type] || DEFAULT_COLOR;
  const authority = approval || approvalAuthority;

  // Real-time calculation logic (mirrors client)
  const isAgri = type === 'Agricultural Land';
  const isPlot = type?.includes('Plot');
  const isResidential = ['Apartment', 'Villa', 'Independent House', 'Farmhouse'].includes(type);
  const isCommercial = type === 'Commercial Space';
  const isVastuFacing = facing && ['east', 'north', 'north-east'].includes(facing?.toLowerCase());
  
  const agriTotalValue = (pricePerAcre && totalAcres) ? Math.round(Number(pricePerAcre) * Number(totalAcres)) : 0;
  const gajamInfo = smartAreaConverter(areaSize || 0, (measurementUnit?.toLowerCase()?.includes('yard') ? 'gajam' : measurementUnit?.toLowerCase()) || 'gajam');
  const displayGajam = (isPlot && (measurementUnit === 'Sq.Yards' || !measurementUnit)) ? gajamInfo.gajam : null;
  const displayPrice = (isAgri && agriTotalValue > 0) ? agriTotalValue : price;

  const cycleImage = (e: React.MouseEvent, dir: number) => {
    e.preventDefault(); e.stopPropagation();
    setImgIdx(i => (i + dir + allImages.length) % allImages.length);
  };

  return (
    <div className="pc-card-preview-container" style={{ width: '100%', maxWidth: '360px', margin: '0 auto' }}>
      <div className="pc-card" style={{ 
        '--type-accent': typeStyle.accent, 
        '--type-bg': typeStyle.bg, 
        '--type-border': typeStyle.border 
      } as any}>
        
        {/* IMAGE ZONE */}
        <div className="pc-img-wrap">
          <img src={mainImage} alt={title} className="pc-img" />
          <div className="pc-img-gradient" />

          {/* Price badge */}
          <div className="pc-price-badge">
            <span className="pc-price">{formatSnapAddaPrice(displayPrice)}</span>
            {isAgri && agriTotalValue > 0 && <span className="pc-price-sub">Total Value</span>}
          </div>

          {/* Top left badges */}
          <div className="pc-badges-tl">
            {isFeatured && <span className="pc-badge pc-badge-featured">⭐ Featured</span>}
            <span className="pc-badge pc-badge-new">✨ Live Preview</span>
            {purpose && (
              <span className="pc-badge" style={{ background: purpose === 'Rent' ? '#22d9e0' : '#10d98c', color: '#000', fontWeight: 900 }}>
                {purpose === 'Rent' ? 'FOR RENT' : 'FOR SALE'}
              </span>
            )}
          </div>

          {/* Top right badges */}
          <div className="pc-badges-tr">
            {isVerified && <span className="pc-badge pc-badge-verified"><ShieldCheck size={10}/> Verified</span>}
            {vastuCompliant && <span className="pc-badge pc-badge-vastu">🧭 Vastu</span>}
            {isGated && <span className="pc-badge pc-badge-gated">🔒 Gated</span>}
          </div>

          {/* Image nav arrows */}
          {allImages.length > 1 && (
            <>
              <button className="pc-img-arrow pc-img-arrow-left" onClick={(e) => cycleImage(e, -1)}>‹</button>
              <button className="pc-img-arrow pc-img-arrow-right" onClick={(e) => cycleImage(e, 1)}>›</button>
              <div className="pc-img-dots">
                {allImages.slice(0, 5).map((_, i) => (
                  <span key={i} className={`pc-img-dot ${i === imgIdx ? 'active' : ''}`} />
                ))}
              </div>
            </>
          )}

          {/* Action buttons icon-only mock */}
          <div className="pc-img-actions">
            <div className="pc-action-btn"><Heart size={15} /></div>
            <div className="pc-action-btn"><Share2 size={15} /></div>
          </div>

          <div className="pc-viewers"><Eye size={10}/> 12 viewing</div>
        </div>

        {/* CONTENT ZONE */}
        <div className="pc-content">
          <div className="pc-meta-row">
            <span className="pc-type-pill" style={{ background: typeStyle.bg, border: `1px solid ${typeStyle.border}`, color: typeStyle.accent }}>
              {typeStyle.icon} {type}
            </span>
            {authority && authority !== 'N/A' && (
              <span className="pc-auth-pill"><Award size={10}/> {authority}</span>
            )}
          </div>

          <h2 className="pc-title">{title}</h2>

          <div className="pc-location">
            <MapPin size={11}/> {location}
            {listerType && (
              <span className="pc-lister"> · {listerType}</span>
            )}
          </div>

          {/* Type-Specific Features (exact logic from client) */}
          <div className="pc-features">
            {isAgri && (
              <>
                <div className="pc-feat">
                  <span className="pc-feat-val" style={{ color: typeStyle.accent }}>
                    {totalAcres ? formatLandSize(totalAcres) : (areaSize ? `${areaSize} ${measurementUnit}` : '—')}
                  </span>
                  <span className="pc-feat-lbl">Total Area</span>
                </div>
                {Number(pricePerAcre) > 0 && (
                  <>
                    <div className="pc-feat-div"/>
                    <div className="pc-feat">
                      <span className="pc-feat-val" style={{ color: '#e8b84b' }}>{formatSnapAddaPrice(pricePerAcre)}</span>
                      <span className="pc-feat-lbl">Per Acre</span>
                    </div>
                  </>
                )}
              </>
            )}

            {isPlot && (
              <>
                <div className="pc-feat">
                  <span className="pc-feat-val" style={{ color: typeStyle.accent }}>
                    {displayGajam ? `${displayGajam.toLocaleString('en-IN')}` : (areaSize || '—')}
                  </span>
                  <span className="pc-feat-lbl">{displayGajam ? 'Gajaalu' : (measurementUnit || 'Sq.Yds')}</span>
                </div>
                {facing && (
                  <>
                    <div className="pc-feat-div"/>
                    <div className="pc-feat">
                      <span className="pc-feat-val" style={{ color: isVastuFacing ? '#e8b84b' : 'inherit' }}>
                        {facing} {isVastuFacing && '🧭'}
                      </span>
                      <span className="pc-feat-lbl">Facing</span>
                    </div>
                  </>
                )}
              </>
            )}

            {isResidential && (
              <>
                <div className="pc-feat">
                  <span className="pc-feat-val">{bhk || beds || '—'} <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>BHK</span></span>
                  <span className="pc-feat-lbl">Config</span>
                </div>
                <div className="pc-feat-div"/>
                <div className="pc-feat">
                  <span className="pc-feat-val">{areaSize || sqft || '—'}</span>
                  <span className="pc-feat-lbl">{measurementUnit || 'Sq.Ft'}</span>
                </div>
                {facing && (
                  <>
                    <div className="pc-feat-div"/>
                    <div className="pc-feat">
                      <span className="pc-feat-val">{facing}</span>
                      <span className="pc-feat-lbl">Facing</span>
                    </div>
                  </>
                )}
              </>
            )}

            {isCommercial && (
              <>
                <div className="pc-feat">
                  <span className="pc-feat-val">{areaSize || '—'}</span>
                  <span className="pc-feat-lbl">{measurementUnit || 'Sq.Ft'}</span>
                </div>
                {constructionStatus && (
                   <>
                    <div className="pc-feat-div"/>
                    <div className="pc-feat">
                      <span className="pc-feat-val" style={{ fontSize: '0.7rem' }}>{constructionStatus}</span>
                      <span className="pc-feat-lbl">Status</span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="pc-actions">
            <div className="pc-btn pc-btn-call"><Phone size={13}/> Call</div>
            <div className="pc-btn pc-btn-wa"><MessageSquare size={13}/> WhatsApp</div>
          </div>
        </div>
      </div>
      
      {/* Admin Meta Debug Info */}
      <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)', fontSize: '0.7rem', color: '#9d99c4' }}>
        <p style={{ marginBottom: '4px', fontWeight: 700, color: 'var(--gold)' }}>🛠️ ADMIN PREVIEW DATA</p>
        <p>Type: {type}</p>
        <p>Area: {isAgri ? formatLandSize(totalAcres) : `${areaSize} ${measurementUnit}`}</p>
        <p>Images: {allImages.length} attached</p>
      </div>
    </div>
  );
};
