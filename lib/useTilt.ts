"use client";

import { useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";
import { usePrefersReducedMotion } from "./useReducedMotion";

/**
 * Pointer-tracked 3D tilt for cards. Returns spring-smoothed rotateX/rotateY
 * motion values plus pointer handlers. The handlers also write `--mx`/`--my`
 * CSS vars (pointer position within the card) so a spotlight overlay can
 * follow the cursor. Mouse-only; inert under prefers-reduced-motion.
 */
export function useTilt(maxDeg = 4) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLElement | null>(null);

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const spring = { stiffness: 180, damping: 22, mass: 0.6 };
  const rotateX = useSpring(rx, spring);
  const rotateY = useSpring(ry, spring);

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el || reduced || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    rx.set((0.5 - py) * maxDeg * 2);
    ry.set((px - 0.5) * maxDeg * 2);
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const onPointerLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return { ref, rotateX, rotateY, onPointerMove, onPointerLeave };
}
