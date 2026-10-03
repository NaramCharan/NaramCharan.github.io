"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { animate, createSpring, stagger, svg } from "animejs";
import { projects } from "@/lib/content";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * Hero HUD — the two segment-C panels, driven by anime.js.
 *
 * Everything here is counted from `projects` (never typed), and the markup
 * renders the FINAL state so SSR / reduced-motion get a complete HUD; anime
 * only supplies the journey via from-values. The journey replays each time
 * the hero scroll re-enters segment C (the canvas stamps `data-seg` on #top),
 * and every animation is reverted on the way out so nothing loops off-screen.
 *
 *   • PROJECTS BUILT  — odometer count-up + one MK tag per project, lit in
 *                       sequence, then a scanner sweep that re-runs.
 *   • DEPLOYED ONLINE — segmented ring (one arc per project, gold = has a
 *                       live URL) drawn arc by arc, with a sonar pulse.
 *   • Conduits        — each panel is wired to the reactor rim by a drawn
 *                       path with a packet travelling along it.
 */

const BUILT = projects.length;
const DEPLOYED = projects.filter((p) => p.demo).length;

/* Ring geometry — deterministic (rounded) so SSR and client agree. */
const CX = 40;
const CY = 40;
const R = 31;
const GAP = 7; // degrees between arcs
const ARCS = projects.map((p, i) => {
  const span = 360 / projects.length;
  const a0 = ((i * span + GAP / 2) * Math.PI) / 180;
  const a1 = (((i + 1) * span - GAP / 2) * Math.PI) / 180;
  const pt = (a: number) => `${(CX + R * Math.cos(a)).toFixed(2)} ${(CY + R * Math.sin(a)).toFixed(2)}`;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return { d: `M${pt(a0)} A${R} ${R} 0 ${large} 1 ${pt(a1)}`, live: !!p.demo, code: p.code };
});

function Panel({
  className,
  panelRef,
  children,
}: {
  className: string;
  panelRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  return (
    <div
      ref={panelRef}
      className={`ia-panel absolute rounded-lg border border-cyan/25 bg-surface/70 p-3.5 shadow-[0_0_28px_-10px_rgba(34,211,238,0.45)] backdrop-blur-sm ${className}`}
    >
      <span aria-hidden className="absolute right-2.5 top-2.5 h-2.5 w-2.5 border-r border-t border-cyan/50" />
      <span aria-hidden className="absolute bottom-2.5 left-2.5 h-2.5 w-2.5 border-b border-l border-cyan/50" />
      {children}
    </div>
  );
}

function PanelHead({ label, code, live }: { label: string; code: string; live?: boolean }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <span className="mono text-[9px] tracking-[0.25em] text-text-muted">{label}</span>
      <span className="mono flex items-center gap-1 rounded border border-cyan/30 px-1.5 text-[8px] tracking-widest text-cyan/90">
        {live && <span className="h-1 w-1 animate-pulse rounded-full bg-gold" />}
        {code}
      </span>
    </div>
  );
}

/** Odometer: tween a plain object and write the rounded value into the node. */
function countUp(el: HTMLElement | null, to: number, duration: number, delay: number) {
  if (!el) return null;
  const o = { v: 0 };
  el.textContent = "0";
  return animate(o, {
    v: to,
    duration,
    delay,
    ease: "outExpo",
    onUpdate: () => {
      el.textContent = String(Math.round(o.v));
    },
    onComplete: () => {
      el.textContent = String(to);
    },
  });
}

export default function HeroHud() {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const builtNum = useRef<HTMLSpanElement>(null);
  const liveNum = useRef<HTMLSpanElement>(null);
  const pathL = useRef<SVGPathElement>(null);
  const pathR = useRef<SVGPathElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = document.getElementById("top");
    if (!root || !track) return;

    /* ── Conduit geometry: panel edge → reactor rim, in root-local px ── */
    const layout = () => {
      const rr = root.getBoundingClientRect();
      const anchor = anchorRef.current?.getBoundingClientRect();
      const l = leftRef.current?.getBoundingClientRect();
      const r = rightRef.current?.getBoundingClientRect();
      if (!rr.width || !anchor || !l || !r) return;
      const ax = anchor.left - rr.left;
      const ay = anchor.top - rr.top;
      const rim = Math.min(rr.height * 0.24, rr.width * 0.16);
      const curve = (sx: number, sy: number, ex: number) => {
        const dx = ex - sx;
        return `M${sx.toFixed(1)} ${sy.toFixed(1)} C${(sx + dx * 0.55).toFixed(1)} ${sy.toFixed(1)} ${(ex - dx * 0.25).toFixed(1)} ${ay.toFixed(1)} ${ex.toFixed(1)} ${ay.toFixed(1)}`;
      };
      pathL.current?.setAttribute("d", curve(l.right - rr.left, l.top - rr.top + l.height / 2, ax - rim));
      pathR.current?.setAttribute("d", curve(r.left - rr.left, r.top - rr.top + r.height / 2, ax + rim));
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(root);

    if (reduced) return () => ro.disconnect();

    /* ── Journey — built on entering segment C, reverted on leaving ──── */
    let live: { revert: () => unknown }[] = [];
    const stop = () => {
      live.forEach((a) => a.revert());
      live = [];
    };
    const q = (sel: string) => root.querySelectorAll<SVGElement | HTMLElement>(sel);

    const play = () => {
      stop();
      layout();
      const add = (a: { revert: () => unknown } | null) => a && live.push(a);

      add(countUp(builtNum.current, BUILT, 1400, 150));
      add(countUp(liveNum.current, DEPLOYED, 1100, 500));

      // MK tags light up one by one…
      add(
        animate(q(".hud-tag"), {
          opacity: [0, 1],
          translateY: [10, 0],
          scale: [0.7, 1],
          delay: stagger(85, { start: 250 }),
          duration: 900,
          ease: createSpring({ stiffness: 160, damping: 11 }),
        }),
      );
      // …then a scanner sweep passes over them, on a loop.
      add(
        animate(q(".hud-tag"), {
          scale: [1, 1.12, 1],
          filter: ["brightness(1)", "brightness(1.9)", "brightness(1)"],
          delay: stagger(110, { start: 1700 }),
          duration: 650,
          ease: "inOutSine",
          loop: true,
          loopDelay: 2400,
        }),
      );

      // Ring: arcs draw in sequence, then the gold arc sonar-pings.
      add(
        animate(q(".hud-arc"), {
          strokeDashoffset: [1, 0],
          delay: stagger(120, { start: 400 }),
          duration: 700,
          ease: "outCubic",
        }),
      );
      add(
        animate(q(".hud-ping"), {
          scale: [1, 2.3],
          opacity: [0.7, 0],
          duration: 1900,
          delay: 1300,
          ease: "outQuad",
          loop: true,
        }),
      );
      add(
        animate(q(".hud-ring-dash"), {
          rotate: [0, -360],
          duration: 36000,
          ease: "linear",
          loop: true,
        }),
      );

      // Conduits draw from the panel to the reactor, then packets travel.
      add(
        animate(q(".hud-wire"), {
          strokeDashoffset: [1, 0],
          delay: stagger(220, { start: 600 }),
          duration: 1300,
          ease: "inOutQuad",
        }),
      );
      add(
        animate(q(".hud-node"), {
          scale: [0, 1],
          opacity: [0, 1],
          delay: stagger(220, { start: 1600 }),
          duration: 600,
          ease: createSpring({ stiffness: 200, damping: 9 }),
        }),
      );
      [pathL.current, pathR.current].forEach((p, i) => {
        const dot = root.querySelector<SVGElement>(i === 0 ? ".hud-packet-l" : ".hud-packet-r");
        if (!p || !dot) return;
        add(
          animate(dot, {
            ...svg.createMotionPath(p),
            opacity: [0, 1, 1, 0],
            duration: 2600,
            delay: 2000 + i * 900,
            ease: "inOutSine",
            loop: true,
            loopDelay: 900,
          }),
        );
      });
    };

    const sync = () => {
      if (track.dataset.seg === "c") play();
      else stop();
    };
    let last = track.dataset.seg;
    const mo = new MutationObserver(() => {
      if (track.dataset.seg !== last) {
        last = track.dataset.seg;
        sync();
      }
    });
    mo.observe(track, { attributes: true, attributeFilter: ["data-seg"] });
    sync();

    return () => {
      mo.disconnect();
      ro.disconnect();
      stop();
    };
  }, [reduced]);

  return (
    <div ref={rootRef} className="absolute inset-0">
      {/* Conduits — d is filled in from the measured panel/reactor positions */}
      <svg aria-hidden className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <linearGradient id="hud-wire-l" x1="0" x2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="hud-wire-r" x1="0" x2="1">
            <stop offset="0%" stopColor="#ffb23e" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffb23e" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <path ref={pathL} className="hud-wire" pathLength={1} fill="none" stroke="url(#hud-wire-l)" strokeWidth="1.2" style={{ strokeDasharray: 1 }} />
        <path ref={pathR} className="hud-wire" pathLength={1} fill="none" stroke="url(#hud-wire-r)" strokeWidth="1.2" style={{ strokeDasharray: 1 }} />
        <circle className="hud-packet-l" r="3" fill="#7de7f5" style={{ filter: "drop-shadow(0 0 5px #22d3ee)", opacity: 0 }} />
        <circle className="hud-packet-r" r="3" fill="#ffb23e" style={{ filter: "drop-shadow(0 0 5px #ffb23e)", opacity: 0 }} />
      </svg>
      <div ref={anchorRef} className="absolute left-1/2 top-[34%] h-0 w-0" />

      {/* ── Left — build log ────────────────────────────────────────── */}
      <Panel panelRef={leftRef} className="left-8 top-1/2 w-[250px] -translate-y-1/2">
        <PanelHead label="PROJECTS BUILT" code="BUILD LOG" />
        <div className="flex items-end gap-3">
          <span ref={builtNum} className="mono text-5xl font-bold leading-none text-cyan glow-cyan">
            {BUILT}
          </span>
          <span className="mono mb-0.5 text-[9px] leading-tight tracking-[0.2em] text-text-dim">
            AND
            <br />
            GROWING
          </span>
        </div>
        <ul className="mt-3.5 grid grid-cols-3 gap-1.5">
          {projects.map((p) => (
            <li
              key={p.id}
              className={`hud-tag mono rounded border px-1 py-1 text-center text-[9px] tracking-[0.15em] ${
                p.demo
                  ? "border-gold/50 bg-gold/10 text-gold"
                  : "border-cyan/30 bg-cyan/[0.07] text-cyan"
              }`}
            >
              {p.code}
            </li>
          ))}
        </ul>
      </Panel>

      {/* ── Right — deployed ring ───────────────────────────────────── */}
      <Panel panelRef={rightRef} className="right-8 top-1/2 w-[250px] -translate-y-1/2">
        <PanelHead label="DEPLOYED ONLINE" code="LIVE" live />
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0">
            <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90">
              <g className="hud-ring-dash" style={{ transformOrigin: "40px 40px" }}>
                <circle cx={CX} cy={CY} r="38" fill="none" stroke="#22d3ee" strokeOpacity="0.3" strokeWidth="0.8" strokeDasharray="1.5 5" />
              </g>
              {ARCS.map((a) => (
                <path
                  key={a.code}
                  className="hud-arc"
                  d={a.d}
                  pathLength={1}
                  fill="none"
                  stroke={a.live ? "#ffb23e" : "#22d3ee"}
                  strokeOpacity={a.live ? 1 : 0.6}
                  strokeWidth={a.live ? 4 : 3}
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: 1,
                    filter: a.live ? "drop-shadow(0 0 4px rgba(255,178,62,0.9))" : undefined,
                  }}
                />
              ))}
              {ARCS.filter((a) => a.live).map((a) => (
                <path
                  key={`ping-${a.code}`}
                  className="hud-ping"
                  d={a.d}
                  fill="none"
                  stroke="#ffb23e"
                  strokeWidth="3"
                  strokeLinecap="round"
                  style={{ transformOrigin: "40px 40px", opacity: 0 }}
                />
              ))}
            </svg>
            <span
              ref={liveNum}
              className="mono absolute inset-0 flex items-center justify-center text-3xl font-bold text-gold glow-gold"
            >
              {DEPLOYED}
            </span>
          </div>
          <div className="mono min-w-0 text-[9px] leading-relaxed tracking-[0.18em] text-text-dim">
            <p className="text-text-muted">ON AZURE</p>
            <p>RSNA</p>
            <p>PNEUMONIA</p>
          </div>
        </div>
      </Panel>

      {/* Rim nodes — where the conduits dock on the reactor */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <RimNode pathRef={pathL} color="#22d3ee" />
        <RimNode pathRef={pathR} color="#ffb23e" />
      </svg>
    </div>
  );
}

/** A dock marker at the end of a conduit; positioned after layout() writes d. */
function RimNode({ pathRef, color }: { pathRef: RefObject<SVGPathElement | null>; color: string }) {
  const ref = useRef<SVGGElement>(null);
  useEffect(() => {
    const p = pathRef.current;
    const g = ref.current;
    if (!p || !g) return;
    const place = () => {
      const len = p.getTotalLength?.();
      if (!len) return;
      const pt = p.getPointAtLength(len);
      g.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
    };
    place();
    const mo = new MutationObserver(place);
    mo.observe(p, { attributes: true, attributeFilter: ["d"] });
    return () => mo.disconnect();
  }, [pathRef]);
  return (
    <g ref={ref}>
      <g className="hud-node" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <circle r="5" fill="none" stroke={color} strokeOpacity="0.6" />
        <circle r="2" fill={color} />
      </g>
    </g>
  );
}
