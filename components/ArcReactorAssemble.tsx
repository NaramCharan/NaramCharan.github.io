"use client";

import { useEffect, useRef, useState } from "react";
import { createTimeline, stagger, utils } from "animejs";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * Iron Man 3 arc reactor that assembles part-by-part via anime.js (v4).
 * Same geometry as ArcReactorStatic, but each part is class-tagged and flies
 * into place on a staggered timeline: bezel → tick ring → coils (sweep) →
 * triangle (spins in) → nested bevels + corner nodes → core ignites + flash.
 *
 * Reduced-motion: renders fully assembled, no animation.
 * IMPORTANT: animated parts must NOT carry an SVG `transform` attribute (a CSS
 * transform from anime would override it) — coil positioning lives on wrapper
 * <g> elements instead.
 */
export default function ArcReactorAssemble({
  onDone,
}: {
  onDone?: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const [assembling, setAssembling] = useState(true);

  const outer = "100,162 46.3,69 153.7,69";
  const nest1 = "100,150 56.7,75 143.3,75";
  const nest2 = "100,138 67,81 133,81";
  const corners: [number, number][] = [
    [100, 162],
    [46.3, 69],
    [153.7, 69],
  ];
  const core = "100,78 81,111 119,111";
  const coreInner = "100,88 89.6,106 110.4,106";
  const coils = Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2;
    const x = +(100 + Math.cos(a) * 70).toFixed(2);
    const y = +(100 + Math.sin(a) * 70).toFixed(2);
    const rot = +((a * 180) / Math.PI + 90).toFixed(2);
    return { x, y, rot };
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root || startedRef.current) return;
    startedRef.current = true;

    if (reduced) {
      setAssembling(false);
      onDone?.();
      return;
    }

    const q = (s: string) => Array.from(root.querySelectorAll(s));

    // Hide every part up-front via inline style (no dependency on the CSS race),
    // then reveal during the timeline.
    utils.set(q(".ar-part, .p-flash"), { opacity: 0 });
    setAssembling(false); // CSS hide no longer needed; inline styles drive it.

    const tl = createTimeline({
      defaults: { ease: "outExpo", duration: 600 },
      onComplete: () => onDone?.(),
    });

    tl.add(q(".p-glow"), { opacity: [0, 1], duration: 500 }, 0)
      .add(q(".p-bezel"), { opacity: [0, 1], scale: [0.5, 1], rotate: [-25, 0], duration: 550 }, 0)
      .add(q(".p-tick"), { opacity: [0, 1], scale: [0.7, 1], rotate: [-90, 0], duration: 550 }, 250)
      .add(q(".p-coil"), { opacity: [0, 1], scale: [0, 1], duration: 420, delay: stagger(32), ease: "outBack" }, 350)
      .add(q(".p-tri"), { opacity: [0, 1], scale: [0, 1], rotate: [45, 0], duration: 650, ease: "outBack" }, 760)
      .add(q(".p-nest"), { opacity: [0, 1], scale: [0, 1], duration: 450, delay: stagger(110) }, 1060)
      .add(q(".p-node"), { opacity: [0, 1], scale: [0, 1], duration: 450, delay: stagger(110), ease: "outBack" }, 1200)
      .add(q(".p-core"), { opacity: [0, 1], scale: [0, 1], duration: 520, ease: "outBack" }, 1520)
      .add(q(".p-flash"), { opacity: [0, 0.7], duration: 150, ease: "outQuad" }, 1500)
      .add(q(".p-flash"), { opacity: [0.7, 0], duration: 520, ease: "outQuad" }, 1650);

    void tl;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return (
    <div ref={rootRef} aria-hidden className="relative flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 200 200" data-assembling={assembling} className="h-full w-full max-h-[460px]">
        <defs>
          <radialGradient id="ara-core" cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor="#f4feff" />
            <stop offset="35%" stopColor="#bdf3fb" />
            <stop offset="72%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0e7d8f" />
          </radialGradient>
          <radialGradient id="ara-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ara-metal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7de7f5" />
            <stop offset="48%" stopColor="#1b6f7e" />
            <stop offset="100%" stopColor="#0b343c" />
          </linearGradient>
        </defs>

        {/* Ambient glow */}
        <circle className="ar-part p-glow" cx="100" cy="100" r="98" fill="url(#ara-glow)" />

        {/* Outer bezel + coil housing */}
        <circle className="ar-part p-bezel" cx="100" cy="100" r="90" fill="#06121a" stroke="#0f3d47" strokeWidth="3" />
        <circle className="ar-part p-bezel" cx="100" cy="100" r="90" fill="none" stroke="#22d3ee" strokeOpacity="0.45" strokeWidth="1" />
        <circle className="ar-part p-bezel" cx="100" cy="100" r="76" fill="#08161f" stroke="#155e6b" strokeWidth="2" />

        {/* Tick ring */}
        <circle className="ar-part p-tick" cx="100" cy="100" r="83" fill="none" stroke="#22d3ee" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 6" />

        {/* Coil segments — wrapper <g> holds rotation (attribute), rect animates */}
        {coils.map((c, i) => (
          <g key={i} transform={`rotate(${c.rot} ${c.x} ${c.y})`}>
            <rect
              className="ar-part p-coil"
              x={+(c.x - 3).toFixed(2)}
              y={+(c.y - 6).toFixed(2)}
              width="6"
              height="12"
              rx="1.5"
              fill="#0a2730"
              stroke="#22d3ee"
              strokeOpacity="0.7"
              strokeWidth="0.8"
            />
          </g>
        ))}

        {/* Dominant downward triangle */}
        <polygon className="ar-part p-tri" points={outer} fill="#08202a" stroke="url(#ara-metal)" strokeWidth="6" strokeLinejoin="round" />
        <polygon className="ar-part p-tri" points={outer} fill="none" stroke="#7de7f5" strokeOpacity="0.85" strokeWidth="1.5" strokeLinejoin="round" />

        {/* Nested bevels */}
        <polygon className="ar-part p-nest" points={nest1} fill="none" stroke="#22d3ee" strokeOpacity="0.55" strokeWidth="2" strokeLinejoin="round" />
        <polygon className="ar-part p-nest" points={nest2} fill="none" stroke="#22d3ee" strokeOpacity="0.4" strokeWidth="1.5" strokeLinejoin="round" />

        {/* Corner nodes */}
        {corners.map(([x, y], i) => (
          <g key={i} className="ar-part p-node">
            <circle cx={x} cy={y} r="9" fill="#06121a" stroke="#22d3ee" strokeWidth="2" />
            <circle cx={x} cy={y} r="4" fill="#22d3ee" />
          </g>
        ))}

        {/* Core */}
        <g className="ar-part p-core">
          <circle cx="100" cy="100" r="34" fill="url(#ara-glow)" />
          <polygon points={core} fill="url(#ara-core)" />
          <polygon points={coreInner} fill="none" stroke="#eafdff" strokeOpacity="0.9" strokeWidth="1.5" strokeLinejoin="round" />
          <polygon points="100,94 95,104 105,104" fill="#eafdff" />
        </g>

        {/* Ignition flash */}
        <circle className="p-flash" cx="100" cy="100" r="60" fill="#bdf3fb" style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "50% 50%" }} />
      </svg>
    </div>
  );
}
