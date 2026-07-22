"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { type Project } from "@/lib/content";
import { EASE } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import ArcReactorStatic from "./ArcReactorStatic";

/**
 * FRIDAY project brief — a holographic analysis panel projected from the card.
 * Cyan wireframe, corner brackets, scanlines, an upward light cone (beamed-up
 * hologram look), and a schematic readout of the project's deep-dive `brief`.
 */
export default function ProjectHologram({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const open = !!project;

  // ESC to close + lock body scroll + focus the panel while open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Scrim */}
          <button
            aria-label="Close project brief"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-bg/85 backdrop-blur-sm"
          />

          {/* Upward hologram light cone */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-1/2 h-[60vh] w-[80vw] max-w-3xl -translate-x-1/2"
            style={{
              background:
                "conic-gradient(from 180deg at 50% 100%, transparent 150deg, rgba(34,211,238,0.12) 175deg, rgba(125,231,245,0.18) 180deg, rgba(34,211,238,0.12) 185deg, transparent 210deg)",
              maskImage: "linear-gradient(to top, #000, transparent 85%)",
              WebkitMaskImage: "linear-gradient(to top, #000, transparent 85%)",
            }}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="holo-title"
            tabIndex={-1}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96, filter: "brightness(2)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "brightness(1)" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="scanlines relative z-10 flex max-h-[92vh] sm:max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-cyan/40 bg-gradient-to-br from-cyan/[0.08] via-surface/85 to-surface/90 shadow-[inset_0_0_28px_-14px_rgba(34,211,238,0.6),0_0_60px_-10px_rgba(34,211,238,0.5)] outline-none backdrop-blur-[15px]"
          >
            {/* Glitch layer — brief skew blip every 3s, kept off the motion
                element so it can't fight the entrance/exit transform */}
            <div className={`flex min-h-0 flex-1 flex-col${reduced ? "" : " holo-glitch"}`}>
            {/* Corner brackets */}
            {[
              "left-2.5 top-2.5",
              "right-2.5 top-2.5 rotate-90",
              "bottom-2.5 left-2.5 -rotate-90",
              "bottom-2.5 right-2.5 rotate-180",
            ].map((p) => (
              <svg
                key={p}
                aria-hidden
                viewBox="0 0 40 40"
                className={`pointer-events-none absolute h-6 w-6 text-cyan/70 ${p}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M2 14 V2 H14" />
              </svg>
            ))}

            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4 sm:px-8">
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
                  </span>
                  <span className="mono text-[10px] tracking-[0.35em] text-cyan/80">
                    FRIDAY // PROJECT ANALYSIS
                  </span>
                </div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="mono rounded border border-cyan/40 px-2 py-0.5 text-[10px] tracking-[0.2em] text-cyan">
                    {project.code}
                  </span>
                  <span className="mono rounded bg-surface-2/80 px-2 py-0.5 text-[10px] tracking-[0.2em] text-text-muted">
                    {project.domain.toUpperCase()}
                  </span>
                  <span className="mono text-sm font-bold text-gold glow-gold">
                    {project.metric}
                  </span>
                </div>
                <h3 id="holo-title" className="text-lg font-semibold text-cyan-bright sm:text-xl">
                  {project.name}
                </h3>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 rounded-md border border-line p-2 text-text-muted transition-colors duration-200 hover:border-cyan/60 hover:text-cyan"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-8">
              <div className="flex flex-col gap-6 sm:flex-row">
                {/* Reactor motif */}
                <div className="mx-auto hidden h-28 w-28 shrink-0 opacity-90 sm:block">
                  <ArcReactorStatic />
                </div>

                {/* Schematic readout */}
                <dl className="min-w-0 flex-1 space-y-3">
                  {project.brief.map((row, i) => (
                    <motion.div
                      key={row.label}
                      initial={reduced ? false : { opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.06, ease: EASE }}
                      className="grid grid-cols-[92px_1fr] gap-3 border-b border-line/50 pb-3 last:border-0"
                    >
                      <dt className="mono flex items-start gap-1.5 text-[10px] leading-5 tracking-[0.15em] text-gold/90">
                        <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rotate-45 bg-cyan" />
                        {row.label}
                      </dt>
                      <dd className="text-sm leading-relaxed text-text/90">{row.value}</dd>
                    </motion.div>
                  ))}
                </dl>
              </div>

              {/* Stack */}
              <div className="mt-5">
                <p className="mono mb-2 text-[10px] tracking-[0.3em] text-text-dim">STACK</p>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <span key={t} className="mono rounded bg-cyan/10 px-2 py-1 text-[11px] text-cyan/90">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-4 border-t border-line px-6 py-3.5 sm:px-8">
              <span className="mono text-[10px] tracking-[0.25em] text-text-dim">
                MARK XLII · ARCHIVE
              </span>
              <div className="flex items-center gap-2">
                {project.demo && (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono rounded-md border border-gold/50 bg-gold/10 px-3 py-2 text-xs text-gold transition-colors duration-200 hover:bg-gold/20"
                  >
                    LIVE DEMO ↗
                  </a>
                )}
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono inline-flex items-center gap-1.5 rounded-md border border-cyan/50 bg-cyan/10 px-3 py-2 text-xs text-cyan transition-colors duration-200 hover:bg-cyan/20"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                    <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.1 3.29 9.42 7.86 10.95.58.1.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.67.8.56A11.53 11.53 0 0 0 23.5 12.02C23.5 5.74 18.27.5 12 .5Z" />
                  </svg>
                  VIEW CODE →
                </a>
              </div>
            </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
