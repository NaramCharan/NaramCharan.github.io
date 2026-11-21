"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * The "dive" into Skills: a scroll-driven warp through a portal into a star
 * world that the skill cards then sit inside.
 *
 * Everything is scroll-LINKED, not time-based: star positions are a pure
 * function of how far you have scrolled, so when you stop scrolling the world
 * stops too — no idle loop, no CPU at rest. A short rAF only runs while the
 * damped position catches up to the scroll target.
 *
 * - `SkillsBackdrop` — sticky, full-viewport canvas starfield + perspective
 *   grid floor behind the WHOLE section (the "world").
 * - `SkillsDive` — the pinned portal stage: HUD rings fly past the camera,
 *   a depth readout counts down, and the title zooms out of the void.
 *
 * Both read the same progress, published on the section as CSS vars and on a
 * shared mutable object (no React re-render per frame). Reduced motion: the
 * dive stage is display:none (CSS, so SSR-safe) and the backdrop draws one
 * static frame.
 */

type WorldState = { dive: number; section: number };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// deterministic PRNG — the star field is identical on every load
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function useSkillsWorld(
  sectionRef: React.RefObject<HTMLElement | null>,
  diveRef: React.RefObject<HTMLElement | null>
) {
  const state = useRef<WorldState>({ dive: 0, section: 0 });
  const listeners = useRef(new Set<() => void>());

  useEffect(() => {
    const section = sectionRef.current;
    const dive = diveRef.current;
    if (!section) return;
    const emit = () => listeners.current.forEach((f) => f());

    const triggers: ScrollTrigger[] = [];
    triggers.push(
      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          state.current.section = self.progress;
          section.style.setProperty("--sw-s", self.progress.toFixed(4));
          emit();
        },
      })
    );
    if (dive && getComputedStyle(dive).display !== "none") {
      triggers.push(
        ScrollTrigger.create({
          trigger: dive,
          start: "top 70%",
          end: "bottom bottom",
          onUpdate: (self) => {
            state.current.dive = self.progress;
            section.style.setProperty("--sw-d", self.progress.toFixed(4));
            emit();
          },
        })
      );
    } else {
      state.current.dive = 1;
      section.style.setProperty("--sw-d", "1");
    }
    emit();
    return () => triggers.forEach((t) => t.kill());
  }, [sectionRef, diveRef]);

  return useMemo(() => ({ state, listeners }), []);
}

type World = ReturnType<typeof useSkillsWorld>;

/* ───────────────────────────── backdrop ───────────────────────────── */

export function SkillsBackdrop({ world }: { world: World }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const rand = mulberry32(42);
    const COUNT = 900;
    const stars = Array.from({ length: COUNT }, () => {
      // spread wider than the screen so the edges are never empty
      const a = rand() * Math.PI * 2;
      const r = 0.04 + Math.sqrt(rand()) * 1.1;
      return {
        x: Math.cos(a) * r,
        y: Math.sin(a) * r,
        z: rand(),
        gold: rand() < 0.08,
        size: 0.6 + rand() * 1.1,
      };
    });

    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // travel: steep through the dive (the warp), a gentle drift after
    const target = () => {
      const { dive, section } = world.state.current;
      return dive * dive * 7 + section * 1.6;
    };
    let travel = target();
    let visible = false;
    let raf = 0;

    const draw = () => {
      const { dive } = world.state.current;
      // warp intensity: builds, peaks mid-dive, eases out as we "arrive"
      const warp = smooth(0.12, 0.5, dive) * (1 - smooth(0.72, 1, dive));
      const cx = w / 2;
      const cy = h / 2;
      const f = Math.min(w, h) * 0.55;
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      const tail = 0.01 + warp * 0.3;
      for (const s of stars) {
        let z = (s.z - travel) % 1;
        if (z < 0) z += 1;
        if (z < 0.015) continue;
        const sx = cx + (s.x / z) * f;
        const sy = cy + (s.y / z) * f;
        if (sx < -50 || sx > w + 50 || sy < -50 || sy > h + 50) continue;
        const zt = Math.min(1, z + tail);
        const tx = cx + (s.x / zt) * f;
        const ty = cy + (s.y / zt) * f;
        const near = 1 - z;
        const alpha = Math.min(1, Math.pow(near, 1.4) * (0.9 + warp * 0.9));
        ctx.strokeStyle = s.gold
          ? `rgba(255,190,90,${alpha})`
          : `rgba(150,236,250,${alpha})`;
        ctx.lineWidth = s.size * (0.4 + near * 1.6);
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(sx + 0.01, sy);
        ctx.stroke();
      }
    };

    const tick = () => {
      raf = 0;
      const t = target();
      travel += (t - travel) * 0.14;
      if (Math.abs(t - travel) < 0.0004) travel = t;
      draw();
      if (travel !== t && visible) raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (reduced) return;
      if (!raf && visible) raf = requestAnimationFrame(tick);
    };

    resize();
    draw();
    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick();
    });
    io.observe(canvas);
    world.listeners.current.add(kick);
    const listeners = world.listeners.current;

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      listeners.delete(kick);
    };
  }, [world]);

  return (
    <div
      aria-hidden
      className="sw-backdrop pointer-events-none sticky top-0 -mb-[100dvh] h-dvh overflow-hidden"
    >
      {/* nebula wash */}
      <div className="sw-nebula absolute inset-0" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* perspective grid floor — rolls toward you as you scroll */}
      <div className="sw-floor absolute inset-x-[-50%] bottom-0 h-[55%]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(3,6,12,0.85)_100%)]" />
    </div>
  );
}

/* ───────────────────────────── portal stage ───────────────────────────── */

const RINGS = 5;

export function SkillsDive({
  world,
  diveRef,
}: {
  world: World;
  diveRef: React.RefObject<HTMLDivElement | null>;
}) {
  const ringRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef = useRef<HTMLDivElement>(null);
  const depthRef = useRef<HTMLSpanElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const d = world.state.current.dive;
      // rings: each one starts as a far speck and flies past the camera
      ringRefs.current.forEach((el, i) => {
        if (!el) return;
        const t = d * 1.6 - i * 0.16; // staggered
        const scale = Math.pow(9, t) * 0.18;
        const op =
          smooth(-0.15, 0.05, t) * (1 - smooth(0.75, 1.05, t)) * 0.9;
        el.style.transform = `translate(-50%,-50%) scale(${scale.toFixed(4)}) rotate(${(i % 2 ? -1 : 1) * d * 90}deg)`;
        el.style.opacity = op.toFixed(3);
      });
      // title: emerges from the void, holds, then we fly through it
      if (titleRef.current) {
        const inT = smooth(0.05, 0.42, d);
        const outT = smooth(0.7, 0.96, d);
        const scale = 0.55 + inT * 0.45 + outT * outT * 4;
        titleRef.current.style.transform = `scale(${scale.toFixed(4)})`;
        titleRef.current.style.opacity = (inT * (1 - outT)).toFixed(3);
        titleRef.current.style.filter = `blur(${((1 - inT) * 8 + outT * 6).toFixed(2)}px)`;
      }
      if (eyebrowRef.current) {
        eyebrowRef.current.style.opacity = (
          smooth(0.0, 0.2, d) * (1 - smooth(0.6, 0.8, d))
        ).toFixed(3);
      }
      if (depthRef.current) {
        depthRef.current.textContent = String(Math.round(d * 4096)).padStart(4, "0");
      }
    };
    update();
    const listeners = world.listeners.current;
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, [world]);

  return (
    <div ref={diveRef} aria-hidden className="sw-dive relative h-[190vh]">
      <div className="sticky top-0 flex h-dvh items-center justify-center overflow-hidden">
        {/* portal core glow — opens as you approach */}
        <div className="sw-core absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full" />

        {Array.from({ length: RINGS }, (_, i) => (
          <div
            key={i}
            ref={(el) => {
              ringRefs.current[i] = el;
            }}
            className="absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] opacity-0 will-change-transform"
          >
            <svg viewBox="0 0 200 200" className="h-full w-full" fill="none">
              <circle
                cx="100"
                cy="100"
                r="96"
                stroke={i % 2 ? "#ffb23e" : "#22d3ee"}
                strokeOpacity={i % 2 ? 0.55 : 0.75}
                strokeWidth="0.8"
                strokeDasharray={i % 2 ? "2 6" : "28 8 4 8"}
              />
              <circle cx="100" cy="100" r="88" stroke="#22d3ee" strokeOpacity="0.25" strokeWidth="0.4" />
              {Array.from({ length: 12 }, (_, k) => (
                <line
                  key={k}
                  x1="100"
                  y1="2"
                  x2="100"
                  y2={k % 3 === 0 ? 12 : 7}
                  stroke={k % 3 === 0 ? "#ffb23e" : "#7de7f5"}
                  strokeOpacity="0.8"
                  strokeWidth="0.8"
                  transform={`rotate(${k * 30} 100 100)`}
                />
              ))}
            </svg>
          </div>
        ))}

        {/* HUD readouts */}
        <div
          ref={eyebrowRef}
          className="mono absolute left-1/2 top-[18%] -translate-x-1/2 text-center text-[10px] tracking-[0.4em] text-cyan/80 sm:text-xs"
        >
          <div>INITIATING DIVE</div>
          <div className="mt-2 text-gold/90">
            DEPTH <span ref={depthRef}>0000</span> · SKILL SPACE
          </div>
        </div>

        <div ref={titleRef} className="relative px-6 text-center will-change-transform" style={{ opacity: 0 }}>
          <p className="mono mb-4 text-[10px] tracking-[0.5em] text-gold sm:text-xs">
            02 · SUIT SYSTEMS
          </p>
          <p className="sw-title font-display text-5xl font-semibold tracking-tight sm:text-7xl md:text-8xl">
            Enter the Systems
          </p>
          <p className="mono mt-5 text-[10px] tracking-[0.35em] text-cyan/70 sm:text-xs">
            NEURAL · MODELS · SIGNALS · CORE
          </p>
        </div>
      </div>
    </div>
  );
}
