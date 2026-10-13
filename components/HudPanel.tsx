"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Holographic panel shell shared by project and skill cards: HUD corner
 * brackets, a cursor-following glow and a one-shot scan sweep as the panel
 * first enters view. All motion is event-driven (enter / hover) — nothing
 * loops — and the CSS in globals.css switches it off under reduced motion.
 *
 * The server markup is the final, fully visible state. Only after mount does
 * a panel that is still below the fold get `data-reveal="pending"`, so a
 * failed or slow script never leaves content hidden.
 */
export default function HudPanel({
  as: Tag = "div",
  className = "",
  delay = 0,
  children,
}: {
  as?: "div" | "article";
  className?: string;
  delay?: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.reveal = "done";
          io.disconnect();
        } else if (!el.dataset.reveal) {
          el.dataset.reveal = "pending";
        }
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    io.observe(el);

    // Glow tracks the pointer through CSS vars — no React re-render.
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    el.addEventListener("pointermove", move);
    return () => {
      io.disconnect();
      el.removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`hud-panel ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      <span aria-hidden className="hud-corner hud-corner--tl" />
      <span aria-hidden className="hud-corner hud-corner--tr" />
      <span aria-hidden className="hud-corner hud-corner--bl" />
      <span aria-hidden className="hud-corner hud-corner--br" />
      {children}
    </Tag>
  );
}
