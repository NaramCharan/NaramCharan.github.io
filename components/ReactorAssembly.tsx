"use client";

/**
 * The IM3 Mark XLII arc reactor as a GSAP-ready rig: pure SVG, every part
 * carries a class hook (.ra-*) so the scroll timeline in IntroDashboard can
 * fly pieces in from off-screen and snap them together (film-matched:
 * scattered components → staggered mechanical assembly → core ignition).
 *
 * This component renders the FINAL (assembled) state — GSAP owns the motion.
 * With reduced motion no timeline runs, so this is also the a11y fallback.
 * All parts use .ar-part (transform-box: fill-box + will-change: transform)
 * so scales/rotations are GPU-accelerated around each piece's own centre.
 *
 * Geometry is identical to ArcReactorStatic (kept for non-scrolling uses).
 */
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

export default function ReactorAssembly() {
  return (
    <div aria-hidden className="relative flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 200 200" className="ra-svg h-full w-full max-h-[460px] overflow-visible">
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

        {/* Blueprint ghost — the faint schematic the parts assemble into */}
        <g
          className="ra-ghost"
          stroke="#22d3ee"
          strokeOpacity="0.14"
          fill="none"
          strokeDasharray="3 5"
        >
          <circle cx="100" cy="100" r="90" strokeWidth="1" />
          <circle cx="100" cy="100" r="76" strokeWidth="1" />
          <polygon points={OUTER} strokeWidth="1.2" strokeLinejoin="round" />
        </g>

        {/* Schematic callout annotations (visible while parts float, à la EDITH) */}
        <g className="ra-callout" opacity="0" stroke="#22d3ee" strokeOpacity="0.5" strokeWidth="0.7" fill="none">
          <path d="M100 100 L136 64 H170" />
          <circle cx="136" cy="64" r="1.6" fill="#22d3ee" stroke="none" />
          <path d="M100 100 L62 138 H28" />
          <circle cx="62" cy="138" r="1.6" fill="#22d3ee" stroke="none" />
        </g>

        {/* Ambient glow — "charging up" after assembly */}
        <circle className="ra-glowring ar-part" cx="100" cy="100" r="98" fill="url(#ra-glow)" />

        {/* 1 — Outer bezel */}
        <g className="ra-bezel ar-part">
          <circle cx="100" cy="100" r="90" fill="#06121a" stroke="#0f3d47" strokeWidth="3" />
          <circle cx="100" cy="100" r="90" fill="none" stroke="#22d3ee" strokeOpacity="0.45" strokeWidth="1" />
        </g>

        {/* 2 — Tick ring (CSS idle spin nested inside the GSAP part) */}
        <g className="ra-tick ar-part">
          <g className="animate-spin-slow" style={{ transformOrigin: "100px 100px" }}>
            <circle
              cx="100" cy="100" r="83" fill="none"
              stroke="#22d3ee" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 6"
            />
          </g>
        </g>

        {/* 3 — Coil housing */}
        <g className="ra-housing ar-part">
          <circle cx="100" cy="100" r="76" fill="#08161f" stroke="#155e6b" strokeWidth="2" />
        </g>

        {/* Coil segments — the scattered pieces that stagger into the ring */}
        <g>
          {Array.from({ length: 18 }).map((_, i) => {
            const a = (i / 18) * Math.PI * 2;
            const x = +(100 + Math.cos(a) * 70).toFixed(2);
            const y = +(100 + Math.sin(a) * 70).toFixed(2);
            const rot = +((a * 180) / Math.PI + 90).toFixed(2);
            return (
              <g key={i} className="ra-coil ar-part" data-angle={a.toFixed(4)}>
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
              </g>
            );
          })}
        </g>

        {/* 4 — Rotor triangle */}
        <g className="ra-tri ar-part">
          <polygon points={OUTER} fill="#08202a" stroke="url(#ra-metal)" strokeWidth="6" strokeLinejoin="round" />
          <polygon points={OUTER} fill="none" stroke="#7de7f5" strokeOpacity="0.85" strokeWidth="1.5" strokeLinejoin="round" />
        </g>

        {/* 5 — Nested bevels */}
        <polygon
          className="ra-nest ar-part"
          points={NEST1} fill="none" stroke="#22d3ee" strokeOpacity="0.55" strokeWidth="2" strokeLinejoin="round"
        />
        <polygon
          className="ra-nest ar-part"
          points={NEST2} fill="none" stroke="#22d3ee" strokeOpacity="0.4" strokeWidth="1.5" strokeLinejoin="round"
        />

        {/* Corner nodes */}
        {CORNERS.map(([x, y], i) => (
          <g key={i} className="ra-node ar-part">
            <circle cx={x} cy={y} r="9" fill="#06121a" stroke="#22d3ee" strokeWidth="2" />
            <circle cx={x} cy={y} r="4" fill="#22d3ee" />
          </g>
        ))}

        {/* 6 — Core (the back.out "mechanical snap" piece) */}
        <g className="ra-corewrap ar-part">
          <circle cx="100" cy="100" r="34" fill="url(#ra-glow)" />
          <polygon
            points={CORE}
            fill="url(#ra-core)"
            className="animate-pulse-core"
            style={{ transformOrigin: "100px 100px" }}
          />
          <polygon points={CORE_INNER} fill="none" stroke="#eafdff" strokeOpacity="0.9" strokeWidth="1.5" strokeLinejoin="round" />
          <polygon points="100,94 95,104 105,104" fill="#eafdff" />
        </g>

        {/* Ignition flash */}
        <circle className="ra-flash ar-part" cx="100" cy="100" r="60" fill="#bdf3fb" opacity="0" />
      </svg>
    </div>
  );
}
