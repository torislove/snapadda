/**
 * SnapAdda Haptics Engine
 * Provides tactile feedback for mobile touch interactions
 */
export const triggerHaptic = (type = 'light') => {
  if (typeof window === 'undefined' || !navigator.vibrate) return;

  switch (type) {
    case 'light':
      navigator.vibrate(10);
      break;
    case 'medium':
      navigator.vibrate(25);
      break;
    case 'heavy':
      navigator.vibrate(50);
      break;
    case 'success':
      navigator.vibrate([10, 30, 10]);
      break;
    case 'error':
      navigator.vibrate([50, 100, 50]);
      break;
    case 'warning':
      navigator.vibrate([20, 50]);
      break;
    default:
      navigator.vibrate(10);
  }
};
