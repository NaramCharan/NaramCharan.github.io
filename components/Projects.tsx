"use client";

import { motion } from "framer-motion";
import { projects, type Project } from "@/lib/content";
import { EASE } from "@/lib/motion";
import SectionHeading from "./SectionHeading";

function ProjectCard({ p, i }: { p: Project; i: number }) {
  return (
    <motion.a
      href={p.repo}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${p.name} — open repository on GitHub`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.7, ease: EASE, delay: (i % 2) * 0.1 }}
      className={`group relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan/60 hover:bg-surface-2/70 hover:shadow-[0_0_36px_-6px_rgba(34,211,238,0.35)] sm:p-7 ${
        p.featured ? "md:col-span-2" : ""
      }`}
    >
      {/* Scan sweep on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent opacity-0 [animation:scan-sweep_1.4s_ease-in-out_infinite] group-hover:opacity-100"
      />
      {/* GitHub icon (top-right) */}
      <span
        aria-hidden
        className="absolute right-4 top-4 text-text-dim transition-all duration-300 group-hover:scale-110 group-hover:text-cyan"
      >
        <GitHubMark className="h-5 w-5" />
      </span>

      <div className="mb-4 flex flex-wrap items-center gap-2 pr-8">
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
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold leading-snug text-text transition-colors duration-200 group-hover:text-cyan-bright">
          {p.name}
        </h3>
        <span className="mono shrink-0 whitespace-nowrap text-base font-bold text-gold glow-gold">
          {p.metric}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">
        {p.description}
      </p>

      {/* Key results — always visible (desktop + mobile) */}
      <div className="mt-4">
        <p className="mono mb-2 flex items-center gap-2 text-[10px] tracking-[0.3em] text-gold/90">
          <span className="h-px w-4 bg-gold/70" /> KEY RESULTS
        </p>
        <ul className="space-y-1.5">
          {p.wins.map((w) => (
            <li key={w} className="flex items-start gap-2 text-[13px] text-text/90">
              <svg viewBox="0 0 24 24" className="mt-[3px] h-3.5 w-3.5 shrink-0 text-cyan" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span className="leading-snug">{w}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {p.tech.map((t) => (
          <span
            key={t}
            className="mono rounded bg-cyan/10 px-2 py-1 text-[11px] text-cyan/90"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-line pt-4">
        {p.demo ? (
          <span
            className="mono text-xs text-gold transition-transform duration-200 group-hover:translate-x-0.5"
          >
            LIVE DEMO ↗
          </span>
        ) : (
          <span aria-hidden />
        )}
        <span className="mono inline-flex items-center gap-1.5 text-xs text-cyan transition-transform duration-200 group-hover:translate-x-1">
          <GitHubMark className="h-3.5 w-3.5" />
          VIEW CODE →
        </span>
      </div>
    </motion.a>
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
  return (
    <section id="projects" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-28">
      <SectionHeading
        index="01"
        title="Projects"
        subtitle="Production-grade ML systems — each scanned, validated, and leakage-checked before deployment."
      />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {projects.map((p, i) => (
          <ProjectCard key={p.id} p={p} i={i} />
        ))}
      </div>
    </section>
  );
}
