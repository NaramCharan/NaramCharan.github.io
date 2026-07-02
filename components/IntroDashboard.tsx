"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence, motion } from "framer-motion";
import { profile } from "@/lib/content";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import { useRotate } from "@/lib/useDecode";
import { EASE } from "@/lib/motion";
import ReactorAssembly from "./ReactorAssembly";

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
 * The hero — a scroll-scrubbed "Stark assembly" driven by one GSAP timeline
 * tied to ScrollTrigger (scrub: reverse on scroll-up, stop when you stop).
 *
 *   Segment A (0–30%)  · "Welcome to the world" fades in and out
 *   Segment B (30–70%) · scattered reactor parts fly in and snap together
 *   Segment C (70–100%)· name + subtitle fade in, quote "types" on, HUD panels
 *
 * Markup renders the FINAL state (SSR/SEO/no-JS/reduced-motion safe); the
 * timeline immediately re-poses everything to the scattered start on mount.
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
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        },
      });

      /* ── Segment A (0–3): welcome line — visible at rest, drifts out ── */
      tl.to(".ia-hint", { autoAlpha: 0, duration: 0.4 }, 0.1)
        .to(".ia-welcome", { autoAlpha: 0, y: -30, scale: 1.04, duration: 0.7, ease: "power1.in" }, 2.3);

      /* ── Segment B (3–7): the Stark assembly ───────────────────── */
      // schematic callouts + streaming code appear with the floating parts
      tl.fromTo(".ra-callout", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 2.9)
        .fromTo(".ia-code", { autoAlpha: 0 }, { autoAlpha: 0.55, duration: 0.5 }, 3.0)
        // big rings fly in from off-screen corners, rotating into place
        .from(".ra-bezel", { x: -500, y: -300, rotation: -180, scale: 0.4, autoAlpha: 0, duration: 1.4, ease: "power3.out" }, 3.0)
        .from(".ra-tick", { x: 520, y: -280, rotation: 220, scale: 0.4, autoAlpha: 0, duration: 1.3, ease: "power3.out" }, 3.25)
        .from(".ra-housing", { x: -460, y: 340, rotation: -160, scale: 0.5, autoAlpha: 0, duration: 1.2, ease: "power3.out" }, 3.5)
        // 18 coil segments stagger in radially — mechanical assembly
        .from(".ra-coil", {
          x: (_, el) => Math.cos(+(el as SVGGElement).dataset.angle!) * 340,
          y: (_, el) => Math.sin(+(el as SVGGElement).dataset.angle!) * 340,
          rotation: 180,
          scale: 0,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.045,
          ease: "power2.out",
        }, 3.9)
        // rotor triangle + bevels + corner nodes
        .from(".ra-tri", { scale: 0, rotation: 180, autoAlpha: 0, duration: 0.8, ease: "back.out(1.4)" }, 5.7)
        .from(".ra-nest", { autoAlpha: 0, scale: 0.6, duration: 0.4, stagger: 0.15, ease: "power2.out" }, 6.2)
        .from(".ra-node", { scale: 0, autoAlpha: 0, duration: 0.4, stagger: 0.12, ease: "back.out(1.7)" }, 6.3)
        // the core snaps in — back.out for the mechanical click
        .from(".ra-corewrap", { scale: 0, rotation: 180, autoAlpha: 0, duration: 0.6, ease: "back.out(1.7)" }, 6.6)
        // charge-up: glow blooms, flash pops, callouts/code dissolve
        .from(".ra-glowring", { autoAlpha: 0, duration: 0.5 }, 6.9)
        .fromTo(".ra-flash", { autoAlpha: 0 }, { autoAlpha: 0.8, duration: 0.2 }, 7.0)
        .to(".ra-flash", { autoAlpha: 0, duration: 0.3 }, 7.2)
        .to(".ra-callout", { autoAlpha: 0, duration: 0.3 }, 6.6)
        .to(".ia-code", { autoAlpha: 0, duration: 0.4 }, 6.8)
        .fromTo(".ia-reactor", { scale: 0.92 }, { scale: 1, duration: 4, ease: "none" }, 3.0);

      /* ── Segment C (7–10): identity + HUD panels ───────────────── */
      tl.from(".ia-status", { autoAlpha: 0, y: 14, duration: 0.4, ease: "power2.out" }, 7.2)
        .from(".ia-name", { autoAlpha: 0, y: 26, duration: 0.7, ease: "power2.out" }, 7.4)
        .from(".ia-spec", { autoAlpha: 0, y: 14, duration: 0.5, ease: "power2.out" }, 7.9)
        // the quote "types" on via a clip wipe; caret rides along then fades
        .fromTo(".ia-quote", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1.4 }, 8.1)
        .from(".ia-caret", { autoAlpha: 0, duration: 0.1 }, 8.1)
        .to(".ia-caret", { autoAlpha: 0, duration: 0.2 }, 9.7)
        .from(".ia-ctas", { autoAlpha: 0, y: 16, duration: 0.5, ease: "power2.out" }, 9.3)
        .from(".ia-panel", { autoAlpha: 0, y: 14, duration: 0.5, stagger: 0.35, ease: "power2.out" }, 7.6);
    }, track);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      id="top"
      ref={trackRef}
      aria-label="Intro"
      className={reduced ? "relative" : "relative h-[300vh]"}
    >
      <div className="sticky top-0 flex h-dvh flex-col items-center justify-center overflow-hidden bg-bg px-6">
        <div className="hud-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(34,211,238,0.10),transparent_62%)]" />

        {/* Segment A — welcome line (skipped entirely under reduced motion) */}
        {!reduced && (
          <div
            aria-hidden
            className="ia-welcome pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 text-center"
          >
            <p className="ia-welcome-line text-balance text-3xl font-semibold tracking-tight text-text glow-cyan sm:text-5xl lg:text-6xl">
              Welcome to the world,
            </p>
            <p className="ia-welcome-line mono text-sm tracking-[0.35em] text-cyan sm:text-base">
              LET&apos;S DIVE IN
            </p>
          </div>
        )}

        {/* Streaming code columns (desktop, during assembly) */}
        <div aria-hidden className="ia-code pointer-events-none absolute inset-y-0 left-6 z-0 hidden w-64 flex-col justify-center gap-1.5 opacity-0 lg:flex">
          {CODE_LINES.slice(0, 5).map((l) => (
            <span key={l} className="mono text-[10px] leading-4 text-cyan/60">{l}</span>
          ))}
        </div>
        <div aria-hidden className="ia-code pointer-events-none absolute inset-y-0 right-6 z-0 hidden w-64 flex-col items-end justify-center gap-1.5 opacity-0 text-right lg:flex">
          {CODE_LINES.slice(5).map((l) => (
            <span key={l} className="mono text-[10px] leading-4 text-cyan/60">{l}</span>
          ))}
        </div>

        {/* Segment B — the reactor rig */}
        <div className="ia-reactor relative z-10 h-44 w-44 sm:h-56 sm:w-56 lg:h-72 lg:w-72">
          <ReactorAssembly />
        </div>

        {/* Segment C — identity */}
        <div className="relative z-10 mt-2 flex flex-col items-center text-center">
          <p className="ia-status mono text-[11px] tracking-[0.4em] text-cyan/80 sm:text-xs">
            {profile.status}
          </p>
          <h1 className="ia-name mt-4 text-balance text-4xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="glow-cyan">{profile.name}</span>
          </h1>
          <div className="ia-spec mt-4 flex h-6 items-center gap-2 mono text-xs tracking-[0.15em] text-text-dim sm:text-sm">
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
          <p className="mt-4 max-w-md text-balance text-lg leading-relaxed text-text sm:text-xl">
            <span className="ia-quote inline-block">&ldquo;{profile.tagline}&rdquo;</span>
            {!reduced && (
              <span aria-hidden className="ia-caret ml-0.5 inline-block h-5 w-2 translate-y-0.5 animate-blink bg-cyan align-baseline" />
            )}
          </p>
          <div className="ia-ctas mt-7 flex flex-col gap-3 sm:flex-row">
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
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
          {/* MODEL ACCURACY — top centre */}
          <Panel className="left-1/2 top-8 w-[300px] -translate-x-1/2">
            <PanelHead label="MODEL ACCURACY" code="MK-02" />
            <div className="flex items-end justify-between">
              <span className="mono text-2xl font-bold text-gold glow-gold">98.28%</span>
              <span className="mono text-[9px] text-text-dim">10-FOLD CV</span>
            </div>
            <AccuracyChart />
          </Panel>

          {/* SUIT SYSTEMS — top left */}
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

          {/* STORE-DEPARTMENT FORECAST — bottom left */}
          <Panel className="bottom-16 left-8 w-[260px]">
            <PanelHead label="STORE-DEPT FORECAST" code="MK-01" />
            <ForecastBars />
            <p className="mono mt-2 text-[9px] tracking-wide text-text-dim">95.5% VALIDATION R²</p>
          </Panel>

          {/* TERMINAL — top right */}
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
              <li className="mono flex items-center gap-1 text-[10px] text-cyan">
                <span className="text-gold">&gt;</span>
                <span className="inline-block h-3 w-1.5 animate-blink bg-cyan" />
              </li>
            </ul>
          </Panel>

          {/* STAT READOUTS — right mid */}
          <Panel className="right-10 top-1/2 w-[240px] -translate-y-1/2">
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
          <Panel className="bottom-16 right-8 w-[260px]">
            <PanelHead label="GLOBAL NODES" code="NET" />
            <NodeNet />
          </Panel>
        </div>

        {/* Header + scroll hint */}
        <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 mono text-[10px] tracking-[0.5em] text-cyan/70">
          J.A.R.V.I.S // MARK XLII
        </div>
        {!reduced && (
          <div className="ia-hint pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5">
            <span className="mono text-[10px] tracking-[0.35em] text-cyan/80">SCROLL TO INITIALIZE</span>
            <svg viewBox="0 0 24 24" className="h-4 w-4 animate-bounce text-cyan/70" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        {/* Blend into the site below */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-bg" />
      </div>
    </section>
  );
}

/* ── HUD panel shell (GSAP reveals .ia-panel in Segment C) ──────── */
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
