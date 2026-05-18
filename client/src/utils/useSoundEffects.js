import { useCallback } from 'react';

/**
 * Premium Web Audio API Synthesis Engine
 * Provides sub-millisecond, high-fidelity physical haptic sound effects
 * with zero file loading latency and 100% offline support.
 */

// Global AudioContext (lazy-initialized to respect browser autoplay policies)
let audioCtx = null;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const useSoundEffects = () => {
  const isSoundEnabled = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('snapadda_sound_effects') !== 'false';
  }, []);
  
  // 1. Mechanical "Tick" (Ideal for bottom tabs and click buttons)
  const playTick = useCallback(() => {
    try {
      if (!isSoundEnabled()) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle'; // Smooth, organic knock
      osc.frequency.setValueAtTime(1400, ctx.currentTime); // High frequency notch
      
      // Ultra-short envelope
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02); // 20ms duration

      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch (e) {
      console.warn('Audio synthesis tick failed', e);
    }
  }, [isSoundEnabled]);

  // 2. Soft Bubble "Pop" (Ideal for sheets sliding up, filters opening)
  const playPop = useCallback(() => {
    try {
      if (!isSoundEnabled()) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine'; // Pure liquid tone
      
      // Frequency sweep (sliding upwards from low to high)
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.07);

      // Bubble pop envelope
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08); // 80ms duration

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {
      console.warn('Audio synthesis pop failed', e);
    }
  }, [isSoundEnabled]);

  // 3. Royal Golden "Chime" (Ideal for success toast, conversions, celebrations)
  const playChime = useCallback(() => {
    try {
      if (!isSoundEnabled()) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Double-note harmonized arpeggio
      const playNote = (freq, startTime, duration, vol = 0.05) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.linearRampToValueAtTime(vol * 0.5, startTime + duration * 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.1);
      };

      // Play elegant C6 (1046Hz) and G6 arpeggio (1568Hz) arpeggio
      playNote(1046.50, now, 0.45, 0.05); // First note
      playNote(1567.98, now + 0.08, 0.6, 0.04); // Overlapping fifth note (creating golden harmony)
    } catch (e) {
      console.warn('Audio synthesis chime failed', e);
    }
  }, [isSoundEnabled]);

  return { playTick, playPop, playChime };
};
