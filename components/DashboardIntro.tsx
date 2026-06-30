"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { profile, stats } from "@/lib/content";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import ArcReactorAssemble from "./ArcReactorAssemble";

const STATUS = [
  "BOOTING MARK XLII INTERFACE",
  "SYNCING NEURAL CORE",
  "POWER SURGE — CALIBRATING",
  "REACTOR ONLINE · WELCOME",
];

// Streaming glyphs for the matrix-style side rails.
const GLYPHS = "01<>{}[]#$%&*+=/\\ΛΣΔΩ⌬⎔⏃⏚01アイウ";

/**
 * Auto-playing power-on gate styled like the JARVIS dashboard. Glyph rails
 * stream, the reactor charges, lightning glitches fire on a timeline, then it
 * dissolves into the site — no clicking required. Skips once per session.
 */
export default function DashboardIntro() {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState(0); // index into STATUS
  const [bolt, setBolt] = useState(0); // bumps to replay lightning
  const [entered, setEntered] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("jarvis_entered")) setEntered(true);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || entered) return;

    if (reduced) {
      // Respect reduced motion: brief static hold, then enter.
      const t = setTimeout(() => finish(), 700);
      return () => clearTimeout(t);
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    // Advance status lines.
    STATUS.forEach((_, i) =>
      timers.push(setTimeout(() => setPhase(i), 650 * i + 300))
    );
    // Fire lightning glitches at two beats.
    timers.push(setTimeout(() => setBolt(1), 1000));
    timers.push(setTimeout(() => setBolt(2), 1950));
    // Enter the site.
    timers.push(setTimeout(() => finish(), 3300));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, entered, reduced]);

  const finish = () => {
    sessionStorage.setItem("jarvis_entered", "1");
    setEntered(true);
  };

  if (!ready) return <div className="fixed inset-0 z-[95] bg-bg" aria-hidden />;

  const surging = bolt > 0 && !reduced;

  return (
    <AnimatePresence>
      {!entered && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[95] overflow-hidden bg-bg"
          exit={{ opacity: 0, filter: "brightness(2.2)" }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
          role="status"
          aria-label="System initializing"
        >
          <div className="hud-grid pointer-events-none absolute inset-0 opacity-50" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.14),transparent_60%)]" />

          {/* Streaming glyph rails */}
          {!reduced && (
            <>
              <GlyphRail className="left-3 sm:left-8" />
              <GlyphRail className="right-3 sm:right-8" reverse />
            </>
          )}

          <div
            className={`relative flex h-full flex-col ${surging ? "fx-glitch" : ""}`}
            key={`glitch-${bolt}`}
          >
            {/* Top bar */}
            <header className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-10">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan" />
                </span>
                <p className="mono text-sm font-bold tracking-[0.3em] text-cyan glow-cyan">
                  J.A.R.V.I.S
                </p>
              </div>
              <p className="mono text-[9px] tracking-[0.25em] text-gold sm:text-[10px]">
                {profile.name.toUpperCase()} · MK XLII
              </p>
            </header>

            {/* Center reactor */}
            <div className="relative flex flex-1 items-center justify-center px-4">
              {/* Floating stat chips */}
              <div className="pointer-events-none absolute inset-0 hidden lg:block">
                {stats.map((s, i) => {
                  const pos = [
                    "left-10 top-[20%]",
                    "left-10 bottom-[20%]",
                    "right-10 top-[20%]",
                    "right-10 bottom-[20%]",
                  ][i];
                  const decimals = Number.isInteger(s.value) ? 0 : 2;
                  return (
                    <div
                      key={s.label}
                      className={`absolute ${pos} w-44 rounded-lg border border-line bg-surface/70 p-3 backdrop-blur-sm`}
                    >
                      <p className="mono text-2xl font-bold text-cyan glow-cyan">
                        {s.prefix ?? ""}
                        {s.value.toFixed(decimals)}
                        {s.suffix}
                      </p>
                      <p className="mono mt-1 text-[9px] tracking-wide text-text-muted">
                        {s.label.toUpperCase()}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="relative flex flex-col items-center">
                <div className="relative h-60 w-60 sm:h-72 sm:w-72 md:h-80 md:w-80">
                  <ArcReactorAssemble />
                  {surging && (
                    <span
                      key={`ring-${bolt}`}
                      aria-hidden
                      className="fx-ring absolute inset-6 rounded-full border-2 border-cyan"
                    />
                  )}
                </div>

                {/* Auto status line + charge meter */}
                <p
                  key={`status-${phase}`}
                  className="mono mt-8 min-h-5 text-center text-xs tracking-[0.25em] text-cyan sm:text-sm"
                  style={!reduced ? { animation: "glyph-flicker 1.2s ease-in-out" } : undefined}
                >
                  {STATUS[phase]}
                  <span className="animate-blink"> _</span>
                </p>
                <div className="mt-3 h-1 w-48 overflow-hidden rounded-full bg-surface-2" aria-hidden>
                  <motion.div
                    className="h-full bg-cyan shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                    initial={{ width: "0%" }}
                    animate={{ width: reduced ? "100%" : "100%" }}
                    transition={{ duration: reduced ? 0.5 : 3.1, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </div>

            <footer className="border-t border-line px-4 py-3">
              <p className="mono text-center text-[9px] tracking-[0.35em] text-text-muted">
                MARK XLII · PERSONAL INTERFACE
              </p>
            </footer>
          </div>

          {/* Lightning flash + bolts */}
          {surging && (
            <div key={`flash-${bolt}`} aria-hidden className="pointer-events-none absolute inset-0 z-10">
              <div
                className={`fx-flash absolute inset-0 ${
                  bolt >= 2 ? "bg-cyan-bright/70" : "bg-cyan/40"
                }`}
              />
              <svg viewBox="0 0 1000 600" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                <path className="fx-bolt" d="M120 0 L260 230 L180 250 L360 600" fill="none" stroke="#7de7f5" strokeWidth="3" style={{ filter: "drop-shadow(0 0 6px #22d3ee)" }} />
                <path className="fx-bolt" d="M880 0 L740 210 L820 240 L640 600" fill="none" stroke="#7de7f5" strokeWidth="3" style={{ filter: "drop-shadow(0 0 6px #22d3ee)" }} />
              </svg>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* Vertical stream of glitchy glyphs along a screen edge.
   Deterministic (index-derived) so SSR and client render identically. */
function GlyphRail({ className, reverse }: { className: string; reverse?: boolean }) {
  const seed = reverse ? 13 : 7;
  const col = Array.from(
    { length: 60 },
    (_, i) => GLYPHS[(i * seed + (reverse ? 5 : 0)) % GLYPHS.length]
  );
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute top-0 hidden h-full w-6 overflow-hidden opacity-30 sm:block ${className}`}
    >
      <div
        className="mono flex flex-col gap-1 text-[10px] leading-none text-cyan"
        style={{
          animation: `glyph-stream ${reverse ? 7 : 9}s linear infinite${
            reverse ? " reverse" : ""
          }`,
        }}
      >
        {[...col, ...col].map((g, i) => (
          <span key={i} className={i % 7 === 0 ? "text-gold" : undefined}>
            {g}
          </span>
        ))}
      </div>
    </div>
  );
}
