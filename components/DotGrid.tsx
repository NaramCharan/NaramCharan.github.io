"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * A field of HUD dots that ripples — outward from wherever you click/tap,
 * a small glow under the moving pointer, and a slow automatic pulse from a
 * random dot while idle (the anime.js 13×13 grid demo, JARVIS-flavored).
 * Mounts as an absolute background layer; listeners attach to the parent
 * section so the content above stays fully interactive.
 */
export default function DotGrid({
  cols = 26,
  rows = 12,
}: {
  cols?: number;
  rows?: number;
}) {
  const reduced = usePrefersReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  const count = cols * rows;

  useEffect(() => {
    const grid = gridRef.current;
    const parent = grid?.parentElement;
    if (!grid || !parent || reduced) return;
    const dots = grid.querySelectorAll<HTMLElement>(".dg-dot");

    const nearestIndex = (clientX: number, clientY: number) => {
      const r = grid.getBoundingClientRect();
      const c = Math.max(
        0,
        Math.min(cols - 1, Math.round(((clientX - r.left) / r.width) * cols - 0.5))
      );
      const row = Math.max(
        0,
        Math.min(rows - 1, Math.round(((clientY - r.top) / r.height) * rows - 0.5))
      );
      return row * cols + c;
    };

    const ripple = (from: number, big: boolean) => {
      animate(dots, {
        scale: [1, big ? 2.6 : 1.9, 1],
        opacity: [0.22, big ? 1 : 0.7, 0.22],
        delay: stagger(big ? 26 : 20, { grid: [cols, rows], from }),
        duration: big ? 520 : 420,
        ease: "inOutQuad",
        composition: "blend",
      });
    };

    // Click/tap → big ripple from that spot.
    const onDown = (e: PointerEvent) => ripple(nearestIndex(e.clientX, e.clientY), true);

    // Pointer glow — light the dot under the cursor (cheap, throttled by rAF).
    let raf = 0;
    let px = 0;
    let py = 0;
    let lastGlow = -1;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX;
      py = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const i = nearestIndex(px, py);
        if (i === lastGlow) return;
        lastGlow = i;
        animate(dots[i], {
          scale: [1.6, 1],
          opacity: [0.9, 0.22],
          duration: 900,
          ease: "outExpo",
          composition: "blend",
        });
      });
    };

    // Idle auto-pulse (only while the section is on screen).
    let timer: ReturnType<typeof setInterval> | null = null;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !timer) {
        timer = setInterval(() => {
          ripple(Math.floor(Math.random() * count), false);
        }, 4200);
      } else if (!entry.isIntersecting && timer) {
        clearInterval(timer);
        timer = null;
      }
    });
    io.observe(parent);

    parent.addEventListener("pointerdown", onDown);
    parent.addEventListener("pointermove", onMove);
    return () => {
      parent.removeEventListener("pointerdown", onDown);
      parent.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
      if (timer) clearInterval(timer);
      io.disconnect();
    };
  }, [cols, rows, count, reduced]);

  return (
    <div
      ref={gridRef}
      aria-hidden
      className="absolute inset-0 grid overflow-hidden opacity-80"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        maskImage:
          "radial-gradient(ellipse 90% 85% at 50% 50%, #000 40%, transparent 78%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 90% 85% at 50% 50%, #000 40%, transparent 78%)",
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="flex items-center justify-center">
          <span className="dg-dot h-1 w-1 rounded-full bg-cyan opacity-[0.22]" />
        </span>
      ))}
    </div>
  );
}
