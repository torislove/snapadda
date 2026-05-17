import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Play, Pause,
  Volume2, VolumeX, Maximize2, Download, FileText, Search,
  Tv, Layout, Minimize2, RotateCw
} from 'lucide-react';

export default function MediaViewerContainer({
  isOpen,
  onClose,
  promotionType = 'photo',
  image = '',
  videoUrl = '',
  pdfUrl = '',
  title = '',
  description = '',
  linkedPropertyId = '',
  mediaSettings = []
}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999999,
          background: 'rgba(3, 3, 5, 0.98)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          color: 'white',
          fontFamily: 'var(--font-body)',
          overflow: 'hidden'
        }}
      >
        {isMobile ? (
          <MobileMediaViewer
            onClose={onClose}
            promotionType={promotionType}
            image={image}
            videoUrl={videoUrl}
            pdfUrl={pdfUrl}
            title={title}
            description={description}
            mediaSettings={mediaSettings}
          />
        ) : (
          <DesktopMediaViewer
            onClose={onClose}
            promotionType={promotionType}
            image={image}
            videoUrl={videoUrl}
            pdfUrl={pdfUrl}
            title={title}
            description={description}
            mediaSettings={mediaSettings}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════
   1. MOBILE MEDIA VIEWER (NATIVE GESTURES)
   ═══════════════════════════════════════════════ */
function MobileMediaViewer({
  onClose, promotionType, image, videoUrl, pdfUrl, title, description, mediaSettings
}) {
  const [zoomScale, setZoomScale] = useState(1);
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);
  const [pdfPage, setPdfPage] = useState(1);
  const touchStart = useRef({ x: 0, y: 0 });

  // Compile photos
  const photos = mediaSettings.length > 0 ? mediaSettings.map(s => s.url) : [image].filter(Boolean);

  const handleTouchStart = (e) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchEnd = (e) => {
    const diffX = e.changedTouches[0].clientX - touchStart.current.x;
    const diffY = e.changedTouches[0].clientY - touchStart.current.y;

    // Swipe down to dismiss
    if (diffY > 120 && Math.abs(diffX) < 80) {
      onClose();
      return;
    }

    // Swipe left/right for images
    if (promotionType === 'photo' && photos.length > 1) {
      if (diffX > 60 && currentPhotoIdx > 0) {
        setCurrentPhotoIdx(prev => prev - 1);
        setZoomScale(1);
      } else if (diffX < -60 && currentPhotoIdx < photos.length - 1) {
        setCurrentPhotoIdx(prev => prev + 1);
        setZoomScale(1);
      }
    }
  };

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        padding: '20px 16px env(safe-area-inset-bottom, 16px) 16px',
        height: '100%'
      }}
    >
      {/* Top Header Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div>
          <span style={{
            fontSize: '0.6rem',
            fontWeight: 900,
            color: 'var(--gold)',
            textTransform: 'uppercase',
            letterSpacing: '0.15em'
          }}>
            {promotionType}
          </span>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 900, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
            {title || 'Exclusive Offer'}
          </h4>
        </div>
        <button
          onClick={onClose}
          style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Interactive Viewport */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        margin: '20px 0'
      }}>
        {/* A. PHOTO VIEWER WITH PINCH/ZOOM & SWIPE */}
        {promotionType === 'photo' && photos.length > 0 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
              animate={{ scale: zoomScale }}
              style={{
                width: '100%',
                maxHeight: '75vh',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                backgroundImage: `url(${photos[currentPhotoIdx]})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                height: '420px'
              }}
            />
            {/* Zoom Controls */}
            <div style={{
              position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)',
              padding: '6px 14px', borderRadius: '20px', backdropFilter: 'blur(8px)', zIndex: 10
            }}>
              <button onClick={() => setZoomScale(s => Math.max(1, s - 0.25))} style={{ background: 'none', border: 'none', color: '#fff' }}><ZoomOut size={16} /></button>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, minWidth: '35px', textAlign: 'center' }}>{Math.round(zoomScale * 100)}%</span>
              <button onClick={() => setZoomScale(s => Math.min(3, s + 0.25))} style={{ background: 'none', border: 'none', color: '#fff' }}><ZoomIn size={16} /></button>
            </div>
            {/* Slide Indicators */}
            {photos.length > 1 && (
              <span style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', padding: '3px 8px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 800 }}>
                {currentPhotoIdx + 1} / {photos.length}
              </span>
            )}
          </div>
        )}

        {/* B. NATIVE-FEEL GESTURE VIDEO VIEWER */}
        {promotionType === 'video' && videoUrl && (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay
              loop
              playsInline
              onClick={toggleVideoPlay}
              style={{
                width: '100%',
                maxHeight: '75vh',
                borderRadius: '16px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                objectFit: 'cover'
              }}
            />
            {/* Floating Controls */}
            <div style={{
              position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: '20px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)',
              padding: '8px 24px', borderRadius: '24px', backdropFilter: 'blur(8px)', alignItems: 'center'
            }}>
              <button onClick={toggleVideoPlay} style={{ background: 'none', border: 'none', color: '#fff' }}>
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button onClick={() => {
                if (videoRef.current) {
                  videoRef.current.muted = !isMuted;
                  setIsMuted(!isMuted);
                }
              }} style={{ background: 'none', border: 'none', color: '#fff' }}>
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
          </div>
        )}

        {/* C. MOBILE-OPTIMIZED PDF VIEWER (SCROLL-BASED STACKED VIEWER) */}
        {promotionType === 'property' && pdfUrl && (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Viewport optimized brochure container */}
            <div style={{
              width: '100%', flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px'
            }}>
              <FileText size={48} color="var(--gold)" style={{ marginBottom: '12px' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: '8px' }}>
                Mobile Digital Brochure Available
              </span>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: '20px', maxWidth: '200px' }}>
                For the best mobile viewing, click below to open in your native device viewer.
              </span>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  textDecoration: 'none', background: 'var(--gold)', color: 'black',
                  fontWeight: 900, padding: '12px 24px', borderRadius: '12px', fontSize: '0.75rem',
                  letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px',
                  boxShadow: '0 8px 24px rgba(244,208,63,0.3)'
                }}
              >
                OPEN DIGITAL BROCHURE <Download size={14} />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Swipe Down Dismiss Alert Helper */}
      <div style={{ textAlign: 'center', opacity: 0.4, fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        ↓ Swipe Down to Close
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   2. DESKTOP MEDIA VIEWER (CINEMATIC)
   ═══════════════════════════════════════════════ */
function DesktopMediaViewer({
  onClose, promotionType, image, videoUrl, pdfUrl, title, description, mediaSettings
}) {
  const [zoomScale, setZoomScale] = useState(1);
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
  const videoRef = useRef(null);

  // Compile photos
  const photos = mediaSettings.length > 0 ? mediaSettings.map(s => s.url) : [image].filter(Boolean);

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSpeedChange = (e) => {
    const s = parseFloat(e.target.value);
    setPlaySpeed(s);
    if (videoRef.current) {
      videoRef.current.playbackRate = s;
    }
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '24px 32px'
    }}>
      {/* Top Header Navbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', zIndex: 10 }}>
        <div>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 900,
            color: 'var(--gold)',
            textTransform: 'uppercase',
            letterSpacing: '0.2em'
          }}>
            SnapAdda Elite Space
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 950, marginTop: '4px', letterSpacing: '-0.02em' }}>
            {title || 'Exclusive Campaign'}
          </h2>
        </div>
        <button
          onClick={onClose}
          style={{
            width: '46px', height: '46px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
            transition: 'background 0.2s', cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Split Window */}
      <div style={{ flex: 1, display: 'flex', gap: '30px', overflow: 'hidden' }}>
        
        {/* A. DOCK PANEL (LEFT SIDEBAR) */}
        <div style={{
          width: '320px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '24px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflowY: 'auto'
        }}>
          <div>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Description</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--txt-secondary)', lineHeight: 1.5, marginTop: '6px' }}>
              {description || 'Browse premium developments, plots, and agricultural investments direct from verified owners.'}
            </p>
          </div>

          {/* Thumbnail sidebar for photos */}
          {promotionType === 'photo' && photos.length > 1 && (
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '10px' }}>
                Gallery Items ({photos.length})
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {photos.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setCurrentPhotoIdx(idx); setZoomScale(1); }}
                    style={{
                      aspectRatio: '1',
                      borderRadius: '10px',
                      border: idx === currentPhotoIdx ? '2px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)',
                      backgroundImage: `url(${url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      cursor: 'pointer',
                      background: 'none'
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Cinematic details */}
          <div style={{ marginTop: 'auto', padding: '16px', background: 'rgba(244,208,63,0.03)', border: '1px solid rgba(244,208,63,0.15)', borderRadius: '16px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--gold)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SnapAdda Elite Care</span>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px', display: 'block', lineHeight: 1.4 }}>
              Fully compatible dual-mode display. Optimized on mobiles for touch gestures, and desktops for widescreen cinema layouts.
            </span>
          </div>
        </div>

        {/* B. MAIN DESKTOP CINEMATIC MEDIA CONTAINER */}
        <div style={{
          flex: 1,
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.04)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          
          {/* PHOTO CINEMATIC VIEW */}
          {promotionType === 'photo' && photos.length > 0 && (
            <div style={{ width: '90%', height: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <motion.div
                animate={{ scale: zoomScale }}
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${photos[currentPhotoIdx]})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  transition: 'transform 0.1s ease'
                }}
              />

              {/* Slider Arrows */}
              {photos.length > 1 && (
                <>
                  <button
                    disabled={currentPhotoIdx === 0}
                    onClick={() => { setCurrentPhotoIdx(p => p - 1); setZoomScale(1); }}
                    style={{
                      position: 'absolute', left: 10, width: '44px', height: '44px', borderRadius: '50%',
                      background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: currentPhotoIdx === 0 ? 0.3 : 1
                    }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    disabled={currentPhotoIdx === photos.length - 1}
                    onClick={() => { setCurrentPhotoIdx(p => p + 1); setZoomScale(1); }}
                    style={{
                      position: 'absolute', right: 10, width: '44px', height: '44px', borderRadius: '50%',
                      background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: currentPhotoIdx === photos.length - 1 ? 0.3 : 1
                    }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Zoom Controls Overlay */}
              <div style={{
                position: 'absolute', bottom: 20, display: 'flex', gap: '12px', background: 'rgba(10,12,22,0.85)',
                border: '1px solid rgba(255,255,255,0.1)', padding: '8px 18px', borderRadius: '24px', backdropFilter: 'blur(12px)'
              }}>
                <button onClick={() => setZoomScale(s => Math.max(1, s - 0.25))} style={{ background: 'none', border: 'none', color: '#fff' }}><ZoomOut size={16} /></button>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, minWidth: '40px', textAlign: 'center' }}>{Math.round(zoomScale * 100)}%</span>
                <button onClick={() => setZoomScale(s => Math.min(4, s + 0.25))} style={{ background: 'none', border: 'none', color: '#fff' }}><ZoomIn size={16} /></button>
              </div>
            </div>
          )}

          {/* VIDEO CINEMATIC VIEW (THEATRE MODES & SPEED SELECTORS) */}
          {promotionType === 'video' && videoUrl && (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <video
                ref={videoRef}
                src={videoUrl}
                autoPlay
                loop
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
              {/* Desktop Bar */}
              <div style={{
                position: 'absolute', bottom: 20, width: '90%', display: 'flex', justifyContent: 'space-between',
                background: 'rgba(10,12,22,0.9)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 24px',
                borderRadius: '20px', backdropFilter: 'blur(12px)', alignItems: 'center', zIndex: 10
              }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <button onClick={toggleVideoPlay} style={{ background: 'none', border: 'none', color: '#fff', display: 'flex', alignItems: 'center' }}>
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.muted = !isMuted;
                      setIsMuted(!isMuted);
                    }
                  }} style={{ background: 'none', border: 'none', color: '#fff', display: 'flex', alignItems: 'center' }}>
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Speed</span>
                    <select
                      value={playSpeed}
                      onChange={handleSpeedChange}
                      style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                        color: 'white', borderRadius: '8px', fontSize: '0.7rem', padding: '3px 8px', outline: 'none'
                      }}
                    >
                      <option value="0.5">0.5x</option>
                      <option value="1">1.0x</option>
                      <option value="1.25">1.25x</option>
                      <option value="1.5">1.5x</option>
                      <option value="2">2.0x</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        if (document.fullscreenElement) {
                          document.exitFullscreen();
                        } else {
                          videoRef.current.requestFullscreen();
                        }
                      }
                    }}
                    style={{ background: 'none', border: 'none', color: '#fff', display: 'flex', alignItems: 'center' }}
                  >
                    <Maximize2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DUAL-PAGE SIDE-BY-SIDE PDF VIEW */}
          {promotionType === 'property' && pdfUrl && (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <iframe
                title="Desktop PDF Viewport"
                src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
