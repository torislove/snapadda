import confetti from 'canvas-confetti';

/**
 * Custom High-Fidelity UI Celebration Engine
 * Powered by hardware-accelerated HTML5 Canvas Confetti.
 */

// Synthesize a beautiful C6-G6 golden success chime arpeggio directly via Web Audio API
const playCelebrationChime = () => {
  try {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

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

    playNote(1046.50, now, 0.45, 0.05); // C6
    playNote(1567.98, now + 0.08, 0.6, 0.04); // G6 (creating golden fifth harmony)
  } catch (e) {
    console.warn('Celebration audio chime failed', e);
  }
};

// 1. Premium Liquid Gold Burst (Ideal for form submissions / simple leads)
export const triggerGoldBurst = () => {
  playCelebrationChime();
  confetti({
    particleCount: 140,
    spread: 80,
    origin: { y: 0.6 },
    colors: [
      '#f4d03f', // Gold
      '#fcd58e', // Light Gold
      '#e8b84b', // Royal Gold
      '#ffffff'  // Silver highlight
    ],
    disableForReducedMotion: true
  });
};

// 2. Dual Side-Cannon Stream (Ideal for key milestones like Onboarding Completion!)
export const triggerContinuousConfetti = (durationSeconds = 3) => {
  playCelebrationChime();
  const duration = durationSeconds * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 999999 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    // Left Cannon
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });
    // Right Cannon
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);
};

// 3. Majestic Fireworks Celebration (Ideal for successful property postings!)
export const triggerVentureSuccess = () => {
  playCelebrationChime();
  const duration = 4 * 1000;
  const animationEnd = Date.now() + duration;

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    // Launch single fireworks firecracker shell that explodes
    confetti({
      particleCount: 80,
      startVelocity: 45,
      spread: 60,
      origin: { x: Math.random(), y: Math.random() - 0.2 },
      colors: ['#22d9e0', '#9b59f5', '#f5397b', '#10d98c', '#e8b84b']
    });
  }, 400);
};
