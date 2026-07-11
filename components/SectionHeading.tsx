"use client";

import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { animate, stagger } from "animejs";
import { EASE } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * Section headings break into characters that flip up into place one-by-one
 * (the anime.js split-text signature). The plain title is always in the DOM
 * for SSR/SEO; chars start hidden via inline style and cascade in on view.
 */
export default function SectionHeading({
  index,
  title,
  subtitle,
}: {
  index: string;
  title: string;
  subtitle?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    const chars = el.querySelectorAll<HTMLElement>(".sh-char");
    if (reduced) {
      chars.forEach((c) => (c.style.opacity = "1"));
      return;
    }
    animate(chars, {
      opacity: [0, 1],
      translateY: ["0.55em", "0em"],
      rotateX: [-90, 0],
      duration: 750,
      delay: stagger(30),
      ease: "outExpo",
    });
  }, [inView, reduced]);

  return (
    <div className="mb-14">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mb-4 flex items-center gap-3"
      >
        <span className="mono text-xs tracking-[0.3em] text-gold">{index}</span>
        <motion.span
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          className="h-px w-16 origin-left bg-gradient-to-r from-cyan to-transparent"
        />
        <span className="mono text-[10px] tracking-[0.4em] text-text-dim">
          SYSTEM MODULE
        </span>
      </motion.div>
      <h2
        ref={ref}
        aria-label={title}
        className="text-4xl font-semibold tracking-tight sm:text-5xl"
        style={{ perspective: "600px" }}
      >
        <span aria-hidden className="glow-cyan">
          {title.split("").map((ch, i) =>
            ch === " " ? (
              <span key={i}> </span>
            ) : (
              <span
                key={i}
                className="sh-char inline-block will-change-transform"
                style={{ opacity: 0, transformStyle: "preserve-3d" }}
              >
                {ch}
              </span>
            )
          )}
        </span>
      </h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.18 }}
          className="mt-4 max-w-2xl text-lg leading-relaxed text-text-muted"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
