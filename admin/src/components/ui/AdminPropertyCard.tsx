import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, MapPin, Building2, Leaf, Square,
  Compass, CheckCircle2, Edit3, Trash2, Zap, ChevronLeft,
  ChevronRight, Image as ImageIcon, Home as HomeIcon, TrendingUp,
  Clock, Copy, X, Play, BedDouble
} from 'lucide-react';
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

const fmt = (p: number) => {
  if (!p) return 'Price on Request';
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
  return `₹${p.toLocaleString('en-IN')}`;
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
  if (low.includes('apartment')) return { icon: <Building2 size={12}/>, accent: '#9b59f5' };
  if (low.includes('villa')) return { icon: <HomeIcon size={12}/>, accent: '#e8b84b' };
  if (low.includes('crda') || low.includes('plot') || low.includes('layout')) return { icon: <Square size={12}/>, accent: '#22d9e0' };
  if (low.includes('agri') || low.includes('farm')) return { icon: <Leaf size={12}/>, accent: '#10d98c' };
  if (low.includes('house')) return { icon: <HomeIcon size={12}/>, accent: '#ff8c42' };
  return { icon: <Building2 size={12}/>, accent: '#fff' };
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
  const timerRef = useRef<any>(null);

  const id = prop._id || prop.id;
  const imgs = [...(prop.images||[]), prop.image].filter(validImg).slice(0, 8);
  const vids = [...(prop.videos||[]), prop.videoUrl].filter(validVideo);
  const status = prop.status || 'Active';
  const sc = STATUS[status] || STATUS.Active;
  const score = completeness(prop);
  const typeStyle = getTypeStyle(prop.type);
  const isAgri = ['agricultural land','farmhouse'].some(t => (prop.type||'').toLowerCase().includes(t));
  const isResidential = ['apartment', 'villa', 'independent house'].some(t => (prop.type || '').toLowerCase().includes(t));

  const daysAgo = prop.createdAt
    ? Math.floor((Date.now() - new Date(prop.createdAt).getTime()) / 86400000)
    : null;

  const startCycle = () => {
    if (imgs.length > 1)
      timerRef.current = setInterval(() => setImgIdx(p => (p+1) % imgs.length), 1800);
  };
  const stopCycle = () => { clearInterval(timerRef.current); setImgIdx(0); };

  const changeStatus = useCallback(async (s: string) => {
    if (busy) return;
    setBusy(true);
    try { await updateProperty(id, { status: s }); loadProperties(); }
    finally { setBusy(false); }
  }, [id, busy, updateProperty, loadProperties]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm(`Delete "${prop.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try { await deleteProperty(id); loadProperties(); }
    catch { setDeleting(false); }
  }, [id, prop.title, deleteProperty, loadProperties]);

  const handleCopy = useCallback(async () => {
    if (copying || !createProperty) return;
    setCopying(true);
    try {
      const { _id, id: _id2, createdAt, likeCount, shareCount, likeLogs, shareLogs, ...rest } = prop;
      await createProperty({ ...rest, title: `[COPY] ${prop.title}`, status: 'Draft' });
      loadProperties();
    } catch(e) { console.error(e); }
    finally { setCopying(false); }
  }, [prop, copying, createProperty, loadProperties]);

  const scoreColor = score >= 80 ? '#10d98c' : score >= 50 ? '#e8b84b' : '#f5397b';
  const isMobile = window.innerWidth <= 600;

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
            <button onClick={() => setLightbox(false)}
              style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)',
                border: 'none', borderRadius: '50%', padding: 10, color: 'white', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setImgIdx(p => (p - 1 + imgs.length) % imgs.length); }}
              style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.1)', border: 'none',
                borderRadius: '50%', padding: 14, color: 'white', cursor: 'pointer' }}>
              <ChevronLeft size={22} />
            </button>
            <img src={imgs[imgIdx % imgs.length]} onClick={e => e.stopPropagation()}
              style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 12,
                boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }} alt="" />
            <button onClick={(e) => { e.stopPropagation(); setImgIdx(p => (p + 1) % imgs.length); }}
              style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.1)', border: 'none',
                borderRadius: '50%', padding: 14, color: 'white', cursor: 'pointer' }}>
              <ChevronRight size={22} />
            </button>
            <div style={{ position: 'absolute', bottom: 20, display: 'flex', gap: 8 }}>
              {imgs.map((_, i) => (
                <div key={i} onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
                  style={{ width: imgIdx === i ? 24 : 8, height: 8, borderRadius: 4, cursor: 'pointer',
                    background: imgIdx === i ? '#e8b84b' : 'rgba(255,255,255,0.4)', transition: 'all 0.3s' }} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileTap={{ scale: 0.98 }}
        style={{
          margin: isMobile ? '0 4px' : '0',
          height: isMobile ? '460px' : '520px', // Slightly taller for Admin to fit actions
          perspective: 1000
        }}
      >
        <HolographicWrapper
          intensity={1.5}
          iridescent={prop.isFeatured}
          tilt={!isMobile}
          style={{ height: '100%', borderRadius: isMobile ? 28 : 24 }}
        >
        <div style={{ 
          height: '100%', 
          borderRadius: 'inherit',
          background: '#050a14',
          border: isMobile ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}>
          
          {/* FULL BLEED BACKGROUND IMAGE */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }} onMouseEnter={startCycle} onMouseLeave={stopCycle}>
            <AnimatePresence initial={false}>
              {imgs.length > 0 ? (
                <motion.img key={imgIdx} src={imgs[imgIdx % imgs.length]}
                  initial={{ opacity: 0.8 }} animate={{ opacity: 1 }}
                  exit={{ opacity: 0.8 }} transition={{ duration: 0.25 }}
                  onClick={() => setLightbox(true)}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                  alt={prop.title}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <div style={{ height: '100%', background: '#111', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                  <Building2 size={44} />
                  <div style={{ fontSize: '0.68rem', marginTop: 8, color: '#aaa' }}>No Images</div>
                </div>
              )}
            </AnimatePresence>

            {/* Holographic Gradient Overlay */}
            <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 25%, transparent 40%, rgba(5,10,20,0.95) 80%, rgba(5,10,20,1) 100%)', zIndex: 1 }} />
            
            {/* Top Bar Badges */}
            <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {imgs.length > 1 && (
                  <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: 'white', padding: '4px 10px', borderRadius: '14px', fontSize: '0.65rem', fontWeight: 800, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ImageIcon size={10} /> {(imgIdx % imgs.length) + 1}/{imgs.length}
                  </div>
                )}
                {vids.length > 0 && (
                  <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: '#22d9e0', padding: '4px 10px', borderRadius: '14px', fontSize: '0.65rem', fontWeight: 800, border: '1px solid rgba(34,217,224,0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Play size={10} fill="#22d9e0" /> VIDEO
                  </div>
                )}
              </div>

              {/* Admin Select & Score */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: scoreColor, padding: '4px 8px', borderRadius: '8px', fontSize: '0.6rem', fontWeight: 800, border: `1px solid ${scoreColor}44` }}>
                  {score}% HEALTH
                </div>
                {onSelect && (
                  <div onClick={(e) => { e.stopPropagation(); onSelect(id); }}
                    style={{ width: 24, height: 24, borderRadius: 6, border: selected ? 'none' : '2px solid rgba(255,255,255,0.6)', background: selected ? '#e8b84b' : 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
                    {selected && <CheckCircle2 size={16} color="#07070f" />}
                  </div>
                )}
              </div>
            </div>

            {/* Status Labels Top Right below Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', position: 'absolute', top: 60, right: 16, zIndex: 10 }}>
              <div style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.color}44`, padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em', backdropFilter: 'blur(10px)' }}>
                {sc.label}
              </div>
              {prop.isVerified && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(212,175,55,0.15)', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.3)', backdropFilter: 'blur(10px)', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem' }}>
                  <ShieldCheck size={12} /> Verified
                </div>
              )}
            </div>

            {/* Completeness Bar at bottom of image overlay */}
            <div style={{ position: 'absolute', bottom: '170px', left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.05)', zIndex: 10 }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} style={{ height: '100%', background: scoreColor, boxShadow: `0 0 8px ${scoreColor}` }} />
            </div>
          </div>

          {/* FLOATING CONTENT AT BOTTOM */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.25rem', zIndex: 20, display: 'flex', flexDirection: 'column' }}>
            
            {/* Price Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 900, color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                  {fmt(prop.price)}
                </span>
                {isAgri && prop.pricePerAcre > 0 && <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>{fmt(prop.pricePerAcre)}/Ac</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'white', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', padding: '4px 10px', borderRadius: '12px' }}>
                <span style={{ color: typeStyle.accent }}>{typeStyle.icon}</span> <span>{prop.type}</span>
                {prop.purpose && <span style={{ marginLeft: '4px', color: prop.purpose === 'Rent' ? '#22d9e0' : '#10d98c' }}>{prop.purpose}</span>}
              </div>
            </div>

            {/* Title */}
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '1.05rem', fontWeight: 800, color: 'white', margin: '0 0 4px 0', lineHeight: 1.3, textShadow: '0 2px 4px rgba(0,0,0,0.8)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{prop.title}</h3>
            
            {/* Location & Meta */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', textShadow: '0 1px 3px rgba(0,0,0,0.8)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                <MapPin size={14} style={{ color: 'var(--gold)' }} /> {[prop.location, prop.district].filter(Boolean).join(', ')}
              </div>
              {daysAgo !== null && (
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Clock size={10} /> {daysAgo}d
                </div>
              )}
            </div>

            {/* Advanced Specs Grid */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
               {isResidential && (prop.bhk > 0 || prop.beds > 0) ? (
                 <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', padding: '4px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'white', fontWeight: 600 }}>
                   <BedDouble size={12} style={{ color: 'var(--gold)' }} /> <span>{prop.bhk || prop.beds} BHK</span>
                 </div>
               ) : null}
               {(prop.areaSize > 0 || prop.totalAcres > 0) && (
                 <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', padding: '4px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'white', fontWeight: 600 }}>
                   {isAgri ? <Leaf size={12} style={{ color: '#10d98c' }}/> : <Square size={12} style={{ color: '#22d9e0' }}/>} 
                   <span>{isAgri ? `${Number(prop.totalAcres||0).toFixed(2)} Ac` : `${prop.areaSize} ${prop.measurementUnit||'Sq.Ft'}`}</span>
                 </div>
               )}
               {prop.facing && !['Any','N/A'].includes(prop.facing) && (
                 <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', padding: '4px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'white', fontWeight: 600 }}>
                   <Compass size={12} style={{ color: 'var(--gold)' }} /> <span>{prop.facing}</span>
                 </div>
               )}
            </div>

            {/* Admin Actions Overlay Block */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
              <Btn onClick={() => handleEdit(prop)} icon={<Edit3 size={13}/>} label="Edit" />
              
              <Btn onClick={handleCopy} icon={<Copy size={13}/>} label={copying ? '...' : 'Copy'}
                color="rgba(155,89,245,0.1)" border="rgba(155,89,245,0.3)" textColor="#9b59f5" />
              
              <Btn onClick={handleDelete} icon={<Trash2 size={13}/>} label={deleting ? '...' : 'Del'}
                color="rgba(245,57,123,0.1)" border="rgba(245,57,123,0.3)" textColor="#f5397b" />
              
              {status !== 'Sold' ? (
                <Btn onClick={() => changeStatus('Sold')} icon={<CheckCircle2 size={13}/>} label="Set Sold"
                  color="rgba(16,217,140,0.1)" border="rgba(16,217,140,0.3)" textColor="#10d98c" />
              ) : (
                <Btn onClick={() => changeStatus('Active')} icon={<TrendingUp size={13}/>} label="Set Live"
                  color="rgba(232,184,75,0.1)" border="rgba(232,184,75,0.3)" textColor="#e8b84b" />
              )}
              
              <a href={`https://snapadda-7a6e6.web.app/property/${id}`} target="_blank" rel="noopener noreferrer"
                style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 5, padding: '8px', background: 'rgba(232,184,75,0.15)', border: '1px solid rgba(232,184,75,0.3)', backdropFilter: 'blur(10px)',
                  borderRadius: 12, color: '#e8b84b', fontSize: '0.75rem', fontWeight: 800, textDecoration: 'none' }}>
                <Zap size={14} fill="#e8b84b"/> View Live Listing
              </a>
            </div>
          </div>
        </div>
        </HolographicWrapper>
      </motion.div>
    </>
  );
};

const Btn: React.FC<{
  onClick: () => void; icon: React.ReactNode; label: string;
  color?: string; border?: string; textColor?: string;
}> = ({ onClick, icon, label, color = 'rgba(255,255,255,0.1)', border = 'rgba(255,255,255,0.2)', textColor = 'white' }) => (
  <button onClick={onClick}
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 4px',
      background: color, border: `1px solid ${border}`, borderRadius: 12, color: textColor, backdropFilter: 'blur(10px)',
      cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800, transition: 'all 0.2s' }}>
    {icon} {label}
  </button>
);

export default AdminPropertyCard;
