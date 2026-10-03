"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import { SCENES } from "./timeline";

const ArmorScene = dynamic(() => import("./ArmorScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center">
      <span className="mono animate-pulse text-[10px] tracking-[0.5em] text-cyan/70">INITIALIZING ARMOR…</span>
    </div>
  ),
});

/* Captions fade on the same --p the canvas reads: pure CSS, no re-renders.
   Each fades over ~4% of scroll at either edge of its window. */
const fade = (s: number, e: number): CSSProperties => ({
  opacity: `clamp(0, min(calc((var(--p) - ${s}) * 25), calc((${e} - var(--p)) * 25)), 1)`,
  transform: `translateY(calc((1 - clamp(0, calc((var(--p) - ${s}) * 25), 1)) * 18px))`,
});

const CHAPTERS = [
  {
    at: [0.09, 0.29],
    n: "01",
    title: "Shell",
    body: "Rear dome seats over the inner frame. Shell halves close from both sides; ear housings lock.",
  },
  {
    at: [0.31, 0.55],
    n: "02",
    title: "Plating",
    body: "Forehead tab drops into its channel. Gold jaw rises, chin plate seals underneath.",
  },
  {
    at: [0.57, 0.71],
    n: "03",
    title: "Faceplate",
    body: "The faceplate swings down and forward — and locks.",
  },
  {
    at: [0.73, 0.83],
    n: "04",
    title: "Optics online",
    body: "Ocular arrays ignite. Calibrating.",
  },
] as const;

export default function ArmorExperience() {
  const reduced = usePrefersReducedMotion();
  const track = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const raw = useRef(0);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    if (reduced) {
      raw.current = 1;
      el.style.setProperty("--p", "1");
      if (pct.current) pct.current.textContent = "100";
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: track.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        raw.current = self.progress;
        el.style.setProperty("--p", self.progress.toFixed(4));
        if (pct.current) pct.current.textContent = String(Math.round(self.progress * 100)).padStart(3, "0");
      },
    });
    return () => st.kill();
  }, [reduced]);

  return (
    <main id="main" className="bg-[#030405] text-text">
      <section
        ref={track}
        aria-label="Project Aegis — armor assembly sequence"
        // Scroll length of the whole sequence; the stage is pinned inside it.
        className={reduced ? "relative h-dvh" : "relative h-[900vh]"}
      >
        <div ref={stage} className="sticky top-0 h-dvh w-full overflow-hidden" style={{ "--p": 0 } as CSSProperties}>
          <ArmorScene raw={raw} reduced={reduced} />

          {/* ── chrome ─────────────────────────────────────────────── */}
          <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 sm:px-10">
            <Link
              href="/"
              className="pointer-events-auto mono text-[10px] tracking-[0.35em] text-text-dim transition-colors hover:text-cyan"
            >
              ← NARAM CHARAN
            </Link>
            <span className="mono text-[10px] tracking-[0.35em] text-text-dim">
              AEGIS · MK-I · <span ref={pct}>000</span>%
            </span>
          </header>

          {/* progress rail with chapter ticks */}
          <div aria-hidden className="pointer-events-none absolute right-5 top-1/2 z-20 hidden h-[46vh] -translate-y-1/2 sm:block sm:right-10">
            <div className="relative h-full w-px bg-white/10">
              <div
                className="absolute inset-x-0 top-0 h-full origin-top bg-gradient-to-b from-cyan via-cyan to-gold"
                style={{ transform: "scaleY(var(--p))" }}
              />
              {SCENES.map((s) => (
                <div key={s.id} className="absolute right-0 flex -translate-y-1/2 items-center gap-3" style={{ top: `${s.at[0] * 100}%` }}>
                  <span
                    className="mono whitespace-nowrap text-[9px] tracking-[0.3em] text-text-dim"
                    style={{ opacity: `clamp(0.25, calc(1 - abs(var(--p) - ${(s.at[0] + s.at[1]) / 2}) * 9), 1)` }}
                  >
                    {s.label}
                  </span>
                  <span className="h-px w-2.5 bg-white/40" />
                </div>
              ))}
            </div>
          </div>

          {/* ── 01 initialization ──────────────────────────────────── */}
          <div
            className="pointer-events-none absolute inset-x-5 bottom-[12%] z-10 sm:inset-x-auto sm:bottom-auto sm:left-10 sm:top-1/2 sm:-translate-y-1/2 lg:left-16"
            style={fade(-1, 0.07)}
          >
            <p className="mono mb-4 text-[10px] tracking-[0.45em] text-gold">◢ MK-I HELMET</p>
            <h1 className="font-display text-5xl font-semibold leading-[0.9] tracking-tight text-white sm:text-7xl lg:text-8xl">
              PROJECT
              <br />
              AEGIS
            </h1>
            <p className="mono mt-5 text-[11px] tracking-[0.4em] text-cyan/90 sm:text-xs">HELMET ASSEMBLY SEQUENCE</p>
          </div>

          {/* ── 02–05 chapter captions ─────────────────────────────── */}
          {CHAPTERS.map((c) => (
            <div
              key={c.n}
              className="pointer-events-none absolute inset-x-5 bottom-[8%] z-10 max-w-sm rounded-lg bg-[#030405]/55 p-4 backdrop-blur-[2px] sm:inset-x-auto sm:bottom-[14%] sm:left-10 sm:bg-transparent sm:p-0 sm:backdrop-blur-0 lg:left-16"
              style={fade(c.at[0], c.at[1])}
            >
              <p className="mono text-[10px] tracking-[0.45em] text-gold">{c.n} — SEQUENCE</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">{c.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-text-muted">{c.body}</p>
            </div>
          ))}

          {/* ── 06 system online ───────────────────────────────────── */}
          <div
            className="pointer-events-none absolute inset-x-0 top-[5.5%] z-10 text-center sm:inset-x-auto sm:left-10 sm:top-1/2 sm:-translate-y-1/2 sm:text-left lg:left-16"
            style={fade(0.9, 2)}
          >
            <p className="mono hidden text-[10px] tracking-[0.45em] text-gold sm:block">◢ SEQUENCE COMPLETE</p>
            <h2 className="font-display text-xl font-semibold tracking-tight text-white sm:mt-3 sm:text-6xl">SYSTEM ONLINE</h2>
            <p className="mono mt-1 text-[8px] tracking-[0.3em] text-cyan/90 sm:mt-4 sm:text-[11px] sm:tracking-[0.35em]">ALL HELMET SYSTEMS OPERATIONAL</p>
          </div>

          {/* CC-BY-4.0 attribution for the helmet model */}
          <p className="absolute bottom-3 right-5 z-20 text-[10px] text-text-dim sm:right-10">
            Model:{" "}
            <a href="https://sketchfab.com/3d-models/ironman-mark-iii-helmet-free-71a03274781145699ac9f88d03609c43" target="_blank" rel="noopener noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-cyan">
              Ironman Mark III Helmet
            </a>{" "}
            by Demonic Arts ·{" "}
            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-cyan">
              CC BY 4.0
            </a>
          </p>

          {/* scroll hint */}
          {!reduced && (
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center"
              style={{ opacity: "clamp(0, calc(1 - var(--p) * 30), 1)" }}
            >
              <p className="mono text-[9px] tracking-[0.45em] text-text-dim">SCROLL TO ASSEMBLE</p>
              <div className="mx-auto mt-2 h-8 w-px animate-pulse bg-gradient-to-b from-cyan to-transparent" />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
