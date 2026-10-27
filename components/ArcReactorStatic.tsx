"use client";

/**
 * Iron Man Arc Reactor (Avengers / Mark VI triangular core design).
 * Pure SVG so it stays crisp at any size, themeable, and reduced-motion safe
 * (the global reduced-motion rule freezes the CSS spins/pulse automatically).
 *
 * Visual structure:
 * - Outer machined bezel + rotating dashed tick ring
 * - Recessed well with concentric circular boundary tracks
 * - 8 copper coil blocks with orange borders & radial split grooves,
 *   interleaved with 5 glowing cyan radial dividers
 * - Inverted hollow triangular frame (truss) with 3 circular corner nodes
 *   and nested HUD wireframe triangles
 * - Center 20-tooth gear collar
 * - Central glowing UPWARD-pointing triangle core with nested luminous layers
 */

// Helper to convert math polar angles (deg) to SVG canvas coordinates
// 0 deg = +X (3 o'clock), 90 deg = +Y (12 o'clock, straight up)
const pt = (deg: number, r: number): [number, number] => {
  const rad = (deg * Math.PI) / 180;
  return [
    +(100 + Math.cos(rad) * r).toFixed(2),
    +(100 - Math.sin(rad) * r).toFixed(2),
  ];
};

export default function ArcReactorStatic() {
  // Inverted Equilateral Triangle (Frame):
  // Top-Right: 30 deg, Top-Left: 150 deg, Bottom: 270 deg (circumradius 58)
  // Base is horizontal at y = 71; apex points straight down at y = 158
  const triOuter = "49.77,71 150.23,71 100,158";
  const triNest1 = "63.83,79.17 136.17,79.17 100,141.76";
  const triNest2 = "70.87,83.25 129.13,83.25 100,133.64";

  // 3 Corner circular nodes at triangle vertices
  const corners: [number, number][] = [
    [49.77, 71], // Top-Left
    [150.23, 71], // Top-Right
    [100, 158], // Bottom
  ];

  // Upward Equilateral Triangle Core (pointing UP):
  // Apex at 90 deg (y = 79); base is horizontal at y = 110.5
  const coreOuter = "100,79 81.8,110.5 118.2,110.5";
  const coreMid = "100,86 87.9,107 112.1,107";
  const coreInner = "100,93 93.9,103.5 106.1,103.5";

  // 8 Copper Coil Blocks grouped in 3 sectors:
  // Top sector: 2 coils (116 deg, 64 deg)
  // Left sector: 3 coils (172 deg, 210 deg, 248 deg)
  // Right sector: 3 coils (292 deg, 330 deg, 10 deg)
  const coilSpecs = [
    { deg: 116, w: 10.5 },
    { deg: 64, w: 10.5 },
    { deg: 172, w: 8.5 },
    { deg: 210, w: 9.5 },
    { deg: 248, w: 8.5 },
    { deg: 292, w: 8.5 },
    { deg: 330, w: 9.5 },
    { deg: 10, w: 8.5 },
  ];

  const coilPolygons = coilSpecs.map(({ deg, w }) => {
    const [x1, y1] = pt(deg - w, 50);
    const [x2, y2] = pt(deg + w, 50);
    const [x3, y3] = pt(deg + w * 1.15, 73);
    const [x4, y4] = pt(deg - w * 1.15, 73);
    const [sx1, sy1] = pt(deg, 51);
    const [sx2, sy2] = pt(deg, 72);
    return {
      pts: `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`,
      split: { sx1, sy1, sx2, sy2 },
    };
  });

  // 5 Glowing Cyan Radial Dividers
  // Top: 90 deg (12 o'clock)
  // Left: 190 deg, 230 deg
  // Right: 310 deg, 350 deg
  const dividerAngles = [90, 190, 230, 310, 350];
  const dividers = dividerAngles.map((deg) => {
    const [x1, y1] = pt(deg, 49);
    const [x2, y2] = pt(deg, 74);
    return { x1, y1, x2, y2 };
  });

  // 20-Tooth Gear Collar around the core (radius 29)
  const teeth = Array.from({ length: 20 }, (_, i) => {
    const deg = (i / 20) * 360;
    const [x, y] = pt(deg, 29);
    return { x, y, rot: +(90 - deg).toFixed(2) };
  });

  return (
    <div
      aria-hidden
      className="relative flex h-full w-full items-center justify-center"
    >
      <svg viewBox="0 0 200 200" className="h-full w-full max-h-[460px]">
        <defs>
          <radialGradient id="ar-core" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#bdf3fb" />
            <stop offset="65%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#087082" />
          </radialGradient>
          <radialGradient id="ar-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.55" />
            <stop offset="70%" stopColor="#22d3ee" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ar-metal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7de7f5" />
            <stop offset="48%" stopColor="#1b6f7e" />
            <stop offset="100%" stopColor="#0b343c" />
          </linearGradient>
        </defs>

        {/* 1 — Ambient Cyan Halo */}
        <circle cx="100" cy="100" r="98" fill="url(#ar-glow)" />

        {/* 2 — Outer Machined Bezel */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="#06121a"
          stroke="#0f3d47"
          strokeWidth="3"
        />
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="#22d3ee"
          strokeOpacity="0.5"
          strokeWidth="1.2"
        />

        {/* 3 — Rotating Dashed Tick Ring */}
        <g
          className="animate-spin-slow"
          style={{ transformOrigin: "100px 100px" }}
        >
          <circle
            cx="100"
            cy="100"
            r="83"
            fill="none"
            stroke="#22d3ee"
            strokeOpacity="0.45"
            strokeWidth="1.2"
            strokeDasharray="2.5 5.5"
          />
        </g>

        {/* 4 — Recessed Coil Well & Inner Boundary Tracks */}
        <circle
          cx="100"
          cy="100"
          r="76"
          fill="#08161f"
          stroke="#155e6b"
          strokeWidth="2"
        />
        <circle cx="100" cy="100" r="74" fill="#050e14" />
        <circle
          cx="100"
          cy="100"
          r="49"
          fill="none"
          stroke="#22d3ee"
          strokeOpacity="0.5"
          strokeWidth="1.2"
        />

        {/* 5 — 8 Copper Coil Blocks with Orange Borders & Split Grooves */}
        <g>
          {coilPolygons.map(({ pts, split }, i) => (
            <g key={`coil-${i}`}>
              <polygon
                points={pts}
                fill="#241408"
                stroke="#ea7a24"
                strokeOpacity="0.9"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              {/* Center radial split groove */}
              <line
                x1={split.sx1}
                y1={split.sy1}
                x2={split.sx2}
                y2={split.sy2}
                stroke="#06121a"
                strokeWidth="1.2"
              />
            </g>
          ))}
        </g>

        {/* 6 — 5 Glowing Cyan Radial Dividers */}
        <g>
          {dividers.map((d, i) => (
            <line
              key={`div-${i}`}
              x1={d.x1}
              y1={d.y1}
              x2={d.x2}
              y2={d.y2}
              stroke="#22d3ee"
              strokeOpacity="0.9"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* 7 — Concentric Machined Rings inside Coils */}
        <circle
          cx="100"
          cy="100"
          r="45"
          fill="none"
          stroke="#2a4a55"
          strokeWidth="1.5"
        />
        <circle
          cx="100"
          cy="100"
          r="41"
          fill="none"
          stroke="#7de7f5"
          strokeOpacity="0.35"
          strokeWidth="1"
        />

        {/* 8 — Inverted Hollow Triangular Frame (Truss Structure) */}
        {/* Main beveled metal truss */}
        <polygon
          points={triOuter}
          fill="none"
          stroke="url(#ar-metal)"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <polygon
          points={triOuter}
          fill="none"
          stroke="#22d3ee"
          strokeOpacity="0.85"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        {/* Nested HUD wireframe inverted triangles */}
        <polygon
          points={triNest1}
          fill="none"
          stroke="#22d3ee"
          strokeOpacity="0.55"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <polygon
          points={triNest2}
          fill="none"
          stroke="#22d3ee"
          strokeOpacity="0.38"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* 9 — 3 Circular Corner Nodes at Triangle Vertices */}
        {corners.map(([x, y], i) => (
          <g key={`corner-${i}`}>
            <circle
              cx={x}
              cy={y}
              r="9.5"
              fill="#06121a"
              stroke="#22d3ee"
              strokeWidth="2.2"
            />
            <circle
              cx={x}
              cy={y}
              r="5.5"
              fill="#0d2a36"
              stroke="#155e6b"
              strokeWidth="1"
            />
            <circle cx={x} cy={y} r="2.8" fill="#22d3ee" />
            <circle cx={x} cy={y} r="1.2" fill="#eafdff" />
          </g>
        ))}

        {/* 10 — 20-Tooth Gear Collar around the Core */}
        <g
          className="animate-spin-rev"
          style={{
            transformOrigin: "100px 100px",
            animationDuration: "35s",
          }}
        >
          {teeth.map((t, i) => (
            <rect
              key={`tooth-${i}`}
              x={+(t.x - 1.8).toFixed(2)}
              y={+(t.y - 2.8).toFixed(2)}
              width="3.6"
              height="5.6"
              fill="#2a4a55"
              stroke="#7de7f5"
              strokeOpacity="0.4"
              strokeWidth="0.6"
              transform={`rotate(${t.rot} ${t.x} ${t.y})`}
            />
          ))}
          <circle
            cx="100"
            cy="100"
            r="27"
            fill="none"
            stroke="#7de7f5"
            strokeOpacity="0.65"
            strokeWidth="1.5"
          />
        </g>

        {/* 11 — Central Glowing Upward-Pointing Triangle Core */}
        <circle cx="100" cy="100" r="32" fill="url(#ar-glow)" />

        <polygon
          points={coreOuter}
          fill="url(#ar-core)"
          stroke="#22d3ee"
          strokeWidth="1.5"
          strokeLinejoin="round"
          className="animate-pulse-core"
          style={{ transformOrigin: "100px 100px" }}
        />
        <polygon
          points={coreMid}
          fill="none"
          stroke="#eafdff"
          strokeOpacity="0.9"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <polygon
          points={coreInner}
          fill="#eafdff"
          stroke="#ffffff"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
