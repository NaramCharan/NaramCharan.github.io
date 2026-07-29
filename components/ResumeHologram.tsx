"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  profile,
  dossier,
  education,
  projects,
  skillSystems,
  certifications,
  contact,
} from "@/lib/content";
import { EASE } from "@/lib/motion";
import { triggerResumeDownload } from "@/lib/resume";
import { RESUME_HOLOGRAM_EVENT } from "@/lib/resumeHologram";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

function Block({
  code,
  title,
  children,
}: {
  code: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line pt-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="mono text-[9px] tracking-[0.3em] text-gold">{code}</span>
        <span aria-hidden className="h-px w-8 bg-gradient-to-r from-cyan to-transparent" />
        <h3 className="mono text-[10px] tracking-[0.35em] text-cyan/85">{title}</h3>
      </div>
      {children}
    </section>
  );
}

/**
 * Curriculum vitae projected as a hologram — the RESUME button opens this
 * instead of dumping a PDF at the user. Same three-layer hologram stack as the
 * FRIDAY brief and the personnel file, with the real PDF one click away.
 */
export default function ResumeHologram() {
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(RESUME_HOLOGRAM_EVENT, onOpen);
    return () => window.removeEventListener(RESUME_HOLOGRAM_EVENT, onOpen);
  }, []);

  // ESC closes, Tab is trapped inside, body scroll locks, and focus returns to
  // whichever button opened it (same contract as ProjectHologram).
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
            aria-label="Close resume"
            onClick={close}
            className="absolute inset-0 cursor-default bg-bg/88 backdrop-blur-sm"
          />

          {/* Projection cone */}
          {!reduced && (
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 left-1/2 h-[65vh] w-[85vw] max-w-3xl -translate-x-1/2"
              style={{
                background:
                  "conic-gradient(from 180deg at 50% 100%, transparent 150deg, rgba(34,211,238,0.12) 175deg, rgba(125,231,245,0.18) 180deg, rgba(34,211,238,0.12) 185deg, transparent 210deg)",
                maskImage: "linear-gradient(to top, #000, transparent 85%)",
                WebkitMaskImage: "linear-gradient(to top, #000, transparent 85%)",
              }}
            />
          )}

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="resume-holo-title"
            tabIndex={-1}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.96, filter: "brightness(2)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "brightness(1)" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.42, ease: EASE }}
            className="scanlines relative z-10 flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-cyan/40 bg-gradient-to-br from-cyan/[0.08] via-surface/90 to-surface/95 shadow-[inset_0_0_28px_-14px_rgba(34,211,238,0.6),0_0_60px_-10px_rgba(34,211,238,0.5)] outline-none backdrop-blur-[15px]"
          >
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
              <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-3.5 sm:px-7">
                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      {!reduced && (
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-60" />
                      )}
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
                    </span>
                    <span className="mono text-[10px] tracking-[0.35em] text-cyan/80">
                      J.A.R.V.I.S // CURRICULUM VITAE
                    </span>
                  </div>
                  <h2
                    id="resume-holo-title"
                    className="truncate text-lg font-semibold tracking-tight text-text glow-cyan sm:text-xl"
                  >
                    {profile.fullName}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close resume"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-line text-text-dim transition-colors duration-300 hover:border-cyan/60 hover:text-cyan"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              {/* Scrolling CV body */}
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-7">
                {/* Contact strip */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mono text-[10px] tracking-wide text-text-muted">
                  <a href={`mailto:${contact.email}`} className="hover:text-cyan">{contact.email}</a>
                  <span aria-hidden className="text-line">|</span>
                  <span>{profile.location}</span>
                  <span aria-hidden className="text-line">|</span>
                  <a href={contact.github} target="_blank" rel="noopener noreferrer" className="hover:text-cyan">github.com/NaramCharan</a>
                  <span aria-hidden className="text-line">|</span>
                  <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-cyan">linkedin.com/in/naramcharan</a>
                </div>

                <p className="text-[13px] leading-relaxed text-text-muted">
                  {dossier.summary}
                </p>

                <Block code="01" title="EDUCATION">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="text-sm font-medium text-text">
                      {education.degree}
                      <span className="text-text-muted"> · {education.specialization}</span>
                    </p>
                    <span className="mono text-[11px] text-cyan">CGPA {education.cgpa}</span>
                  </div>
                  <p className="mono mt-1 text-[10px] tracking-wide text-text-dim">
                    {education.school} · {education.year} · {education.graduation}
                  </p>
                </Block>

                <Block code="02" title="SELECTED PROJECTS">
                  <ul className="space-y-3.5">
                    {projects.map((p) => (
                      <li key={p.id}>
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                          <p className="text-sm font-medium text-text">
                            <span className="mono mr-2 text-[10px] text-cyan/70">{p.code}</span>
                            {p.name}
                          </p>
                          <span className="mono text-[11px] font-bold text-gold">{p.metric}</span>
                        </div>
                        <p className="mt-1 text-[12px] leading-relaxed text-text-muted">
                          {p.wins[0]}
                        </p>
                        <p className="mono mt-1 text-[9px] tracking-wide text-text-dim">
                          {p.tech.join(" · ")}
                        </p>
                      </li>
                    ))}
                  </ul>
                </Block>

                <Block code="03" title="TECHNICAL SYSTEMS">
                  <ul className="space-y-2">
                    {skillSystems.map((s) => (
                      <li key={s.system} className="sm:flex sm:gap-3">
                        <span className="mono block shrink-0 text-[10px] tracking-wide text-cyan sm:w-44">
                          {s.system}
                        </span>
                        <span className="text-[12px] text-text-muted">{s.items.join(" · ")}</span>
                      </li>
                    ))}
                  </ul>
                </Block>

                <Block code="04" title="CERTIFICATIONS">
                  <ul className="space-y-1.5">
                    {certifications.map((c) => (
                      <li key={c.name} className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] text-text transition-colors duration-300 hover:text-cyan"
                        >
                          {c.name}
                          <span className="text-text-dim"> — {c.issuer}</span>
                        </a>
                        <span className="mono text-[10px] text-text-dim">{c.note}</span>
                      </li>
                    ))}
                  </ul>
                </Block>
              </div>

              {/* Footer actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5 sm:px-7">
                <span className="mono text-[9px] tracking-[0.3em] text-text-dim">
                  {dossier.fileId} · VERIFIED
                </span>
                <div className="flex gap-2">
                  <a
                    href={profile.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => triggerResumeDownload(profile.resume)}
                    className="inline-flex min-h-10 items-center gap-2 rounded-md border border-gold/60 bg-gold/15 px-5 py-2 mono text-[11px] tracking-[0.15em] text-gold transition-all duration-300 hover:bg-gold/25 hover:shadow-[0_0_22px_rgba(255,178,62,0.35)]"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
                    </svg>
                    DOWNLOAD PDF
                  </a>
                  <button
                    type="button"
                    onClick={close}
                    className="inline-flex min-h-10 items-center rounded-md border border-line px-5 py-2 mono text-[11px] tracking-[0.15em] text-text-muted transition-colors duration-300 hover:border-cyan/50 hover:text-cyan"
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
