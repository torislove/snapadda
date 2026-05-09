import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Eye } from 'lucide-react';

const IMAGE_PLACEHOLDER = (
  <div style={{
    width: '100%', height: '100%', minHeight: '280px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(255,255,255,0.04)', gap: '12px'
  }}>
    <Eye size={40} color="rgba(232,184,75,0.4)" />
    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>Image not available</span>
  </div>
);

const EliteLightBox = ({ images = [], videos = [], startIdx = 0, onClose, title }) => {
  const [page, setPage] = useState(startIdx < images.length ? startIdx : 0);
  const [zoom, setZoom] = useState(false);
  const [imgErrors, setImgErrors] = useState({});
  const thumbsRef = useRef(null);

  const allAssets = [
    ...images.map(img => ({ type: 'image', url: img })),
    ...videos.map(vid => ({ type: 'video', url: vid }))
  ];

  // Vertical swipe-to-dismiss
  const dragY = useMotionValue(0);
  const opacity = useTransform(dragY, [-200, 0, 200], [0, 1, 0]);
  const contentScale = useTransform(dragY, [-200, 0, 200], [0.85, 1, 0.85]);

  const paginate = (dir) => {
    const next = (page + dir + allAssets.length) % allAssets.length;
    setPage(next);
    setZoom(false);
  };

  const handleDragEnd = (_, info) => {
    if (Math.abs(info.offset.y) > 130) {
      onClose();
    } else if (Math.abs(info.offset.x) > 80) {
      paginate(info.offset.x < 0 ? 1 : -1);
    }
  };

  const handleImgError = (i) => {
    setImgErrors(prev => ({ ...prev, [i]: true }));
  };

  // Scroll thumbnail into view
  useEffect(() => {
    if (thumbsRef.current) {
      const thumb = thumbsRef.current.children[page];
      if (thumb) thumb.scrollIntoView({ inline: 'center', behavior: 'smooth' });
    }
  }, [page]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') paginate(-1);
      if (e.key === 'ArrowRight') paginate(1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [page]);

  if (allAssets.length === 0) return null;

  const current = allAssets[page];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.97)', backdropFilter: 'blur(24px)',
        display: 'flex', flexDirection: 'column',
        // NO touchAction:none here — let the browser scroll normally on outer container
      }}
    >
      {/* ── Top Bar ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 20px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)',
        flexShrink: 0, zIndex: 10
      }}>
        <div>
          <div style={{ color: 'var(--gold,#e8b84b)', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            SNAPADDA ELITE · {page + 1} / {allAssets.length}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', fontWeight: 600, marginTop: '2px' }}>{title}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {current.type === 'image' && (
            <button
              onClick={() => setZoom(z => !z)}
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: zoom ? 'rgba(232,184,75,0.2)' : 'rgba(255,255,255,0.1)',
                border: `1px solid ${zoom ? 'rgba(232,184,75,0.5)' : 'transparent'}`,
                color: zoom ? 'var(--gold,#e8b84b)' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}
              aria-label="Toggle zoom"
            >
              {zoom ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)', border: 'none',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
            aria-label="Close lightbox"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* ── Main Image / Video Area ── */}
      <div style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 0
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            drag
            dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={handleDragEnd}
            style={{
              y: dragY,
              opacity,
              scale: contentScale,
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              touchAction: 'none', // only on the draggable element
              cursor: zoom ? 'zoom-out' : 'grab',
            }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.22 }}
          >
            {current.type === 'image' ? (
              imgErrors[page] ? IMAGE_PLACEHOLDER : (
                <div style={{
                  position: 'relative',
                  maxWidth: zoom ? '100%' : '92vw',
                  maxHeight: zoom ? '100%' : '80vh',
                  overflow: 'hidden',
                  borderRadius: zoom ? '0' : '12px',
                  transition: 'border-radius 0.3s, max-width 0.3s, max-height 0.3s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <img
                    src={current.url}
                    alt={`${title} – photo ${page + 1}`}
                    onError={() => handleImgError(page)}
                    style={{
                      maxWidth: '100%',
                      maxHeight: zoom ? '100vh' : '80vh',
                      objectFit: 'contain',
                      display: 'block',
                      transform: zoom ? 'scale(2)' : 'scale(1)',
                      transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                      userSelect: 'none',
                      WebkitUserDrag: 'none',
                    }}
                    draggable={false}
                  />
                </div>
              )
            ) : (
              <div style={{ width: '92vw', maxWidth: '900px', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', background: '#111' }}>
                <iframe
                  src={current.url.includes('youtube.com/watch?v=')
                    ? current.url.replace('watch?v=', 'embed/')
                    : current.url.includes('youtu.be/')
                      ? current.url.replace('youtu.be/', 'www.youtube.com/embed/')
                      : current.url}
                  width="100%" height="100%"
                  frameBorder="0"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  title={`Video ${page + 1}`}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Desktop Nav Arrows ── */}
        {allAssets.length > 1 && (
          <>
            <button
              onClick={() => paginate(-1)}
              className="lightbox-nav-btn"
              style={{ position: 'absolute', left: '16px' }}
              aria-label="Previous"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => paginate(1)}
              className="lightbox-nav-btn"
              style={{ position: 'absolute', right: '16px' }}
              aria-label="Next"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* ── Thumbnail Strip ── */}
      {allAssets.length > 1 && (
        <div style={{
          flexShrink: 0,
          padding: '12px 16px 20px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
        }}>
          <div
            ref={thumbsRef}
            style={{
              display: 'flex', gap: '8px', overflowX: 'auto',
              justifyContent: 'center', paddingBottom: '4px'
            }}
            className="hide-scrollbar"
          >
            {allAssets.map((asset, i) => (
              <button
                key={i}
                onClick={() => { setPage(i); setZoom(false); }}
                style={{
                  flexShrink: 0,
                  width: '56px', height: '40px',
                  borderRadius: '6px', overflow: 'hidden', padding: 0,
                  border: i === page ? '2px solid var(--gold,#e8b84b)' : '2px solid rgba(255,255,255,0.15)',
                  opacity: i === page ? 1 : 0.55,
                  transition: 'border-color 0.25s, opacity 0.25s',
                  cursor: 'pointer', background: '#111'
                }}
                aria-label={`Go to ${asset.type} ${i + 1}`}
              >
                {asset.type === 'image' ? (
                  imgErrors[i] ? (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a' }}>
                      <Eye size={12} color="rgba(232,184,75,0.5)" />
                    </div>
                  ) : (
                    <img
                      src={asset.url}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onError={() => handleImgError(i)}
                    />
                  )
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#1a1a2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Eye size={12} color="var(--gold,#e8b84b)" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .lightbox-nav-btn {
          width: 48px; height: 48px; border-radius: 50%;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.15);
          color: white; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.2s, transform 0.2s;
          top: 50%; transform: translateY(-50%);
          z-index: 5;
        }
        .lightbox-nav-btn:hover {
          background: rgba(232,184,75,0.2);
          border-color: rgba(232,184,75,0.4);
          transform: translateY(-50%) scale(1.1);
        }
        @media (max-width: 640px) {
          .lightbox-nav-btn { display: none !important; }
        }
        .hide-scrollbar { scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </motion.div>
  );
};

export default EliteLightBox;
