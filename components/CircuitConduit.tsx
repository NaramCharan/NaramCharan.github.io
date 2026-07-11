"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

// Sections the conduit taps into (ids must exist in page.tsx order).
const TAPS = [
  { id: "projects", label: "01 PROJECTS" },
  { id: "skills", label: "02 SYSTEMS" },
  { id: "about", label: "03 ORIGIN" },
  { id: "contact", label: "04 LINK" },
];

type Geometry = {
  top: number; // px from <main> top
  height: number;
  nodes: { y: number; label: string }[];
};

/**
 * The power conduit — a vertical line in the left gutter that draws itself
 * as you scroll, carrying charge from the reactor down to CONTACT. Section
 * nodes ignite (spring pop via anime.js) the moment the charge front passes
 * them. Desktop-only ornament: hidden below xl, aria-hidden throughout.
 * Reduced motion renders it fully drawn and lit, no listeners.
 */
export default function CircuitConduit() {
  const reduced = usePrefersReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<SVGPathElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const [geo, setGeo] = useState<Geometry | null>(null);
  const lit = useRef<boolean[]>([]);

  // Measure section positions relative to <main>; re-measure on resize.
  useEffect(() => {
    const main = document.getElementById("main");
    if (!main) return;
    const measure = () => {
      const mainTop = main.getBoundingClientRect().top + window.scrollY;
      const first = document.getElementById(TAPS[0].id);
      const last = document.getElementById(TAPS[TAPS.length - 1].id);
      if (!first || !last) return;
      const firstTop = first.getBoundingClientRect().top + window.scrollY;
      const lastEl = last.getBoundingClientRect();
      const end = lastEl.top + window.scrollY + lastEl.height * 0.55;
      const top = firstTop - mainTop - 40;
      const height = end - firstTop + 40;
      const nodes = TAPS.flatMap(({ id, label }) => {
        const el = document.getElementById(id);
        if (!el) return [];
        const y =
          el.getBoundingClientRect().top + window.scrollY - mainTop - top + 96;
        return [{ y, label }];
      });
      setGeo({ top, height, nodes });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);

  // Scroll-drive the draw (rAF-throttled). Nodes ignite once, on first pass.
  useEffect(() => {
    if (!geo || reduced) return;
    const main = document.getElementById("main");
    const fill = fillRef.current;
    const head = headRef.current;
    const wrap = wrapRef.current;
    if (!main || !fill || !head || !wrap) return;
    lit.current = geo.nodes.map(() => false);

    let raf = 0;
    const update = () => {
      raf = 0;
      const mainTop = main.getBoundingClientRect().top + window.scrollY;
      const start = mainTop + geo.top;
      // The charge front tracks a point 70% down the viewport.
      const front = window.scrollY + window.innerHeight * 0.7 - start;
      const p = Math.max(0, Math.min(1, front / geo.height));
      const drawn = p * geo.height;
      fill.style.strokeDashoffset = String(geo.height - drawn);
      head.style.transform = `translateY(${drawn}px)`;
      head.style.opacity = p > 0.001 && p < 0.999 ? "1" : "0";
      geo.nodes.forEach((n, i) => {
        if (lit.current[i] || drawn < n.y) return;
        lit.current[i] = true;
        const node = wrap.querySelector<HTMLElement>(`[data-node="${i}"]`);
        if (!node) return;
        node.classList.add("conduit-lit");
        animate(node, {
          scale: [0.4, 1.5, 1],
          duration: 600,
          ease: "outBack(2.5)",
        });
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [geo, reduced]);

  if (!geo) return null;

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none absolute z-0 hidden w-40 xl:block"
      style={{ top: geo.top, height: geo.height, left: 14 }}
    >
      <svg
        width="24"
        height={geo.height}
        viewBox={`0 0 24 ${geo.height}`}
        className="absolute left-0 top-0"
      >
        {/* base track */}
        <path
          d={`M12 0 V ${geo.height}`}
          stroke="#22d3ee"
          strokeOpacity="0.14"
          strokeWidth="1.5"
        />
        {/* drawn fill */}
        <path
          ref={fillRef}
          d={`M12 0 V ${geo.height}`}
          stroke="#22d3ee"
          strokeOpacity="0.75"
          strokeWidth="1.5"
          strokeDasharray={geo.height}
          strokeDashoffset={reduced ? 0 : geo.height}
          style={{ filter: "drop-shadow(0 0 4px rgba(34,211,238,0.6))" }}
        />
        {/* charge front */}
        <g ref={headRef} style={{ opacity: reduced ? 0 : undefined }}>
          <circle cx="12" cy="0" r="3" fill="#7de7f5" style={{ filter: "drop-shadow(0 0 8px rgba(125,231,245,0.9))" }} />
          <circle cx="12" cy="0" r="7" fill="none" stroke="#22d3ee" strokeOpacity="0.4" strokeWidth="1" />
        </g>
      </svg>

      {/* section nodes + labels */}
      {geo.nodes.map((n, i) => (
        <div key={n.label} className="absolute left-0" style={{ top: n.y }}>
          <span
            data-node={i}
            className={`conduit-node absolute left-[7.5px] top-[-4.5px] block h-[9px] w-[9px] rotate-45 border border-cyan/60 bg-bg ${
              reduced ? "conduit-lit" : ""
            }`}
          />
          <span
            className={`conduit-label mono absolute left-[22px] top-2 text-[9px] tracking-[0.3em] text-cyan/70 [writing-mode:vertical-rl] ${
              reduced ? "opacity-100" : ""
            }`}
          >
            {n.label}
          </span>
        </div>
      ))}
    </div>
  );
}
