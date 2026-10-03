/**
 * Project Aegis — the single source of truth for the scroll storyboard.
 *
 * Everything in the armor experience is a pure function of one number,
 * `p` ∈ [0, 1] (scroll progress, smoothed). Scrolling down advances it,
 * scrolling up reverses it — there are no autoplaying timelines anywhere.
 */

export const SCENES = [
  { id: "init", label: "INITIALIZATION", at: [0, 0.1] },
  { id: "helmet", label: "HELMET", at: [0.1, 0.25] },
  { id: "torso", label: "TORSO", at: [0.25, 0.45] },
  { id: "arms", label: "ARMS", at: [0.45, 0.65] },
  { id: "lower", label: "LOWER BODY", at: [0.65, 0.8] },
  { id: "online", label: "SYSTEM ONLINE", at: [0.8, 1] },
] as const;

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

/** Local 0..1 progress of `p` inside the window [a, b]. */
export const win = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

export const smooth = (t: number) => t * t * (3 - 2 * t);

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Ease-out with overshoot — the part travels past its socket and settles
 *  back, which reads as a mechanical lock-in rather than a soft landing. */
export const lockIn = (t: number, s = 1.35) => {
  const u = t - 1;
  return 1 + (s + 1) * u * u * u + s * u * u;
};

/* ── Camera path ──────────────────────────────────────────────────────
 * Spherical coordinates around a moving target, keyframed on p and
 * sampled with Catmull-Rom so velocity is continuous through every key —
 * no stops, no jumps, fully reversible.
 *   az  — azimuth in degrees (0 = dead front, + = camera on the armor's left)
 *   el  — elevation in degrees
 *   r   — radius; the value `FINAL` is replaced at runtime by the distance
 *         that frames the full body at ~80% of the viewport height
 *   tx, ty — look-at target (x, y)
 */
export const FINAL = -1;

export type CamKey = { p: number; az: number; el: number; r: number; tx: number; ty: number };

export const CAMERA_KEYS: CamKey[] = [
  { p: 0.0, az: 52, el: 7, r: 4.4, tx: -0.62, ty: 1.22 }, // 3/4, armor parked right
  { p: 0.1, az: 46, el: 6, r: 3.0, tx: -0.3, ty: 1.5 },
  { p: 0.2, az: 34, el: 3, r: 1.75, tx: -0.06, ty: 1.66 }, // helmet close-up
  { p: 0.3, az: 26, el: 2, r: 2.4, tx: 0, ty: 1.45 },
  { p: 0.42, az: 14, el: 4, r: 2.9, tx: 0, ty: 1.32 }, // torso
  { p: 0.55, az: -18, el: 5, r: 3.4, tx: 0, ty: 1.2 }, // swing across for the arms
  { p: 0.68, az: -24, el: 3, r: 4.2, tx: 0, ty: 0.9 }, // lower body
  { p: 0.8, az: -10, el: 2, r: 5.0, tx: 0, ty: 0.95 },
  { p: 0.92, az: 0, el: 0, r: FINAL, tx: 0, ty: 0.93 }, // locked front hero shot
  { p: 1.0, az: 0, el: 0, r: FINAL, tx: 0, ty: 0.93 },
];

const catmull = (p0: number, p1: number, p2: number, p3: number, t: number) => {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
};

export function sampleCamera(p: number, finalR: number, rScale: number) {
  const k = CAMERA_KEYS;
  const x = clamp01(p);
  let i = 0;
  while (i < k.length - 2 && x > k[i + 1].p) i++;
  const a = k[Math.max(0, i - 1)];
  const b = k[i];
  const c = k[i + 1];
  const d = k[Math.min(k.length - 1, i + 2)];
  const t = (x - b.p) / (c.p - b.p || 1);
  const R = (key: CamKey) => (key.r === FINAL ? finalR : key.r * rScale);
  const f = (sel: (key: CamKey) => number) => catmull(sel(a), sel(b), sel(c), sel(d), t);
  return {
    az: f((q) => q.az),
    el: f((q) => q.el),
    r: f(R),
    tx: f((q) => q.tx),
    ty: f((q) => q.ty),
  };
}

/** Armor proportions (world units, feet on y = 0). */
export const BODY = {
  height: 1.88,
  centerY: 0.93,
};
