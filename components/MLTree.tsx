"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { animate, stagger } from "animejs";
import { ML_TREE, type TreeModel } from "@/lib/mlTree";
import { projects } from "@/lib/content";
import { EASE } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * The ML taxonomy, projected as a hologram.
 *
 * Root splits into the two things that actually decide your whole approach:
 * whether the data arrives as a table, or as pixels/tokens. Left branch is
 * traditional ML on tabular data; right is deep learning on unstructured.
 * Expand a category to reach the models, and every model that maps to real
 * work links straight to that project.
 *
 * Three node states, because "no project" means two different things:
 * shipped work (cyan pip, links to the repo), FOUNDATION (the theory a branch
 * stands on — sequential models are the problem transformers solved, so they
 * carry no project by design), and a genuine not-yet gap (hollow pip). Only
 * the last counts against the mapped total. A taxonomy that implied a project
 * behind every leaf would be dishonest; one that called theory a gap would be
 * unfair to the work.
 */

const projectById = new Map(projects.map((p) => [p.id, p]));

/* ── one model row ───────────────────────────────────────────────────── */
function ModelRow({ model, open, onToggle }: { model: TreeModel; open: boolean; onToggle: () => void }) {
  const linked = model.projectIds.map((id) => projectById.get(id)).filter(Boolean);
  const hasWork = linked.length > 0 || model.wip || model.foundation;

  return (
    <li className="ml-tree-model">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`group flex w-full items-center gap-2.5 rounded-md border px-3 py-2.5 text-left transition-all duration-300 ${
          open
            ? "border-cyan/60 bg-cyan/10"
            : hasWork
            ? "border-line bg-surface/40 hover:border-cyan/50 hover:bg-surface-2/60"
            : "border-line/50 bg-transparent hover:border-line"
        }`}
      >
        {/* status pip: cyan = shipped, amber = WIP, ringed = foundation, hollow = gap */}
        <span
          aria-hidden
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            model.wip
              ? "bg-gold shadow-[0_0_8px_rgba(255,178,62,0.9)] motion-safe:animate-pulse"
              : linked.length
              ? "bg-cyan shadow-[0_0_8px_rgba(34,211,238,0.8)]"
              : model.foundation
              ? "border border-cyan/50 bg-cyan/20"
              : "border border-text-dim/60"
          }`}
        />
        <span className={`flex-1 text-sm ${hasWork ? "text-text" : "text-text-dim"}`}>
          {model.label}
        </span>

        {model.wip && (
          <span className="mono shrink-0 rounded border border-gold/50 px-1.5 py-0.5 text-[9px] tracking-[0.14em] text-gold">
            IN PROGRESS
          </span>
        )}
        {!model.wip && linked.length > 0 && (
          <span className="mono shrink-0 text-[9px] tracking-[0.14em] text-cyan/80">
            {linked.length} PROJECT{linked.length > 1 ? "S" : ""}
          </span>
        )}
        {!model.wip && linked.length === 0 && model.foundation && (
          <span className="mono shrink-0 text-[9px] tracking-[0.14em] text-cyan/60">
            FOUNDATION
          </span>
        )}
        {!model.wip && linked.length === 0 && !model.foundation && (
          <span className="mono shrink-0 text-[9px] tracking-[0.14em] text-text-dim/70">—</span>
        )}
        <span
          aria-hidden
          className={`shrink-0 text-text-dim transition-transform duration-300 ${open ? "rotate-90" : ""}`}
        >
          ›
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="ml-3 mt-1.5 space-y-2 border-l border-line pl-4 pb-1">
              {model.note && (
                <p className="pt-1.5 text-[13px] leading-relaxed text-text-muted">{model.note}</p>
              )}

              {linked.map((p) => (
                <a
                  key={p!.id}
                  href={p!.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/card block rounded-md border border-line bg-bg-2/60 px-3 py-2.5 transition-all duration-300 hover:border-cyan/60 hover:bg-surface-2/60"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="mono text-[10px] tracking-[0.16em] text-cyan">{p!.code}</span>
                    <span className="mono text-[11px] text-gold">{p!.metric}</span>
                  </div>
                  <p className="mt-1 text-[13px] font-medium text-text transition-colors group-hover/card:text-cyan-bright">
                    {p!.name}
                  </p>
                  <p className="mono mt-1 text-[9px] tracking-[0.14em] text-text-dim">
                    {p!.domain} · VIEW CODE →
                  </p>
                </a>
              ))}

              {model.seeAlso && (
                <a
                  href={model.seeAlso.href}
                  className="mono inline-block text-[10px] tracking-[0.14em] text-cyan hover:text-cyan-bright"
                >
                  {model.seeAlso.label} ↓
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

/* ── one branch column ───────────────────────────────────────────────── */
function Branch({
  branch,
  side,
  openModels,
  toggleModel,
}: {
  branch: (typeof ML_TREE)["branches"][number];
  side: "left" | "right";
  openModels: Set<string>;
  toggleModel: (id: string) => void;
}) {
  const accent = side === "left" ? "cyan" : "gold";

  return (
    <div className="ml-tree-branch flex-1">
      {/* branch head */}
      <div
        className={`relative rounded-lg border px-4 py-3.5 ${
          side === "left"
            ? "border-cyan/40 bg-cyan/[0.06]"
            : "border-gold/40 bg-gold/[0.06]"
        }`}
      >
        <p
          className={`mono text-[10px] tracking-[0.24em] ${
            side === "left" ? "text-cyan" : "text-gold"
          }`}
        >
          {branch.dataType}
        </p>
        {/* h3, not h4 — the section heading above is an h2 and skipping a level
            breaks screen-reader outline navigation. */}
        <h3 className="mt-1 text-lg font-semibold text-text">{branch.label}</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-text-muted">{branch.caption}</p>
      </div>

      {/* categories */}
      <div className="mt-4 space-y-4">
        {branch.categories.map((cat) => (
          <div key={cat.id} className="rounded-lg border border-line bg-surface/30 p-3.5">
            <p
              className={`mono text-[10px] tracking-[0.2em] ${
                accent === "cyan" ? "text-cyan/90" : "text-gold/90"
              }`}
            >
              {cat.label}
            </p>
            <p className="mt-1 mb-3 text-[12px] leading-relaxed text-text-dim">{cat.caption}</p>
            <ul className="space-y-1.5">
              {cat.models.map((m) => (
                <ModelRow
                  key={m.id}
                  model={m}
                  open={openModels.has(m.id)}
                  onToggle={() => toggleModel(m.id)}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── the hologram ────────────────────────────────────────────────────── */
export default function MLTree() {
  const reduced = usePrefersReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { once: true, margin: "-100px" });
  const [openModels, setOpenModels] = useState<Set<string>>(new Set());

  const toggleModel = (id: string) =>
    setOpenModels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  /* Count what the tree actually covers — a real number, computed. */
  const stats = useMemo(() => {
    const all = ML_TREE.branches.flatMap((b) => b.categories.flatMap((c) => c.models));
    const mapped = all.filter((m) => m.projectIds.length > 0).length;
    // Foundations are lineage, not portfolio gaps — they never count against you.
    const applicable = all.filter((m) => !m.foundation).length;
    return { applicable, mapped };
  }, []);

  /* The projection: trunk draws, then the branches ignite. */
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || !inView) return;

    if (reduced) {
      wrap.querySelectorAll<HTMLElement>(".ml-tree-branch, .ml-tree-root").forEach((el) => {
        el.style.opacity = "1";
      });
      return;
    }

    const trunk = wrap.querySelectorAll<SVGGeometryElement>(".ml-trunk-line");
    trunk.forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
    });

    animate(".ml-tree-root", { opacity: [0, 1], scale: [0.9, 1], duration: 600, ease: "outExpo" });
    animate(trunk, {
      strokeDashoffset: 0,
      duration: 700,
      delay: stagger(90, { start: 260 }),
      ease: "inOutQuad",
    });
    animate(".ml-tree-branch", {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 700,
      delay: stagger(120, { start: 520 }),
      ease: "outExpo",
    });
  }, [inView, reduced]);

  return (
    <div
      ref={wrapRef}
      className="relative overflow-hidden rounded-xl border border-line bg-surface/40 px-4 py-6 sm:px-6"
    >
      {/* holographic wash + scanlines */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_0%,rgba(34,211,238,0.10),transparent_70%)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:repeating-linear-gradient(0deg,rgba(34,211,238,0.5)_0px,rgba(34,211,238,0.5)_1px,transparent_1px,transparent_4px)]"
      />

      <div className="relative">
        {/* header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <span className="mono text-[10px] tracking-[0.24em] text-text-dim">
            PROJECTION · ML TAXONOMY
          </span>
          <span className="mono text-[10px] tracking-[0.18em] text-text-dim">
            <b className="font-normal text-cyan">{stats.mapped}</b>/{stats.applicable} MAPPED TO PROJECTS
          </span>
        </div>

        {/* root */}
        <div className="ml-tree-root mx-auto w-fit" style={{ opacity: 0 }}>
          <div className="relative rounded-lg border border-cyan/60 bg-cyan/10 px-6 py-3 text-center shadow-[0_0_40px_-10px_rgba(34,211,238,0.6)]">
            <span className="mono text-[9px] tracking-[0.3em] text-cyan/80">ROOT</span>
            <p className="text-lg font-semibold tracking-tight text-text sm:text-xl">
              {ML_TREE.root}
            </p>
          </div>
        </div>

        {/* trunk — splits by the one question that decides everything.
            Below lg the two branches STACK, so a Y-split would fork out to the
            left and right edges and dead-end in empty space (the gold arm
            especially, pointing at nothing). Mobile gets a single spine with
            the question set into it; the fork only appears once there really
            are two columns to fork into. */}
        <div className="relative mx-auto flex h-16 w-full max-w-3xl items-center justify-center lg:hidden">
          <svg
            viewBox="0 0 100 80"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full overflow-visible"
            aria-hidden
          >
            <path
              className="ml-trunk-line"
              d="M50 0 V80"
              fill="none"
              stroke="var(--color-cyan)"
              strokeWidth="1.5"
              opacity="0.65"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <span className="mono relative whitespace-nowrap bg-bg px-3 text-[9px] tracking-[0.2em] text-text-dim">
            WHAT SHAPE IS THE DATA?
          </span>
        </div>

        <div className="relative mx-auto hidden h-16 w-full max-w-3xl sm:h-20 lg:block">
          <svg
            viewBox="0 0 600 80"
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
            aria-hidden
          >
            <path className="ml-trunk-line" d="M300 0 V26" fill="none" stroke="var(--color-cyan)" strokeWidth="1.5" opacity="0.7" />
            <path className="ml-trunk-line" d="M300 26 H90 V80" fill="none" stroke="var(--color-cyan)" strokeWidth="1.5" opacity="0.55" />
            <path className="ml-trunk-line" d="M300 26 H510 V80" fill="none" stroke="var(--color-gold)" strokeWidth="1.5" opacity="0.55" />
          </svg>
          <span className="mono absolute left-1/2 top-[26px] -translate-x-1/2 -translate-y-1/2 bg-bg px-2 text-[9px] tracking-[0.2em] text-text-dim">
            WHAT SHAPE IS THE DATA?
          </span>
        </div>

        {/* the two branches */}
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {ML_TREE.branches.map((b, i) => (
            <Branch
              key={b.id}
              branch={b}
              side={i === 0 ? "left" : "right"}
              openModels={openModels}
              toggleModel={toggleModel}
            />
          ))}
        </div>

        <p className="mono mt-5 border-t border-line pt-3 text-[10px] leading-relaxed tracking-wide text-text-dim">
          <b className="font-normal text-text-muted">HOW TO READ THIS.</b> A filled cyan dot means
          I&apos;ve shipped a project with that model — open the node to jump to the code. Amber is
          in progress. <b className="font-normal text-cyan/80">FOUNDATION</b> means I&apos;ve
          studied it in theory and understand how it works, and it carries no project by design:
          RNN → LSTM → attention is the line the modern era of AI was built on, and the architecture
          it ends at is the one running inside ChatGPT, Gemini and Claude today. A hollow dot is a
          method I know but haven&apos;t built with yet.
        </p>
      </div>
    </div>
  );
}
