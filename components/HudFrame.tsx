"use client";

/**
 * Decorative HUD overlay: corner brackets + edge readouts that frame the
 * viewport like a heads-up display. Purely visual, hidden from a11y tree.
 */
export default function HudFrame() {
  const Corner = ({ className }: { className: string }) => (
    <svg
      viewBox="0 0 60 60"
      className={`absolute h-10 w-10 text-cyan/60 md:h-14 md:w-14 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M2 20 V2 H20" />
      <path d="M2 30 H10" />
    </svg>
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40">
      <Corner className="left-3 top-3" />
      <Corner className="right-3 top-3 rotate-90" />
      <Corner className="bottom-3 left-3 -rotate-90" />
      <Corner className="bottom-3 right-3 rotate-180" />

      <div className="absolute left-1/2 top-3 -translate-x-1/2 mono text-[10px] tracking-[0.35em] text-cyan/50">
        J.A.R.V.I.S · ONLINE
      </div>
      <div className="absolute bottom-3 left-1/2 hidden -translate-x-1/2 mono text-[10px] tracking-[0.3em] text-text-muted/50 sm:block">
        MARK XLII · PERSONAL INTERFACE
      </div>
    </div>
  );
}
