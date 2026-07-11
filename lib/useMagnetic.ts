"use client";

import { useCallback, useRef } from "react";
import { animate, createSpring } from "animejs";
import { usePrefersReducedMotion } from "./useReducedMotion";

/**
 * Magnetic hover — the element leans toward the cursor while hovered and
 * springs back to rest on leave (the anime.js-style physical button feel).
 *
 * Uses the standalone CSS `translate` property so it never fights Tailwind
 * hover transforms, and temporarily narrows `transition-property` so the
 * element's `transition-all` doesn't smear the spring release.
 * Mouse-only; inert under prefers-reduced-motion.
 */
export function useMagnetic(strength = 0.32, max = 10) {
  const reduced = usePrefersReducedMotion();
  const cleanup = useRef<(() => void) | null>(null);

  return useCallback(
    (el: HTMLElement | null) => {
      cleanup.current?.();
      cleanup.current = null;
      if (!el || reduced) return;

      const pos = { x: 0, y: 0 };
      let release: ReturnType<typeof animate> | null = null;
      const baseTransition = el.style.transitionProperty;

      const apply = () => {
        el.style.translate = `${pos.x.toFixed(2)}px ${pos.y.toFixed(2)}px`;
      };

      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        release?.cancel();
        release = null;
        el.style.transitionProperty =
          "color, background-color, border-color, box-shadow, opacity";
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * strength;
        const dy = (e.clientY - (r.top + r.height / 2)) * strength;
        pos.x = Math.max(-max, Math.min(max, dx));
        pos.y = Math.max(-max, Math.min(max, dy));
        apply();
      };

      const onLeave = () => {
        release?.cancel();
        release = animate(pos, {
          x: 0,
          y: 0,
          ease: createSpring({ stiffness: 180, damping: 12 }),
          onUpdate: apply,
          onComplete: () => {
            el.style.translate = "";
            el.style.transitionProperty = baseTransition;
          },
        });
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      cleanup.current = () => {
        release?.cancel();
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
        el.style.translate = "";
        el.style.transitionProperty = baseTransition;
      };
    },
    [reduced, strength, max]
  );
}
