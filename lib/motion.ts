// Shared motion language — one easing curve, one rhythm, applied everywhere.
// Premium expo-out easing reads as "crafted" rather than default AOS fade.

export const EASE = [0.16, 1, 0.3, 1] as const;

/** Refined section/card reveal: rise + settle on the shared easing curve. */
export const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-70px" } as const,
  transition: { duration: 0.7, ease: EASE, delay },
});

/** Same, but plays on mount (for above-the-fold hero elements). */
export const enter = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: EASE, delay },
});
