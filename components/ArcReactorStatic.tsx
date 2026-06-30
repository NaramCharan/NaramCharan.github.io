"use client";

/**
 * Iron Man 3 "Mark XLII" arc reactor — the triangular new-element core.
 * Pure SVG so it stays crisp at any size, themeable, and reduced-motion safe
 * (the global reduced-motion rule freezes the CSS spins/pulse automatically).
 *
 * Geometry: a dominant downward triangle (centroid at 100,100) with corner
 * nodes, nested bevels, a coil housing ring, and a bright upward-triangle core.
 */
export default function ArcReactorStatic() {
  // Downward triangle, circumradius 62 → centroid (100,100).
  const outer = "100,162 46.3,69 153.7,69";
  const nest1 = "100,150 56.7,75 143.3,75";
  const nest2 = "100,138 67,81 133,81";
  const corners: [number, number][] = [
    [100, 162],
    [46.3, 69],
    [153.7, 69],
  ];
  // Upward triangle core, circumradius 22.
  const core = "100,78 81,111 119,111";
  const coreInner = "100,88 89.6,106 110.4,106";

  return (
    <div
      aria-hidden
      className="relative flex h-full w-full items-center justify-center"
    >
      <svg viewBox="0 0 200 200" className="h-full w-full max-h-[460px]">
        <defs>
          <radialGradient id="ar-core" cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor="#f4feff" />
            <stop offset="35%" stopColor="#bdf3fb" />
            <stop offset="72%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0e7d8f" />
          </radialGradient>
          <radialGradient id="ar-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ar-metal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7de7f5" />
            <stop offset="48%" stopColor="#1b6f7e" />
            <stop offset="100%" stopColor="#0b343c" />
          </linearGradient>
        </defs>

        {/* Ambient glow */}
        <circle cx="100" cy="100" r="98" fill="url(#ar-glow)" />

        {/* Outer bezel */}
        <circle cx="100" cy="100" r="90" fill="#06121a" stroke="#0f3d47" strokeWidth="3" />
        <circle cx="100" cy="100" r="90" fill="none" stroke="#22d3ee" strokeOpacity="0.45" strokeWidth="1" />

        {/* Rotating outer tick ring */}
        <g className="animate-spin-slow" style={{ transformOrigin: "100px 100px" }}>
          <circle
            cx="100"
            cy="100"
            r="83"
            fill="none"
            stroke="#22d3ee"
            strokeOpacity="0.35"
            strokeWidth="1"
            strokeDasharray="2 6"
          />
        </g>

        {/* Coil housing */}
        <circle cx="100" cy="100" r="76" fill="#08161f" stroke="#155e6b" strokeWidth="2" />

        {/* Coil segments (counter-rotating) */}
        <g className="animate-spin-rev" style={{ transformOrigin: "100px 100px" }}>
          {Array.from({ length: 18 }).map((_, i) => {
            const a = (i / 18) * Math.PI * 2;
            const x = +(100 + Math.cos(a) * 70).toFixed(2);
            const y = +(100 + Math.sin(a) * 70).toFixed(2);
            const rot = +((a * 180) / Math.PI + 90).toFixed(2);
            return (
              <rect
                key={i}
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
            );
          })}
        </g>

        {/* Dominant downward triangle (beveled metal) */}
        <polygon points={outer} fill="#08202a" stroke="url(#ar-metal)" strokeWidth="6" strokeLinejoin="round" />
        <polygon points={outer} fill="none" stroke="#7de7f5" strokeOpacity="0.85" strokeWidth="1.5" strokeLinejoin="round" />

        {/* Nested triangle bevels */}
        <polygon points={nest1} fill="none" stroke="#22d3ee" strokeOpacity="0.55" strokeWidth="2" strokeLinejoin="round" />
        <polygon points={nest2} fill="none" stroke="#22d3ee" strokeOpacity="0.4" strokeWidth="1.5" strokeLinejoin="round" />

        {/* Corner nodes */}
        {corners.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="9" fill="#06121a" stroke="#22d3ee" strokeWidth="2" />
            <circle cx={x} cy={y} r="4" fill="#22d3ee" />
          </g>
        ))}

        {/* Central core glow + upward-triangle emblem */}
        <circle cx="100" cy="100" r="34" fill="url(#ar-glow)" />
        <polygon
          points={core}
          fill="url(#ar-core)"
          className="animate-pulse-core"
          style={{ transformOrigin: "100px 100px" }}
        />
        <polygon points={coreInner} fill="none" stroke="#eafdff" strokeOpacity="0.9" strokeWidth="1.5" strokeLinejoin="round" />
        <polygon points="100,94 95,104 105,104" fill="#eafdff" />
      </svg>
    </div>
  );
}
