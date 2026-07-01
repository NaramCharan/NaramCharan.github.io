"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { createTimeline, stagger, utils } from "animejs";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * Hero arc reactor that assembles as you scroll (anime.js v4, scrubbed to
 * scroll position over the pinned hero `track`). The glowing core + halo are
 * lit from the start so the landing is never empty; the armour (bezel, ring,
 * coils, triangle, bevels, nodes) builds around it as you scroll in.
 */
export default function HeroReactor({
  trackRef,
}: {
  trackRef: RefObject<HTMLElement | null>;
}) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(true);

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
    const reactor = ref.current;
    const track = trackRef.current;
    if (!reactor || !track) return;

    if (reduced) {
      setHidden(false);
      return;
    }

    const q = (s: string) => Array.from(reactor.querySelectorAll(s));
    utils.set(q(".ar-part, .p-flash"), { opacity: 0 });
    setHidden(false);

    const tl = createTimeline({
      defaults: { ease: "outExpo", duration: 600 },
      autoplay: false,
    });

    tl.add(q(".p-bezel"), { opacity: [0, 1], scale: [0.5, 1], rotate: [-25, 0], duration: 550 }, 0)
      .add(q(".p-tick"), { opacity: [0, 1], scale: [0.7, 1], rotate: [-90, 0], duration: 550 }, 250)
      .add(q(".p-coil"), { opacity: [0, 1], scale: [0, 1], duration: 420, delay: stagger(30), ease: "outBack" }, 350)
      .add(q(".p-tri"), { opacity: [0, 1], scale: [0, 1], rotate: [45, 0], duration: 650, ease: "outBack" }, 760)
      .add(q(".p-nest"), { opacity: [0, 1], scale: [0, 1], duration: 450, delay: stagger(110) }, 1060)
      .add(q(".p-node"), { opacity: [0, 1], scale: [0, 1], duration: 450, delay: stagger(110), ease: "outBack" }, 1200)
      .add(q(".p-flash"), { opacity: [0, 0.55], duration: 160, ease: "outQuad" }, 1320)
      .add(q(".p-flash"), { opacity: [0.55, 0], duration: 520, ease: "outQuad" }, 1500);

    const dur = tl.duration;
    let raf = 0;
    const update = () => {
      raf = 0;
      const dist = Math.max(1, track.offsetHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, -track.getBoundingClientRect().top / dist));
      tl.seek(dur * p);
    };
    const onScrollEv = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScrollEv, { passive: true });
    window.addEventListener("resize", onScrollEv);
    update();

    return () => {
      window.removeEventListener("scroll", onScrollEv);
      window.removeEventListener("resize", onScrollEv);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return (
    <div ref={ref} aria-hidden className="relative flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 200 200" data-assembling={hidden} className="h-full w-full max-h-[460px]">
        <defs>
          <radialGradient id="hr-core" cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor="#f4feff" />
            <stop offset="35%" stopColor="#bdf3fb" />
            <stop offset="72%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0e7d8f" />
          </radialGradient>
          <radialGradient id="hr-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hr-metal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7de7f5" />
            <stop offset="48%" stopColor="#1b6f7e" />
            <stop offset="100%" stopColor="#0b343c" />
          </linearGradient>
        </defs>

        {/* Always-lit core halo (not part of the scroll build) */}
        <circle cx="100" cy="100" r="46" fill="url(#hr-glow)" />

        {/* Armour — assembles on scroll */}
        <circle className="ar-part p-bezel" cx="100" cy="100" r="90" fill="#06121a" stroke="#0f3d47" strokeWidth="3" />
        <circle className="ar-part p-bezel" cx="100" cy="100" r="90" fill="none" stroke="#22d3ee" strokeOpacity="0.45" strokeWidth="1" />
        <circle className="ar-part p-bezel" cx="100" cy="100" r="76" fill="#08161f" stroke="#155e6b" strokeWidth="2" />
        <circle className="ar-part p-tick" cx="100" cy="100" r="83" fill="none" stroke="#22d3ee" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 6" />

        {coils.map((c, i) => (
          <g key={i} transform={`rotate(${c.rot} ${c.x} ${c.y})`}>
            <rect className="ar-part p-coil" x={+(c.x - 3).toFixed(2)} y={+(c.y - 6).toFixed(2)} width="6" height="12" rx="1.5" fill="#0a2730" stroke="#22d3ee" strokeOpacity="0.7" strokeWidth="0.8" />
          </g>
        ))}

        <polygon className="ar-part p-tri" points={outer} fill="#08202a" stroke="url(#hr-metal)" strokeWidth="6" strokeLinejoin="round" />
        <polygon className="ar-part p-tri" points={outer} fill="none" stroke="#7de7f5" strokeOpacity="0.85" strokeWidth="1.5" strokeLinejoin="round" />
        <polygon className="ar-part p-nest" points={nest1} fill="none" stroke="#22d3ee" strokeOpacity="0.55" strokeWidth="2" strokeLinejoin="round" />
        <polygon className="ar-part p-nest" points={nest2} fill="none" stroke="#22d3ee" strokeOpacity="0.4" strokeWidth="1.5" strokeLinejoin="round" />

        {corners.map(([x, y], i) => (
          <g key={i} className="ar-part p-node">
            <circle cx={x} cy={y} r="9" fill="#06121a" stroke="#22d3ee" strokeWidth="2" />
            <circle cx={x} cy={y} r="4" fill="#22d3ee" />
          </g>
        ))}

        {/* Core — always lit, gentle pulse */}
        <g className="animate-pulse-core" style={{ transformBox: "fill-box", transformOrigin: "100px 100px" }}>
          <polygon points={core} fill="url(#hr-core)" />
          <polygon points={coreInner} fill="none" stroke="#eafdff" strokeOpacity="0.9" strokeWidth="1.5" strokeLinejoin="round" />
          <polygon points="100,94 95,104 105,104" fill="#eafdff" />
        </g>

        {/* Ignition flash */}
        <circle className="p-flash" cx="100" cy="100" r="60" fill="#bdf3fb" style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "50% 50%" }} />
      </svg>
    </div>
  );
}
