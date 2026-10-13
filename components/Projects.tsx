"use client";

import { useCallback, useState, type CSSProperties } from "react";
import { projects, type Project } from "@/lib/content";
import SectionHeading from "./SectionHeading";
import ProjectHologram from "./ProjectHologram";
import ProjectEvidence from "./ProjectEvidence";
import HudPanel from "./HudPanel";

const priority = ["rsna", "walmart", "churn", "transformer", "scraper"];
const ordered = [...projects].sort((a, b) => {
  const rank = (id: string) => priority.includes(id) ? priority.indexOf(id) : priority.length;
  return rank(a.id) - rank(b.id);
});

function Status({ p }: { p: Project }) {
  const [label, tone] = p.demo
    ? ["LIVE", "text-gold"]
    : p.wip
      ? ["IN PROGRESS", "text-gold"]
      : /learning/i.test(p.domain)
        ? ["ONGOING", "text-gold"]
        : ["COMPLETE", "text-cyan"];
  return (
    <span className={`mono inline-flex items-center gap-2 text-[10px] tracking-[0.25em] ${tone}`}>
      <span aria-hidden className="hud-led" />
      {label}
    </span>
  );
}

function ProjectCard({ p, index, onBrief }: { p: Project; index: number; onBrief: (p: Project) => void }) {
  return (
    <HudPanel
      as="article"
      delay={(index % 2) * 110}
      className={`project-card rounded-2xl border border-line bg-surface/70 p-5 sm:p-7 ${p.featured ? "md:col-span-2" : ""}`}
    >
      <div className={p.featured ? "grid items-start gap-7 md:grid-cols-2" : "flex h-full flex-col"}>
        <div className="flex h-full flex-col">
          {!p.featured && <div className="mb-6"><ProjectEvidence project={p} /></div>}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mono text-xs tracking-[0.15em] text-cyan">{p.code}</span>
              <span aria-hidden className="h-px w-5 bg-cyan/40" />
              <span className="mono text-[11px] uppercase tracking-[0.15em] text-text-muted">{p.domain}</span>
            </div>
            <div className="flex items-center gap-3">
              {p.featured && <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs text-gold">Featured project</span>}
              <Status p={p} />
            </div>
          </div>
          <h3 className="text-xl font-semibold leading-tight sm:text-2xl">{p.name}</h3>
          <div className="mt-4 border-l-2 border-gold/80 pl-3">
            <p className="mono text-[10px] tracking-[0.3em] text-text-dim">PRIMARY METRIC</p>
            <p className="glow-gold mt-1 text-2xl font-semibold text-gold">{p.metric}</p>
          </div>
          <p className="mt-4 text-base leading-relaxed text-text-muted">{p.description}</p>
          <ul className="mt-5 space-y-2 text-sm leading-relaxed">
            {p.wins.map(win => (
              <li key={win} className="flex gap-2.5">
                <span aria-hidden className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rotate-45 bg-cyan shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                <span>{win}</span>
              </li>
            ))}
          </ul>
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tech stack">
            {p.tech.map((tech, i) => (
              <li
                key={tech}
                className="hud-chip mono rounded-md bg-cyan/5 px-2.5 py-1 text-[11px] text-cyan-bright ring-1 ring-inset ring-cyan/25"
                style={{ "--i": i } as CSSProperties}
              >
                {tech}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex-1" aria-hidden="true" />
          <div className="mt-auto flex flex-wrap gap-3 border-t border-line pt-5">
            {p.demo && <a href={p.demo} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-md border border-gold/50 bg-gold/10 px-4 text-sm font-medium text-gold transition-shadow hover:shadow-[0_0_18px_rgba(255,178,62,0.3)]">Live Demo ↗</a>}
            <button onClick={() => onBrief(p)} className="inline-flex min-h-11 items-center rounded-md border border-cyan/40 px-4 text-sm text-cyan-bright transition-[background-color,box-shadow] hover:bg-cyan/10 hover:shadow-[0_0_18px_rgba(34,211,238,0.25)]" aria-label={`Project Details — ${p.name}`}>Project Details <span aria-hidden className="ml-2 mono text-[11px] text-cyan/70">FRIDAY</span></button>
            <a href={p.repo} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} — view code on GitHub`} className="inline-flex min-h-11 items-center text-sm text-text-muted hover:text-cyan">View Code ↗</a>
          </div>
        </div>
        {p.featured && <ProjectEvidence project={p} />}
      </div>
    </HudPanel>
  );
}
export default function Projects() {
  const [active, setActive] = useState<Project | null>(null);
  const close = useCallback(() => setActive(null), []);
  return (
    <section id="projects" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:px-6 sm:py-24">
      <SectionHeading index="01" title="Selected Projects" subtitle="Medical imaging, forecasting, and the pipelines behind them. Explore the results, my contribution, and what I learned." />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">{ordered.map((p, i) => <ProjectCard key={p.id} p={p} index={i} onBrief={setActive} />)}</div>
      <ProjectHologram project={active} onClose={close} />
    </section>
  );
}
