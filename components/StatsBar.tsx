"use client";

import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { animate } from "animejs";
import { stats } from "@/lib/content";
import { EASE } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

// Stats rise in one-by-one; each number then rolls up like an odometer.
const statSeq = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const statItem = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

/**
 * Odometer — every digit is a vertical 0–9 strip; anime rolls each strip to
 * its target with a per-column stagger (right column lands last, like a real
 * counter). Non-digit characters (".", "<") render as static glyphs.
 * Reduced motion renders the plain final value.
 */
function Odometer({ text, play }: { text: string; play: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !play) return;
    const strips = el.querySelectorAll<HTMLElement>(".od-strip");
    strips.forEach((strip, i) => {
      const params = {
        translateY: `${-Number(strip.dataset.digit)}em`,
        duration: 1600,
        delay: i * 90,
        ease: "outExpo",
      };
      if (i === strips.length - 1) {
        // the whole number gives a little spring pop the moment it lands
        animate(strip, {
          ...params,
          onComplete: () => {
            animate(el, { scale: [1, 1.07, 1], duration: 450, ease: "outBack(3)" });
          },
        });
      } else {
        animate(strip, params);
      }
    });
  }, [play]);

  return (
    <span ref={ref} className="inline-flex">
      {text.split("").map((ch, i) =>
        /\d/.test(ch) ? (
          <span
            key={i}
            className="inline-block h-[1em] overflow-hidden"
            style={{ lineHeight: "1em" }}
          >
            <span
              className="od-strip block will-change-transform"
              data-digit={ch}
            >
              {Array.from({ length: 10 }).map((_, d) => (
                <span key={d} className="block h-[1em]" style={{ lineHeight: "1em" }}>
                  {d}
                </span>
              ))}
            </span>
          </span>
        ) : (
          <span key={i} style={{ lineHeight: "1em" }}>
            {ch}
          </span>
        )
      )}
    </span>
  );
}

export default function StatsBar() {
  const reduced = usePrefersReducedMotion();
  const listRef = useRef<HTMLUListElement>(null);
  const inView = useInView(listRef, { once: true, margin: "-60px" });

  return (
    <section
      id="metrics"
      aria-label="Key metrics"
      className="relative border-y border-line bg-surface/40 py-10"
    >
      {/* Power handoff — the reactor's charge sweeps in along the top edge
          as the section reveals, then the odometers roll. Stitches the
          cinematic hero to the playful world below. */}
      <motion.span
        aria-hidden
        className="absolute inset-x-0 top-[-1px] h-px origin-left bg-gradient-to-r from-cyan via-cyan-bright to-gold shadow-[0_0_12px_rgba(34,211,238,0.8)]"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.9, ease: EASE }}
      />
      <motion.ul
        ref={listRef}
        className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-5 sm:grid-cols-4 sm:gap-0"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={statSeq}
      >
        {stats.map((s, i) => {
          const decimals = Number.isInteger(s.value) ? 0 : 2;
          const valueText = s.value.toFixed(decimals);
          return (
            <motion.li
              key={s.label}
              variants={statItem}
              className={`flex flex-col items-center text-center sm:px-4 ${
                i < stats.length - 1 ? "sm:border-r sm:border-line" : ""
              }`}
            >
              <span className="mono flex items-baseline text-3xl font-bold text-cyan glow-cyan sm:text-4xl">
                {s.prefix ?? ""}
                {reduced ? (
                  <span>{valueText}</span>
                ) : (
                  <Odometer text={valueText} play={inView} />
                )}
                {s.suffix}
              </span>
              <span className="mt-2 text-xs text-text-muted sm:text-sm">
                {s.label}
              </span>
            </motion.li>
          );
        })}
      </motion.ul>
    </section>
  );
}
