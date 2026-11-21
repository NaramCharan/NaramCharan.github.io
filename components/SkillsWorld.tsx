"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * The Skills "world": a sticky, full-viewport star field + perspective grid
 * floor that sits behind the skill cards.
 *
 * Scroll-LINKED, not time-based: star depth is a pure function of how far the
 * section has scrolled, so when you stop scrolling the world stops too — no
 * idle loop, no CPU at rest. A short rAF only runs while the damped position
 * catches up to the scroll target, and only while the section is on screen.
 * Reduced motion: one static frame, the floor stays still.
 *
 * (A pinned "dive" portal used to precede the cards; it was removed at the
 * user's request, 2026-11.)
 */

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

export default function SkillsBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const world = root?.parentElement;
    const canvas = canvasRef.current;
    if (!root || !world || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const rand = mulberry32(42);
    const stars = Array.from({ length: 700 }, () => {
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
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    let progress = 0; // section scroll progress, 0..1
    let travel = 0;
    let visible = false;
    let raf = 0;

    const draw = () => {
      const cx = w / 2;
      const cy = h / 2;
      const f = Math.min(w, h) * 0.55;
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      for (const s of stars) {
        let z = (s.z - travel) % 1;
        if (z < 0) z += 1;
        if (z < 0.015) continue;
        const sx = cx + (s.x / z) * f;
        const sy = cy + (s.y / z) * f;
        if (sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20) continue;
        const zt = Math.min(1, z + 0.012);
        const near = 1 - z;
        ctx.strokeStyle = s.gold
          ? `rgba(255,190,90,${Math.pow(near, 1.4) * 0.9})`
          : `rgba(150,236,250,${Math.pow(near, 1.4) * 0.9})`;
        ctx.lineWidth = s.size * (0.4 + near * 1.6);
        ctx.beginPath();
        ctx.moveTo(cx + (s.x / zt) * f, cy + (s.y / zt) * f);
        ctx.lineTo(sx + 0.01, sy);
        ctx.stroke();
      }
    };

    const tick = () => {
      raf = 0;
      const target = progress * 1.6;
      travel += (target - travel) * 0.14;
      if (Math.abs(target - travel) < 0.0004) travel = target;
      draw();
      if (travel !== target && visible) raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!reduced && !raf && visible) raf = requestAnimationFrame(tick);
    };

    const st = ScrollTrigger.create({
      trigger: world,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        progress = self.progress;
        world.style.setProperty("--sw-s", progress.toFixed(4));
        kick();
      },
    });
    progress = st.progress;
    travel = progress * 1.6;

    resize();
    draw();
    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      kick();
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      st.kill();
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none sticky top-0 -mb-[100dvh] h-dvh overflow-hidden"
    >
      <div className="sw-nebula absolute inset-0" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* perspective grid floor — rolls toward you as you scroll */}
      <div className="sw-floor absolute inset-x-[-50%] bottom-0 h-[55%]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(3,6,12,0.85)_100%)]" />
    </div>
  );
}
