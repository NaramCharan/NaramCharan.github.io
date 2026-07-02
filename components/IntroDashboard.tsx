"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence, motion } from "framer-motion";
import { profile } from "@/lib/content";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import { useRotate } from "@/lib/useDecode";
import { EASE } from "@/lib/motion";
import HeroCanvas from "./reactor3d/HeroCanvas";
import ArcReactorStatic from "./ArcReactorStatic";

gsap.registerPlugin(ScrollTrigger);

const SPECIALTIES = [
  "Recommendation Systems",
  "Demand Forecasting",
  "Data Engineering",
  "Neural Networks",
];

const CODE_LINES = [
  "model = NCF(n_users, n_items, dim=32)",
  "opt = torch.optim.Adam(model.parameters())",
  "loss = bce(preds, interactions) + l2(emb)",
  "index = faiss.IndexFlatL2(32)",
  "index.add(item_embeddings)",
  "D, I = index.search(user_vec, k=10)",
  "assert latency_ms < 10",
  "study = optuna.create_study()",
  "study.optimize(objective, n_trials=120)",
  "r2_score(y_val, y_pred)  # 0.955",
];

/**
 * The hero — a scroll-scrubbed cinematic. A WebGL reactor (HeroCanvas) opens on
 * the EDITH glasses, then robotic arms assemble a 3D Mark XLII reactor; a GSAP
 * timeline (scrubbed on the same #top track) drives the DOM overlays in lockstep:
 *
 *   A (0–28%)  · glasses + "Welcome to the world" → fade out
 *   B (28–74%) · the 3D assembly (owned by the canvas) + code streams
 *   C (74–100%)· identity in, quote "types" on, HUD panels stagger in
 *
 * DOM markup renders the FINAL, readable state (SSR/SEO/reduced-motion safe).
 * Reduced motion skips WebGL entirely and shows a static reactor + all content.
 */
export default function IntroDashboard() {
  const reduced = usePrefersReducedMotion();
  const trackRef = useRef<HTMLElement>(null);
  const specialty = useRotate(SPECIALTIES);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: { trigger: track, start: "top top", end: "bottom bottom", scrub: true },
      });
      // positions below are in scroll-fraction terms; pad total to ~1 at the end.
      tl.to(".ia-hint", { autoAlpha: 0, duration: 0.05 }, 0.03)
        .to(".ia-reticle", { autoAlpha: 0, scale: 1.6, duration: 0.12, ease: "power1.in" }, 0.06)
        .to(".ia-welcome", { autoAlpha: 0, y: -40, scale: 1.05, duration: 0.1, ease: "power1.in" }, 0.15)
        .fromTo(".ia-code", { autoAlpha: 0 }, { autoAlpha: 0.55, duration: 0.08 }, 0.3)
        .to(".ia-code", { autoAlpha: 0, duration: 0.08 }, 0.66)
        .from(".ia-status", { autoAlpha: 0, y: 14, duration: 0.06 }, 0.74)
        .from(".ia-name", { autoAlpha: 0, y: 28, duration: 0.09 }, 0.77)
        .from(".ia-spec", { autoAlpha: 0, y: 14, duration: 0.06 }, 0.82)
        .fromTo(".ia-quote", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.1, ease: "none" }, 0.85)
        .fromTo(".ia-caret", { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.02 }, 0.96)
        .from(".ia-ctas", { autoAlpha: 0, y: 16, duration: 0.06 }, 0.9)
        .from(".ia-panel", { autoAlpha: 0, y: 14, duration: 0.06, stagger: 0.02 }, 0.78)
        .to({}, { duration: 0.001 }, 1); // pad so positions ≈ scroll fraction

      ScrollTrigger.refresh();
    }, track);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      id="top"
      ref={trackRef}
      aria-label="Intro"
      className={reduced ? "relative" : "relative h-[320vh]"}
    >
      <div className="sticky top-0 flex h-dvh flex-col items-center justify-center overflow-hidden bg-bg">
        {/* WebGL reactor (or static fallback under reduced motion) */}
        {reduced ? (
          <div className="relative z-10 h-56 w-56 sm:h-64 sm:w-64">
            <ArcReactorStatic />
          </div>
        ) : (
          <HeroCanvas trackId="top" />
        )}

        <div className="hud-grid pointer-events-none absolute inset-0 z-0 opacity-30" />

        {/* Segment A — JARVIS optical-scan reticle (the opening "lock-on") */}
        {!reduced && <ScanReticle />}

        {/* Segment A — welcome line */}
        {!reduced && (
          <div
            aria-hidden
            className="ia-welcome pointer-events-none absolute inset-x-0 bottom-[14%] z-20 flex flex-col items-center gap-3 text-center"
          >
            <p className="text-balance text-3xl font-semibold tracking-tight text-text glow-cyan sm:text-5xl lg:text-6xl">
              Welcome to the world,
            </p>
            <p className="mono text-sm tracking-[0.35em] text-cyan sm:text-base">LET&apos;S DIVE IN</p>
          </div>
        )}

        {/* Streaming code columns (desktop, during assembly) */}
        <div aria-hidden className="ia-code pointer-events-none absolute inset-y-0 left-6 z-[5] hidden w-64 flex-col justify-center gap-1.5 opacity-0 lg:flex">
          {CODE_LINES.slice(0, 5).map((l) => (
            <span key={l} className="mono text-[10px] leading-4 text-cyan/60">{l}</span>
          ))}
        </div>
        <div aria-hidden className="ia-code pointer-events-none absolute inset-y-0 right-6 z-[5] hidden w-64 flex-col items-end justify-center gap-1.5 opacity-0 text-right lg:flex">
          {CODE_LINES.slice(5).map((l) => (
            <span key={l} className="mono text-[10px] leading-4 text-cyan/60">{l}</span>
          ))}
        </div>

        {/* Segment C — identity (bottom-centre, under the reactor) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[6%] z-10 flex flex-col items-center px-6 text-center">
          <p className="ia-status mono text-[11px] tracking-[0.4em] text-cyan/80 sm:text-xs">
            {reduced ? profile.status : profile.status}
          </p>
          <h1 className="ia-name mt-3 text-balance text-4xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="glow-cyan">{profile.name}</span>
          </h1>
          <div className="ia-spec mt-3 flex h-6 items-center gap-2 mono text-xs tracking-[0.15em] text-text-dim sm:text-sm">
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
          </div>
          <p className="mt-3 max-w-md text-balance text-lg leading-relaxed text-text sm:text-xl">
            <span className="ia-quote inline-block">&ldquo;{profile.tagline}&rdquo;</span>
            {!reduced && (
              <span aria-hidden className="ia-caret ml-0.5 inline-block h-5 w-2 translate-y-0.5 animate-blink bg-cyan align-baseline" />
            )}
          </p>
          <div className="ia-ctas pointer-events-auto mt-6 flex flex-col gap-3 sm:flex-row">
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
          </div>
        </div>

        {/* ── HUD panels (desktop, Segment C) ─────────────────────── */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-10 hidden lg:block">
          <Panel className="left-8 top-24 w-[220px]">
            <PanelHead label="SUIT SYSTEMS" code="PWR" />
            <div className="flex items-center gap-4">
              <PowerGauge />
              <div>
                <div className="mono text-xl font-bold text-cyan glow-cyan">100%</div>
                <div className="mono text-[9px] tracking-[0.2em] text-text-dim">POWER LEVEL</div>
              </div>
            </div>
          </Panel>

          <Panel className="left-8 top-1/2 w-[250px] -translate-y-1/2">
            <PanelHead label="MODEL ACCURACY" code="MK-02" />
            <div className="flex items-end justify-between">
              <span className="mono text-2xl font-bold text-gold glow-gold">98.28%</span>
              <span className="mono text-[9px] text-text-dim">10-FOLD CV</span>
            </div>
            <AccuracyChart />
          </Panel>

          <Panel className="bottom-16 left-8 w-[260px]">
            <PanelHead label="STORE-DEPT FORECAST" code="MK-01" />
            <ForecastBars />
            <p className="mono mt-2 text-[9px] tracking-wide text-text-dim">95.5% VALIDATION R²</p>
          </Panel>

          <Panel className="right-8 top-20 w-[260px]">
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
            </ul>
          </Panel>

          <Panel className="right-8 top-1/2 w-[240px] -translate-y-1/2">
            <PanelHead label="TELEMETRY" code="RT" />
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

          <Panel className="bottom-16 right-8 w-[260px]">
            <PanelHead label="GLOBAL NODES" code="NET" />
            <NodeNet />
          </Panel>
        </div>

        {/* Header + scroll hint */}
        <div className="pointer-events-none absolute left-1/2 top-6 z-20 -translate-x-1/2 mono text-[10px] tracking-[0.5em] text-cyan/70">
          J.A.R.V.I.S // MARK XLII
        </div>
        {!reduced && (
          <div className="ia-hint pointer-events-none absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1.5">
            <span className="mono text-[10px] tracking-[0.35em] text-cyan/80">SCROLL TO INITIALIZE</span>
            <svg viewBox="0 0 24 24" className="h-4 w-4 animate-bounce text-cyan/70" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-32 bg-gradient-to-b from-transparent to-bg" />
      </div>
    </section>
  );
}

/* ── JARVIS optical-scan reticle — the opening lock-on ───────── */
function ScanReticle() {
  const ticks = Array.from({ length: 60 });
  return (
    <div
      aria-hidden
      className="ia-reticle pointer-events-none absolute left-1/2 top-1/2 z-[12] -translate-x-1/2 -translate-y-1/2"
    >
      <div className="relative h-[min(78vw,560px)] w-[min(78vw,560px)]">
        <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
          <defs>
            <radialGradient id="rt-sweep" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* radar sweep */}
          <g className="animate-radar" style={{ transformOrigin: "200px 200px" }}>
            <path d="M200 200 L200 24 A176 176 0 0 1 324 96 Z" fill="url(#rt-sweep)" />
          </g>

          {/* outer dashed ring — slow spin */}
          <g className="animate-spin-slow" style={{ transformOrigin: "200px 200px" }}>
            <circle cx="200" cy="200" r="188" fill="none" stroke="#22d3ee" strokeOpacity="0.5" strokeWidth="1" strokeDasharray="2 8" />
          </g>

          {/* tick ring — reverse spin */}
          <g className="animate-spin-rev" style={{ transformOrigin: "200px 200px" }}>
            {ticks.map((_, i) => {
              const a = (i / 60) * Math.PI * 2;
              const r1 = i % 5 === 0 ? 156 : 164;
              const x1 = +(200 + Math.cos(a) * r1).toFixed(2);
              const y1 = +(200 + Math.sin(a) * r1).toFixed(2);
              const x2 = +(200 + Math.cos(a) * 172).toFixed(2);
              const y2 = +(200 + Math.sin(a) * 172).toFixed(2);
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#22d3ee" strokeOpacity={i % 5 === 0 ? 0.8 : 0.4} strokeWidth={i % 5 === 0 ? 1.4 : 0.8} />
              );
            })}
          </g>

          {/* static mid + inner rings */}
          <circle cx="200" cy="200" r="150" fill="none" stroke="#22d3ee" strokeOpacity="0.25" strokeWidth="1" />
          <circle cx="200" cy="200" r="96" fill="none" stroke="#7de7f5" strokeOpacity="0.5" strokeWidth="1" strokeDasharray="3 6" />

          {/* crosshair (gapped at centre) */}
          <g stroke="#22d3ee" strokeOpacity="0.55" strokeWidth="1">
            <line x1="200" y1="30" x2="200" y2="78" />
            <line x1="200" y1="322" x2="200" y2="370" />
            <line x1="30" y1="200" x2="78" y2="200" />
            <line x1="322" y1="200" x2="370" y2="200" />
          </g>

          {/* centre target */}
          <circle cx="200" cy="200" r="5" fill="none" stroke="#7de7f5" strokeWidth="1.2" />
          <circle cx="200" cy="200" r="1.6" fill="#7de7f5" />

          {/* corner brackets on a square frame */}
          {[
            "M96 60 h-36 v36",
            "M304 60 h36 v36",
            "M96 340 h-36 v-36",
            "M304 340 h36 v-36",
          ].map((d) => (
            <path key={d} d={d} fill="none" stroke="#22d3ee" strokeOpacity="0.7" strokeWidth="1.4" />
          ))}
        </svg>

        {/* HUD labels */}
        <span className="mono absolute left-1/2 top-[6%] -translate-x-1/2 text-[10px] tracking-[0.4em] text-cyan/80">
          ◈ OPTICAL SCAN ◈
        </span>
        <span className="mono absolute bottom-[7%] left-1/2 -translate-x-1/2 text-[9px] tracking-[0.35em] text-cyan/55">
          CALIBRATING · MK XLII
        </span>
      </div>
    </div>
  );
}

/* ── HUD panel shell ────────────────────────────────────────── */
function Panel({ className, children }: { className: string; children: ReactNode }) {
  return (
    <div className={`ia-panel absolute rounded-lg border border-line bg-surface/70 p-3 backdrop-blur-sm ${className}`}>
      <span aria-hidden className="absolute right-2.5 top-2.5 h-2.5 w-2.5 border-r border-t border-cyan/50" />
      {children}
    </div>
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
