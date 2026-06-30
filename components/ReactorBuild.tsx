"use client";

import { useEffect, useRef, useState } from "react";
import { createTimeline, stagger, utils } from "animejs";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * Scroll-driven Mark XLII assembly (anime.js v4). A tall scroll "track" pins
 * the reactor; the assembly timeline is *scrubbed to scroll position* via
 * `onScroll({ sync: true })`, so the parts come together as you scroll down
 * and come apart as you scroll back up — like the animejs.com hero.
 */
export default function ReactorBuild() {
  const reduced = usePrefersReducedMotion();
  const trackRef = useRef<HTMLElement>(null);
  const reactorRef = useRef<HTMLDivElement>(null);
  const [assembling, setAssembling] = useState(true);

  // Geometry (matches ArcReactorStatic).
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
    const reactor = reactorRef.current;
    const track = trackRef.current;
    if (!reactor || !track) return;

    if (reduced) {
      setAssembling(false);
      return;
    }

    const q = (s: string) => Array.from(reactor.querySelectorAll(s));
    utils.set(q(".ar-part, .p-flash"), { opacity: 0 });
    setAssembling(false);

    const tl = createTimeline({
      defaults: { ease: "outExpo", duration: 600 },
      autoplay: false,
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

    // Scrub the timeline to scroll position through the pinned track.
    const dur = tl.duration;
    let raf = 0;
    const update = () => {
      raf = 0;
      const dist = Math.max(1, track.offsetHeight - window.innerHeight);
      const scrolled = -track.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, scrolled / dist));
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
    <section ref={trackRef} aria-label="Reactor assembly" className="relative h-[220vh]">
      {/* Pinned stage */}
      <div className="sticky top-0 flex h-dvh flex-col items-center justify-center overflow-hidden px-5">
        <div className="hud-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.10),transparent_60%)]" />

        <div className="relative z-10 mb-6 flex items-center gap-3">
          <span className="mono text-xs tracking-[0.3em] text-gold">◢</span>
          <span className="mono text-[11px] tracking-[0.35em] text-text-muted">
            ASSEMBLY SEQUENCE · MARK XLII
          </span>
        </div>

        {/* Reactor */}
        <div ref={reactorRef} aria-hidden className="relative z-10 h-64 w-64 sm:h-80 sm:w-80 md:h-96 md:w-96">
          <svg viewBox="0 0 200 200" data-assembling={assembling} className="h-full w-full">
            <defs>
              <radialGradient id="rb-core" cx="50%" cy="42%" r="60%">
                <stop offset="0%" stopColor="#f4feff" />
                <stop offset="35%" stopColor="#bdf3fb" />
                <stop offset="72%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0e7d8f" />
              </radialGradient>
              <radialGradient id="rb-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="rb-metal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7de7f5" />
                <stop offset="48%" stopColor="#1b6f7e" />
                <stop offset="100%" stopColor="#0b343c" />
              </linearGradient>
            </defs>

            <circle className="ar-part p-glow" cx="100" cy="100" r="98" fill="url(#rb-glow)" />
            <circle className="ar-part p-bezel" cx="100" cy="100" r="90" fill="#06121a" stroke="#0f3d47" strokeWidth="3" />
            <circle className="ar-part p-bezel" cx="100" cy="100" r="90" fill="none" stroke="#22d3ee" strokeOpacity="0.45" strokeWidth="1" />
            <circle className="ar-part p-bezel" cx="100" cy="100" r="76" fill="#08161f" stroke="#155e6b" strokeWidth="2" />
            <circle className="ar-part p-tick" cx="100" cy="100" r="83" fill="none" stroke="#22d3ee" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 6" />

            {coils.map((c, i) => (
              <g key={i} transform={`rotate(${c.rot} ${c.x} ${c.y})`}>
                <rect className="ar-part p-coil" x={+(c.x - 3).toFixed(2)} y={+(c.y - 6).toFixed(2)} width="6" height="12" rx="1.5" fill="#0a2730" stroke="#22d3ee" strokeOpacity="0.7" strokeWidth="0.8" />
              </g>
            ))}

            <polygon className="ar-part p-tri" points={outer} fill="#08202a" stroke="url(#rb-metal)" strokeWidth="6" strokeLinejoin="round" />
            <polygon className="ar-part p-tri" points={outer} fill="none" stroke="#7de7f5" strokeOpacity="0.85" strokeWidth="1.5" strokeLinejoin="round" />
            <polygon className="ar-part p-nest" points={nest1} fill="none" stroke="#22d3ee" strokeOpacity="0.55" strokeWidth="2" strokeLinejoin="round" />
            <polygon className="ar-part p-nest" points={nest2} fill="none" stroke="#22d3ee" strokeOpacity="0.4" strokeWidth="1.5" strokeLinejoin="round" />

            {corners.map(([x, y], i) => (
              <g key={i} className="ar-part p-node">
                <circle cx={x} cy={y} r="9" fill="#06121a" stroke="#22d3ee" strokeWidth="2" />
                <circle cx={x} cy={y} r="4" fill="#22d3ee" />
              </g>
            ))}

            <g className="ar-part p-core">
              <circle cx="100" cy="100" r="34" fill="url(#rb-glow)" />
              <polygon points={core} fill="url(#rb-core)" />
              <polygon points={coreInner} fill="none" stroke="#eafdff" strokeOpacity="0.9" strokeWidth="1.5" strokeLinejoin="round" />
              <polygon points="100,94 95,104 105,104" fill="#eafdff" />
            </g>

            <circle className="p-flash" cx="100" cy="100" r="60" fill="#bdf3fb" style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "50% 50%" }} />
          </svg>
        </div>

        {/* Scroll hint */}
        <div className="relative z-10 mt-8 flex flex-col items-center gap-2">
          <span className="mono text-[10px] tracking-[0.3em] text-cyan/70">
            SCROLL TO ASSEMBLE
          </span>
          <svg viewBox="0 0 24 24" className="h-4 w-4 animate-bounce text-cyan/60" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </section>
  );
}
