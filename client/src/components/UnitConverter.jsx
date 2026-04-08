import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Calculator, X, ChevronRight, Compass, ArrowLeft, 
  RotateCw, Hash, History, Settings, ExternalLink, 
  Copy, Check, Info, LayoutGrid, Scale, Map, Navigation,
  Activity, Shield
} from 'lucide-react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// --- PRECISION MATHEMATICS ---
const CONVERSION_BASES = {
  'Sq.Yards': 1, 'Sq.Yds': 1, 'Sq.Ft': 0.1111111111, 'Cents': 48.4, 'Acres': 4840,
  'Guntas': 121, 'Ankanam': 8, 'Hectares': 11959.9, 'Sq.Meters': 1.19599,
  'Marla': 30.25, 'Kanal': 605, 'Biswa': 151.25, 'Ground': 266.67
};

// --- COMPONENTS ---

const PrecisionToast = ({ msg, onDone }) => (
  <motion.div initial={{ opacity: 0, y: 40, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 20, x: '-50%' }}
    style={{
      position: 'fixed', bottom: '100px', left: '50%', zIndex: 11000,
      background: 'rgba(212, 175, 55, 0.95)', color: '#000', padding: '10px 24px',
      borderRadius: '50px', fontWeight: 900, fontSize: '0.8rem', whiteSpace: 'nowrap',
      boxShadow: '0 10px 40px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)'
    }}
  >
    {msg}
  </motion.div>
);

const HudSwitch = ({ icon: Icon, label, desc, active, onClick }) => (
  <motion.button whileHover={{ scale: 1.02, backgroundColor: 'rgba(212,175,55,0.05)' }} whileTap={{ scale: 0.98 }} onClick={onClick}
    style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: '15px', padding: '16px',
      border: active ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.08)',
      background: active ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255,255,255,0.03)',
      borderRadius: '24px', cursor: 'pointer', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      textAlign: 'left', color: '#fff', position: 'relative', overflow: 'hidden'
    }}
  >
    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: active ? 'var(--gold)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? '#000' : 'var(--gold)' }}>
      <Icon size={22} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.02em' }}>{label}</div>
      <div style={{ fontSize: '0.65rem', opacity: 0.5, fontWeight: 600 }}>{desc || 'Launch Professional Interface'}</div>
    </div>
    <ChevronRight size={16} opacity={0.3} />
  </motion.button>
);

// --- COMPASS LIQUID GLASS DESIGN ---
const LiquidCompass = ({ rotation }) => {
  return (
    <div style={{ position: 'relative', width: '280px', height: '280px', margin: '0 auto' }}>
      <motion.div 
        style={{ width: '100%', height: '100%', position: 'relative', rotate: rotation }}
      >
        <svg viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))' }}>
          <defs>
            <radialGradient id="glassGradient" cx="50%" cy="30%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            <linearGradient id="metallicDial" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a1a2e" />
              <stop offset="50%" stopColor="#0a0a14" />
              <stop offset="100%" stopColor="#050510" />
            </linearGradient>
            <filter id="metallicSheen">
              <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur" />
              <feSpecularLighting in="blur" surfaceScale="5" specularConstant="0.8" specularExponent="20" lightingColor="#d4af37" result="spec">
                <fePointLight x="-50" y="-50" z="200" />
              </feSpecularLighting>
              <feComposite in="spec" in2="SourceAlpha" operator="in" result="comb" />
              <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="comb" /></feMerge>
            </filter>
          </defs>

          <circle cx="50" cy="50" r="48" fill="url(#metallicDial)" stroke="rgba(212,175,55,0.3)" strokeWidth="0.5" filter="url(#metallicSheen)" />
          
          {[...Array(360)].map((_, i) => (
             i % 5 === 0 && (
               <line key={i} x1="50" y1="6" x2="50" y2="10" 
                stroke={i % 90 === 0 ? "var(--gold)" : (i % 30 === 0 ? "#fff" : "rgba(255,255,255,0.2)")} 
                strokeWidth={i % 30 === 0 ? "0.6" : "0.3"} transform={`rotate(${i} 50 50)`} 
               />
             )
          ))}

          <text x="50" y="22" textAnchor="middle" fill="var(--gold)" fontSize="10" fontWeight="950" style={{ letterSpacing: '1px' }}>N</text>
          <text x="50" y="86" textAnchor="middle" fill="#fff" fontSize="7" opacity="0.6">S</text>
          <text x="84" y="54" textAnchor="middle" fill="#fff" fontSize="7" opacity="0.6">E</text>
          <text x="16" y="54" textAnchor="middle" fill="#fff" fontSize="7" opacity="0.6">W</text>

          <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(212,175,55,0.1)" strokeWidth="0.3" />

          <g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.8))">
             <path d="M50 15 L54 50 L50 85 L46 50 Z" fill="rgba(212,175,55,0.1)" />
             <path d="M50 15 L54 50 L50 50 Z" fill="var(--gold)" opacity="0.9" />
             <path d="M50 15 L46 50 L50 50 Z" fill="#fff" opacity="0.8" />
             <path d="M50 85 L54 50 L50 50 Z" fill="#999" opacity="0.5" />
             <path d="M50 85 L46 50 L50 50 Z" fill="#ccc" opacity="0.6" />
          </g>

          <circle cx="50" cy="50" r="4" fill="var(--gold)" />
          <circle cx="50" cy="50" r="1.5" fill="#000" />
        </svg>

        <div style={{
          position: 'absolute', inset: '10px', borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 60%)',
          pointerEvents: 'none', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
        }} />
      </motion.div>

      <div style={{
        position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
        width: '4px', height: '20px', background: 'var(--gold)', borderRadius: '100px',
        boxShadow: '0 0 15px var(--gold)', zIndex: 10
      }} />
    </div>
  );
};

export default function UnitConverter() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('menu'); 
  const [toast, setToast] = useState('');

  // Converter State
  const [convValue, setConvValue] = useState(1);
  const [convUnit, setConvUnit] = useState('Acres');

  // Calculator State
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcFormula, setCalcFormula] = useState('');
  const [calcHistory, setCalcHistory] = useState([]);

  // --- COMPASS STABILIZATION LOGIC ---
  const [compassPermission, setCompassPermission] = useState('prompt');
  const [displayHeading, setDisplayHeading] = useState(0); // For textual display
  const prevHeadingRef = useRef(0);
  const totalRotationRef = useRef(0);
  
  // Motion Value for buttery visuals
  const rotationMotion = useMotionValue(0);
  const rotationSpring = useSpring(rotationMotion, { damping: 20, stiffness: 80, mass: 1 });

  const handleOrientation = useCallback((e) => {
    let rawHeading = e.webkitCompassHeading;
    if (rawHeading == null && e.absolute) {
      rawHeading = (360 - e.alpha);
    }
    
    if (rawHeading == null) return;

    // 1. Low-Pass Filter (Simple Smoothing)
    const alpha = 0.15; // Smoothing factor (0.1 = slow/heavy, 0.9 = fast/jittery)
    const smoothedHeading = prevHeadingRef.current + alpha * (rawHeading - prevHeadingRef.current);
    prevHeadingRef.current = smoothedHeading;
    setDisplayHeading(Math.round(smoothedHeading));

    // 2. Shortest-Path Rotation Accumulator
    let diff = rawHeading - (totalRotationRef.current % 360);
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    totalRotationRef.current += diff;
    rotationMotion.set(-totalRotationRef.current);
  }, [rotationMotion]);

  useEffect(() => {
    if (compassPermission === 'granted') {
      window.addEventListener('deviceorientation', handleOrientation, true);
      return () => window.removeEventListener('deviceorientation', handleOrientation, true);
    }
  }, [compassPermission, handleOrientation]);

  const requestCompass = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res === 'granted') { setCompassPermission('granted'); } else { setCompassPermission('denied'); }
      } catch { setCompassPermission('denied'); }
    } else { setCompassPermission('granted'); }
  };

  const getVastuInfo = (angle) => {
    const norm = (angle % 360 + 360) % 360;
    if (norm >= 337.5 || norm < 22.5) return { d: 'North (Uttara)', v: 'Kubera (Wealth)', s: 'Career & Growth', c: '#e8b84b' };
    if (norm >= 22.5 && norm < 67.5) return { d: 'North-East (Isanya)', v: 'Eshwar (Spiritual)', s: 'Health & Clarity', c: '#60a5fa' };
    if (norm >= 67.5 && norm < 112.5) return { d: 'East (Purva)', v: 'Indra (Success)', s: 'Social & Fame', c: '#fbbf24' };
    if (norm >= 112.5 && norm < 157.5) return { d: 'South-East (Agneya)', v: 'Agni (Fire)', s: 'Kitchen & Cashflow', c: '#f87171' };
    if (norm >= 157.5 && norm < 202.5) return { d: 'South (Dakshina)', v: 'Yama (Legal)', s: 'Power & Sleep', c: '#9ca3af' };
    if (norm >= 202.5 && norm < 247.5) return { d: 'South-West (Nairuti)', v: 'Pitri (Foundation)', s: 'Stability & Strength', c: '#8b5e3c' };
    if (norm >= 247.5 && norm < 292.5) return { d: 'West (Paschima)', v: 'Varuna (Gains)', s: 'Knowledge & Profit', c: '#34d399' };
    if (norm >= 292.5 && norm < 337.5) return { d: 'North-West (Vayavya)', v: 'Vayu (Movement)', s: 'Sales & Support', c: '#a78bfa' };
    return { d: 'Detecting...', v: '...', s: '...', c: 'var(--gold)' };
  };

  const vastu = getVastuInfo(displayHeading);

  return (
    <>
      <motion.button onClick={() => { setIsOpen(!isOpen); setMode('menu'); }} className="unit-converter-trigger" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Close utilities menu" : "Open property utilities menu"}
        style={{ position: 'fixed', right: '18px', bottom: '75px', zIndex: 9999, width: '60px', height: '60px', borderRadius: '22px', background: 'linear-gradient(135deg, rgba(212,175,55,1), rgba(212,175,55,0.7))', color: '#000', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <LayoutGrid size={28} />
      </motion.button>

      <AnimatePresence>{toast && <PrecisionToast msg={toast} onDone={() => setToast('')} />}</AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 50 }}
            style={{ 
              position: 'fixed', bottom: '150px', right: '18px', width: 'calc(100% - 36px)', maxWidth: '380px', padding: '1.75rem', zIndex: 10001, 
              borderRadius: '40px', background: 'rgba(5, 5, 12, 0.98)', border: '1px solid rgba(212, 175, 55, 0.25)', boxShadow: '0 40px 100px rgba(0,0,0,0.9)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {mode !== 'menu' && ( <button onClick={() => setMode('menu')} aria-label="Back to utilities menu" style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', padding: '10px', borderRadius: '15px', cursor: 'pointer' }}> <ArrowLeft size={18} /> </button> )}
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 950, color: '#fff', letterSpacing: '0.05em', fontFamily: 'var(--font-serif)' }}> {mode === 'menu' ? 'SNAPADDA COMMAND' : mode.toUpperCase()} </h3>
                  <div style={{ fontSize: '0.65rem', color: 'var(--gold)', fontWeight: 800, letterSpacing: '0.3em' }}>STABILIZED_HUD // ACTIVE</div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                aria-label="Close command center"
                style={{ background: 'rgba(212,175,55,0.1)', border: 'none', color: 'var(--gold)', padding: '10px', borderRadius: '15px', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {mode === 'menu' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <HudSwitch icon={Map} label="Precision Area Converter" desc="Scientific land metrics" active={false} onClick={() => setMode('converter')} />
                <HudSwitch icon={Calculator} label="Dynamic Finance Calc" desc="Investment logic" active={false} onClick={() => setMode('calculator')} />
                <HudSwitch icon={Navigation} label="Elite Vastu Compass" desc="Stabilized orientation tracking" active={false} onClick={() => setMode('compass')} />
              </div>
            )}

            {mode === 'converter' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <input type="number" value={convValue} onChange={(e) => setConvValue(e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '2px solid var(--gold)', color: '#fff', fontSize: '2rem', fontWeight: 950, padding: '5px 0', outline: 'none', width: '100px' }} />
                    <select value={convUnit} onChange={(e) => setConvUnit(e.target.value)} style={{ background: 'rgba(212,175,55,0.15)', border: 'none', color: 'var(--gold)', padding: '8px 15px', borderRadius: '15px', fontSize: '0.95rem', fontWeight: 900, outline: 'none' }}>
                      {Object.keys(CONVERSION_BASES).filter(u => u !== 'Sq.Yds').map(u => <option key={u} value={u} style={{ background: '#0a0a14' }}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ maxHeight: '250px', overflowY: 'auto' }} className="custom-scrollbar">
                  {Object.keys(CONVERSION_BASES).filter(u => u !== convUnit && u !== 'Sq.Yds').map(u => {
                    const valueInSqYds = convValue * CONVERSION_BASES[convUnit];
                    const res = valueInSqYds / CONVERSION_BASES[u];
                    const formatted = Number(res.toFixed(6));
                    return (
                      <div key={u} onClick={() => { navigator.clipboard.writeText(String(formatted)); }} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px', cursor: 'pointer' }}>
                        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>{u}</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 950, color: 'var(--gold)' }}>{formatted}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {mode === 'calculator' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div style={{ gridColumn: 'span 4', background: 'rgba(0,0,0,0.6)', padding: '25px', borderRadius: '30px', marginBottom: '1.2rem', border: '1px solid rgba(212,175,55,0.2)', textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(212,175,55,0.5)', fontFamily: 'monospace' }}>{calcFormula || '...'}</div>
                  <div style={{ fontSize: '3rem', fontWeight: 950, color: '#fff' }}>{calcDisplay}</div>
                </div>
                {['C', '/', '*', 'DEL', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '%', '.', '0', 'H', '='].map(key => (
                  <button key={key} onClick={() => {
                    if (key === '=') { try { const res = new Function('return ' + calcFormula.replace(/[^-()\d/*+.]/g, ''))(); setCalcDisplay(String(res)); setCalcFormula(String(res)); } catch { setCalcDisplay('ERR'); } return; }
                    if (key === 'C') { setCalcDisplay('0'); setCalcFormula(''); return; }
                    if (key === 'DEL') { setCalcDisplay(calcDisplay.length > 1 ? calcDisplay.slice(0, -1) : '0'); setCalcFormula(calcFormula.slice(0, -1)); return; }
                    const newDisp = calcDisplay === '0' ? key : calcDisplay + key;
                    setCalcDisplay(newDisp); setCalcFormula(calcFormula + key);
                  }} style={{ padding: '18px 0', borderRadius: '20px', background: key === '=' ? 'var(--gold)' : 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: key === '=' ? '#000' : '#fff', fontSize: '1.25rem', fontWeight: 950 }}>{key}</button>
                ))}
              </div>
            )}

            {mode === 'compass' && (
              <div style={{ textAlign: 'center' }}>
                {compassPermission !== 'granted' ? (
                  <div style={{ padding: '3rem 1.5rem' }}>
                    <button onClick={requestCompass} className="btn-3d" style={{ width: '100%', padding: '16px', borderRadius: '20px' }}> SYNC PRECISION HUD <Activity size={18} style={{ marginLeft: '10px' }} /> </button>
                  </div>
                ) : (
                  <div>
                    <LiquidCompass rotation={rotationSpring} />
                    <div style={{ marginTop: '2rem' }}>
                       <div style={{ fontSize: '3.5rem', fontWeight: 950, color: '#fff', letterSpacing: '-2px', fontFamily: 'monospace' }}> {displayHeading}<span style={{ color: 'var(--gold)', fontSize: '1.5rem' }}>°</span> </div>
                       <div style={{ display: 'inline-flex', padding: '6px 20px', borderRadius: '100px', background: `${vastu.c}22`, border: `1.5px solid ${vastu.c}`, color: vastu.c, fontWeight: 950, marginTop: '10px' }}> {vastu.d} </div>
                       <div style={{ marginTop: '15px', padding: '15px', borderRadius: '25px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                         <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fff' }}>Deity: {vastu.v}</div>
                         <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Optimal: {vastu.s}</p>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '30px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}> <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--gold)' }} /> <span style={{ fontSize: '0.55rem', letterSpacing: '0.2em', opacity: 0.3 }}>STABILIZED</span> </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}> <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--emerald)' }} /> <span style={{ fontSize: '0.55rem', letterSpacing: '0.2em', opacity: 0.3 }}>SENSOR_SYNC</span> </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
