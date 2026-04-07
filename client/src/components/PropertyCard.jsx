import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Share2, Eye, Phone, MessageSquare, ShieldCheck, Flame,
  MapPin, Building2, User, Leaf, BedDouble, Bath, Square,
  Compass, IndianRupee, CheckCircle2, Award, TreePine
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { likeProperty, shareProperty } from '../services/api';
import { useTranslation } from 'react-i18next';
import { formatSnapAddaPrice, formatLandSize } from '../utils/priceUtils';

// Type-specific accent colors
const TYPE_COLORS = {
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

function Toast({ msg, onDone }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      onAnimationComplete={onDone}
      style={{
        position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(10,10,20,0.95)', border: '1px solid rgba(232,184,75,0.3)',
        color: '#e8b84b', padding: '10px 20px', borderRadius: '30px',
        fontSize: '0.82rem', fontWeight: 700, zIndex: 99999,
        backdropFilter: 'blur(20px)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        whiteSpace: 'nowrap',
      }}
    >
      {msg}
    </motion.div>
  );
}

export default function PropertyCard({
  id, _id, image, images, title, price, location, beds, baths, sqft,
  type = 'Apartment', purpose, measurementUnit = 'Sq.Yds', approval, approvalAuthority, facing,
  areaSize, totalAcres, pricePerAcre, bhk, floorNo, totalFloors,
  isVerified = false, isFeatured = false, vastuCompliant = false,
  listerType = 'Individual Owner', googleMapsLink = '',
  createdAt, likeCount: initialLikeCount = 0, initialLiked = false,
  isGated, cornerProperty, constructionStatus,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const propertyId = id || _id;
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [toast, setToast] = useState('');
  const [imgIdx, setImgIdx] = useState(0);
  const imgRef = useRef(null);

  const allImages = Array.isArray(images) && images.length > 0
    ? images : (image ? [image] : []);
  const mainImage = allImages[imgIdx] || null;
  const authority = approval || approvalAuthority;
  const typeStyle = TYPE_COLORS[type] || DEFAULT_COLOR;

  // Derivative flags
  const isAgri = type === 'Agricultural Land';
  const isPlot = type?.includes('Plot');
  const isResidential = ['Apartment', 'Villa', 'Independent House', 'Farmhouse'].includes(type);
  const isCommercial = type === 'Commercial Space';
  const isVastuFacing = facing && ['east', 'north', 'north-east'].includes(facing?.toLowerCase());
  const isNew = createdAt ? (Date.now() - new Date(createdAt).getTime() < 10080 * 60 * 1000) : false;
  const viewers = propertyId ? (propertyId.charCodeAt(0) % 12) + 3 : 7;

  // Agriculture calcs
  const pricePerCent = pricePerAcre ? Math.round(Number(pricePerAcre) / 100) : 0;
  const agriTotalValue = (pricePerAcre && totalAcres) ? Math.round(Number(pricePerAcre) * Number(totalAcres)) : 0;

  // Effective display price
  const displayPrice = (isAgri && agriTotalValue > 0) ? agriTotalValue : price;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleLike = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { navigate('/login', { state: { from: window.location.pathname } }); return; }
    try {
      const res = await likeProperty(propertyId, user._id || user.id);
      if (res.status === 'success') {
        setLiked(res.data.liked);
        setLikeCount(res.data.likeCount);
        showToast(res.data.liked ? '❤️ Saved to favourites' : '💔 Removed from saved');
      }
    } catch { showToast('⚠️ Could not save — try again'); }
  };

  const handleShare = async (e) => {
    e.preventDefault(); e.stopPropagation();
    const url = `${window.location.origin}/property/${propertyId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `SnapAdda: ${title}`, text: `Check this property in ${location}`, url });
        await shareProperty(propertyId, 'native', user?._id);
      } else {
        await navigator.clipboard.writeText(url);
        showToast('🔗 Link copied!');
        await shareProperty(propertyId, 'clipboard', user?._id);
      }
    } catch { showToast('🔗 Link copied!'); }
  };

  const cycleImage = (e, dir) => {
    e.preventDefault(); e.stopPropagation();
    setImgIdx(i => (i + dir + allImages.length) % allImages.length);
  };

  return (
    <>
      <AnimatePresence>{toast && <Toast msg={toast} onDone={() => setToast('')} />}</AnimatePresence>
      <motion.article
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ type: 'spring', stiffness: 100, damping: 18 }}
        style={{ width: '100%', height: '100%' }}
      >
        <div className="pc-card" style={{ '--type-accent': typeStyle.accent, '--type-bg': typeStyle.bg, '--type-border': typeStyle.border }}>
          
          {/* ── IMAGE ZONE ── */}
          <Link to={propertyId ? `/property/${propertyId}` : '#'} className="pc-img-link" tabIndex={-1}>
            <div className="pc-img-wrap" ref={imgRef}>
              {mainImage ? (
                <img src={mainImage} alt={`${title} - ${location}`} className="pc-img" loading="lazy" />
              ) : (
                <div className="pc-img-empty"><Building2 size={40} style={{ opacity: 0.3 }} /></div>
              )}
              <div className="pc-img-gradient" />

              {/* Price badge */}
              <div className="pc-price-badge">
                <span className="pc-price">{formatSnapAddaPrice(displayPrice)}</span>
                {isAgri && agriTotalValue > 0 && <span className="pc-price-sub">Total Value</span>}
              </div>

              {/* Top left badges */}
              <div className="pc-badges-tl">
                {isFeatured && <span className="pc-badge pc-badge-featured">⭐ Featured</span>}
                {isNew && <span className="pc-badge pc-badge-new">✨ New</span>}
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

              {/* Image nav arrows (only if multiple images) */}
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

              {/* Action buttons on image */}
              <div className="pc-img-actions">
                <button className={`pc-action-btn ${liked ? 'liked' : ''}`} onClick={handleLike} title="Save">
                  <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
                  {likeCount > 0 && <span className="pc-action-count">{likeCount}</span>}
                </button>
                <button className="pc-action-btn" onClick={handleShare} title="Share">
                  <Share2 size={15} />
                </button>
                {googleMapsLink && (
                  <a href={googleMapsLink} target="_blank" rel="noopener noreferrer"
                    className="pc-action-btn pc-action-map" onClick={e => e.stopPropagation()} title="View on Map">
                    <MapPin size={15} />
                  </a>
                )}
              </div>

              {/* Hover overlay */}
              <Link to={propertyId ? `/property/${propertyId}` : '#'} className="pc-hover-overlay">
                <span className="pc-view-btn"><Eye size={13}/> View Details</span>
              </Link>

              {/* Viewer count */}
              <span className="pc-viewers"><Eye size={10}/> {viewers} viewing</span>
            </div>
          </Link>

          {/* ── CONTENT ZONE ── */}
          <div className="pc-content">
            {/* Type pill + location */}
            <div className="pc-meta-row">
              <span className="pc-type-pill" style={{ background: typeStyle.bg, border: `1px solid ${typeStyle.border}`, color: typeStyle.accent }}>
                {typeStyle.icon} {type}
              </span>
              {authority && authority !== 'N/A' && (
                <span className="pc-auth-pill"><Award size={10}/> {authority}</span>
              )}
            </div>

            {/* Title */}
            <Link to={propertyId ? `/property/${propertyId}` : '#'} className="pc-title-link">
              <h2 className="pc-title">{title}</h2>
            </Link>

            {/* Location */}
            <div className="pc-location">
              <MapPin size={11}/> {location}
              {listerType && (
                <span className="pc-lister" style={{ color: listerType.includes('Builder') ? 'var(--gold)' : 'var(--txt-muted)' }}>
                  · {listerType.includes('Builder') ? '🏗️' : '👤'} {listerType}
                </span>
              )}
            </div>

            {/* ── TYPE-SPECIFIC FEATURES ── */}
            <div className="pc-features">

              {/* AGRICULTURAL LAND */}
              {isAgri && (
                <>
                  <div className="pc-feat">
                    <span className="pc-feat-val" style={{ color: typeStyle.accent }}>
                      {totalAcres ? formatLandSize(totalAcres) : (areaSize ? `${areaSize} ${measurementUnit}` : '—')}
                    </span>
                    <span className="pc-feat-lbl">Total Area</span>
                  </div>
                  {pricePerAcre > 0 && (
                    <>
                      <div className="pc-feat-div"/>
                      <div className="pc-feat">
                        <span className="pc-feat-val" style={{ color: 'var(--gold)' }}>{formatSnapAddaPrice(pricePerAcre)}</span>
                        <span className="pc-feat-lbl">Per Acre</span>
                      </div>
                    </>
                  )}
                  {pricePerCent > 0 && (
                    <>
                      <div className="pc-feat-div"/>
                      <div className="pc-feat">
                        <span className="pc-feat-val" style={{ color: '#a8ff78', fontSize: '0.78rem' }}>₹{pricePerCent.toLocaleString('en-IN')}</span>
                        <span className="pc-feat-lbl">Per Cent</span>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* RESIDENTIAL PLOT / COMMERCIAL PLOT */}
              {isPlot && (
                <>
                  <div className="pc-feat">
                    <span className="pc-feat-val" style={{ color: typeStyle.accent }}>{areaSize || '—'}</span>
                    <span className="pc-feat-lbl">{measurementUnit || 'Sq.Yds'}</span>
                  </div>
                  {facing && (
                    <>
                      <div className="pc-feat-div"/>
                      <div className="pc-feat">
                        <span className="pc-feat-val" style={{ color: isVastuFacing ? 'var(--gold)' : 'inherit' }}>
                          {facing} {isVastuFacing && '🧭'}
                        </span>
                        <span className="pc-feat-lbl" style={{ color: isVastuFacing ? 'var(--gold)' : undefined }}>Facing</span>
                      </div>
                    </>
                  )}
                  {constructionStatus && constructionStatus !== 'N/A' && (
                    <>
                      <div className="pc-feat-div"/>
                      <div className="pc-feat">
                        <span className="pc-feat-val" style={{ fontSize: '0.74rem' }}>{constructionStatus}</span>
                        <span className="pc-feat-lbl">Status</span>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* APARTMENT / VILLA / HOUSE */}
              {isResidential && (
                <>
                  {(beds || bhk) && (
                    <>
                      <div className="pc-feat">
                        <span className="pc-feat-val">{bhk || beds} <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>BHK</span></span>
                        <span className="pc-feat-lbl">Config</span>
                      </div>
                      <div className="pc-feat-div"/>
                    </>
                  )}
                  {baths > 0 && (
                    <>
                      <div className="pc-feat">
                        <span className="pc-feat-val">{baths}</span>
                        <span className="pc-feat-lbl">Baths</span>
                      </div>
                      <div className="pc-feat-div"/>
                    </>
                  )}
                  <div className="pc-feat">
                    <span className="pc-feat-val">{areaSize || sqft || '—'}</span>
                    <span className="pc-feat-lbl">{measurementUnit || 'Sq.Ft'}</span>
                  </div>
                  {facing && (
                    <>
                      <div className="pc-feat-div"/>
                      <div className="pc-feat">
                        <span className="pc-feat-val" style={{ color: isVastuFacing ? 'var(--gold)' : 'inherit' }}>
                          {facing} {isVastuFacing && '🧭'}
                        </span>
                        <span className="pc-feat-lbl" style={{ color: isVastuFacing ? 'var(--gold)' : undefined }}>Facing</span>
                      </div>
                    </>
                  )}
                  {floorNo > 0 && (
                    <>
                      <div className="pc-feat-div"/>
                      <div className="pc-feat">
                        <span className="pc-feat-val">{floorNo}/{totalFloors}</span>
                        <span className="pc-feat-lbl">Floor</span>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* COMMERCIAL SPACE */}
              {isCommercial && (
                <>
                  <div className="pc-feat">
                    <span className="pc-feat-val" style={{ color: typeStyle.accent }}>{areaSize || '—'}</span>
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
                  {constructionStatus && constructionStatus !== 'N/A' && (
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

            {/* ── ACTIONS ── */}
            <div className="pc-actions">
              <a
                href="tel:+919346793364"
                className="pc-btn pc-btn-call"
                style={{ textDecoration: 'none' }}
              >
                <Phone size={13}/> Call Now
              </a>
              <a
                href={`https://wa.me/919346793364?text=${encodeURIComponent(`Hi SnapAdda! I'm interested in "${title}" in ${location}. Please share details.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pc-btn pc-btn-wa"
                style={{ textDecoration: 'none' }}
              >
                <MessageSquare size={13}/> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </motion.article>
    </>
  );
}
