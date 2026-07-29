"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import {
  profile,
  dossier,
  education,
  certifications,
  projects,
  contact,
} from "@/lib/content";
import { EASE } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import { triggerResumeDownload } from "@/lib/resume";

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
function IdBadge({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative h-40 w-40 shrink-0 sm:h-44 sm:w-44">
        {/* Portrait + grade, all clipped to the hexagon */}
        <div className="absolute inset-0" style={{ clipPath: HEX_CLIP }}>
          <Image
            src="/portrait.jpg"
            alt="Naram Charan"
            width={512}
            height={512}
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
          {!reduced && (
            <motion.span
              aria-hidden
              className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-bright to-transparent shadow-[0_0_10px_rgba(125,231,245,0.9)]"
              initial={{ top: "8%", opacity: 0 }}
              whileInView={{ top: ["8%", "92%", "8%"], opacity: [0, 1, 0] }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 3.4,
                ease: "easeInOut",
                delay: 0.7,
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
 * Personnel file — a JARVIS hologram of the short resume, projected right after
 * the hero's reactor assembly finishes. Same three-layer hologram stack as the
 * FRIDAY brief (glass / glow / glitch) plus an upward light cone, so it reads as
 * a projection rather than another flat card. Content is a scannable dossier:
 * identity, summary, education, focus, core stack, and a service record.
 */
export default function HoloDossier() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  // CGPA is deliberately absent — it already appears in the INSTITUTION field
  // below and again in the StatsBar directly under this section.
  const record = [
    { k: "PROJECTS SHIPPED", v: String(projects.length) },
    { k: "CERTIFICATIONS", v: String(certifications.length) },
  ];

  return (
    <section
      id="dossier"
      aria-label="Personnel file — profile summary"
      className="relative overflow-hidden border-b border-line px-5 py-20 sm:py-24"
    >
      {/* Projection cone rising from the panel's base */}
      {!reduced && (
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/2 h-[70%] w-[85vw] max-w-4xl -translate-x-1/2"
          style={{
            background:
              "conic-gradient(from 180deg at 50% 100%, transparent 152deg, rgba(34,211,238,0.10) 176deg, rgba(125,231,245,0.16) 180deg, rgba(34,211,238,0.10) 184deg, transparent 208deg)",
            maskImage: "linear-gradient(to top, #000, transparent 88%)",
            WebkitMaskImage: "linear-gradient(to top, #000, transparent 88%)",
          }}
        />
      )}

      <motion.div
        ref={ref}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.97, filter: "brightness(1.8)" }}
        whileInView={{ opacity: 1, y: 0, scale: 1, filter: "brightness(1)" }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.75, ease: EASE }}
        className="scanlines relative z-10 mx-auto max-w-5xl overflow-hidden rounded-xl border border-cyan/40 bg-gradient-to-br from-cyan/[0.07] via-surface/85 to-surface/90 shadow-[inset_0_0_30px_-14px_rgba(34,211,238,0.6),0_0_70px_-18px_rgba(34,211,238,0.5)] backdrop-blur-[15px]"
      >
        {/* Glitch layer lives on an inner wrapper so it can't fight the
            entrance transform (same pattern as ProjectHologram). */}
        <div className={reduced ? "" : "holo-glitch"}>
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4 sm:px-8">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {!reduced && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-60" />
                )}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
              </span>
              <span className="mono text-[10px] tracking-[0.35em] text-cyan/80">
                J.A.R.V.I.S // PERSONNEL FILE
              </span>
            </div>
            <span className="mono text-[9px] tracking-[0.3em] text-text-dim">
              {dossier.fileId} · CLEARANCE OPEN
            </span>
          </div>

          {/* Body */}
          <div className="grid gap-8 px-6 py-8 sm:px-8 md:grid-cols-[auto_1fr] md:gap-10">
            {/* Left rail — badge + hard identity fields */}
            <div className="flex flex-col items-center gap-5 md:items-start">
              <IdBadge reduced={reduced} />
              <ul className="w-full space-y-2 md:w-44">
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

            {/* Right — the actual dossier */}
            <div className="min-w-0">
              <h2 className="text-balance text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                <span className="glow-cyan">{profile.fullName}</span>
              </h2>
              <p className="mono mt-2 text-[11px] tracking-[0.2em] text-cyan/90">
                {profile.role.toUpperCase()}
              </p>

              <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-text-muted">
                {dossier.summary}
              </p>

              <div className="mt-6 space-y-2 border-t border-line pt-5">
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

              {/* Focus */}
              <div className="mt-6 border-t border-line pt-5">
                <p className="mono mb-3 text-[9px] tracking-[0.3em] text-text-dim">
                  PRIMARY FOCUS
                </p>
                <ul className="grid gap-2 sm:grid-cols-3">
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

              {/* Core stack */}
              <div className="mt-6 border-t border-line pt-5">
                <p className="mono mb-3 text-[9px] tracking-[0.3em] text-text-dim">
                  CORE STACK
                </p>
                <ul className="flex flex-wrap gap-2">
                  {dossier.coreStack.map((s, i) => (
                    <motion.li
                      key={s}
                      initial={reduced ? false : { opacity: 0, y: 6 }}
                      animate={inView ? { opacity: 1, y: 0 } : undefined}
                      transition={{ duration: 0.4, ease: EASE, delay: 0.5 + i * 0.05 }}
                      className="mono rounded border border-cyan/30 bg-cyan/[0.07] px-2.5 py-1 text-[10px] tracking-wide text-cyan"
                    >
                      {s}
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="mt-7 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row">
                <a
                  href={profile.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => triggerResumeDownload(profile.resume)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-gold/60 bg-gold/15 px-6 py-2.5 text-sm font-semibold text-gold transition-all duration-300 hover:bg-gold/25 hover:shadow-[0_0_26px_rgba(255,178,62,0.35)]"
                >
                  Full Resume
                </a>
                <a
                  href="#projects"
                  className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-cyan/50 bg-cyan/10 px-6 py-2.5 text-sm font-medium text-cyan transition-all duration-300 hover:bg-cyan/20 hover:shadow-[0_0_26px_rgba(34,211,238,0.35)]"
                >
                  Service Record
                  <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                    →
                  </span>
                </a>
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-line px-6 py-2.5 text-sm text-text-muted transition-colors duration-300 hover:border-cyan/50 hover:text-cyan"
                >
                  Open Channel
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
