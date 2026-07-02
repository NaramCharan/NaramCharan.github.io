"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { profile } from "@/lib/content";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import { useDecode, useRotate } from "@/lib/useDecode";
import { enter, EASE } from "@/lib/motion";
import ReactorAssembly from "./ReactorAssembly";

const SPECIALTIES = [
  "Recommendation Systems",
  "Demand Forecasting",
  "Data Engineering",
  "Neural Networks",
];

/**
 * The hero: a crisp, all-vector JARVIS dashboard. Identity (name, tagline,
 * CTAs) is visible from the start; the HUD panels assemble around the arc
 * reactor scrubbed to scroll position via Framer Motion `useScroll`.
 */
export default function IntroDashboard() {
  const reduced = usePrefersReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const name = useDecode(profile.name, 28);
  const specialty = useRotate(SPECIALTIES);

  // Scroll progress over the pinned track (manual listener — reliable with
  // this page's scroll setup, same pattern the hero reactor used).
  const scrollYProgress = useMotionValue(0);
  useEffect(() => {
    const track = trackRef.current;
    if (!track || reduced) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const dist = Math.max(1, track.offsetHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, -track.getBoundingClientRect().top / dist));
      scrollYProgress.set(p);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  // Panels reveal AFTER the reactor build (~0.72 = core ignition), matching
  // the reference choreography: parts converge → core ignites → HUD lights up.
  const pAccuracy = useTransform(scrollYProgress, [0.68, 0.8], [0, 1]);
  const pSystems = useTransform(scrollYProgress, [0.72, 0.84], [0, 1]);
  const pForecast = useTransform(scrollYProgress, [0.78, 0.9], [0, 1]);
  const pTerminal = useTransform(scrollYProgress, [0.74, 0.86], [0, 1]);
  const pStats = useTransform(scrollYProgress, [0.8, 0.92], [0, 1]);
  const pNodes = useTransform(scrollYProgress, [0.84, 0.96], [0, 1]);
  const reactorScale = useTransform(scrollYProgress, [0, 0.6], [0.9, 1]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  return (
    <section
      id="top"
      ref={trackRef}
      aria-label="Intro"
      className={reduced ? "relative" : "relative h-[240vh]"}
    >
      <div className="sticky top-0 flex h-dvh flex-col items-center justify-center overflow-hidden bg-bg px-6">
        <div className="hud-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(34,211,238,0.10),transparent_62%)]" />

        {/* Reactor — assembles piece-by-piece as you scroll */}
        <motion.div
          style={reduced ? undefined : { scale: reactorScale }}
          className="relative z-10 h-44 w-44 sm:h-56 sm:w-56 lg:h-72 lg:w-72"
        >
          <ReactorAssembly progress={scrollYProgress} reduced={reduced} />
        </motion.div>

        {/* Identity — the hero content, visible from the start */}
        <div className="relative z-10 mt-2 flex flex-col items-center text-center">
          <motion.p
            {...enter(0.1)}
            className="mono text-[11px] tracking-[0.4em] text-cyan/80 sm:text-xs"
          >
            {profile.status}
          </motion.p>
          <motion.h1
            {...enter(0.18)}
            className="mt-4 text-balance text-4xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl"
          >
            <span className="glow-cyan">{name || profile.name}</span>
          </motion.h1>
          <motion.div
            {...enter(0.26)}
            className="mt-4 flex h-6 items-center gap-2 mono text-xs tracking-[0.15em] text-text-dim sm:text-sm"
          >
            <span className="text-gold">◢</span>
            <span>SPECIALIZING IN</span>
            <span className="relative inline-flex min-w-[13ch] justify-start text-cyan">
              <AnimatePresence mode="wait">
                <motion.span
                  key={specialty}
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  {specialty}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.div>
          <motion.p
            {...enter(0.34)}
            className="mt-4 max-w-md text-balance text-lg leading-relaxed text-text sm:text-xl"
          >
            &ldquo;{profile.tagline}&rdquo;
          </motion.p>
          <motion.div {...enter(0.42)} className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="#projects"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-cyan/50 bg-cyan/10 px-7 py-3 text-sm font-medium text-cyan transition-all duration-300 hover:bg-cyan/20 hover:shadow-[0_0_26px_rgba(34,211,238,0.35)]"
            >
              View Projects
              <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </a>
            <a
              href={profile.resume}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-gold/60 bg-gold/15 px-7 py-3 text-sm font-semibold text-gold transition-all duration-300 hover:bg-gold/25 hover:shadow-[0_0_26px_rgba(255,178,62,0.35)]"
            >
              Download Resume
            </a>
          </motion.div>
        </div>

        {/* ── Panels (desktop) ─────────────────────────────── */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
          {/* MODEL ACCURACY — top centre */}
          <Panel p={pAccuracy} reduced={reduced} className="left-1/2 top-8 w-[300px] -translate-x-1/2">
            <PanelHead label="MODEL ACCURACY" code="MK-02" />
            <div className="flex items-end justify-between">
              <span className="mono text-2xl font-bold text-gold glow-gold">98.28%</span>
              <span className="mono text-[9px] text-text-dim">10-FOLD CV</span>
            </div>
            <AccuracyChart />
          </Panel>

          {/* SUIT SYSTEMS — top left */}
          <Panel p={pSystems} reduced={reduced} className="left-8 top-24 w-[220px]">
            <PanelHead label="SUIT SYSTEMS" code="PWR" />
            <div className="flex items-center gap-4">
              <PowerGauge />
              <div>
                <div className="mono text-xl font-bold text-cyan glow-cyan">100%</div>
                <div className="mono text-[9px] tracking-[0.2em] text-text-dim">POWER LEVEL</div>
              </div>
            </div>
          </Panel>

          {/* STORE-DEPARTMENT FORECAST — bottom left */}
          <Panel p={pForecast} reduced={reduced} className="bottom-16 left-8 w-[260px]">
            <PanelHead label="STORE-DEPT FORECAST" code="MK-01" />
            <ForecastBars />
            <p className="mono mt-2 text-[9px] tracking-wide text-text-dim">95.5% VALIDATION R²</p>
          </Panel>

          {/* TERMINAL — top right */}
          <Panel p={pTerminal} reduced={reduced} className="right-8 top-20 w-[260px]">
            <PanelHead label="SYSTEM FEED" code="LIVE" />
            <ul className="space-y-1">
              {[
                ["INITIALIZING JARVIS CORE", "OK"],
                ["LOADING NEURAL MODULES", "OK"],
                ["FAISS VECTOR INDEX", "OK"],
                ["MODEL INFERENCE ENGINE", "OK"],
                ["REAL-TIME MONITORING", "OK"],
              ].map(([l, s]) => (
                <li key={l} className="mono flex items-center gap-2 text-[10px] text-cyan/85">
                  <span className="text-gold">&gt;</span>
                  <span className="truncate">{l}</span>
                  <span className="ml-auto text-cyan-bright">{s}</span>
                </li>
              ))}
              <li className="mono flex items-center gap-1 text-[10px] text-cyan">
                <span className="text-gold">&gt;</span>
                <span className="inline-block h-3 w-1.5 animate-blink bg-cyan" />
              </li>
            </ul>
          </Panel>

          {/* STAT READOUTS — right mid */}
          <Panel p={pStats} reduced={reduced} className="right-10 top-1/2 w-[240px] -translate-y-1/2">
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                ["<10", "MS", "LATENCY"],
                ["421K", "", "RECORDS"],
                ["OK", "", "FAISS"],
              ].map(([v, u, k]) => (
                <div key={k}>
                  <div className="mono text-lg font-bold text-cyan glow-cyan">
                    {v}
                    <span className="text-xs">{u}</span>
                  </div>
                  <div className="mono text-[8px] tracking-[0.2em] text-text-dim">{k}</div>
                </div>
              ))}
            </div>
          </Panel>

          {/* GLOBAL NODES — bottom right */}
          <Panel p={pNodes} reduced={reduced} className="bottom-16 right-8 w-[260px]">
            <PanelHead label="GLOBAL NODES" code="NET" />
            <NodeNet />
          </Panel>
        </div>

        {/* Header + scroll hint */}
        <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 mono text-[10px] tracking-[0.5em] text-cyan/70">
          J.A.R.V.I.S // MARK XLII
        </div>
        {!reduced && (
          <motion.div
            style={{ opacity: hintOpacity }}
            className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5"
          >
            <span className="mono text-[10px] tracking-[0.35em] text-cyan/80">SCROLL TO INITIALIZE</span>
            <svg viewBox="0 0 24 24" className="h-4 w-4 animate-bounce text-cyan/70" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        )}

        {/* Blend into the site below */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-bg" />
      </div>
    </section>
  );
}

/* ── Reusable panel shell (reveals on scroll) ───────────────── */
function Panel({
  p,
  reduced,
  className,
  children,
}: {
  p: MotionValue<number>;
  reduced: boolean;
  className: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      style={reduced ? undefined : { opacity: p }}
      className={`absolute rounded-lg border border-line bg-surface/70 p-3 backdrop-blur-sm ${className}`}
    >
      <span aria-hidden className="absolute right-2.5 top-2.5 h-2.5 w-2.5 border-r border-t border-cyan/50" />
      {children}
    </motion.div>
  );
}

function PanelHead({ label, code }: { label: string; code: string }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <span className="mono text-[9px] tracking-[0.25em] text-text-muted">{label}</span>
      <span className="mono rounded border border-cyan/30 px-1.5 text-[8px] tracking-widest text-cyan/90">{code}</span>
    </div>
  );
}

function AccuracyChart() {
  const pts = [40, 46, 44, 52, 58, 55, 64, 70, 76, 82, 90, 98];
  const w = 260, h = 56;
  const d = pts.map((v, i) => `${i === 0 ? "M" : "L"}${((i / (pts.length - 1)) * w).toFixed(1)} ${(h - (v / 100) * h).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-1 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="id-acc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L${w} ${h} L0 ${h} Z`} fill="url(#id-acc)" />
      <path d={d} fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 4px rgba(34,211,238,0.6))" }} />
    </svg>
  );
}

function PowerGauge() {
  const r = 26, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
      <circle cx="32" cy="32" r={r} fill="none" stroke="#0f1828" strokeWidth="5" />
      <circle cx="32" cy="32" r={r} fill="none" stroke="#ffb23e" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${c * 0.75} ${c}`} style={{ filter: "drop-shadow(0 0 4px rgba(255,178,62,0.5))" }} />
      <circle cx="32" cy="32" r={r - 8} fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(2 * Math.PI * (r - 8)) * 0.6} ${2 * Math.PI * (r - 8)}`} />
    </svg>
  );
}

function ForecastBars() {
  const bars = [110, 135, 205, 120, 190, 150, 225];
  const max = 240;
  return (
    <svg viewBox="0 0 240 80" className="mt-1 w-full">
      {bars.map((v, i) => {
        const bw = 22, gap = 12, x = i * (bw + gap) + 6, bh = (v / max) * 70, y = 76 - bh;
        return <rect key={i} x={x} y={y} width={bw} height={bh} rx="2" fill={i % 2 ? "#ffb23e" : "#22d3ee"} fillOpacity="0.75" />;
      })}
    </svg>
  );
}

function NodeNet() {
  const nodes = [
    [30, 30], [90, 18], [150, 34], [210, 22],
    [55, 60], [120, 70], [185, 58], [230, 78],
  ];
  return (
    <svg viewBox="0 0 250 90" className="mt-1 w-full">
      {nodes.map(([x1, y1], i) =>
        nodes.slice(i + 1).map(([x2, y2], j) => {
          const near = Math.hypot(x2 - x1, y2 - y1) < 85;
          return near ? <line key={`${i}-${j}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#22d3ee" strokeOpacity="0.2" strokeWidth="0.6" /> : null;
        })
      )}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2.6 : 1.6} fill={i % 3 === 0 ? "#ffb23e" : "#22d3ee"}>
          {i % 3 === 0 && <animate attributeName="opacity" values="1;0.3;1" dur="2.4s" repeatCount="indefinite" />}
        </circle>
      ))}
    </svg>
  );
}
