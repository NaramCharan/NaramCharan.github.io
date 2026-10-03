"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence, motion } from "framer-motion";
import { animate } from "animejs";
import { profile, projects } from "@/lib/content";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import { useDecode, useRotate } from "@/lib/useDecode";
import { EASE } from "@/lib/motion";
import { useMagnetic } from "@/lib/useMagnetic";
import ArcReactorStatic from "./ArcReactorStatic";
import HeroHud from "./HeroHud";
import HelmetHero from "./HelmetHero";

/** The shimmer shown while three.js is still on the wire (and before we ask
 *  for it at all). Doubles as the pre-idle placeholder so the swap is seamless. */
function ReactorShimmer() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 flex flex-col items-center justify-center gap-4"
    >
      <div className="h-44 w-44 opacity-40 sm:h-56 sm:w-56">
        <ArcReactorStatic />
      </div>
      <span className="mono text-[10px] tracking-[0.35em] text-cyan/60">
        INITIALIZING RENDERER…
      </span>
    </div>
  );
}

// Split the three.js bundle out of the initial load — the canvas streams in
// behind a lightweight reactor shimmer instead of blocking first paint.
const HeroCanvas = dynamic(() => import("./reactor3d/HeroCanvas"), {
  ssr: false,
  loading: () => (
    <ReactorShimmer />
  ),
});

gsap.registerPlugin(ScrollTrigger);

/** Chip number that counts up once the boot stagger has revealed it. The
 *  rendered text is already the final value, so SSR / reduced motion are fine. */
function Tick({ to, delay }: { to: number; delay: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const o = { v: 0 };
    el.textContent = "0";
    const a = animate(o, {
      v: to,
      delay,
      duration: 1300,
      ease: "outExpo",
      onUpdate: () => {
        el.textContent = String(Math.round(o.v));
      },
      onComplete: () => {
        el.textContent = String(to);
      },
    });
    return () => {
      a.revert();
    };
  }, [to, delay, reduced]);
  return (
    <b ref={ref} className="font-semibold">
      {to}
    </b>
  );
}

/** Every project on the page — learning builds included, so the hero says
 *  "built", not "shipped". Counted from content so it can't drift. */
const BUILT_COUNT = projects.length;
/** Anything with a public URL — a deployed app is the strongest claim here,
 *  so the hero states how many there are rather than leaving it to be found. */
const DEPLOYED_COUNT = projects.filter((p) => p.demo).length;

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
  "r2_score(y_val, y_pred)  # 0.9555",
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

  /* three.js is ~1.1MB and was being fetched and parsed while React was still
     hydrating — 450ms of blocking time before the page would answer a tap.
     The reactor sits at 0.25 opacity until you scroll, so nobody can tell it
     arrived a beat late: wait for the main thread to go idle, or for the first
     scroll (whichever lands first), then pull it in. The shimmer holds the
     frame meanwhile, so the swap is invisible either way. */
  const [canvasReady, setCanvasReady] = useState(false);
  useEffect(() => {
    if (reduced) return;
    let settled = false;
    const start = () => {
      if (settled) return;
      settled = true;
      cleanup();
      setCanvasReady(true);
    };
    // Safari only shipped requestIdleCallback recently, so fall back to a timer.
    const idle = typeof window.requestIdleCallback === "function";
    const id = idle
      ? window.requestIdleCallback(start, { timeout: 1500 })
      : window.setTimeout(start, 700);
    function cleanup() {
      window.removeEventListener("scroll", start);
      if (idle) window.cancelIdleCallback(id);
      else clearTimeout(id);
    }
    window.addEventListener("scroll", start, { passive: true });
    return cleanup;
  }, [reduced]);
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const specialty = useRotate(SPECIALTIES);
  // JARVIS boot: the at-rest name scrambles in on load.
  const bootName = useDecode(profile.name, 42);
  const magProjects = useMagnetic();

  // Pointer parallax — writes --par-x/--par-y on the stage; the .par-layer
  // wrappers (each with its own --par-m depth) drift in CSS. GSAP never
  // touches these wrappers, so the scroll timeline and parallax can't fight.
  const onStagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== "mouse") return;
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--par-x", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
    el.style.setProperty("--par-y", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
  };
  const onStagePointerLeave = () => {
    const el = stageRef.current;
    if (!el) return;
    el.style.setProperty("--par-x", "0");
    el.style.setProperty("--par-y", "0");
  };

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
        // each code line streams in on its own beat (container caps opacity)
        .fromTo(
          ".ia-code span",
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.03, stagger: 0.012 },
          0.31
        )
        .to(".ia-code", { autoAlpha: 0, duration: 0.08 }, 0.58)
        .from(".ia-name", { autoAlpha: 0, y: 28, duration: 0.09 }, 0.66)
        .from(".ia-spec", { autoAlpha: 0, y: 14, duration: 0.06 }, 0.76)
        .fromTo(".ia-quote", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.1, ease: "none" }, 0.8)
        // caret exists only while the quote "types" — hidden at rest and after
        .fromTo(".ia-caret", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 0.8)
        .to(".ia-caret", { autoAlpha: 0, duration: 0.02 }, 0.94)
        .from(".ia-ctas", { autoAlpha: 0, y: 16, duration: 0.06 }, 0.86)
        // panels boot one-by-one — scale + wider stagger makes each land legibly
        // conduits belong to the panels — invisible until segment C
        .from(".ia-hud-wire", { autoAlpha: 0, duration: 0.06 }, 0.7)
        .from(
          ".ia-panel",
          { autoAlpha: 0, y: 18, scale: 0.94, duration: 0.07, stagger: 0.035 },
          0.68
        )
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
      data-seg="a"
      // 180vh, down from 320vh. At 320 the hero was 29% of the whole page and
      // segment B ran ~1,300px with no text on screen at all.
      className={reduced ? "relative" : "relative h-[180vh]"}
    >
      <div
        ref={stageRef}
        onPointerMove={onStagePointerMove}
        onPointerLeave={onStagePointerLeave}
        className="sticky top-0 flex h-dvh flex-col items-center justify-center overflow-hidden bg-bg"
      >
        {/* WebGL reactor (or static fallback under reduced motion) */}
        {reduced ? (
          <div className="relative z-10 h-56 w-56 sm:h-64 sm:w-64">
            <ArcReactorStatic />
          </div>
        ) : (
          // Faint at rest (scattered parts can't glint over the identity text),
          // full strength as soon as the scroll assembly begins. --p is written
          // on the track by the canvas ScrollTrigger, so CSS handles the fade.
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ opacity: "calc(0.25 + var(--p, 0) * 6)" }}
          >
            {canvasReady ? <HeroCanvas trackId="top" /> : <ReactorShimmer />}
          </div>
        )}

        <div className="hud-grid pointer-events-none absolute inset-0 z-0 opacity-30" />

        {/* Segment A — JARVIS optical-scan reticle (the opening "lock-on") */}
        {!reduced && <HelmetHero />}

        {/* Segment A — at-rest identity: name + role at headline scale, no scroll needed */}
        {!reduced && (
          <div
            aria-hidden
            // Centred, not parked in the bottom 17%: the reticle is a halo
            // behind the name now rather than a 400px empty ring above it.
            className="ia-welcome pointer-events-none absolute inset-0 z-20 flex items-end justify-center px-6 pb-[15vh]"
          >
            {/* Inner wrapper: parallax + boot-in stagger live here, so GSAP
                keeps sole ownership of .ia-welcome's own transform/opacity. */}
            <div
              aria-hidden
              className="hero-aura absolute left-1/2 top-1/2 h-[520px] w-[min(92vw,820px)] -translate-x-1/2 -translate-y-1/2"
            />
            <motion.div
              className="par-layer relative flex flex-col items-center gap-2.5 text-center"
              style={{ "--par-m": 6 } as React.CSSProperties}
              initial="boot"
              animate="on"
              variants={{
                boot: {},
                on: { transition: { staggerChildren: 0.16, delayChildren: 0.25 } },
              }}
            >
              <motion.p
                variants={{ boot: { opacity: 0, y: 12 }, on: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }}
                className="text-sm tracking-wide text-cyan/90 sm:text-base"
              >
                Welcome to the world,
              </motion.p>
              <motion.p
                variants={{ boot: { opacity: 0, y: 14 }, on: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }}
                // font-display: this is a <p>, so without it the name renders in
                // Sora here but Space Grotesk in segment C — one hero, one name,
                // two typefaces.
                className="font-display text-balance text-5xl font-semibold tracking-tight text-hero-gradient sm:text-6xl lg:text-7xl"
              >
                {bootName || " "}
              </motion.p>
              <motion.p
                variants={{ boot: { opacity: 0, y: 10 }, on: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }}
                className="mono text-[11px] tracking-[0.22em] text-text sm:text-sm"
              >
                ML ENGINEER · 3RD-YEAR CS ·{" "}
                <span className="whitespace-nowrap text-gold">OPEN TO INTERNSHIPS</span>
              </motion.p>
              {/* Proof, at rest. These numbers used to sit three viewport
                  scrolls away behind the assembly; LET'S DIVE IN moved into
                  the scroll-hint stack so the two can't collide. */}
              <motion.ul
                variants={{ boot: { opacity: 0, y: 8 }, on: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } } }}
                className="mono mt-2 flex flex-wrap items-center justify-center gap-2 text-[10px] tracking-[0.14em] sm:text-[11px]"
              >
                {/* Counted, not typed — this line read "5 SHIPPED" for a while
                    after the project list changed underneath it. */}
                <li className="rounded-full border border-cyan/30 bg-cyan/[0.06] px-3 py-1 text-cyan">
                  <Tick to={BUILT_COUNT} delay={1100} /> PROJECTS BUILT
                </li>
                <li className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/[0.07] px-3 py-1 text-gold">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
                  <Tick to={DEPLOYED_COUNT} delay={1300} /> DEPLOYED LIVE
                </li>
                <li className="rounded-full border border-cyan/30 bg-cyan/[0.06] px-3 py-1 text-cyan">
                  <Tick to={83} delay={1500} />% PNEUMONIA RECALL
                </li>
              </motion.ul>
            </motion.div>
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
        <div
          className="par-layer pointer-events-none absolute inset-x-0 bottom-[6%] z-10 flex flex-col items-center px-6 text-center"
          style={{ "--par-m": 5 } as React.CSSProperties}
        >
          {/* The status line lived here, but it repeated the at-rest role line
              above and the dossier's AVAILABILITY field below. Cut — the hero
              is the cinematic beat, the dossier carries the facts. */}
          <h1 className="ia-name text-balance text-4xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-hero-gradient">{profile.name}</span>
          </h1>
          {/* Stacks below sm: as one row the reserved 13ch pushed the line to
              308px, so it overflowed and sat visibly left of the name's axis. */}
          <div className="ia-spec mt-3 flex flex-col items-center gap-1 mono text-xs tracking-[0.15em] text-text-dim sm:h-6 sm:flex-row sm:gap-2 sm:text-sm">
            <span className="flex items-center gap-2">
              <span className="text-gold">◢</span>
              <span>SPECIALIZING IN</span>
            </span>
            <span className="relative inline-flex justify-center text-cyan sm:min-w-[13ch] sm:justify-start">
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
            {/* Caret lives inside the quote span — outside it, the wrapped
                tagline orphaned it onto a line of its own as a stray block. */}
            <span className="ia-quote inline-block">
              &ldquo;{profile.tagline}&rdquo;
              {!reduced && (
                <span aria-hidden className="ia-caret ml-0.5 inline-block h-5 w-2 translate-y-0.5 animate-blink bg-cyan align-baseline" />
              )}
            </span>
          </p>
          {/* One CTA only. Resume is always reachable in the navbar and again
              in the dossier immediately below — three entry points was noise. */}
          <div className="ia-ctas pointer-events-auto mt-6 flex">
            <a
              ref={magProjects}
              href="#projects"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-cyan/50 bg-cyan/10 px-7 py-3 text-sm font-medium text-cyan transition-all duration-300 hover:bg-cyan/20 hover:shadow-[0_0_26px_rgba(34,211,238,0.35)]"
            >
              View Projects
              <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </a>
          </div>
        </div>

        {/* ── HUD panels (desktop, Segment C) — far layer, drifts opposite ── */}
        <div
          aria-hidden
          className="par-layer pointer-events-none absolute inset-0 z-10 hidden lg:block"
          style={{ "--par-m": -10 } as React.CSSProperties}
        >
          <HeroHud />
        </div>

        {/* Header + scroll hint (sits below the always-visible navbar) */}
        <div className="pointer-events-none absolute left-1/2 top-16 z-20 -translate-x-1/2 mono text-[10px] tracking-[0.5em] text-cyan/70">
          J.A.R.V.I.S // MARK XLII
        </div>
        {!reduced && (
          <div className="ia-hint pointer-events-none absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1.5">
            <span className="mono text-[11px] tracking-[0.35em] text-cyan sm:text-xs">LET&apos;S DIVE IN</span>
            <span className="mono text-[9px] tracking-[0.35em] text-cyan/60">SCROLL TO INITIALIZE</span>
            <svg viewBox="0 0 24 24" className="h-4 w-4 animate-bounce text-cyan/70" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        {/* Phase rail — takes over the scroll hint's slot once scrolling starts.
            Which phase is lit + the bar's fill are driven entirely by the
            data-seg/--p the canvas stamps on the track (see .seg-rail CSS). */}
        {!reduced && (
          <div
            aria-hidden
            className="seg-rail pointer-events-none absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2"
          >
            <div className="flex items-center gap-4 mono text-[9px] tracking-[0.3em] sm:gap-6 sm:text-[10px]">
              <span className="seg-item seg-a">01 SCAN</span>
              <span className="seg-item seg-b">02 ASSEMBLE</span>
              <span className="seg-item seg-c">03 ONLINE</span>
            </div>
            <div className="h-px w-52 overflow-hidden rounded-full bg-cyan/15 sm:w-64">
              <div
                className="h-full w-full origin-left bg-gradient-to-r from-cyan via-cyan-bright to-gold"
                style={{ transform: "scaleX(var(--p, 0))" }}
              />
            </div>
          </div>
        )}

        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-32 bg-gradient-to-b from-transparent to-bg" />
      </div>
    </section>
  );
}

