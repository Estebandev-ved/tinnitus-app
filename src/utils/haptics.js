export const haptic = (pattern = 10) => {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try { navigator.vibrate(pattern); } catch (_) { /* no-op */ }
  }
};
