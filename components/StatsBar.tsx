"use client";

import { useEffect, useRef, useState } from "react";
import { stats } from "@/lib/content";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

function CountUp({
  target,
  reduced,
  decimals,
}: {
  target: number;
  reduced: boolean;
  decimals: number;
}) {
  const [val, setVal] = useState(reduced ? target : 0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (reduced) return;
    const node = ref.current;
    if (!node) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return;
        started.current = true;
        const duration = 1100;
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - t0) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
          setVal(target * eased);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [target, reduced]);

  return <span ref={ref}>{val.toFixed(decimals)}</span>;
}

export default function StatsBar() {
  const reduced = usePrefersReducedMotion();

  return (
    <section
      aria-label="Key metrics"
      className="relative border-y border-line bg-surface/40 py-10"
    >
      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-5 sm:grid-cols-4 sm:gap-0">
        {stats.map((s, i) => {
          const decimals = Number.isInteger(s.value) ? 0 : 2;
          return (
            <li
              key={s.label}
              className={`flex flex-col items-center text-center sm:px-4 ${
                i < stats.length - 1 ? "sm:border-r sm:border-line" : ""
              }`}
            >
              <span className="mono text-3xl font-bold text-cyan glow-cyan sm:text-4xl">
                {s.prefix ?? ""}
                <CountUp target={s.value} reduced={reduced} decimals={decimals} />
                {s.suffix}
              </span>
              <span className="mt-2 text-xs text-text-muted sm:text-sm">
                {s.label}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
