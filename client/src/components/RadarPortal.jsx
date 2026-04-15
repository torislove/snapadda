import { motion, AnimatePresence } from 'framer-motion';
import { X, Navigation, Radar as RadarIcon, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatSnapAddaPrice } from '../utils/priceUtils';

export default function RadarPortal({ properties, city, isOpen, onClose }) {
  const { t } = useTranslation();

  const getRelativeCoords = (prop) => {
     // Mocking relative mapping for institutional look. 
     // In a production env, this would use actual Lat/Lng relative to city-center.
     const hash = prop._id || prop.id;
     const x = (hash.charCodeAt(0) % 100) - 50; 
     const y = (hash.charCodeAt(1) % 100) - 50;
     return { x: x * 4, y: y * 4 };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ 
            position: 'fixed', inset: 0, zIndex: 20000, 
            background: 'rgba(7,7,12,0.95)', backdropFilter: 'blur(40px)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' 
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', opacity: 0.1, pointerEvents: 'none' }}>
             <div className="radar-grid" style={{ width: '200%', height: '200%', backgroundImage: 'radial-gradient(circle, rgba(232,184,75,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          </div>

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-heavy"
            style={{ 
              width: '100%', maxWidth: '1000px', height: '85vh', 
              borderRadius: '40px', border: '1px solid rgba(232,184,75,0.2)', 
              position: 'relative', display: 'grid', gridTemplateColumns: '1fr 340px' 
            }}
          >
            {/* Radar Viewport */}
            <div style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
               {/* Radar Sweeper */}
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                 style={{ 
                   position: 'absolute', width: '600px', height: '600px', 
                   background: 'conic-gradient(from 0deg, rgba(232,184,75,0.1) 0deg, transparent 90deg)', 
                   borderRadius: '50%', zIndex: 0 
                 }}
               />
               
               {/* Concentric Circles */}
               {[1, 2, 3, 4].map(i => (
                 <div key={i} style={{ 
                   position: 'absolute', width: `${i * 150}px', height: '${i * 150}px'`, 
                   border: '1px solid rgba(232,184,75,0.05)', borderRadius: '50%' 
                 }} />
               ))}

               {/* Asset Pips */}
               {properties.slice(0, 15).map((p, i) => {
                 const coords = getRelativeCoords(p);
                 return (
                   <motion.div 
                     key={p._id || p.id}
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     transition={{ delay: i * 0.05 }}
                     style={{ 
                       position: 'absolute', left: `calc(50% + ${coords.x}px)`, top: `calc(50% + ${coords.y}px)`,
                       width: '12px', height: '12px', background: 'var(--gold)', borderRadius: '50%',
                       boxShadow: '0 0 15px var(--gold)', cursor: 'pointer', zIndex: 10
                     }}
                     whileHover={{ scale: 1.5 }}
                   >
                     <div style={{ position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)', fontWeight: 800 }}>
                       {formatSnapAddaPrice(p.price)}
                     </div>
                   </motion.div>
                 );
               })}

               {/* Center Marker */}
               <div style={{ zIndex: 2, background: 'var(--gold)', color: 'var(--midnight)', padding: '6px 14px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 0 30px rgba(232,184,75,0.4)' }}>
                 <Navigation size={14} fill="currentColor" /> {city?.split(',')[0] || 'Market Center'}
               </div>
            </div>

            {/* Sidebar Data Pane */}
            <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <RadarIcon className="pulse-primary" size={24} color="var(--gold)" />
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: 'white', letterSpacing: '0.05em' }}>ASSET RADAR</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--txt-muted)', fontWeight: 700 }}>VERIFIED SPATIAL ANALYSIS</div>
                    </div>
                 </div>
                 <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
                   <X size={18} />
                 </button>
               </div>

               <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--gold)', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>TOP LIQUID ASSETS</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {properties.slice(0, 5).map(p => (
                      <div key={p._id || p.id} className="glass-premium" style={{ padding: '1rem', borderRadius: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                         <img src={p.image || p.images?.[0]} style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover' }} />
                         <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 800 }}>{formatSnapAddaPrice(p.price)}</div>
                         </div>
                      </div>
                    ))}
                  </div>
               </div>

               <div style={{ marginTop: '2.5rem', padding: '1.5rem', borderRadius: '20px', background: 'rgba(232,184,75,0.05)', border: '1px solid rgba(232,184,75,0.1)' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px', color: 'var(--gold)' }}>
                    <Info size={14} /> <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>MARKET DENSITY ALPHA</span>
                  </div>
                  <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                    This radar cluster visualizes current inventory distribution. Central nodes represent assets within high-growth corridors of the {city || 'selected'} sector.
                  </p>
               </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
