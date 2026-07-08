"use client";

/**
 * Iron Man 3 "Mark XLII" arc reactor — the triangular new-element core.
 * Pure SVG so it stays crisp at any size, themeable, and reduced-motion safe
 * (the global reduced-motion rule freezes the CSS spins/pulse automatically).
 *
 * Geometry mirrors the WebGL hero rig: 10 radial copper coil wedges in a
 * recessed well with lit slots between them, concentric machined rings, a
 * dominant downward triangle rotor with corner nodes, and a 16-tooth collar
 * around the bright upward-triangle core.
 */

// deterministic polar helper (no Math.random — hydration-safe)
const pt = (deg: number, r: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [+(100 + Math.cos(a) * r).toFixed(2), +(100 + Math.sin(a) * r).toFixed(2)];
};

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

  // 10 copper coil wedges (narrow end inward), matching the 3D rig.
  const coilWedges = Array.from({ length: 10 }, (_, i) => {
    const a = i * 36 - 90;
    const [x1, y1] = pt(a - 6.3, 50);
    const [x2, y2] = pt(a + 6.3, 50);
    const [x3, y3] = pt(a + 7.8, 74);
    const [x4, y4] = pt(a - 7.8, 74);
    return `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`;
  });
  // lit slots between the wedges (offset half a pitch)
  const slots = Array.from({ length: 10 }, (_, i) => {
    const a = i * 36 - 72;
    const [x1, y1] = pt(a, 52);
    const [x2, y2] = pt(a, 72);
    return { x1, y1, x2, y2 };
  });
  // 16-tooth collar around the core
  const teeth = Array.from({ length: 16 }, (_, i) => {
    const a = i * 22.5;
    const [x, y] = pt(a, 30);
    return { x, y, rot: +(a + 90).toFixed(2) };
  });

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

        {/* Recessed coil well */}
        <circle cx="100" cy="100" r="76" fill="#08161f" stroke="#155e6b" strokeWidth="2" />
        <circle cx="100" cy="100" r="72" fill="#060f16" />

        {/* Coil band — copper wedges + lit slots, slowly counter-rotating */}
        <g className="animate-spin-rev" style={{ transformOrigin: "100px 100px" }}>
          {slots.map((s, i) => (
            <line
              key={`s${i}`}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke="#22d3ee"
              strokeOpacity="0.8"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          ))}
          {coilWedges.map((pts, i) => (
            <g key={`w${i}`}>
              <polygon points={pts} fill="#241408" stroke="#c9772e" strokeOpacity="0.8" strokeWidth="1.4" strokeLinejoin="round" />
              {/* cyan winding highlight down each wedge face */}
              <line
                x1={pt(i * 36 - 90, 53)[0]}
                y1={pt(i * 36 - 90, 53)[1]}
                x2={pt(i * 36 - 90, 71)[0]}
                y2={pt(i * 36 - 90, 71)[1]}
                stroke="#22d3ee"
                strokeOpacity="0.55"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </g>
          ))}
        </g>

        {/* Concentric machined rings between coils and rotor */}
        <circle cx="100" cy="100" r="46" fill="none" stroke="#2a4a55" strokeWidth="1.6" />
        <circle cx="100" cy="100" r="42" fill="none" stroke="#7de7f5" strokeOpacity="0.3" strokeWidth="1" />

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

        {/* 16-tooth collar + hub ring around the core (matches the 3D rig) */}
        {teeth.map((t, i) => (
          <rect
            key={i}
            x={+(t.x - 2.2).toFixed(2)}
            y={+(t.y - 3).toFixed(2)}
            width="4.4"
            height="6"
            fill="#2a4a55"
            stroke="#7de7f5"
            strokeOpacity="0.35"
            strokeWidth="0.6"
            transform={`rotate(${t.rot} ${t.x} ${t.y})`}
          />
        ))}
        <circle cx="100" cy="100" r="26" fill="none" stroke="#7de7f5" strokeOpacity="0.6" strokeWidth="1.6" />

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
