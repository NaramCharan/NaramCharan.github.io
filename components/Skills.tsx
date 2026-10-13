"use client";

import type { CSSProperties } from "react";
import { skillSystems, type SkillSystem } from "@/lib/content";
import HudPanel from "./HudPanel";
import SectionHeading from "./SectionHeading";
import { SystemIcon } from "./SystemIcons";

function SystemEmblem({ icon }: { icon: SkillSystem["icon"] }) {
  // 96px of emblem left the text column only 161px at 375px — every skill chip
  // wrapped onto its own line. Shrinks on phones, full size from sm.
  return (
    <div className="relative h-16 w-16 shrink-0 sm:h-24 sm:w-24">
      <div className="absolute inset-0">
        {/* The dashed ring spins up on reveal and turns only while hovered,
            so at rest the skill text stays the focus. */}
        <svg viewBox="0 0 96 96" className="absolute inset-0 h-full w-full">
          <circle cx="48" cy="48" r="44" fill="none" stroke="#0f1828" strokeWidth="2" />
          <circle
            className="hud-ring"
            cx="48"
            cy="48"
            r="44"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="14 10"
            style={{ filter: "drop-shadow(0 0 4px rgba(34,211,238,0.5))" }}
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
          <SystemIcon name={icon} className="h-6 w-6 sm:h-9 sm:w-9" />
        </div>
      </div>
    </div>
  );
}

function SystemCard({ s, index }: { s: SkillSystem; index: number }) {
  return (
    <HudPanel
      delay={(index % 2) * 110}
      className="flex gap-4 rounded-xl border border-line bg-surface/50 p-5 sm:gap-5 sm:p-7"
    >
      <div data-emblem>
        <SystemEmblem icon={s.icon} />
      </div>
      <div className="min-w-0">
        <div data-tag className="mb-1 flex items-center justify-between gap-3">
          <span className="mono text-[10px] tracking-[0.25em] text-gold">
            ◢ SYS-0{index + 1} · {s.tag}
          </span>
          <span className="mono inline-flex items-center gap-1.5 text-[9px] tracking-[0.25em] text-cyan/80">
            <span aria-hidden className="hud-led" />
            ONLINE
          </span>
        </div>
        <h3 data-heading className="text-lg font-semibold text-text">
          {s.system}
        </h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {s.items.map((it, i) => (
            <li
              key={it}
              data-chip
              style={{ "--i": i } as CSSProperties}
              className="hud-chip mono rounded bg-cyan/8 px-2 py-1 text-[11px] text-cyan/90 ring-1 ring-inset ring-cyan/20 transition-colors duration-200 hover:bg-cyan/15 hover:text-cyan-bright"
            >
              {it}
            </li>
          ))}
        </ul>
        {/* Evidence line — without it these chips just repeat the tech chips
            already on the project cards above. This makes the card an index
            back into the work. */}
        <p className="mono mt-3 border-t border-line/60 pt-3 text-sm leading-relaxed text-text-muted">
          {s.evidence}
        </p>
      </div>
    </HudPanel>
  );
}

export default function Skills() {
  return (
    <section
      id="skills"
      className="relative scroll-mt-20 border-y border-line bg-bg-2/40 py-16 sm:py-28"
    >
      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading
          index="02"
          title="Skills & Systems"
          subtitle="Tools I use, with evidence from the projects where I applied them."
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {skillSystems.map((s, i) => (
            <SystemCard key={s.system} s={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
