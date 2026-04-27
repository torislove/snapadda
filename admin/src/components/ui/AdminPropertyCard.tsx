import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Share2, ShieldCheck, Flame, MapPin, Building2, Leaf, Square,
  Compass, CheckCircle2, Award, Edit3, Trash2, Zap, ChevronLeft,
  ChevronRight, Image as ImageIcon, Home as HomeIcon, TrendingUp,
  Clock, Copy, X, Play, Maximize2
} from 'lucide-react';

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

const typeColor = (t: string) => {
  const l = (t||'').toLowerCase();
  if (l.includes('apartment')) return '#9b59f5';
  if (l.includes('villa')||l.includes('duplex')) return '#e8b84b';
  if (l.includes('plot')||l.includes('layout')) return '#22d9e0';
  if (l.includes('agri')||l.includes('farm')) return '#10d98c';
  if (l.includes('house')) return '#ff8c42';
  if (l.includes('commercial')||l.includes('office')) return '#22d9e0';
  return '#fff';
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
  const tc = typeColor(prop.type);
  const score = completeness(prop);
  const isAgri = ['agricultural land','farmhouse'].some(t => (prop.type||'').toLowerCase().includes(t));
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

  return (
    <>
      {/* Lightbox */}
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
        style={{
          borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column',
          border: selected ? '2px solid #e8b84b' : '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(10,10,20,0.85)', backdropFilter: 'blur(20px)',
          boxShadow: selected ? '0 0 0 3px rgba(232,184,75,0.2), 0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.4)',
          opacity: deleting ? 0.4 : 1, transition: 'opacity 0.3s, box-shadow 0.2s',
        }}
      >
        {/* Gallery */}
        <div style={{ position: 'relative', height: 210, flexShrink: 0, background: '#0d0d1a', cursor: 'pointer' }}
          onMouseEnter={startCycle} onMouseLeave={stopCycle}
          onClick={() => imgs.length > 0 && setLightbox(true)}>
          <AnimatePresence initial={false}>
            {imgs.length > 0 ? (
              <motion.img key={imgIdx} src={imgs[imgIdx % imgs.length]}
                initial={{ opacity: 0.4, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0.4, x: -20 }} transition={{ duration: 0.22 }}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                alt={prop.title} />
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', opacity: 0.12 }}>
                <Building2 size={44} />
                <div style={{ fontSize: '0.68rem', marginTop: 8, color: '#aaa' }}>No Images</div>
              </div>
            )}
          </AnimatePresence>

          {/* Video badge */}
          {vids.length > 0 && (
            <div style={{ position: 'absolute', top: 10, left: imgs.length > 1 ? 55 : 10, zIndex: 8,
              background: 'rgba(0,0,0,0.7)', color: '#22d9e0', padding: '3px 9px', borderRadius: 20,
              fontSize: '0.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4,
              border: '1px solid rgba(34,217,224,0.3)' }}>
              <Play size={9} fill="#22d9e0" /> VIDEO
            </div>
          )}

          {/* Image counter */}
          {imgs.length > 1 && (
            <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 8, background: 'rgba(0,0,0,0.7)',
              color: 'white', padding: '3px 9px', borderRadius: 20, fontSize: '0.6rem', fontWeight: 800,
              display: 'flex', alignItems: 'center', gap: 4 }}>
              <ImageIcon size={9} /> {(imgIdx % imgs.length) + 1}/{imgs.length}
            </div>
          )}

          {/* Fullscreen hint */}
          {imgs.length > 0 && (
            <div style={{ position: 'absolute', top: 10, right: 50, zIndex: 8, opacity: 0.6 }}>
              <Maximize2 size={14} color="white" />
            </div>
          )}

          {/* Select checkbox */}
          {onSelect && (
            <div onClick={(e) => { e.stopPropagation(); onSelect(id); }}
              style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, width: 22, height: 22,
                borderRadius: 6, border: selected ? 'none' : '2px solid rgba(255,255,255,0.4)',
                background: selected ? '#e8b84b' : 'rgba(0,0,0,0.5)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              {selected && <CheckCircle2 size={14} color="#07070f" />}
            </div>
          )}

          {/* Gradient + price */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.92), transparent)', pointerEvents: 'none', zIndex: 3 }} />
          <div style={{ position: 'absolute', bottom: 10, left: 12, zIndex: 6 }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
              {fmt(prop.price)}
            </div>
            {isAgri && prop.pricePerAcre > 0 && (
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
                {fmt(prop.pricePerAcre)} / Acre
              </div>
            )}
          </div>

          {/* Status + verified */}
          <div style={{ position: 'absolute', bottom: 10, right: 12, zIndex: 6, display: 'flex',
            flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.color}44`,
              padding: '3px 9px', borderRadius: 6, fontSize: '0.6rem', fontWeight: 900,
              letterSpacing: '0.08em', backdropFilter: 'blur(10px)' }}>
              {sc.label}
            </div>
            {prop.isVerified && (
              <div style={{ background: 'linear-gradient(135deg,#e8b84b,#b9933a)', color: '#07070f',
                padding: '2px 7px', borderRadius: 4, fontSize: '0.58rem', fontWeight: 900,
                display: 'flex', alignItems: 'center', gap: 3 }}>
                <ShieldCheck size={8} /> VERIFIED
              </div>
            )}
          </div>

          {/* Dot nav */}
          {imgs.length > 1 && (
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)',
              display: 'flex', justifyContent: 'space-between', padding: '0 8px', zIndex: 7, pointerEvents: 'none' }}>
              <div style={{ background: 'rgba(0,0,0,0.45)', borderRadius: '50%', padding: 4, pointerEvents: 'auto',
                cursor: 'pointer' }} onClick={e => { e.stopPropagation(); setImgIdx(p => (p-1+imgs.length)%imgs.length); }}>
                <ChevronLeft size={13} color="white" />
              </div>
              <div style={{ background: 'rgba(0,0,0,0.45)', borderRadius: '50%', padding: 4, pointerEvents: 'auto',
                cursor: 'pointer' }} onClick={e => { e.stopPropagation(); setImgIdx(p => (p+1)%imgs.length); }}>
                <ChevronRight size={13} color="white" />
              </div>
            </div>
          )}
        </div>

        {/* Completeness Bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', position: 'relative' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ height: '100%', background: scoreColor, boxShadow: `0 0 6px ${scoreColor}` }} />
        </div>

        {/* Body */}
        <div style={{ padding: '14px 15px', flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>

          {/* Type row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 900, color: tc, background: `${tc}18`,
              border: `1px solid ${tc}33`, padding: '2px 7px', borderRadius: 4, letterSpacing: '0.04em' }}>
              {prop.type}
            </span>
            {prop.purpose && (
              <span style={{ fontSize: '0.58rem', fontWeight: 800,
                color: prop.purpose === 'Rent' ? '#22d9e0' : '#10d98c',
                background: prop.purpose === 'Rent' ? 'rgba(34,217,224,0.08)' : 'rgba(16,217,140,0.08)',
                padding: '2px 7px', borderRadius: 10,
                border: `1px solid ${prop.purpose === 'Rent' ? '#22d9e033' : '#10d98c33'}` }}>
                {prop.purpose === 'Rent' ? 'Rent' : 'Sale'}
              </span>
            )}
            <span style={{ marginLeft: 'auto', fontSize: '0.58rem', color: `${scoreColor}cc`,
              display: 'flex', alignItems: 'center', gap: 3, cursor: 'help' }} 
              title={`Health: ${score}%\n- Images: ${(prop.images||[]).length}\n- Description: ${prop.description?.length > 20 ? 'Yes' : 'Too Short'}\n- Price: ${prop.price ? 'Yes' : 'Missing'}`}>
              {score}% complete
            </span>
            {daysAgo !== null && (
              <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Clock size={9} /> {daysAgo}d
              </span>
            )}
          </div>

          {/* Title */}
          <h3 style={{ fontSize: '0.87rem', fontWeight: 800, color: 'white', margin: 0, lineHeight: 1.3,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {prop.title}
          </h3>

          {/* Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem' }}>
            <MapPin size={11} />
            <span>{[prop.location, prop.district].filter(Boolean).join(', ')}</span>
          </div>

          {/* Specs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(prop.bhk > 0 || prop.beds > 0) && (
              <Chip><HomeIcon size={10}/> {prop.bhk||prop.beds} BHK</Chip>
            )}
            {(prop.areaSize > 0 || prop.totalAcres > 0) && (
              <Chip>{isAgri ? <Leaf size={10}/> : <Square size={10}/>} {isAgri
                ? `${Number(prop.totalAcres||0).toFixed(2)} Ac`
                : `${prop.areaSize} ${prop.measurementUnit||'Sq.Ft'}`}</Chip>
            )}
            {prop.facing && !['Any','N/A'].includes(prop.facing) && (
              <Chip><Compass size={10}/> {prop.facing}</Chip>
            )}
            {prop.approvalAuthority && prop.approvalAuthority !== 'N/A' && (
              <Chip gold><Award size={10}/> {prop.approvalAuthority}</Chip>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 6,
            borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.68rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'rgba(255,255,255,0.4)' }}>
              <Heart size={11} color="#f5397b" /> {prop.likeCount||0}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'rgba(255,255,255,0.4)' }}>
              <Share2 size={11} color="#22d9e0" /> {prop.shareCount||0}
            </span>
            {prop.isFeatured && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#e8b84b' }}>
                <Flame size={11}/> Featured
              </span>
            )}
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3,
              color: prop.verificationStatus === 'Verified' ? '#10d98c' : 'rgba(255,255,255,0.25)', fontSize: '0.62rem' }}>
              <CheckCircle2 size={10}/> {prop.verificationStatus||'Draft'}
            </span>
          </div>

          {/* Action grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginTop: 2 }}>
            <Btn onClick={() => handleEdit(prop)} icon={<Edit3 size={13}/>} label="Edit" />
            
            {/* Quick Actions (Client Mirror) */}
            <Btn 
              onClick={async () => {
                try {
                  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/properties/${id}/like`, { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: 'admin_test' }) 
                  });
                  if (res.ok) loadProperties();
                } catch(e) {}
              }} 
              icon={<Heart size={13}/>} 
              label="Like"
              color="rgba(245,57,123,0.05)" border="rgba(245,57,123,0.15)" textColor="#f5397b"
            />

            <Btn 
              onClick={() => {
                const url = `https://snapadda-7a6e6.web.app/property/${id}`;
                navigator.clipboard.writeText(url);
                alert("Link copied to clipboard!");
              }} 
              icon={<Share2 size={13}/>} 
              label="Share" 
              color="rgba(34,217,224,0.05)" border="rgba(34,217,224,0.15)" textColor="#22d9e0"
            />

            <Btn onClick={handleCopy} icon={<Copy size={13}/>} label={copying ? '...' : 'Copy'}
              color="rgba(155,89,245,0.1)" border="rgba(155,89,245,0.2)" textColor="#9b59f5" />
            
            <Btn onClick={handleDelete} icon={<Trash2 size={13}/>} label={deleting ? '...' : 'Del'}
              color="rgba(245,57,123,0.05)" border="rgba(245,57,123,0.2)" textColor="#f5397b" />
            
            {status !== 'Sold' ? (
              <Btn onClick={() => changeStatus('Sold')} icon={<CheckCircle2 size={13}/>} label="Sold"
                color="rgba(16,217,140,0.05)" border="rgba(16,217,140,0.2)" textColor="#10d98c" />
            ) : (
              <Btn onClick={() => changeStatus('Active')} icon={<TrendingUp size={13}/>} label="Live"
                color="rgba(232,184,75,0.05)" border="rgba(232,184,75,0.2)" textColor="#e8b84b" />
            )}
            
            <a href={`https://snapadda-7a6e6.web.app/property/${id}`} target="_blank" rel="noopener noreferrer"
              style={{ gridColumn: 'span 3', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 5, padding: '8px', background: 'rgba(232,184,75,0.12)', border: '1px solid rgba(232,184,75,0.28)',
                borderRadius: 9, color: '#e8b84b', fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none', marginTop: 4 }}>
              <Zap size={13} fill="#e8b84b"/> Launch Property View
            </a>
          </div>
        </div>
      </motion.div>
    </>
  );
};

const Chip: React.FC<{ children: React.ReactNode; gold?: boolean }> = ({ children, gold }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.67rem',
    color: gold ? '#e8b84b' : 'rgba(255,255,255,0.55)',
    background: gold ? 'rgba(232,184,75,0.08)' : 'rgba(255,255,255,0.04)',
    padding: '2px 7px', borderRadius: 5,
    border: gold ? '1px solid rgba(232,184,75,0.18)' : 'none' }}>
    {children}
  </div>
);

const Btn: React.FC<{
  onClick: () => void; icon: React.ReactNode; label: string;
  color?: string; border?: string; textColor?: string;
}> = ({ onClick, icon, label, color = 'rgba(255,255,255,0.06)', border = 'rgba(255,255,255,0.1)', textColor = 'white' }) => (
  <button onClick={onClick}
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px 4px',
      background: color, border: `1px solid ${border}`, borderRadius: 9, color: textColor,
      cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, transition: 'all 0.18s' }}>
    {icon} {label}
  </button>
);

export default AdminPropertyCard;
