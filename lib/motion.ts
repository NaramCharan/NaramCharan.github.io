// Shared motion language — one easing curve, one rhythm, applied everywhere.
// Premium expo-out easing reads as "crafted" rather than default AOS fade.

export const EASE = [0.16, 1, 0.3, 1] as const;

/** Fade-up on mount (for above-the-fold hero elements). */
export const enter = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: EASE, delay },
});
