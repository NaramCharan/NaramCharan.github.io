"use client";

import { useCallback, useState } from "react";
import { projects, type Project } from "@/lib/content";
import SectionHeading from "./SectionHeading";
import ProjectHologram from "./ProjectHologram";
import ProjectEvidence from "./ProjectEvidence";

const priority = ["rsna", "walmart", "churn", "transformer", "scraper"];
const ordered = [...projects].sort((a, b) => {
  const rank = (id: string) => priority.includes(id) ? priority.indexOf(id) : priority.length;
  return rank(a.id) - rank(b.id);
});

function ProjectCard({ p, onBrief }: { p: Project; onBrief: (p: Project) => void }) {
  return (
    <article className={`project-card rounded-2xl border border-line bg-surface/70 p-5 transition-colors hover:border-cyan/50 sm:p-7 ${p.featured ? "md:col-span-2" : ""}`}>
      <div className={p.featured ? "grid items-start gap-7 md:grid-cols-2" : "flex h-full flex-col"}>
        <div className="flex h-full flex-col">
          {!p.featured && <div className="mb-6"><ProjectEvidence project={p} /></div>}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="mono text-xs text-cyan">{p.code}</span>
            <span className="text-xs text-text-muted">{p.domain}</span>
            {p.featured && <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs text-gold">Featured project</span>}
            {p.wip && <span className="text-xs text-gold">In progress</span>}
          </div>
          <h3 className="text-xl font-semibold leading-tight sm:text-2xl">{p.name}</h3>
          <p className="mt-3 text-2xl font-semibold text-gold">{p.metric}</p>
          <p className="mt-3 text-base leading-relaxed text-text-muted">{p.description}</p>
          <ul className="mt-5 space-y-2 text-sm leading-relaxed">
            {p.wins.map(win => <li key={win} className="flex gap-2"><span aria-hidden className="text-cyan">✓</span><span>{win}</span></li>)}
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            {p.tech.map(tech => <span key={tech} className="rounded-md bg-cyan/10 px-2.5 py-1 text-xs text-cyan-bright">{tech}</span>)}
          </div>
          <div className="mt-6 flex-1" aria-hidden="true" />
          <div className="mt-auto flex flex-wrap gap-3 border-t border-line pt-5">
            {p.demo && <a href={p.demo} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-md border border-gold/50 bg-gold/10 px-4 text-sm font-medium text-gold">Live Demo ↗</a>}
            <button onClick={() => onBrief(p)} className="inline-flex min-h-11 items-center rounded-md border border-cyan/40 px-4 text-sm text-cyan-bright" aria-label={`Project Details — ${p.name}`}>Project Details <span aria-hidden className="ml-2 mono text-[11px] text-cyan/70">FRIDAY</span></button>
            <a href={p.repo} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} — view code on GitHub`} className="inline-flex min-h-11 items-center text-sm text-text-muted hover:text-cyan">View Code ↗</a>
          </div>
        </div>
        {p.featured && <ProjectEvidence project={p} />}
      </div>
    </article>
  );
}
export default function Projects() {
  const [active, setActive] = useState<Project | null>(null);
  const close = useCallback(() => setActive(null), []);
  return (
    <section id="projects" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:px-6 sm:py-24">
      <SectionHeading index="01" title="Selected Projects" subtitle="Medical imaging, forecasting, and the pipelines behind them. Explore the results, my contribution, and what I learned." />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">{ordered.map(p => <ProjectCard key={p.id} p={p} onBrief={setActive} />)}</div>
      <ProjectHologram project={active} onClose={close} />
    </section>
  );
}
