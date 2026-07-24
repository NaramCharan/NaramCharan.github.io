"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { profile, education, certifications } from "@/lib/content";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import SectionHeading from "./SectionHeading";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const reduced = usePrefersReducedMotion();
  const narrativeRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Narrative + education panel assemble as the section scrolls into view;
  // the certifications timeline draws its spine and pops each entry in
  // sequence. Both scrub with scroll (reversible) rather than firing once,
  // matching the Projects/Blueprint/Skills pattern.
  useEffect(() => {
    const narrative = narrativeRef.current;
    const timeline = timelineRef.current;
    if (reduced) return;

    const ctx = gsap.context(() => {
      if (narrative) {
        gsap.timeline({
          scrollTrigger: { trigger: narrative, start: "top 88%", end: "top 45%", scrub: 0.5 },
        }).from(narrative.querySelectorAll("[data-narrative-part]"), {
          opacity: 0,
          y: 18,
          stagger: 0.12,
          duration: 0.4,
        });
      }

      if (timeline) {
        const spine = timeline.querySelector<HTMLElement>("[data-spine]");
        if (spine) spine.style.transformOrigin = "top";
        const tl = gsap.timeline({
          scrollTrigger: { trigger: timeline, start: "top 85%", end: "bottom 55%", scrub: 0.5 },
        });
        if (spine) tl.from(spine, { scaleY: 0, duration: 0.6 }, 0);
        tl.from(
          timeline.querySelectorAll("[data-cert-dot]"),
          { scale: 0, transformOrigin: "50% 50%", stagger: 0.09, duration: 0.25, ease: "back.out(2)" },
          0.05
        ).from(
          timeline.querySelectorAll("[data-cert-item]"),
          { opacity: 0, x: -14, stagger: 0.09, duration: 0.35 },
          0.05
        );
      }
    });

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-28">
      <SectionHeading index="03" title="Origin Story" />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
        {/* Narrative */}
        <div ref={narrativeRef} className="lg:col-span-3">
          <div className="space-y-5 text-base leading-relaxed text-text-muted">
            {profile.about.map((para, i) => (
              <p key={i} data-narrative-part className={i === 0 ? "text-text" : undefined}>
                {para}
              </p>
            ))}
          </div>

          {/* Education panel */}
          <div data-narrative-part className="mt-10 rounded-xl border border-line bg-surface/50 p-6">
            <div className="mb-3 mono text-[10px] tracking-[0.3em] text-gold">
              EDUCATION
            </div>
            <h3 className="text-lg font-semibold text-text">
              {education.degree}
            </h3>
            <p className="text-sm text-cyan/90">{education.specialization}</p>
            <p className="mt-1 text-sm text-text-muted">
              {education.school} · {education.year}
            </p>
            <div className="mt-5 flex items-end justify-between gap-4 rounded-md border border-line bg-bg-2/60 px-4 py-3">
              <div>
                <div className="mono text-[9px] tracking-[0.2em] text-text-dim">
                  CGPA AVERAGE
                </div>
                <div className="mono text-2xl font-bold text-cyan glow-cyan">
                  {education.cgpa}
                </div>
              </div>
              <div className="text-right">
                <div className="mono text-[9px] tracking-[0.2em] text-text-dim">
                  GRADUATION
                </div>
                <div className="mono text-sm text-gold">{education.graduation}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Certifications timeline */}
        <div ref={timelineRef} className="lg:col-span-2">
          <div className="mb-4 mono text-[10px] tracking-[0.3em] text-gold">
            CERTIFICATIONS
          </div>
          <div className="relative space-y-3 pl-6">
            {/* Timeline spine draws itself top-to-bottom on reveal */}
            <span
              data-spine
              aria-hidden
              className="absolute left-0 top-0 h-full w-px origin-top bg-gradient-to-b from-cyan/70 via-line to-transparent"
            />
            {certifications.map((c) => (
              <div key={c.name} data-cert-item className="relative">
                <span
                  data-cert-dot
                  aria-hidden
                  className="absolute -left-[26px] top-3.5 h-2.5 w-2.5 rounded-full border border-cyan bg-bg shadow-[0_0_8px_rgba(34,211,238,0.7)]"
                />
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${c.name} — view credential (opens in new tab)`}
                  className="group block rounded-lg border border-line bg-surface/40 px-4 py-3 transition-all duration-300 hover:border-cyan/60 hover:bg-surface-2/60 hover:shadow-[0_0_22px_-8px_rgba(34,211,238,0.4)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-text transition-colors duration-200 group-hover:text-cyan-bright">
                      {c.name}
                    </p>
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-dim transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyan"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 17 17 7M9 7h8v8" />
                    </svg>
                  </div>
                  <p className="text-xs text-text-muted">{c.issuer}</p>
                  <p className="mono mt-1 text-[10px] tracking-wide text-cyan/80">
                    {c.note} · VERIFY →
                  </p>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
