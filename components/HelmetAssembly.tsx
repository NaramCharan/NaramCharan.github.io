"use client";

import { useEffect, useRef } from "react";
import { spring, createTimeline, animate, stagger } from "animejs";

/**
 * Opening "lock-on": a Mark XLII-style helmet rendered as a JARVIS hologram
 * schematic, assembled by anime.js — outline traced, side plates fly in and
 * dock, the faceplate drops shut, the optics ignite.
 *
 * Original line art (not a traced asset). Built symmetric: the right half's
 * plates are authored once and the left half is the same markup inside a
 * mirror transform, so anime's translateX on the right plate visually comes
 * from the left on its twin — one set of from-values, both sides.
 *
 * Markup is the FINAL assembled state (SSR / no-JS / reduced motion all get a
 * complete helmet). The journey replays whenever the hero scroll comes back to
 * segment A, and the whole wrapper keeps the `.ia-reticle` class so the GSAP
 * hero timeline still scales + fades it out as the reactor assembly begins.
 */

const CYAN = "#22d3ee";
const CYAN_HI = "#7de7f5";
const GOLD = "#ffb23e";
const MIRROR = "matrix(-1 0 0 1 400 0)";

/* ── Geometry (viewBox 0 0 400 480) ───────────────────────────────── */
const SHELL =
  "M200 40 C270 40 320 80 330 150 C338 200 336 250 326 290 L318 340 C312 370 296 395 276 410 L240 438 C225 448 175 448 160 438 L124 410 C104 395 88 370 82 340 L74 290 C64 250 62 200 70 150 C80 80 130 40 200 40 Z";
const FACEPLATE =
  "M200 92 L228 96 L236 132 C262 136 286 146 296 162 L298 214 C296 250 290 280 282 300 L262 352 C254 372 240 392 228 404 L172 404 C160 392 146 372 138 352 L118 300 C110 280 104 250 102 214 L104 162 C114 146 138 136 164 132 L172 96 Z";
const CHIN = "M172 404 L228 404 L240 438 C225 448 175 448 160 438 Z";

/* Right-half plates; the left half is the same list under MIRROR. */
const SIDE_PLATES = [
  { d: "M200 40 C262 40 310 72 326 130 L296 162 C286 146 262 136 236 132 L228 96 L200 92 Z", from: [70, -90, 22] }, // crown
  { d: "M296 162 C312 172 324 190 328 214 L326 290 L318 340 C312 362 300 380 286 394 L262 352 L282 300 C290 280 296 250 298 214 Z", from: [140, 10, -18] }, // cheek
  { d: "M262 352 L286 394 C276 404 258 422 240 438 L228 404 C240 392 254 372 262 352 Z", from: [90, 110, 28] }, // jaw
];
const SIDE_LINES = [
  "M248 226 L268 296 L250 336", // cheek seam
  "M236 132 L252 166 L298 176", // brow facet
  "M244 404 L262 372", // jaw seam
  "M250 440 L262 472", // collar
];
const EYE = "M220 196 L280 186 L274 207 L228 212 Z";

export default function HelmetAssembly() {
  const root = useRef<HTMLDivElement>(null);
  const status = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const q = (s: string) => el.querySelectorAll<SVGElement>(s);
    let runs: { revert: () => unknown }[] = [];

    const stop = () => {
      runs.forEach((r) => r.revert());
      runs = [];
    };

    const play = () => {
      stop();
      if (status.current) status.current.textContent = "ASSEMBLING";
      const snap = spring({ stiffness: 120, damping: 11 });

      const tl = createTimeline({ defaults: { ease: "outExpo" } })
        // 1 — scan beam passes over the empty frame
        .add(q(".hm-beam"), { translateY: [-20, 470], opacity: [0, 1, 1, 0], duration: 1100, ease: "inOutSine" }, 0)
        // 2 — blueprint outline + seams trace in
        .add(q(".hm-trace"), { strokeDashoffset: [1, 0], duration: 1300, delay: stagger(45), ease: "inOutQuad" }, 150)
        // 3 — side plates fly in from their from-vectors and dock
        .add(
          q(".hm-plate"),
          {
            translateX: { from: (t?: unknown) => Number((t as SVGElement).dataset.x), to: 0 },
            translateY: { from: (t?: unknown) => Number((t as SVGElement).dataset.y), to: 0 },
            rotate: { from: (t?: unknown) => Number((t as SVGElement).dataset.r), to: 0 },
            scale: [0.55, 1],
            opacity: [0, 1],
            duration: 1100,
            delay: stagger(90),
            ease: snap,
          },
          700,
        )
        // 4 — faceplate drops shut, chin rises to meet it
        .add(q(".hm-face"), { translateY: [-170, 0], opacity: [0, 1], duration: 1000, ease: spring({ stiffness: 140, damping: 9 }) }, 1350)
        .add(q(".hm-chin"), { translateY: [90, 0], opacity: [0, 1], duration: 800, ease: snap }, 1450)
        // 5 — seal flash along the faceplate edge
        .add(q(".hm-seal"), { strokeDashoffset: [1, 0], opacity: [0, 1, 0.5], duration: 700, ease: "inOutSine" }, 2050)
        // 6 — optics ignite with a flicker, flare pops
        .add(q(".hm-eye"), { opacity: [0, 1, 0.2, 1, 0.55, 1], duration: 900, ease: "linear" }, 2350)
        .add(q(".hm-flare"), { scale: [0, 2.6], opacity: [0.85, 0], duration: 900, ease: "outQuad" }, 2500)
        // 7 — callouts tick on
        .add(q(".hm-callout"), { opacity: [0, 1], translateX: { from: (_t, i) => ((i ?? 0) % 2 ? 14 : -14), to: 0 }, duration: 600, delay: stagger(120) }, 2600)
        .call(() => {
          if (status.current) status.current.textContent = "SYSTEMS ONLINE";
        }, 2900);
      runs.push(tl);

      // Idle life once assembled: optics breathe, the beam re-scans.
      runs.push(
        animate(q(".hm-eye"), { opacity: [1, 0.6], duration: 1600, delay: 3400, loop: true, alternate: true, ease: "inOutSine" }),
        animate(q(".hm-beam"), { translateY: [-20, 470], opacity: [0, 0.8, 0.8, 0], duration: 1600, delay: 5200, loop: true, loopDelay: 4200, ease: "inOutSine" }),
      );
    };

    const track = document.getElementById("top");
    let last = track?.dataset.seg ?? "a";
    const mo = new MutationObserver(() => {
      const seg = track?.dataset.seg ?? "a";
      if (seg === last) return;
      if (seg === "a" && last !== "a") play(); // came back up: rebuild it
      last = seg;
    });
    if (track) mo.observe(track, { attributes: true, attributeFilter: ["data-seg"] });
    play();

    return () => {
      mo.disconnect();
      stop();
    };
  }, []);

  const plate = { transformBox: "fill-box", transformOrigin: "center" } as const;

  const sideHalf = (
    <>
      {SIDE_PLATES.map((p, i) => (
        <path
          key={`p${i}`}
          className="hm-plate"
          data-x={p.from[0]}
          data-y={p.from[1]}
          data-r={p.from[2]}
          d={p.d}
          fill="url(#hm-cyan-fill)"
          stroke={CYAN}
          strokeOpacity="0.75"
          strokeWidth="1.2"
          strokeLinejoin="round"
          style={plate}
        />
      ))}
      {SIDE_LINES.map((d, i) => (
        <path key={`l${i}`} className="hm-trace" d={d} pathLength={1} fill="none" stroke={CYAN_HI} strokeOpacity="0.6" strokeWidth="1" style={{ strokeDasharray: 1 }} />
      ))}
      {/* ear disc */}
      <g className="hm-plate" data-x={60} data-y={0} data-r={90} style={plate}>
        <circle cx="328" cy="238" r="17" fill="url(#hm-cyan-fill)" stroke={CYAN} strokeOpacity="0.8" />
        <circle cx="328" cy="238" r="8" fill="none" stroke={CYAN_HI} strokeOpacity="0.7" strokeDasharray="2 3" />
      </g>
    </>
  );

  return (
    <div
      ref={root}
      aria-hidden
      className="ia-reticle pointer-events-none absolute left-1/2 top-[31%] z-[12] -translate-x-1/2 -translate-y-1/2"
    >
      <div
        className="par-layer relative h-[min(40vh,380px)] w-[min(33.3vh,316px)]"
        style={{ "--par-m": 14 } as React.CSSProperties}
      >
        {/* halo */}
        <div className="absolute inset-[-18%] rounded-full bg-[radial-gradient(closest-side,rgba(34,211,238,0.16),transparent)]" />

        <svg viewBox="0 0 400 480" className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <linearGradient id="hm-cyan-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CYAN} stopOpacity="0.16" />
              <stop offset="100%" stopColor={CYAN} stopOpacity="0.03" />
            </linearGradient>
            <linearGradient id="hm-gold-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GOLD} stopOpacity="0.32" />
              <stop offset="100%" stopColor={GOLD} stopOpacity="0.06" />
            </linearGradient>
            <linearGradient id="hm-beam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CYAN} stopOpacity="0" />
              <stop offset="50%" stopColor={CYAN_HI} stopOpacity="0.9" />
              <stop offset="100%" stopColor={CYAN} stopOpacity="0" />
            </linearGradient>
            <pattern id="hm-grid" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M16 0 L0 0 0 16" fill="none" stroke={CYAN} strokeOpacity="0.07" strokeWidth="0.6" />
            </pattern>
            <clipPath id="hm-clip">
              <path d={SHELL} />
            </clipPath>
          </defs>

          {/* blueprint grid inside the shell */}
          <path d={SHELL} fill="url(#hm-grid)" />

          {/* shell outline + centre ridge, traced */}
          <path className="hm-trace" d={SHELL} pathLength={1} fill="none" stroke={CYAN} strokeOpacity="0.9" strokeWidth="1.6" style={{ strokeDasharray: 1, filter: "drop-shadow(0 0 4px rgba(34,211,238,0.6))" }} />
          <path className="hm-trace" d="M200 40 L200 92" pathLength={1} fill="none" stroke={CYAN_HI} strokeOpacity="0.7" style={{ strokeDasharray: 1 }} />

          {/* side plates — right, then mirrored left */}
          <g>{sideHalf}</g>
          <g transform={MIRROR}>{sideHalf}</g>

          {/* faceplate (gold) */}
          <g className="hm-face" style={plate}>
            <path d={FACEPLATE} fill="url(#hm-gold-fill)" stroke={GOLD} strokeOpacity="0.9" strokeWidth="1.4" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 5px rgba(255,178,62,0.45))" }} />
            {/* forehead tab + mouth grille */}
            <path d="M186 106 L214 106 M182 118 L218 118" stroke={GOLD} strokeOpacity="0.55" />
            <path d="M174 362 L226 362 M180 374 L220 374 M186 386 L214 386" stroke={GOLD} strokeOpacity="0.7" strokeLinecap="round" />
          </g>
          {/* seal flash traced over the faceplate edge */}
          <path className="hm-seal" d={FACEPLATE} pathLength={1} fill="none" stroke="#fff4dc" strokeWidth="1.2" style={{ strokeDasharray: 1, opacity: 0.5 }} />

          <g className="hm-chin" style={plate}>
            <path d={CHIN} fill="url(#hm-gold-fill)" stroke={GOLD} strokeOpacity="0.85" strokeWidth="1.2" />
          </g>

          {/* eyes sit above the faceplate */}
          <path className="hm-eye" d={EYE} fill="#e8fdff" style={{ filter: "drop-shadow(0 0 6px #7de7f5) drop-shadow(0 0 14px #22d3ee)" }} />
          <path className="hm-eye" d={EYE} transform={MIRROR} fill="#e8fdff" style={{ filter: "drop-shadow(0 0 6px #7de7f5) drop-shadow(0 0 14px #22d3ee)" }} />
          <circle className="hm-flare" cx="200" cy="200" r="40" fill="none" stroke={CYAN_HI} strokeWidth="2" style={{ ...plate, opacity: 0 }} />

          {/* scan beam, clipped to the shell */}
          <g clipPath="url(#hm-clip)">
            <rect className="hm-beam" x="40" y="0" width="320" height="14" fill="url(#hm-beam)" style={{ opacity: 0 }} />
          </g>

          {/* callouts */}
          <g className="hm-callout" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="2.5">
            <path d="M272 198 L318 150 L392 150" fill="none" stroke={CYAN} strokeOpacity="0.55" />
            <text x="324" y="143" fill={CYAN_HI} fillOpacity="0.85">OPTICS</text>
          </g>
          <g className="hm-callout" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="2.5">
            <path d="M138 352 L84 404 L8 404" fill="none" stroke={GOLD} strokeOpacity="0.55" />
            <text x="8" y="397" fill={GOLD} fillOpacity="0.85">FACEPLATE</text>
          </g>
        </svg>

        {/* labels */}
        <span
          ref={status}
          className="mono absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] tracking-[0.35em] text-gold/80"
        >
          SYSTEMS ONLINE
        </span>
      </div>
    </div>
  );
}
