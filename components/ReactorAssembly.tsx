"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

/**
 * The IM3 Mark XLII reactor, assembling piece-by-piece as the intro track is
 * scrolled — choreography matched to the reference film: coil segments fly in
 * from off-screen and converge, the bezel ring locks, the triangular rotor
 * spins into place, corner nodes clamp on, then the core ignites with a flash.
 * Every part is scrubbed off one shared scroll-progress MotionValue.
 *
 * Geometry is identical to ArcReactorStatic (kept for non-scrolling uses).
 */
type Props = {
  progress: MotionValue<number>;
  reduced: boolean;
};

const OUTER = "100,162 46.3,69 153.7,69";
const NEST1 = "100,150 56.7,75 143.3,75";
const NEST2 = "100,138 67,81 133,81";
const CORNERS: [number, number][] = [
  [100, 162],
  [46.3, 69],
  [153.7, 69],
];
const CORE = "100,78 81,111 119,111";
const CORE_INNER = "100,88 89.6,106 110.4,106";

export default function ReactorAssembly({ progress, reduced }: Props) {
  // ── Assembly windows over scroll progress (0..1) ──────────────
  // glow warms as parts arrive, then surges on core ignition
  const glowOpacity = useTransform(progress, [0.05, 0.6, 0.72], [0.05, 0.35, 1]);

  // 1. bezel ring drifts in and locks
  const bezelOpacity = useTransform(progress, [0.04, 0.16], [0, 1]);
  const bezelScale = useTransform(progress, [0.04, 0.2], [1.35, 1]);
  const bezelRotate = useTransform(progress, [0.04, 0.2], [-40, 0]);

  // 2. tick ring spins into alignment
  const tickOpacity = useTransform(progress, [0.12, 0.24], [0, 1]);
  const tickRotate = useTransform(progress, [0.12, 0.28], [120, 0]);

  // 3. coil housing
  const housingOpacity = useTransform(progress, [0.18, 0.3], [0, 1]);
  const housingScale = useTransform(progress, [0.18, 0.3], [0.82, 1]);

  // 4. rotor triangle spins into place
  const triOpacity = useTransform(progress, [0.34, 0.46], [0, 1]);
  const triRotate = useTransform(progress, [0.34, 0.5], [-75, 0]);
  const triScale = useTransform(progress, [0.34, 0.5], [0.5, 1]);

  // 5. nested bevels
  const nest1Opacity = useTransform(progress, [0.46, 0.56], [0, 1]);
  const nest2Opacity = useTransform(progress, [0.5, 0.6], [0, 1]);

  // 6. core ignition + flash
  const coreOpacity = useTransform(progress, [0.62, 0.72], [0, 1]);
  const coreScale = useTransform(progress, [0.62, 0.74], [0.3, 1]);
  const flashOpacity = useTransform(progress, [0.66, 0.73, 0.82], [0, 0.65, 0]);

  const style = (s: Record<string, MotionValue<number>>) =>
    reduced ? undefined : { ...s, transformOrigin: "100px 100px" };

  return (
    <div aria-hidden className="relative flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 200 200" className="h-full w-full max-h-[460px]">
        <defs>
          <radialGradient id="ra-core" cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor="#f4feff" />
            <stop offset="35%" stopColor="#bdf3fb" />
            <stop offset="72%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0e7d8f" />
          </radialGradient>
          <radialGradient id="ra-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ra-metal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7de7f5" />
            <stop offset="48%" stopColor="#1b6f7e" />
            <stop offset="100%" stopColor="#0b343c" />
          </linearGradient>
        </defs>

        {/* Blueprint ghost — faint schematic the parts assemble into */}
        <g stroke="#22d3ee" strokeOpacity="0.14" fill="none" strokeDasharray="3 5">
          <circle cx="100" cy="100" r="90" strokeWidth="1" />
          <circle cx="100" cy="100" r="76" strokeWidth="1" />
          <polygon points={OUTER} strokeWidth="1.2" strokeLinejoin="round" />
        </g>

        {/* Ambient glow — warms up as the build completes */}
        <motion.circle
          cx="100" cy="100" r="98" fill="url(#ra-glow)"
          style={style({ opacity: glowOpacity })}
        />

        {/* 1 — Outer bezel */}
        <motion.g
          style={style({ opacity: bezelOpacity, scale: bezelScale, rotate: bezelRotate })}
        >
          <circle cx="100" cy="100" r="90" fill="#06121a" stroke="#0f3d47" strokeWidth="3" />
          <circle cx="100" cy="100" r="90" fill="none" stroke="#22d3ee" strokeOpacity="0.45" strokeWidth="1" />
        </motion.g>

        {/* 2 — Tick ring (CSS spin nested inside the scrub transform) */}
        <motion.g
          style={style({ opacity: tickOpacity, rotate: tickRotate })}
        >
          <g className="animate-spin-slow" style={{ transformOrigin: "100px 100px" }}>
            <circle
              cx="100" cy="100" r="83" fill="none"
              stroke="#22d3ee" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 6"
            />
          </g>
        </motion.g>

        {/* 3 — Coil housing */}
        <motion.g
          style={style({ opacity: housingOpacity, scale: housingScale })}
        >
          <circle cx="100" cy="100" r="76" fill="#08161f" stroke="#155e6b" strokeWidth="2" />
        </motion.g>

        {/* Coil segments — fly in radially from off-screen, one after another */}
        <g>
          {Array.from({ length: 18 }).map((_, i) => (
            <Coil key={i} i={i} progress={progress} reduced={reduced} />
          ))}
        </g>

        {/* 4 — Rotor triangle spins into place */}
        <motion.g
          style={style({ opacity: triOpacity, rotate: triRotate, scale: triScale })}
        >
          <polygon points={OUTER} fill="#08202a" stroke="url(#ra-metal)" strokeWidth="6" strokeLinejoin="round" />
          <polygon points={OUTER} fill="none" stroke="#7de7f5" strokeOpacity="0.85" strokeWidth="1.5" strokeLinejoin="round" />
        </motion.g>

        {/* 5 — Nested bevels */}
        <motion.polygon
          points={NEST1} fill="none" stroke="#22d3ee" strokeOpacity="0.55" strokeWidth="2" strokeLinejoin="round"
          style={style({ opacity: nest1Opacity })}
        />
        <motion.polygon
          points={NEST2} fill="none" stroke="#22d3ee" strokeOpacity="0.4" strokeWidth="1.5" strokeLinejoin="round"
          style={style({ opacity: nest2Opacity })}
        />

        {/* Corner nodes clamp on, one per corner */}
        {CORNERS.map(([x, y], i) => (
          <CornerNode key={i} x={x} y={y} i={i} progress={progress} reduced={reduced} />
        ))}

        {/* 6 — Core ignition */}
        <motion.g
          style={style({ opacity: coreOpacity, scale: coreScale })}
        >
          <circle cx="100" cy="100" r="34" fill="url(#ra-glow)" />
          <polygon
            points={CORE}
            fill="url(#ra-core)"
            className="animate-pulse-core"
            style={{ transformOrigin: "100px 100px" }}
          />
          <polygon points={CORE_INNER} fill="none" stroke="#eafdff" strokeOpacity="0.9" strokeWidth="1.5" strokeLinejoin="round" />
          <polygon points="100,94 95,104 105,104" fill="#eafdff" />
        </motion.g>

        {/* Ignition flash */}
        <motion.circle
          cx="100" cy="100" r="60" fill="#bdf3fb"
          style={reduced ? { opacity: 0 } : { opacity: flashOpacity }}
        />
      </svg>
    </div>
  );
}

/* One coil segment flying in along its own radial line. */
function Coil({
  i,
  progress,
  reduced,
}: {
  i: number;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const a = (i / 18) * Math.PI * 2;
  const x = +(100 + Math.cos(a) * 70).toFixed(2);
  const y = +(100 + Math.sin(a) * 70).toFixed(2);
  const rot = +((a * 180) / Math.PI + 90).toFixed(2);
  // staggered window: first coil ~0.08, last ~0.27, each 0.14 wide
  const start = 0.08 + i * 0.011;
  const end = start + 0.14;
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const tx = useTransform(progress, [start, end], [+(Math.cos(a) * 130).toFixed(2), 0]);
  const ty = useTransform(progress, [start, end], [+(Math.sin(a) * 130).toFixed(2), 0]);

  return (
    <motion.g style={reduced ? undefined : { opacity, x: tx, y: ty }}>
      <rect
        x={+(x - 3).toFixed(2)}
        y={+(y - 6).toFixed(2)}
        width="6"
        height="12"
        rx="1.5"
        fill="#0a2730"
        stroke="#22d3ee"
        strokeOpacity="0.7"
        strokeWidth="0.8"
        transform={`rotate(${rot} ${x} ${y})`}
      />
    </motion.g>
  );
}

/* One corner node popping into place. */
function CornerNode({
  x,
  y,
  i,
  progress,
  reduced,
}: {
  x: number;
  y: number;
  i: number;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const start = 0.52 + i * 0.045;
  const opacity = useTransform(progress, [start, start + 0.08], [0, 1]);
  const scale = useTransform(progress, [start, start + 0.08], [0, 1]);

  return (
    <motion.g
      style={reduced ? undefined : { opacity, scale, transformOrigin: `${x}px ${y}px` }}
    >
      <circle cx={x} cy={y} r="9" fill="#06121a" stroke="#22d3ee" strokeWidth="2" />
      <circle cx={x} cy={y} r="4" fill="#22d3ee" />
    </motion.g>
  );
}
