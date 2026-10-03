"use client";

import { useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * Origin Story visual: the 3D Mark III helmet (same model as /armor)
 * assembling as the story scrolls in. three.js is code-split, so it only
 * downloads when the visitor gets near this section.
 */
const OriginHelmetCanvas = dynamic(() => import("./armor/OriginHelmetCanvas"), { ssr: false });

export default function OriginHelmet() {
  const reduced = usePrefersReducedMotion();
  const status = useRef<HTMLSpanElement>(null);
  const onStatus = useCallback((s: string) => {
    if (status.current) status.current.textContent = s;
  }, []);

  return (
    <figure aria-hidden className="relative mx-auto h-[300px] w-full max-w-[360px] sm:h-[380px] lg:h-[440px] lg:max-w-none">
      {/* cool halo behind, warm bounce under the chin */}
      <div className="absolute inset-[6%] rounded-full bg-[radial-gradient(closest-side,rgba(34,211,238,0.14),transparent)]" />
      <div className="absolute inset-x-[20%] bottom-[4%] h-[24%] rounded-full bg-[radial-gradient(closest-side,rgba(255,120,60,0.14),transparent)]" />
      <OriginHelmetCanvas reduced={reduced} onStatus={onStatus} />
      <span
        ref={status}
        className="mono absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] tracking-[0.35em] text-gold/80"
      >
        MARK III · ONLINE
      </span>
    </figure>
  );
}
