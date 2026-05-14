import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, MapPin, Building, Leaf, Square,
  CheckCircle2, Edit3, Trash2, Zap, ChevronLeft,
  ChevronRight, Image as ImageIcon, Home as HomeIcon, TrendingUp,
  Clock, Copy, X, Play, BedDouble, EyeOff, CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getEffectivePricePerUnit } from '../../utils/priceUtils';
import HolographicWrapper from './HolographicWrapper';

interface Props {
  prop: any;
  handleEdit: (p: any) => void;
  updateProperty: (id: string, data: any) => Promise<any>;
  deleteProperty: (id: string) => Promise<any>;
  createProperty: (data: any) => Promise<any>;
  loadProperties: () => void;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

const fmt = (p: any) => {
  const val = Number(p);
  if (!val || isNaN(val)) return 'Price on Request';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
  return `₹${val.toLocaleString('en-IN')}`;
};

const validImg = (s: string) =>
  !!s && typeof s === 'string' && s.startsWith('http') && !s.includes('placeholder');

const validVideo = (s: string) =>
  !!s && typeof s === 'string' && s.startsWith('http') &&
  (/\.(mp4|mov|webm|ogg)$/i.test(s) || s.includes('/video/'));

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  Active:  { label: 'ACTIVE',   color: '#10d98c', bg: 'rgba(16,217,140,0.15)' },
  Sold:    { label: 'SOLD',     color: '#e8b84b', bg: 'rgba(232,184,75,0.15)' },
  Pending: { label: 'PENDING',  color: '#f5c842', bg: 'rgba(245,200,66,0.15)' },
  Rented:  { label: 'RENTED',   color: '#22d9e0', bg: 'rgba(34,217,224,0.15)' },
  Draft:   { label: 'DRAFT',    color: '#888',    bg: 'rgba(136,136,136,0.1)' },
};

const getTypeStyle = (t: string) => {
  const low = (t || '').toLowerCase();
  if (low.includes('apartment')) return { icon: <Building size={12}/>, accent: '#9b59f5' };
  if (low.includes('villa')) return { icon: <HomeIcon size={12}/>, accent: '#e8b84b' };
  if (low.includes('crda') || low.includes('plot') || low.includes('layout')) return { icon: <Square size={12}/>, accent: '#22d9e0' };
  if (low.includes('agri') || low.includes('farm')) return { icon: <Leaf size={12}/>, accent: '#10d98c' };
  if (low.includes('house')) return { icon: <HomeIcon size={12}/>, accent: '#ff8c42' };
  return { icon: <Building size={12}/>, accent: '#fff' };
};

const completeness = (p: any) => {
  const checks = [
    !!p.title, !!p.location, !!p.district, !!p.price,
    !!p.type, !!p.areaSize || !!p.totalAcres,
    (p.images||[]).filter(validImg).length > 0,
    !!p.description && p.description.length > 20,
    !!p.address, !!p.purpose,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

export const AdminPropertyCard: React.FC<Props> = ({
  prop, handleEdit, updateProperty, deleteProperty, createProperty,
  loadProperties, selected, onSelect,
}) => {
  const [imgIdx, setImgIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copying, setCopying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const id = prop._id || prop.id;
  const imgs = [...(prop.images||[]), prop.image].filter(validImg).slice(0, 8);
  const vids = [...(prop.videos||[]), prop.videoUrl].filter(validVideo);
  const status = prop.status || 'Active';
  const sc = STATUS[status] || STATUS.Active;
  const score = completeness(prop);
  const typeStyle = getTypeStyle(prop.type);
  const isAgri = ['agricultural land','farmhouse'].some(t => (prop.type||'').toLowerCase().includes(t));
  const isResidential = ['apartment', 'villa', 'independent house'].some(t => (prop.type || '').toLowerCase().includes(t));

  const getOptimizedImg = (url: string, width = 400) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;
    return `${parts[0]}/upload/f_auto,q_auto:good,w_${width},c_fill/${parts[1]}`;
  };

  const daysAgo = prop.createdAt
    ? Math.floor((Date.now() - new Date(prop.createdAt).getTime()) / 86400000)
    : null;

  const startCycle = () => {
    if (imgs.length <= 1) return;
    stopCycle();
    timerRef.current = setInterval(() => {
      setImgIdx(p => (p + 1) % imgs.length);
    }, 2500);
  };

  const stopCycle = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleApprove = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    const loadingToast = toast.loading("Verifying listing...");
    try {
      await updateProperty(id, { verificationStatus: 'Verified', isVerified: true });
      toast.success("Property Verified!", { id: loadingToast });
      loadProperties();
    } catch {
      toast.error("Verification failed", { id: loadingToast });
    } finally { setBusy(false); }
  }, [id, busy, updateProperty, loadProperties]);

  const changeStatus = useCallback(async (newStatus: string) => {
    if (busy) return;
    setBusy(true);
    const loadingToast = toast.loading(`Updating status to ${newStatus}...`);
    try {
      await updateProperty(id, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`, { id: loadingToast });
      loadProperties();
    } catch {
      toast.error("Status update failed", { id: loadingToast });
    } finally { setBusy(false); }
  }, [id, busy, updateProperty, loadProperties]);

  const handleDelete = useCallback(async () => {
    if (deleting) return;
    if (!window.confirm(`Delete property: ${prop.title}?`)) return;
    setDeleting(true);
    const loadingToast = toast.loading("Deleting property...");
    try {
      await deleteProperty(id);
      toast.success("Property Deleted", { id: loadingToast });
      loadProperties(); 
    } catch { 
      toast.error("Delete failed", { id: loadingToast });
      setDeleting(false); 
    }
  }, [id, prop.title, deleteProperty, loadProperties]);

  const handleCopy = useCallback(async () => {
    if (copying || !createProperty) return;
    setCopying(true);
    const loadingToast = toast.loading("Cloning listing...");
    try {
      const { _id, id: _id2, createdAt, likeCount, shareCount, likeLogs, shareLogs, ...rest } = prop;
      await createProperty({ ...rest, title: `[COPY] ${prop.title}`, status: 'Draft' });
      toast.success("Listing Cloned! Look for '[COPY]' title.", { id: loadingToast });
      loadProperties();
    } catch(e) { 
      toast.error("Clone failed", { id: loadingToast });
      console.error(e); 
    } finally { setCopying(false); }
  }, [prop, copying, createProperty, loadProperties]);

  const handleShareLink = useCallback(() => {
    const url = `https://snapadda.com/property/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied to clipboard!");
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast.success("Link copied!");
    });
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }, [id]);

  const handleWhatsAppShare = useCallback(() => {
    const url  = `https://snapadda.com/property/${id}`;
    const code = prop.propertyCode || `SNA-${id.toString().slice(-5).toUpperCase()}`;
    const price = fmt(prop.price);
    const msg  = `🏠 *${prop.title}*\n📍 ${prop.location}, ${prop.district}\n🏷️ Code: *${code}*\n💰 Price: *${price}*\n\n🔗 View Full Details:\n${url}\n\n_Shared via SnapAdda – Andhra's Leading Property Platform_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  }, [id, prop]);

  const scoreColor = score >= 80 ? '#10d98c' : score >= 50 ? '#e8b84b' : '#f5397b';

  const Btn: React.FC<{
    onClick: () => void; icon: React.ReactNode; label: string;
    color?: string; border?: string; textColor?: string;
  }> = ({ onClick, icon, label, color = 'rgba(255,255,255,0.08)', border = 'rgba(255,255,255,0.15)', textColor = 'white' }) => (
        <button onClick={onClick}
      style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, 
        padding: '6px 2px',
        background: color, border: `1px solid ${border}`, borderRadius: 8, color: textColor, backdropFilter: 'blur(10px)',
        cursor: 'pointer', fontSize: '0.6rem', fontWeight: 900, transition: 'all 0.2s', minHeight: '32px',
        touchAction: 'manipulation', width: '100%' 
      }}>
      {icon} {label}
    </button>
  );

  return (
    <>
      <AnimatePresence>
        {lightbox && imgs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999,
              display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={imgs[imgIdx % imgs.length]}
              style={{ maxWidth: '90%', maxHeight: '80%', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}
            />
            
            <div style={{ position: 'absolute', bottom: '40px', display: 'flex', gap: '20px' }}>
              <button onClick={(e) => { e.stopPropagation(); setImgIdx(p => (p - 1 + imgs.length) % imgs.length); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '15px', borderRadius: '50%', cursor: 'pointer' }}>
                <ChevronLeft size={32} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setImgIdx(p => (p + 1) % imgs.length); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '15px', borderRadius: '50%', cursor: 'pointer' }}>
                <ChevronRight size={32} />
              </button>
            </div>
            
            <button onClick={() => setLightbox(false)} style={{ position: 'absolute', top: '40px', right: '40px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={32} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={isMobile ? {} : { y: -8, transition: { duration: 0.3 } }}
        whileTap={{ scale: 0.98 }}
        style={{
          margin: isMobile ? '0 0.5rem 0.75rem' : '0',
          height: isMobile ? 'auto' : '460px',
          minHeight: isMobile ? '340px' : '460px',
        }}
      >
        <HolographicWrapper
          intensity={1.5}
          iridescent={prop.isFeatured}
          tilt={false}
          style={{ height: '100%', borderRadius: isMobile ? 28 : 24 }}
        >
        <div style={{ 
          height: '100%', 
          borderRadius: 'inherit',
          background: '#050a14',
          border: isMobile ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          
          {/* CARD IMAGE CONTAINER */}
          <div style={{ 
            position: isMobile ? 'relative' : 'absolute', 
            inset: isMobile ? 'unset' : 0, 
            height: isMobile ? '160px' : '100%',
            zIndex: 0,
            overflow: 'hidden'
          }} onMouseEnter={startCycle} onMouseLeave={stopCycle}>
            <AnimatePresence initial={false}>
              {imgs.length > 0 ? (
                <motion.img key={imgIdx} src={getOptimizedImg(imgs[imgIdx % imgs.length])}
                  initial={{ opacity: 0.8 }} animate={{ opacity: 1 }}
                  exit={{ opacity: 0.8 }} transition={{ duration: 0.25 }}
                  onClick={() => setLightbox(true)}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                  alt={prop.title}
                  onError={(e: any) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <div style={{ height: '100%', background: '#111', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                  <Building size={44} />
                  <div style={{ fontSize: '0.68rem', marginTop: 8, color: '#aaa' }}>No Images</div>
                </div>
              )}
            </AnimatePresence>

            {/* Holographic Gradient Overlay */}
            <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 25%, transparent 40%, rgba(5,10,20,0.95) 80%, rgba(5,10,20,1) 100%)', zIndex: 1 }} />
            
            {/* Top Bar Badges */}
            <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {imgs.length > 1 && (
                  <div style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', color: 'white', padding: '2px 6px', borderRadius: '8px', fontSize: '0.55rem', fontWeight: 800, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <ImageIcon size={9} /> {(imgIdx % imgs.length) + 1}/{imgs.length}
                  </div>
                )}
                {vids.length > 0 && (
                  <div style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', color: '#22d9e0', padding: '2px 6px', borderRadius: '8px', fontSize: '0.55rem', fontWeight: 800, border: '1px solid rgba(34,217,224,0.3)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Play size={9} fill="#22d9e0" /> VIDEO
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', color: scoreColor, padding: '3px 6px', borderRadius: '6px', fontSize: '0.55rem', fontWeight: 800, border: `1px solid ${scoreColor}44` }}>
                  {score}%
                </div>
                {onSelect && (
                  <div onClick={(e) => { e.stopPropagation(); onSelect(id); }}
                    style={{ width: 22, height: 22, borderRadius: 6, border: selected ? 'none' : '2px solid rgba(255,255,255,0.6)', background: selected ? '#e8b84b' : 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
                    {selected && <CheckCircle2 size={14} color="#07070f" />}
                  </div>
                )}
              </div>
            </div>

            {/* Status Labels Top Right */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end', position: 'absolute', top: 48, right: 12, zIndex: 10 }}>
              <div style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.color}44`, padding: '3px 8px', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.05em', backdropFilter: 'blur(10px)' }}>
                {sc.label}
              </div>
              {prop.isVerified && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(212,175,55,0.15)', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.3)', backdropFilter: 'blur(10px)', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', fontSize: '0.6rem' }}>
                  <ShieldCheck size={10} /> Verified
                </div>
              )}
            </div>

            {/* Completeness Bar */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.05)', zIndex: 10 }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} style={{ height: '100%', background: scoreColor, boxShadow: `0 0 8px ${scoreColor}` }} />
            </div>
          </div>

          {/* CONTENT AREA */}
          <div style={{ 
            position: isMobile ? 'relative' : 'absolute', 
            bottom: 0, left: 0, right: 0, 
            padding: isMobile ? '0.6rem' : '0.8rem', 
            zIndex: 20, 
            display: 'flex', 
            flexDirection: 'column',
            background: isMobile ? '#050a14' : 'transparent',
            marginTop: '0'
          }}>
            
            {/* Price Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 900, color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                  {fmt(prop.price)}
                </span>
                {(() => {
                  const unitPrices: any = getEffectivePricePerUnit(prop);
                  if (unitPrices) {
                    if (isAgri && unitPrices.acre && unitPrices.acre > 0) return <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.8)' }}>{fmt(unitPrices.acre)}/Ac</span>;
                    const isPlot = (prop.type||'').toLowerCase().includes('plot') || (prop.type||'').toLowerCase().includes('crda');
                    if (isPlot && unitPrices.sqYard && unitPrices.sqYard > 0) return <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.8)' }}>{fmt(unitPrices.sqYard)}/SqYd</span>;
                  }
                  return null;
                })()}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'white', fontSize: '0.65rem', fontWeight: 600, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', padding: '3px 8px', borderRadius: '8px' }}>
                <span style={{ color: typeStyle.accent }}>{typeStyle.icon}</span> <span>{prop.type}</span>
              </div>
            </div>

            {/* Title + SNA Code */}
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 800, color: 'white', margin: '0 0 4px 0', lineHeight: 1.2, textShadow: '0 2px 4px rgba(0,0,0,0.8)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{prop.title}</h3>
            
            {/* SNA Property Code with copy */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ background: 'rgba(232,184,75,0.15)', border: '1px solid rgba(232,184,75,0.35)', color: '#e8b84b', padding: '3px 8px', borderRadius: '8px', fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.08em', fontFamily: 'monospace' }}>
                {prop.propertyCode || `SNA-${id.toString().slice(-5).toUpperCase()}`}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const code = prop.propertyCode || `SNA-${id.toString().slice(-5).toUpperCase()}`;
                  navigator.clipboard.writeText(code).catch(() => null);
                }}
                title="Copy property code"
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
              >
                <Copy size={11} />
              </button>
            </div>
            
            {/* Realtor Badge */}
            {prop.realtor?.name && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', padding: '6px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                {prop.realtor.photo ? (
                  <img src={prop.realtor.photo} alt={prop.realtor.name} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--gold)', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(45deg,var(--gold),#f5c842)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.65rem', color: 'black', flexShrink: 0 }}>
                    {prop.realtor.name.charAt(0)}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'white', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{prop.realtor.name}</div>
                  {prop.realtor.agency && <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{prop.realtor.agency}</div>}
                </div>
              </div>
            )}
            {/* Location & Meta */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', textShadow: '0 1px 3px rgba(0,0,0,0.8)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                <MapPin size={12} style={{ color: 'var(--gold)' }} /> {[prop.location, prop.district].filter(Boolean).join(', ')}
              </div>
              {daysAgo !== null && (
                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Clock size={9} /> {daysAgo}d
                </div>
              )}
            </div>


            {/* Advanced Specs Grid */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
               {isResidential && (prop.bhk > 0 || prop.beds > 0) ? (
                 <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.62rem', color: 'white', fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)' }}>
                   <BedDouble size={10} style={{ color: 'var(--gold)' }} /> <span>{prop.bhk || prop.beds} BHK</span>
                 </div>
               ) : null}
               {(prop.areaSize > 0 || prop.totalAcres > 0) && (
                 <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.62rem', color: 'white', fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)' }}>
                   {isAgri ? <Leaf size={10} style={{ color: '#10d98c' }}/> : <Square size={10} style={{ color: '#22d9e0' }}/>} 
                   <span>{isAgri ? `${Number(prop.totalAcres||0).toFixed(2)} Ac` : `${prop.areaSize} ${prop.measurementUnit||'Sq.Yards'}`}</span>
                 </div>
               )}
            </div>

            {/* Action Button Group */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', 
              gap: '6px', 
              borderTop: '1px solid rgba(255,255,255,0.08)', 
              paddingTop: '10px',
              width: '100%'
            }}>
              <Btn onClick={() => handleEdit(prop)} icon={<Edit3 size={12}/>} label="Edit" />
              
              {prop.verificationStatus !== 'Verified' && (
                <Btn 
                  onClick={handleApprove} 
                  icon={<ShieldCheck size={12}/>} 
                  label="Verify"
                  color="rgba(16,217,140,0.08)" 
                  border="rgba(16,217,140,0.2)" 
                  textColor="#10d98c" 
                />
              )}

              <Btn onClick={handleCopy} icon={<Copy size={12}/>} label={copying ? '...' : 'Clone'}
                color="rgba(155,89,245,0.08)" border="rgba(155,89,245,0.2)" textColor="#9b59f5" />
              
              <Btn onClick={handleDelete} icon={<Trash2 size={12}/>} label={deleting ? '...' : 'Delete'}
                color="rgba(245,57,123,0.08)" border="rgba(245,57,123,0.2)" textColor="#f5397b" />
              
              {/* Status Management Toggles */}
              {prop.status === 'Active' && (
                <>
                  <Btn 
                    onClick={() => changeStatus('Sold')} 
                    icon={<CheckCircle size={12}/>} 
                    label="Sold"
                    color="rgba(232,184,75,0.08)" 
                    border="rgba(232,184,75,0.2)" 
                    textColor="#e8b84b" 
                  />
                  <Btn 
                    onClick={() => changeStatus('Pending')} 
                    icon={<EyeOff size={12}/>} 
                    label="Hide"
                    color="rgba(255,255,255,0.04)" 
                    border="rgba(255,255,255,0.1)" 
                    textColor="#aaa" 
                  />
                </>
              )}

              {prop.status === 'Sold' && (
                <Btn 
                  onClick={() => changeStatus('Active')} 
                  icon={<TrendingUp size={12}/>} 
                  label="Re-list"
                  color="rgba(16,217,140,0.08)" 
                  border="rgba(16,217,140,0.2)" 
                  textColor="#10d98c" 
                />
              )}

              {(prop.status === 'Pending' || prop.status === 'Draft') && (
                <Btn 
                  onClick={() => changeStatus('Active')} 
                  icon={<Play size={12}/>} 
                  label="Live"
                  color="rgba(16,217,140,0.08)" 
                  border="rgba(16,217,140,0.2)" 
                  textColor="#10d98c" 
                />
              )}

              <Btn
                onClick={handleWhatsAppShare}
                icon={<span style={{ fontSize: '10px' }}>📱</span>}
                label="WA"
                color="rgba(37,211,102,0.06)" border="rgba(37,211,102,0.2)" textColor="#25d366"
              />

              <button
                onClick={handleShareLink}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  padding: '8px 2px', background: linkCopied ? 'rgba(16,217,140,0.1)' : 'rgba(232,184,75,0.08)',
                  border: `1px solid ${linkCopied ? 'rgba(16,217,140,0.25)' : 'rgba(232,184,75,0.2)'}`,
                  borderRadius: 10, color: linkCopied ? '#10d98c' : '#e8b84b',
                  fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer', backdropFilter: 'blur(10px)', transition: 'all 0.2s', minHeight: '38px' 
                }}
              >
                <Zap size={11} fill={linkCopied ? '#10d98c' : '#e8b84b'}/>
                {linkCopied ? 'Done' : 'Link'}
              </button>
            </div>

            <a href={`https://snapadda.com/property/${id}`} target="_blank" rel="noopener noreferrer"
              style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 4, padding: '6px', background: 'rgba(34,217,224,0.08)', 
                border: '1px solid rgba(34,217,224,0.25)',
                borderRadius: 10, color: '#22d9e0', fontSize: '0.65rem', 
                fontWeight: 900, textDecoration: 'none', minHeight: '34px',
                marginTop: '8px', transition: 'all 0.2s'
              }}>
              🖥 Client View
            </a>
          </div>
        </div>
        </HolographicWrapper>
      </motion.div>
    </>
  );
};

export default AdminPropertyCard;
