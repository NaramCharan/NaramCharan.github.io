"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { profile, navLinks, stats } from "@/lib/content";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import { useDecode, useRotate } from "@/lib/useDecode";
import { enter, EASE } from "@/lib/motion";
import ArcReactorStatic from "./ArcReactorStatic";

const SPECIALTIES = [
  "Recommendation Systems",
  "Demand Forecasting",
  "Data Engineering",
  "Neural Networks",
];

/* ── Left telemetry: model accuracy mini line chart ─────────────── */
function AccuracyPanel({ reduced }: { reduced: boolean }) {
  const pts = [40, 46, 44, 52, 58, 55, 64, 70, 76, 82, 90, 98];
  const w = 200;
  const h = 70;
  const path = pts
    .map((p, i) => {
      const x = (i / (pts.length - 1)) * w;
      const y = h - (p / 100) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <HudPanel label="MODEL ACCURACY" code="MK-02">
      <p className="mono text-2xl font-bold text-gold glow-gold">98.28%</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="acc-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L${w} ${h} L0 ${h} Z`} fill="url(#acc-fill)" />
        <motion.path
          d={path}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, ease: EASE, delay: 0.6 }}
          style={{ filter: "drop-shadow(0 0 4px rgba(34,211,238,0.6))" }}
        />
      </svg>
      <p className="mono mt-1 text-[9px] tracking-wide text-text-dim">
        XGBOOST · OPTUNA TUNED · 10-FOLD CV
      </p>
    </HudPanel>
  );
}

/* ── Right telemetry: JARVIS system feed ────────────────────────── */
function SystemFeed() {
  const lines = [
    ["INITIALIZING JARVIS CORE", "OK"],
    ["LOADING NEURAL MODULES", "OK"],
    ["FAISS VECTOR INDEX", "OK"],
    ["MODEL INFERENCE ENGINE", "OK"],
    ["REAL-TIME MONITORING", "OK"],
  ];
  return (
    <HudPanel label="SYSTEM FEED" code="LIVE">
      <ul className="space-y-1.5">
        {lines.map(([l, s], i) => (
          <motion.li
            key={l}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + i * 0.14, ease: EASE }}
            className="mono flex items-center gap-2 text-[10px] text-cyan/90"
          >
            <span className="text-gold">&gt;</span>
            <span className="truncate">{l}</span>
            <span className="ml-auto text-cyan-bright">{s}</span>
          </motion.li>
        ))}
        <li className="mono flex items-center gap-1 pt-1 text-[10px] text-cyan">
          <span className="text-gold">&gt;</span>
          <span className="inline-block h-3 w-1.5 animate-blink bg-cyan" />
        </li>
      </ul>
    </HudPanel>
  );
}

function HudPanel({
  label,
  code,
  children,
}: {
  label: string;
  code: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full rounded-lg border border-line bg-surface/55 p-4 backdrop-blur-sm">
      <span aria-hidden className="absolute right-3 top-3 h-3 w-3 border-r border-t border-cyan/50" />
      <div className="mb-2 flex items-center justify-between">
        <span className="mono text-[9px] tracking-[0.25em] text-text-dim">{label}</span>
        <span className="mono rounded border border-cyan/30 px-1.5 text-[8px] tracking-widest text-cyan/90">
          {code}
        </span>
      </div>
      {children}
    </div>
  );
}

function RadarSweep({ reduced }: { reduced: boolean }) {
  if (reduced) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-[44%] h-[540px] w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{ maskImage: "radial-gradient(circle, #000 58%, transparent 72%)" }}
    >
      <div
        className="animate-radar h-full w-full rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(34,211,238,0.16) 36deg, transparent 76deg)",
        }}
      />
      <div className="absolute inset-0 rounded-full border border-cyan/12" />
      <div className="absolute inset-16 rounded-full border border-cyan/10" />
      <div className="absolute inset-32 rounded-full border border-cyan/8" />
    </div>
  );
}

export default function Hero() {
  const reduced = usePrefersReducedMotion();
  const name = useDecode(profile.name, 28);
  const specialty = useRotate(SPECIALTIES);

  // Mouse-parallax depth (desktop, motion-on only).
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 45, damping: 18 });
  const sy = useSpring(py, { stiffness: 45, damping: 18 });
  const reactorX = useTransform(sx, (v) => v * 18);
  const reactorY = useTransform(sy, (v) => v * 18);

  const onMove = (e: React.PointerEvent) => {
    if (reduced || e.pointerType === "touch") return;
    px.set(e.clientX / window.innerWidth - 0.5);
    py.set(e.clientY / window.innerHeight - 0.5);
  };

  return (
    <section
      id="top"
      onPointerMove={onMove}
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 pt-28 pb-14"
    >
      <div className="hud-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(34,211,238,0.10),transparent_60%)]" />
      <RadarSweep reduced={reduced} />

      {/* Sparse ambient particles (whisper, not snow) */}
      {!reduced && (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="absolute h-0.5 w-0.5 rounded-full bg-cyan/40"
              style={{
                left: `${12 + i * 15}%`,
                bottom: "-10px",
                animation: `float-up ${11 + (i % 4)}s linear ${i * 1.4}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 grid w-full max-w-6xl items-center gap-y-8 lg:grid-cols-[1fr_auto_1fr] lg:gap-x-10">
        {/* Left panel — desktop only */}
        <motion.div
          {...enter(0.1)}
          className="hidden w-full max-w-xs justify-self-start lg:block"
        >
          <AccuracyPanel reduced={reduced} />
        </motion.div>

        {/* Center: reactor + identity */}
        <div className="flex flex-col items-center text-center">
          <motion.div
            style={{ x: reactorX, y: reactorY }}
            className="relative h-56 w-56 sm:h-64 sm:w-64 md:h-80 md:w-80"
          >
            <ArcReactorStatic />
          </motion.div>

          <motion.p
            {...enter(0.15)}
            className="mono mt-4 text-[11px] tracking-[0.4em] text-cyan/80 sm:text-xs"
          >
            {profile.status}
          </motion.p>

          <motion.h1
            {...enter(0.22)}
            className="mt-5 text-balance text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl md:text-8xl"
          >
            <span className="glow-cyan">{name || profile.name}</span>
          </motion.h1>

          <motion.div
            {...enter(0.3)}
            className="mt-5 flex h-7 items-center gap-2 mono text-xs tracking-[0.15em] text-text-dim sm:text-sm"
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
            {...enter(0.38)}
            className="mt-6 max-w-md text-balance text-lg leading-relaxed text-text sm:text-xl"
          >
            &ldquo;{profile.tagline}&rdquo;
          </motion.p>

          <motion.div {...enter(0.46)} className="mt-9 flex flex-col gap-3 sm:flex-row">
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

          {/* Mobile-specific compact stat strip (replaces side panels) */}
          <motion.dl
            {...enter(0.54)}
            className="mt-12 grid w-full grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line lg:hidden"
          >
            {stats.map((s) => {
              const decimals = Number.isInteger(s.value) ? 0 : 2;
              return (
                <div key={s.label} className="bg-surface/80 px-4 py-3 text-left">
                  <dt className="mono text-lg font-bold text-cyan glow-cyan">
                    {s.prefix ?? ""}
                    {s.value.toFixed(decimals)}
                    {s.suffix}
                  </dt>
                  <dd className="mono mt-0.5 text-[9px] tracking-wide text-text-dim">
                    {s.label.toUpperCase()}
                  </dd>
                </div>
              );
            })}
          </motion.dl>
        </div>

        {/* Right panel — desktop only */}
        <motion.div
          {...enter(0.1)}
          className="hidden w-full max-w-xs justify-self-end lg:block"
        >
          <SystemFeed />
        </motion.div>
      </div>

      {/* In-page nav */}
      <nav
        aria-label="Section navigation"
        className="relative z-10 mt-12 hidden gap-8 mono text-[11px] tracking-[0.25em] text-text-dim sm:flex"
      >
        {navLinks.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="transition-colors duration-300 hover:text-cyan"
          >
            {l.label.toUpperCase()}
          </a>
        ))}
      </nav>

      {/* Bottom telemetry ticker (subtle) */}
      <div className="absolute bottom-0 left-0 right-0 z-10 overflow-hidden border-t border-line bg-bg-2/50 py-2">
        <div className="flex w-max animate-ticker mono text-[10px] tracking-[0.25em] text-text-dim">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0">
              {stats.map((s) => {
                const decimals = Number.isInteger(s.value) ? 0 : 2;
                return (
                  <span key={s.label + dup} className="flex items-center gap-2 px-6">
                    <span className="text-cyan/70">◆</span>
                    <span className="text-cyan-bright/90">
                      {s.prefix ?? ""}
                      {s.value.toFixed(decimals)}
                      {s.suffix}
                    </span>
                    <span>{s.label.toUpperCase()}</span>
                  </span>
                );
              })}
              <span className="px-6 text-gold/80">SYSTEMS NOMINAL · MARK XLII ONLINE</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
