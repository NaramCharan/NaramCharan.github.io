import type { Project } from "@/lib/content";

/** Source-backed architecture; never presented as a screenshot or model output. */
export default function ProjectSchematic({ project }: { project: Project }) {
  const transformer = project.id === "transformer";
  const stages = transformer ? ["Character input", "Embedding + position", "4 decoder blocks", "Next-character logits"] : ["Book pages", "Extract + validate", "SQLite records", "CSV export"];
  return (
    <div className="w-full px-2">
      <p className="mb-4 text-sm font-medium text-text">{transformer ? "Decoder-only Transformer" : "Book-data pipeline"}</p>
      <ol className="space-y-2 text-xs sm:text-sm">
        {stages.map((stage, index) => <li key={stage} className="flex items-center gap-3 border-l-2 border-cyan/40 py-1 pl-3"><span className="mono text-xs text-gold">0{index + 1}</span><span>{stage}</span></li>)}
      </ol>
      <p className="mt-4 text-xs leading-relaxed text-text-dim">{transformer ? "4 attention heads · 64-dim embeddings · 32-character context" : "Title · price · rating · availability · description · URL"}</p>
    </div>
  );
}
