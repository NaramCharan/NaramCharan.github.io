"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { animate, createDraggable, createSpring } from "animejs";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { skillSystems, type SkillSystem } from "@/lib/content";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import SectionHeading from "./SectionHeading";
import DotGrid from "./DotGrid";
import { SystemIcon } from "./SystemIcons";

gsap.registerPlugin(ScrollTrigger);

function SystemEmblem({ icon }: { icon: SkillSystem["icon"] }) {
  const reduced = usePrefersReducedMotion();
  const dragRef = useRef<HTMLDivElement>(null);

  // The reticle is a toy: grab it, throw it, it springs back home
  // (anime.js Draggable + spring release). Mouse/touch only, decorative.
  useEffect(() => {
    const el = dragRef.current;
    if (!el || reduced) return;
    const d = createDraggable(el, {
      // swells slightly in your hand, then springs home on release —
      // the grab feedback is what makes it feel physical, not scripted
      onGrab: () => {
        animate(el, { scale: 1.08, duration: 220, ease: "outQuad" });
      },
      onRelease: (self) => {
        animate(el, { scale: 1, duration: 320, ease: "outQuad" });
        animate(self, {
          x: 0,
          y: 0,
          duration: 900,
          ease: createSpring({ stiffness: 140, damping: 9 }),
        });
      },
    });
    return () => {
      d.revert();
    };
  }, [reduced]);

  return (
    <div className="relative h-24 w-24 shrink-0">
      <div ref={dragRef} className="absolute inset-0 cursor-grab active:cursor-grabbing">
        {/* Rotating reticle ring — spins continuously once assembled */}
        <svg viewBox="0 0 96 96" className="absolute inset-0 h-full w-full">
          <circle cx="48" cy="48" r="44" fill="none" stroke="#0f1828" strokeWidth="2" />
          <motion.circle
            cx="48"
            cy="48"
            r="44"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="14 10"
            animate={reduced ? { rotate: 0 } : { rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "center", filter: "drop-shadow(0 0 4px rgba(34,211,238,0.5))" }}
          />
          {/* corner ticks */}
          {[0, 90, 180, 270].map((deg) => (
            <line
              key={deg}
              x1="48"
              y1="6"
              x2="48"
              y2="12"
              stroke="#ffb23e"
              strokeWidth="2"
              transform={`rotate(${deg} 48 48)`}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-cyan glow-cyan">
          <SystemIcon name={icon} className="h-9 w-9" />
        </div>
      </div>
    </div>
  );
}

function SystemCard({ s }: { s: SkillSystem }) {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  // Chips pop with a little spring when the pointer lands on them.
  const popChip = (e: React.PointerEvent<HTMLLIElement>) => {
    if (reduced || e.pointerType !== "mouse") return;
    animate(e.currentTarget, {
      scale: [1, 1.14, 1],
      duration: 420,
      ease: "outBack(2.5)",
    });
  };

  // Card assembles as it scrolls into view — emblem, label, heading and each
  // chip lock into place in sequence, reversing on scroll-back — matching the
  // Projects/Blueprint scrub pattern rather than a one-shot entrance.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          end: "top 40%",
          scrub: 0.5,
        },
      });
      tl.from(el, { opacity: 0, y: 22, duration: 0.3 }, 0)
        .from(
          el.querySelector("[data-emblem]"),
          { scale: 0, opacity: 0, transformOrigin: "50% 50%", duration: 0.35, ease: "back.out(1.8)" },
          0.1
        )
        .from(el.querySelectorAll("[data-tag], [data-heading]"), { opacity: 0, x: -10, stagger: 0.06, duration: 0.3 }, 0.2)
        .from(
          el.querySelectorAll("[data-chip]"),
          { opacity: 0, y: 8, scale: 0.9, stagger: 0.045, duration: 0.3 },
          0.35
        );
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div
      ref={rootRef}
      className="flex gap-5 rounded-xl border border-line bg-surface/50 p-6 backdrop-blur-[2px] transition-colors duration-300 hover:border-cyan/50 sm:p-7"
    >
      <div data-emblem>
        <SystemEmblem icon={s.icon} />
      </div>
      <div className="min-w-0">
        <div data-tag className="mb-1 flex items-center gap-2">
          <span className="mono text-[10px] tracking-[0.25em] text-gold">
            ◢ {s.tag}
          </span>
        </div>
        <h3 data-heading className="text-lg font-semibold text-text">
          {s.system}
        </h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {s.items.map((it) => (
            <li
              key={it}
              data-chip
              onPointerEnter={popChip}
              className="mono rounded bg-cyan/8 px-2 py-1 text-[11px] text-cyan/90 ring-1 ring-inset ring-cyan/20 transition-colors duration-200 hover:bg-cyan/15 hover:text-cyan-bright"
            >
              {it}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Skills() {
  return (
    <section
      id="skills"
      className="relative scroll-mt-20 border-y border-line bg-bg-2/40 py-28"
    >
      {/* Interactive HUD dot field — ripples from clicks, glows under the
          cursor, pulses on its own. Content sits above on z-10. */}
      <DotGrid />
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <SectionHeading
          index="02"
          title="Suit Systems"
          subtitle="Core subsystems and their capabilities — the stack that powers every build. (Go ahead — poke the grid, grab a reticle.)"
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {skillSystems.map((s) => (
            <SystemCard key={s.system} s={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
