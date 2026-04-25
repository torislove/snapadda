import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, Eye, Share2, Download } from 'lucide-react';

const EliteLightBox = ({ images = [], videos = [], startIdx = 0, onClose, title }) => {
  const [page, setPage] = useState(startIdx);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  
  const allAssets = [
    ...images.map(img => ({ type: 'image', url: img })),
    ...videos.map(vid => ({ type: 'video', url: vid }))
  ];

  // Gesture handling for swipe-to-dismiss
  const dragY = useMotionValue(0);
  const opacity = useTransform(dragY, [-200, 0, 200], [0, 1, 0]);
  const scale = useTransform(dragY, [-200, 0, 200], [0.8, 1, 0.8]);

  const paginate = (dir) => {
    const next = (page + dir + allAssets.length) % allAssets.length;
    setPage(next);
    setZoom(false);
  };

  const handleDragEnd = (_, info) => {
    if (Math.abs(info.offset.y) > 150) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') paginate(-1);
      if (e.key === 'ArrowRight') paginate(1);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [page]);

  if (allAssets.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      style={{ 
        position: 'fixed', inset: 0, zIndex: 2000, 
        background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'column', touchAction: 'none'
      }}
    >
      {/* Top Bar */}
      <div style={{ 
        padding: '20px', display: 'flex', justifyContent: 'space-between', 
        alignItems: 'center', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
        zIndex: 10
      }}>
        <div>
          <div style={{ color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.1em' }}>SNAPADDA ELITE</div>
          <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: 600 }}>{title}</div>
        </div>
        <button 
          onClick={onClose}
          style={{ 
            width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
            border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={handleDragEnd}
            style={{ 
              y: dragY, opacity, scale,
              width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {allAssets[page].type === 'image' ? (
              <div 
                style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%', overflow: 'hidden' }}
                onClick={() => setZoom(!zoom)}
              >
                <motion.img 
                  src={allAssets[page].url}
                  style={{ 
                    maxWidth: '100vw', maxHeight: '80vh', objectFit: 'contain',
                    scale: zoom ? 2 : 1,
                    transition: { type: 'spring', stiffness: 300, damping: 30 }
                  }}
                />
              </div>
            ) : (
              <div style={{ width: '90%', height: '60%', borderRadius: '12px', overflow: 'hidden' }}>
                <iframe 
                  src={allAssets[page].url.replace('watch?v=', 'embed/')} 
                  width="100%" height="100%" frameBorder="0" allowFullScreen 
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav Buttons (Desktop only) */}
        <button 
          className="nav-btn-mobile-hide"
          onClick={() => paginate(-1)}
          style={{ position: 'absolute', left: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '50px', height: '50px', borderRadius: '50%' }}
        >
          <ChevronLeft />
        </button>
        <button 
          className="nav-btn-mobile-hide"
          onClick={() => paginate(1)}
          style={{ position: 'absolute', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '50px', height: '50px', borderRadius: '50%' }}
        >
          <ChevronRight />
        </button>
      </div>

      {/* Bottom Thumbnails Sync */}
      <div style={{ 
        padding: '20px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
        display: 'flex', justifyContent: 'center', gap: '10px', overflowX: 'auto'
      }}>
        {allAssets.map((asset, i) => (
          <div 
            key={i}
            onClick={() => setPage(i)}
            style={{ 
              width: '60px', height: '40px', borderRadius: '4px', overflow: 'hidden',
              border: i === page ? '2px solid var(--gold)' : '2px solid transparent',
              opacity: i === page ? 1 : 0.5, transition: '0.3s'
            }}
          >
            {asset.type === 'image' ? <img src={asset.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={16} color="var(--gold)" /></div>}
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-btn-mobile-hide { display: none !important; }
        }
      `}</style>
    </motion.div>
  );
};

export default EliteLightBox;
