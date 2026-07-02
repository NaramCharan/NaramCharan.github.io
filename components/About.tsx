"use client";

import { motion } from "framer-motion";
import { profile, education, certifications } from "@/lib/content";
import SectionHeading from "./SectionHeading";

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-28">
      <SectionHeading index="03" title="Origin Story" />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
        {/* Narrative */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-3"
        >
          <div className="space-y-5 text-base leading-relaxed text-text-muted">
            {profile.about.map((para, i) => (
              <p key={i} className={i === 0 ? "text-text" : undefined}>
                {para}
              </p>
            ))}
          </div>

          {/* Education panel */}
          <div className="mt-10 rounded-xl border border-line bg-surface/50 p-6">
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
        </motion.div>

        {/* Certifications timeline */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="mb-4 mono text-[10px] tracking-[0.3em] text-gold">
            CERTIFICATIONS
          </div>
          <ul className="relative space-y-3 border-l border-line pl-6">
            {certifications.map((c) => (
              <li key={c.name} className="relative">
                <span
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
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
