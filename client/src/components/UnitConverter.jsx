import React, { useState, useEffect } from 'react';
import { Calculator, X, ChevronRight, Compass, ArrowLeft, RotateCw, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CONVERSIONS = {
  'Sq.Yards': 1,
  'Sq.Ft': 9,
  'Cents': 0.02066,
  'Acres': 0.0002066,
  'Ankanam': 0.125,
  'Guntas': 0.008264
};

export default function UnitConverter() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('menu'); // menu, converter, calculator, compass
  const [value, setValue] = useState(100);
  const [fromUnit, setFromUnit] = useState('Sq.Yards');
  
  // Calculator State
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcFormula, setCalcFormula] = useState('');

  // Compass State
  const [heading, setHeading] = useState(0);
  const [compassPermission, setCompassPermission] = useState('prompt');

  useEffect(() => {
    // Check if orientation is supported
    if (!window.DeviceOrientationEvent) {
      setCompassPermission('denied');
    }
  }, []);

  const handleOrientation = (e) => {
    let orientation = e.webkitCompassHeading || (360 - e.alpha);
    if (orientation) setHeading(orientation);
  };

  const requestCompassPermission = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          setCompassPermission('granted');
          window.addEventListener('deviceorientation', handleOrientation, true);
        } else {
          setCompassPermission('denied');
        }
      } catch (err) {
        console.error('Compass permission error:', err);
      }
    } else {
      setCompassPermission('granted');
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
  };

  const calculate = (toUnit) => {
    const inSqYards = value / CONVERSIONS[fromUnit];
    return (inSqYards * CONVERSIONS[toUnit]).toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const handleCalcPress = (key) => {
    if (key === 'C') {
      setCalcDisplay('0');
      setCalcFormula('');
    } else if (key === '=') {
      try {
        // eslint-disable-next-line no-eval
        const result = eval(calcFormula.replace(/[^-()\d/*+.]/g, ''));
        setCalcDisplay(String(Number(result).toFixed(2)));
        setCalcFormula(String(result));
      } catch {
        setCalcDisplay('Error');
      }
    } else {
      const newDisplay = calcDisplay === '0' ? key : calcDisplay + key;
      setCalcDisplay(newDisplay);
      setCalcFormula(calcFormula + key);
    }
  };

  const getVastuDirection = (angle) => {
    if (angle >= 337.5 || angle < 22.5) return 'North (Simhadwara)';
    if (angle >= 22.5 && angle < 67.5) return 'North-East (Isanya - Vastu Best)';
    if (angle >= 67.5 && angle < 112.5) return 'East (Purva - Excellent)';
    if (angle >= 112.5 && angle < 157.5) return 'South-East (Agneya)';
    if (angle >= 157.5 && angle < 202.5) return 'South (Dakshina)';
    if (angle >= 202.5 && angle < 247.5) return 'South-West (Nairuti)';
    if (angle >= 247.5 && angle < 292.5) return 'West (Paschima)';
    if (angle >= 292.5 && angle < 337.5) return 'North-West (Vayavya)';
    return '';
  };

  return (
    <>
      <motion.button 
        onClick={() => { setIsOpen(!isOpen); setMode('menu'); }}
        className="unit-converter-trigger"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        style={{ 
          position: 'fixed', right: '20px', bottom: '20px', zIndex: 9999,
          width: '56px', height: '56px', borderRadius: '18px', background: 'var(--gold)',
          color: '#000', border: 'none', boxShadow: '0 8px 24px rgba(212,175,55,0.4)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <Calculator size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-3d-heavy"
            style={{ 
              position: 'fixed', top: '50%', left: '50%', x: '-50%', y: '-50%',
              width: '90%', maxWidth: '360px', padding: '1.25rem',
              zIndex: 10001, overflow: 'hidden', border: '1px solid rgba(212,175,55,0.3)'
            }}
          >
            {/* Header / Back Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
              {mode !== 'menu' && (
                <button 
                  onClick={() => setMode('menu')}
                  className="btn-3d-elite"
                  style={{ padding: '6px 12px', fontSize: '0.7rem' }}
                >
                  <ArrowLeft size={14} /> BACK
                </button>
              )}
              {mode === 'menu' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calculator size={18} className="text-gold" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>Utilities</h3>
                </div>
              )}
              <div style={{ flex: 1 }} />
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* Menu View */}
            {mode === 'menu' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <button onClick={() => setMode('converter')} className="btn-3d-elite" style={{ width: '100%', padding: '12px', justifyContent: 'space-between' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Hash size={18} /> Land Units</div> <ChevronRight size={16} />
                </button>
                <button onClick={() => setMode('calculator')} className="btn-3d-elite" style={{ width: '100%', padding: '12px', justifyContent: 'space-between' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Calculator size={18} /> Price Calc</div> <ChevronRight size={16} />
                </button>
                <button onClick={() => setMode('compass')} className="btn-3d-elite" style={{ width: '100%', padding: '12px', justifyContent: 'space-between' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Compass size={18} /> Vastu Compass</div> <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Units View */}
            {mode === 'converter' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.65rem', color: 'var(--gold)', fontWeight: 800, display: 'block', marginBottom: '0.5rem' }}>VALUE</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="dropdown-3d-glass" style={{ flex: 1 }} />
                    <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className="dropdown-3d-glass">
                      {Object.keys(CONVERSIONS).map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                  {Object.keys(CONVERSIONS).filter(u => u !== fromUnit).map(u => (
                    <div key={u} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.7rem', color: '#fff' }}>{u}</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--gold)' }}>{calculate(u)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Calc View */}
            {mode === 'calculator' && (
              <div>
                <div style={{ background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '16px', color: '#fff', fontSize: '1.5rem', fontWeight: 800, textAlign: 'right', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>{calcDisplay}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '=', '+'].map(key => (
                    <button 
                      key={key} 
                      onClick={() => handleCalcPress(key)} 
                      className="btn-3d-elite"
                      style={{ padding: '12px 0', background: key === '=' ? 'var(--gold)' : '', color: key === '=' ? '#000' : '' }}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Compass View */}
            {mode === 'compass' && (
              <div style={{ textAlign: 'center' }}>
                {compassPermission !== 'granted' ? (
                  <div style={{ padding: '1rem 0' }}>
                    <p style={{ fontSize: '0.85rem', marginBottom: '1rem', color: '#fff' }}>Interactive Vastu guidance requires orientation data.</p>
                    <button onClick={requestCompassPermission} className="btn-3d-elite" style={{ padding: '12px 24px', margin: '0 auto' }}>
                      <RotateCw size={16} /> CALIBRATE
                    </button>
                  </div>
                ) : (
                  <div>
                    <motion.div 
                      style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto' }}
                      animate={{ rotate: -heading }}
                    >
                      <svg viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}>
                        <circle cx="50" cy="50" r="48" fill="rgba(10,10,20,0.7)" stroke="var(--gold)" strokeWidth="1" />
                        {/* Degrees ticks */}
                        {[...Array(12)].map((_, i) => (
                           <line key={i} x1="50" y1="5" x2="50" y2="10" stroke="white" strokeWidth="0.5" transform={`rotate(${i * 30} 50 50)`} />
                        ))}
                        <text x="50" y="20" textAnchor="middle" fill="var(--gold)" fontSize="10" fontWeight="900">N</text>
                        <text x="50" y="90" textAnchor="middle" fill="white" fontSize="8">S</text>
                        <text x="85" y="55" textAnchor="middle" fill="white" fontSize="8">E</text>
                        <text x="15" y="55" textAnchor="middle" fill="white" fontSize="8">W</text>
                        <path d="M50 25 L55 50 L50 75 L45 50 Z" fill="var(--gold)" />
                        <circle cx="50" cy="50" r="4" fill="#fff" />
                      </svg>
                    </motion.div>
                    <div style={{ marginTop: '1.5rem' }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--gold)' }}>{Math.round(heading)}°</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{getVastuDirection(heading)}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
