export default function SectionHeading({ index, title, subtitle }: { index: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-10 sm:mb-12">
      <div className="mb-4 flex items-center gap-3">
        <span className="mono text-xs tracking-[0.2em] text-gold">{index}</span>
        <span aria-hidden className="h-px w-12 bg-cyan/40" />
        <span className="mono text-[10px] tracking-[0.25em] text-text-dim">PORTFOLIO</span>
      </div>
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-muted sm:text-lg">{subtitle}</p>}
    </div>
  );
}
