"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects, type Project } from "@/lib/content";
import { useTilt } from "@/lib/useTilt";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import SectionHeading from "./SectionHeading";
import ProjectHologram from "./ProjectHologram";
import MiniDemo from "./MiniDemo";

gsap.registerPlugin(ScrollTrigger);

function ProjectCard({
  p,
  onBrief,
}: {
  p: Project;
  onBrief: (p: Project) => void;
}) {
  const tilt = useTilt(3.5);
  const reduced = usePrefersReducedMotion();

  // Exploded-parts assembly, scrubbed by scroll: each internal part starts
  // offset/rotated outside the frame and locks into place as the card enters
  // the viewport (reverses on scroll-back). SSR markup is the assembled state.
  useEffect(() => {
    const el = tilt.ref.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top 94%",
          end: "top 45%",
          scrub: 0.5,
        },
      });
      tl.from(el.querySelectorAll("[data-bracket]"), {
        scale: 0,
        opacity: 0,
        duration: 0.22,
        stagger: 0.04,
        ease: "back.out(2)",
      });
      el.querySelectorAll<HTMLElement>("[data-part]").forEach((part, pi) => {
        tl.from(
          part,
          {
            x: pi % 2 ? 30 : -30,
            y: 24 + (pi % 3) * 8,
            rotate: pi % 2 ? 2.5 : -2.5,
            opacity: 0,
            filter: "blur(4px)",
            duration: 0.45,
            ease: "power2.out",
          },
          0.1 + pi * 0.09
        );
      });
    }, el);
    return () => ctx.revert();
  }, [reduced, tilt.ref]);

  return (
    <motion.article
      ref={tilt.ref as React.Ref<HTMLElement>}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest("a") && !target.closest("button")) {
          onBrief(p);
        }
      }}
      style={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
        transformPerspective: 900,
      }}
      className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-xl border border-line bg-surface/60 p-5 transition-colors duration-300 hover:border-cyan/60 hover:bg-surface-2/70 hover:shadow-[0_0_36px_-6px_rgba(34,211,238,0.35)] sm:p-6 ${
        p.featured ? "md:col-span-2" : ""
      }`}
    >
      {/* HUD lock-on brackets — first parts to snap in during assembly */}
      {[
        "left-2 top-2 border-l border-t",
        "right-2 top-2 border-r border-t",
        "left-2 bottom-2 border-l border-b",
        "right-2 bottom-2 border-r border-b",
      ].map((cls) => (
        <span
          key={cls}
          data-bracket
          aria-hidden
          className={`pointer-events-none absolute z-10 h-4 w-4 border-cyan/60 ${cls}`}
        />
      ))}

      {/* Scan sweep on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent opacity-0 [animation:scan-sweep_1.4s_ease-in-out_infinite] group-hover:opacity-100"
      />
      {/* Cursor-following spotlight */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(340px circle at var(--mx, 50%) var(--my, 50%), rgba(34,211,238,0.09), transparent 65%)",
        }}
      />

      <div className={p.featured ? "md:grid md:grid-cols-2 md:gap-6 md:items-start flex-1" : "flex flex-col flex-1"}>
        {/* Left Column (or Top) */}
        <div className="flex flex-col justify-between h-full">
          <div>
            <div data-part className="mb-3 flex flex-wrap items-center gap-2">
              <span className="mono rounded border border-cyan/40 px-2 py-0.5 text-[10px] tracking-[0.2em] text-cyan">
                {p.code}
              </span>
              <span className="mono rounded bg-surface-2/80 px-2 py-0.5 text-[10px] tracking-[0.2em] text-text-muted">
                {p.domain.toUpperCase()}
              </span>
              {p.featured && (
                <span className="mono rounded border border-gold/50 bg-gold/10 px-2 py-0.5 text-[10px] tracking-[0.2em] text-gold">
                  FEATURED
                </span>
              )}
            </div>

            {/* Title + headline metric */}
            <div data-part className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold leading-snug text-text transition-colors duration-200 group-hover:text-cyan-bright sm:text-lg">
                {p.name}
              </h3>
              <span className="mono shrink-0 whitespace-nowrap text-sm font-bold text-gold glow-gold sm:text-base">
                {p.metric}
              </span>
            </div>
            <p data-part className="mt-2 text-xs leading-relaxed text-text-muted sm:text-sm">
              {p.description}
            </p>
          </div>

          {/* Action buttons on desktop for featured card */}
          {p.featured && (
            <div data-part className="hidden md:flex items-center justify-between gap-3 border-t border-line pt-4 mt-4">
              <button
                type="button"
                onClick={() => onBrief(p)}
                aria-label={`FRIDAY — analyze ${p.name}`}
                className="friday-chip mono group/friday inline-flex items-center gap-2 rounded-md border border-cyan/40 bg-cyan/5 px-3 py-1.5 text-[11px] tracking-[0.2em] text-cyan transition-all duration-200 hover:border-cyan hover:bg-cyan/15 hover:shadow-[0_0_16px_-4px_rgba(34,211,238,0.5)]"
              >
                <span aria-hidden className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
                </span>
                FRIDAY
                <span className="text-cyan/60 transition-colors group-hover/friday:text-cyan">◈ BRIEF</span>
              </button>

              <a
                href={p.repo}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${p.name} — open repository on GitHub`}
                className="mono inline-flex items-center gap-1.5 text-xs text-cyan transition-transform duration-200 hover:translate-x-1"
              >
                <GitHubMark className="h-3.5 w-3.5" />
                VIEW CODE →
              </a>
            </div>
          )}
        </div>

        {/* Right Column (or Bottom) */}
        <div className="flex flex-col justify-between mt-3 md:mt-0">
          <div>
            {/* Live mini-demo */}
            <div data-part>
              <MiniDemo id={p.id} />
            </div>

            {/* Key results */}
            <div data-part className="mt-3">
              <p className="mono mb-1.5 flex items-center gap-2 text-[10px] tracking-[0.25em] text-gold/90">
                <span className="h-px w-3 bg-gold/70" /> KEY RESULTS
              </p>
              <ul className="space-y-1">
                {p.wins.map((w) => (
                  <li key={w} className="flex items-start gap-2 text-xs text-text/90">
                    <svg viewBox="0 0 24 24" className="mt-[2px] h-3.5 w-3.5 shrink-0 text-cyan" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span className="leading-snug">{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div data-part className="mt-3 flex flex-wrap gap-1.5">
            {p.tech.map((t) => (
              <span
                key={t}
                className="mono rounded bg-cyan/10 px-2 py-0.5 text-[10px] text-cyan/90 sm:text-[11px]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons for normal cards (and mobile for featured card) */}
      {(!p.featured || true) && (
        <div data-part className={`mt-4 flex items-center justify-between gap-3 border-t border-line pt-3.5 ${p.featured ? "md:hidden" : ""}`}>
          <button
            type="button"
            onClick={() => onBrief(p)}
            aria-label={`FRIDAY — analyze ${p.name}`}
            className="friday-chip mono group/friday inline-flex items-center gap-2 rounded-md border border-cyan/40 bg-cyan/5 px-3 py-1.5 text-[11px] tracking-[0.2em] text-cyan transition-all duration-200 hover:border-cyan hover:bg-cyan/15 hover:shadow-[0_0_16px_-4px_rgba(34,211,238,0.5)]"
          >
            <span aria-hidden className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
            </span>
            FRIDAY
            <span className="text-cyan/60 transition-colors group-hover/friday:text-cyan">◈ BRIEF</span>
          </button>

          <a
            href={p.repo}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${p.name} — open repository on GitHub`}
            className="mono inline-flex items-center gap-1.5 text-xs text-cyan transition-transform duration-200 hover:translate-x-1"
          >
            <GitHubMark className="h-3.5 w-3.5" />
            VIEW CODE →
          </a>
        </div>
      )}
    </motion.article>
  );
}

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.1 3.29 9.42 7.86 10.95.58.1.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.67.8.56A11.53 11.53 0 0 0 23.5 12.02C23.5 5.74 18.27.5 12 .5Z" />
    </svg>
  );
}

export default function Projects() {
  const [active, setActive] = useState<Project | null>(null);

  return (
    <section id="projects" className="mx-auto max-w-6xl scroll-mt-20 px-4 sm:px-6 py-16 md:py-24">
      <SectionHeading
        index="01"
        title="Projects"
        subtitle="Production-grade ML systems — each scanned, validated, and leakage-checked before deployment. Tap any card or FRIDAY for the full brief."
      />
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
        {projects.map((p) => (
          <ProjectCard key={p.id} p={p} onBrief={setActive} />
        ))}
      </div>

      <ProjectHologram project={active} onClose={() => setActive(null)} />
    </section>
  );
}
