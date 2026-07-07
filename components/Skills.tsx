"use client";

import { motion } from "framer-motion";
import { skillSystems, type SkillSystem } from "@/lib/content";
import { EASE } from "@/lib/motion";
import SectionHeading from "./SectionHeading";
import { SystemIcon } from "./SystemIcons";

function SystemEmblem({ icon }: { icon: SkillSystem["icon"] }) {
  return (
    <div className="relative h-24 w-24 shrink-0">
      {/* Rotating reticle ring (decorative, replaces the numeric gauge) */}
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
          initial={{ rotate: 0, opacity: 0 }}
          whileInView={{ rotate: 360, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ rotate: { duration: 24, repeat: Infinity, ease: "linear" }, opacity: { duration: 0.6 } }}
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
  );
}

function SystemCard({ s, i }: { s: SkillSystem; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.7, ease: EASE, delay: i * 0.1 }}
      className="flex gap-5 rounded-xl border border-line bg-surface/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan/50 sm:p-7"
    >
      <SystemEmblem icon={s.icon} />
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2">
          <span className="mono text-[10px] tracking-[0.25em] text-gold">
            ◢ {s.tag}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-text">{s.system}</h3>
        {/* Chips cascade in one-by-one after the card lands */}
        <motion.ul
          className="mt-3 flex flex-wrap gap-2"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.05, delayChildren: 0.25 + i * 0.1 },
            },
          }}
        >
          {s.items.map((it) => (
            <motion.li
              key={it}
              variants={{
                hidden: { opacity: 0, y: 8, scale: 0.92 },
                show: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.45, ease: EASE },
                },
              }}
              className="mono rounded bg-cyan/8 px-2 py-1 text-[11px] text-cyan/90 ring-1 ring-inset ring-cyan/20 transition-colors duration-200 hover:bg-cyan/15 hover:text-cyan-bright"
            >
              {it}
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </motion.div>
  );
}

export default function Skills() {
  return (
    <section
      id="skills"
      className="relative scroll-mt-20 border-y border-line bg-bg-2/40 py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          index="02"
          title="Suit Systems"
          subtitle="Core subsystems and their capabilities — the stack that powers every build."
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {skillSystems.map((s, i) => (
            <SystemCard key={s.system} s={s} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
