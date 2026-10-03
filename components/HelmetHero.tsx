"use client";

import { useCallback, useRef } from "react";
import dynamic from "next/dynamic";

/**
 * Homepage opening lock-on: the 3D Mark III helmet from /armor, assembling
 * itself above the name. Keeps the `.ia-reticle` class so the hero's GSAP
 * timeline still scales + fades it out as the reactor assembly begins.
 * three.js is code-split behind next/dynamic, so the name and CTAs paint
 * before the WebGL bundle arrives.
 */
const HelmetHeroCanvas = dynamic(() => import("./armor/HelmetHeroCanvas"), { ssr: false });

export default function HelmetHero() {
  const status = useRef<HTMLSpanElement>(null);
  const onStatus = useCallback((s: string) => {
    if (status.current) status.current.textContent = s;
  }, []);

  return (
    <div
      aria-hidden
      className="ia-reticle pointer-events-none absolute left-1/2 top-[31%] z-[12] -translate-x-1/2 -translate-y-1/2"
    >
      <div
        className="par-layer relative h-[min(40vh,380px)] w-[min(33.3vh,316px)]"
        style={{ "--par-m": 14 } as React.CSSProperties}
      >
        {/* cool projector halo behind, warm bounce under the chin */}
        <div className="absolute inset-[-20%] rounded-full bg-[radial-gradient(closest-side,rgba(34,211,238,0.16),transparent)]" />
        <div className="absolute inset-x-[10%] bottom-[-8%] h-[30%] rounded-full bg-[radial-gradient(closest-side,rgba(255,120,60,0.16),transparent)]" />
        {/* canvas is 2× the helmet box so plates can fly in from outside it */}
        <div className="absolute left-1/2 top-1/2 h-[200%] w-[260%] -translate-x-1/2 -translate-y-1/2">
          <HelmetHeroCanvas onStatus={onStatus} />
        </div>
        <span
          ref={status}
          className="mono absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] tracking-[0.35em] text-gold/80"
        >
          SYSTEMS ONLINE
        </span>
      </div>
    </div>
  );
}
