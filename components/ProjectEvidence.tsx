import Image from "next/image";
import type { Project } from "@/lib/content";

export default function ProjectEvidence({ project }: { project: Project }) {
  const evidence = project.evidence;
  if (!evidence) return null;
  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-bg-2">
      <Image src={evidence.src} alt={evidence.alt} width={evidence.width} height={evidence.height} sizes="(min-width: 768px) 520px, 100vw" className="h-auto w-full" />
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3 text-xs leading-relaxed text-text-muted">
        <span>{evidence.caption}</span>
        <a href={evidence.source} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center text-cyan-bright underline decoration-dotted underline-offset-4">View source ↗</a>
      </figcaption>
    </figure>
  );
}
