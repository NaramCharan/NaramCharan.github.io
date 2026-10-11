import Image from "next/image";
import type { Project } from "@/lib/content";
import ProjectSchematic from "./ProjectSchematic";

export default function ProjectEvidence({ project }: { project: Project }) {
  const evidence = project.evidence;
  const label = evidence ? (project.id === "rsna" ? "Application capture" : "Published results") : "Architecture illustration";
  return (
    <figure className="project-evidence overflow-hidden rounded-xl border border-line bg-bg-2">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <span className="mono text-[10px] tracking-widest text-text-dim">{project.code} / PREVIEW</span>
        <span className="text-xs text-text-muted">{label}</span>
      </div>
      <div className="flex aspect-[16/10] items-center justify-center overflow-hidden p-3 sm:p-4">
        {evidence ? <Image src={evidence.src} alt={evidence.alt} width={evidence.width} height={evidence.height} sizes="(min-width: 768px) 520px, 100vw" className="max-h-full w-full object-contain" /> : <ProjectSchematic project={project} />}
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3 text-xs leading-relaxed text-text-muted">
        <span className="min-w-0 flex-1">{evidence?.caption ?? "Project architecture · illustration, not execution output"}</span>
        <a href={evidence?.source ?? project.repo} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 shrink-0 items-center text-cyan-bright underline decoration-dotted underline-offset-4">View source ↗</a>
      </figcaption>
    </figure>
  );
}
