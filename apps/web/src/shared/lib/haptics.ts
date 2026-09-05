/** Progressive enhancement: iOS Safari may not expose the Vibration API. */
export function triggerHaptic(
  type:
    | 'selection'
    | 'impactLight'
    | 'impactMedium'
    | 'impactHeavy'
    | 'success'
    | 'error' = 'impactLight',
) {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  const patterns = {
    selection: 8,
    impactLight: 12,
    impactMedium: 20,
    impactHeavy: 30,
    success: [15, 35, 20],
    error: [25, 40, 25, 40, 25],
  };
  try {
    navigator.vibrate(patterns[type]);
  } catch {
    /* Restricted webview, keep visual feedback. */
  }
}
