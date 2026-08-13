"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  profile,
  dossier,
  education,
  certifications,
  projects,
} from "@/lib/content";
import { EASE } from "@/lib/motion";
import { triggerResumeDownload } from "@/lib/resume";
import { DOSSIER_EVENT } from "@/lib/dossier";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

/* Field row — label left, value right, with the HUD's dotted leader between. */
function Field({ label, value }: { label: string; value: string }) {
  return (
    // Mobile stacks label-over-value (long values wrapped into a cramped
    // column beside the leader); sm+ collapses back to one dotted-leader row.
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
      <div className="flex items-baseline gap-3 sm:contents">
        <span className="mono shrink-0 text-[9px] tracking-[0.25em] text-text-dim">
          {label}
        </span>
        <span
          aria-hidden
          className="h-px min-w-4 flex-1 bg-[repeating-linear-gradient(90deg,var(--color-line)_0_2px,transparent_2px_5px)]"
        />
      </div>
      <span className="text-sm text-text sm:text-right">{value}</span>
    </div>
  );
}

/* Hex geometry shared by the photo clip and the SVG bezel drawn over it. */
const HEX_CLIP = "polygon(50% 5%, 88% 27.5%, 88% 72.5%, 50% 95%, 12% 72.5%, 12% 27.5%)";

/**
 * ID badge — the real portrait, hex-clipped and graded into the HUD palette
 * (light cyan wash + scanlines + a fade into the panel) so it reads as a
 * scanned personnel photo without going full duotone and losing the face.
 */
function IdBadge({ reduced, play }: { reduced: boolean; play: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative h-32 w-32 shrink-0 sm:h-40 sm:w-40">
        {/* Portrait + grade, all clipped to the hexagon */}
        <div className="absolute inset-0" style={{ clipPath: HEX_CLIP }}>
          <Image
            src="/portrait.jpg"
            alt="Naram Charan"
            width={512}
            height={512}
            // The dialog only mounts on open, so this costs nothing on page
            // load and stops the hex flashing empty when it does open.
            priority
            className="h-full w-full scale-[1.06] object-cover"
          />
          <span aria-hidden className="absolute inset-0 bg-cyan/12" />
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-surface/85 via-transparent to-cyan/10"
          />
          <span
            aria-hidden
            className="absolute inset-0 opacity-60"
            style={{
              background:
                "repeating-linear-gradient(to bottom, transparent 0 2px, rgba(34,211,238,0.16) 3px, transparent 4px)",
            }}
          />
          {/* Biometric scan bar sweeps across the photo */}
          {!reduced && play && (
            <motion.span
              aria-hidden
              className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-bright to-transparent shadow-[0_0_10px_rgba(125,231,245,0.9)]"
              initial={{ top: "8%", opacity: 0 }}
              animate={{ top: ["8%", "92%", "8%"], opacity: [0, 1, 0] }}
              transition={{
                duration: 3.4,
                ease: "easeInOut",
                delay: 0.5,
                repeat: Infinity,
                repeatDelay: 2.6,
              }}
            />
          )}
        </div>

        {/* Bezel, reticle and corner ticks drawn over the photo */}
        <svg
          viewBox="0 0 120 120"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden
        >
          <path
            d="M60 6 L105.6 33 V87 L60 114 L14.4 87 V33 Z"
            fill="none"
            stroke="var(--color-cyan)"
            strokeWidth="1.2"
            opacity="0.8"
          />
          <path
            d="M60 13 L99 37 V83 L60 107 L21 83 V37 Z"
            fill="none"
            stroke="var(--color-cyan)"
            strokeWidth="0.5"
            opacity="0.3"
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="var(--color-cyan)"
            strokeWidth="0.5"
            strokeDasharray="3 7"
            opacity="0.45"
            className={reduced ? "" : "animate-spin-slow"}
            style={{ transformOrigin: "60px 60px" }}
          />
          {[0, 90, 180, 270].map((a) => (
            <line
              key={a}
              x1="60"
              y1="2"
              x2="60"
              y2="10"
              stroke="var(--color-gold)"
              strokeWidth="1.4"
              opacity="0.85"
              transform={`rotate(${a} 60 60)`}
            />
          ))}
        </svg>
      </div>

      <span className="mono text-[8px] tracking-[0.3em] text-cyan/70">
        ◈ ID VERIFIED
      </span>
    </div>
  );
}

/**
 * Personnel file — the JARVIS hologram of the short resume, projected by the
 * RESUME button. Three-layer hologram stack (glass / glow / glitch) plus an
 * upward light cone so it reads as a projection, with the real PDF one click
 * away in the footer.
 */
export default function DossierHologram() {
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(DOSSIER_EVENT, onOpen);
    return () => window.removeEventListener(DOSSIER_EVENT, onOpen);
  }, []);

  // ESC closes, Tab is trapped inside, body scroll locks, and focus returns to
  // whichever control opened it.
  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      triggerRef.current?.focus();
    };
  }, [open, close]);

  // "Service Record" has to dismiss the dialog before the page can scroll to
  // the section behind it.
  const goToProjects = useCallback(() => {
    close();
    window.setTimeout(() => {
      document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
    }, 260);
  }, [close]);

  const record = [
    // Shipped means shipped — a wip build is not a delivered one.
    { k: "PROJECTS SHIPPED", v: String(projects.filter((p) => !p.wip).length) },
    { k: "CERTIFICATIONS", v: String(certifications.length) },
    { k: "CGPA", v: education.cgpa.replace(" / 10.0", "/10") },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            aria-label="Close personnel file"
            onClick={close}
            className="absolute inset-0 cursor-default bg-bg/88 backdrop-blur-sm"
          />

          {/* Upward projection cone */}
          {!reduced && (
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 left-1/2 h-[65vh] w-[85vw] max-w-4xl -translate-x-1/2"
              style={{
                background:
                  "conic-gradient(from 180deg at 50% 100%, transparent 152deg, rgba(34,211,238,0.10) 176deg, rgba(125,231,245,0.16) 180deg, rgba(34,211,238,0.10) 184deg, transparent 208deg)",
                maskImage: "linear-gradient(to top, #000, transparent 88%)",
                WebkitMaskImage: "linear-gradient(to top, #000, transparent 88%)",
              }}
            />
          )}

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dossier-title"
            tabIndex={-1}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.96, filter: "brightness(1.9)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "brightness(1)" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="scanlines relative z-10 flex max-h-[94dvh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-cyan/40 bg-gradient-to-br from-cyan/[0.07] via-surface/90 to-surface/95 shadow-[inset_0_0_30px_-14px_rgba(34,211,238,0.6),0_0_70px_-18px_rgba(34,211,238,0.5)] outline-none backdrop-blur-[15px]"
          >
            {/* Glitch layer on an inner wrapper so it can't fight the
                entrance/exit transform. */}
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
                  className={`pointer-events-none absolute z-10 h-6 w-6 text-cyan/70 ${p}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M2 14 V2 H14" />
                </svg>
              ))}

              {/* Header */}
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3 sm:px-7 sm:py-3.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="relative flex h-2 w-2 shrink-0">
                    {!reduced && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-60" />
                    )}
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
                  </span>
                  <span className="mono truncate text-[9px] tracking-[0.3em] text-cyan/80 sm:text-[10px] sm:tracking-[0.35em]">
                    J.A.R.V.I.S // PERSONNEL FILE
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="mono hidden text-[9px] tracking-[0.3em] text-text-dim lg:inline">
                    {dossier.fileId} · CLEARANCE OPEN
                  </span>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close personnel file"
                    // 44px touch target on mobile, compact on pointer devices
                    className="grid h-11 w-11 place-items-center rounded-md border border-line text-text-dim transition-colors duration-300 hover:border-cyan/60 hover:text-cyan sm:h-8 sm:w-8"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Body — scrolls inside the panel on short/mobile screens */}
              <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto px-5 py-5 sm:px-7 md:grid-cols-[auto_1fr] md:gap-9">
                {/* Left rail — badge + service record */}
                <div className="flex flex-col items-center gap-4 md:items-start">
                  <IdBadge reduced={reduced} play={open} />
                  <ul className="w-full space-y-1.5 md:w-44">
                    {record.map((r) => (
                      <li
                        key={r.k}
                        className="flex items-center justify-between gap-3 rounded border border-line bg-bg/40 px-3 py-1.5"
                      >
                        <span className="mono text-[8px] tracking-[0.2em] text-text-dim">
                          {r.k}
                        </span>
                        <span className="mono text-sm font-bold text-cyan glow-cyan">
                          {r.v}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right — the dossier itself */}
                <div className="min-w-0">
                  <h2
                    id="dossier-title"
                    className="text-balance text-2xl font-semibold tracking-tight text-text sm:text-3xl"
                  >
                    <span className="glow-cyan">{profile.fullName}</span>
                  </h2>
                  <p className="mono mt-2 text-[11px] tracking-[0.2em] text-cyan/90">
                    {profile.role.toUpperCase()}
                  </p>

                  <p className="mt-3.5 max-w-2xl text-[14px] leading-relaxed text-text-muted">
                    {dossier.summary}
                  </p>

                  <div className="mt-4 space-y-1.5 border-t border-line pt-4">
                    {dossier.identity.map((f) => (
                      <Field key={f.label} label={f.label} value={f.value} />
                    ))}
                    <Field
                      label="EDUCATION"
                      value={`${education.degree} · ${education.specialization}`}
                    />
                    <Field
                      label="INSTITUTION"
                      value={`${education.school} — CGPA ${education.cgpa}`}
                    />
                    <Field label="GRADUATION" value={education.graduation} />
                  </div>

                  <div className="mt-4 grid gap-4 border-t border-line pt-4 lg:grid-cols-[1fr_auto] lg:gap-8">
                    <div>
                      <p className="mono mb-2 text-[9px] tracking-[0.3em] text-text-dim">
                        PRIMARY FOCUS
                      </p>
                      <ul className="space-y-1">
                        {dossier.focus.map((f) => (
                          <li
                            key={f}
                            className="mono flex items-start gap-2 text-[11px] leading-snug text-text"
                          >
                            <span className="mt-px text-gold">◢</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="lg:max-w-[19rem]">
                      <p className="mono mb-2 text-[9px] tracking-[0.3em] text-text-dim">
                        CORE STACK
                      </p>
                      {/* Plain <li>: framer leaves nested children parked on
                          `initial` inside this dialog's entrance, so the chips
                          ride the panel's own animation instead. */}
                      <ul className="flex flex-wrap gap-1.5">
                        {dossier.coreStack.map((s) => (
                          <li
                            key={s}
                            className="mono rounded border border-cyan/30 bg-cyan/[0.07] px-2 py-0.5 text-[10px] tracking-wide text-cyan"
                          >
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex flex-col gap-2.5 border-t border-line px-5 py-3.5 sm:flex-row sm:items-center sm:justify-end sm:px-7">
                <a
                  href={profile.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => triggerResumeDownload(profile.resume)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-gold/60 bg-gold/15 px-6 py-2.5 text-sm font-semibold text-gold transition-all duration-300 hover:bg-gold/25 hover:shadow-[0_0_26px_rgba(255,178,62,0.35)]"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
                  </svg>
                  Download Resume
                </a>
                <button
                  type="button"
                  onClick={goToProjects}
                  className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-cyan/50 bg-cyan/10 px-6 py-2.5 text-sm font-medium text-cyan transition-all duration-300 hover:bg-cyan/20 hover:shadow-[0_0_26px_rgba(34,211,238,0.35)]"
                >
                  Service Record
                  <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                    →
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
