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
// Mark III-style faceplate: forehead tab, brow, cheekbone notch, squared jaw.
const FACEPLATE =
  "M200 88 L226 92 L234 128 C262 132 288 144 300 162 L302 216 C301 246 296 270 288 288 L270 318 L276 352 C270 376 256 396 240 408 L160 408 C144 396 130 376 124 352 L130 318 L112 288 C104 270 99 246 98 216 L100 162 C112 144 138 132 166 128 L174 92 Z";
const CHIN = "M160 408 L240 408 L246 436 C230 448 170 448 154 436 Z";

/* Right-half plates; the left half is the same list under MIRROR. */
const SIDE_PLATES = [
  { d: "M200 40 C262 40 310 72 326 132 L300 162 C288 144 262 132 234 128 L226 92 L200 88 Z", from: [70, -90, 22] }, // crown
  { d: "M300 162 C314 172 326 192 330 216 L326 290 L318 340 C312 360 302 378 292 392 L276 352 L270 318 L288 288 C296 270 301 246 302 216 Z", from: [140, 10, -18] }, // cheek
  { d: "M276 352 L292 392 C282 406 264 424 246 436 L240 408 C256 396 270 376 276 352 Z", from: [90, 110, 28] }, // jaw
];
// Panel seams cut into the metal (dark), right half.
const SIDE_SEAMS = [
  "M246 224 L266 292 L252 330", // faceplate cheek line
  "M312 230 L318 300", // cheek plate vent
  "M248 404 L266 376", // jaw seam
];
const EYE = "M218 196 L282 184 L276 206 L226 212 Z";

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
        // 2b — the under-shell materialises over the blueprint
        .add(q(".hm-base"), { opacity: [0, 1], duration: 700, ease: "inOutSine" }, 650)
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
        .add(q(".hm-shine"), { opacity: [0, 1], translateX: [-30, 0], duration: 900, ease: "outQuad" }, 2000)
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
  const SEAM = "#1a0305";

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
          fill="url(#hm-red)"
          stroke={SEAM}
          strokeWidth="2"
          strokeLinejoin="round"
          filter="url(#hm-bevel)"
          style={plate}
        />
      ))}
      {/* ear disc */}
      <g className="hm-plate" data-x={60} data-y={0} data-r={90} style={plate}>
        <circle cx="330" cy="238" r="19" fill="url(#hm-red)" stroke={SEAM} strokeWidth="2" filter="url(#hm-bevel)" />
        <circle cx="330" cy="238" r="10" fill="#5a0609" stroke="#e0434a" strokeOpacity="0.5" />
        <circle cx="326" cy="233" r="3" fill="#fff" fillOpacity="0.35" />
      </g>
    </>
  );
  const faceSeams = (
    <>
      {SIDE_SEAMS.map((d, i) => (
        <path key={i} className="hm-trace" d={d} pathLength={1} fill="none" stroke={SEAM} strokeOpacity="0.75" strokeWidth="1.6" strokeLinecap="round" style={{ strokeDasharray: 1 }} />
      ))}
    </>
  );
  const eyeGlow = { filter: "drop-shadow(0 0 4px #ffffff) drop-shadow(0 0 10px #9ff3ff) drop-shadow(0 0 22px #22d3ee)" };

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
        {/* halo — cool projector light behind, warm bounce under the chin */}
        <div className="absolute inset-[-20%] rounded-full bg-[radial-gradient(closest-side,rgba(34,211,238,0.16),transparent)]" />
        <div className="absolute inset-x-[10%] bottom-[-8%] h-[30%] rounded-full bg-[radial-gradient(closest-side,rgba(255,120,60,0.18),transparent)]" />

        <svg viewBox="0 0 400 480" className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            {/* candy-red lacquer: hot highlight top-left falling to oxblood */}
            <linearGradient id="hm-red" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ee4034" />
              <stop offset="30%" stopColor="#c8121b" />
              <stop offset="70%" stopColor="#820910" />
              <stop offset="100%" stopColor="#3e0306" />
            </linearGradient>
            <radialGradient id="hm-red-base" cx="42%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#a5121b" />
              <stop offset="100%" stopColor="#2a0204" />
            </radialGradient>
            {/* polished gold: bright crown, darker mid, reflection band, deep chin */}
            <linearGradient id="hm-gold" x1="0" y1="0" x2="0.25" y2="1">
              <stop offset="0%" stopColor="#ffe08a" />
              <stop offset="16%" stopColor="#e9b44a" />
              <stop offset="40%" stopColor="#c48724" />
              <stop offset="56%" stopColor="#f2c76a" />
              <stop offset="78%" stopColor="#a66816" />
              <stop offset="100%" stopColor="#5a370b" />
            </linearGradient>
            <linearGradient id="hm-beam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CYAN} stopOpacity="0" />
              <stop offset="50%" stopColor={CYAN_HI} stopOpacity="0.9" />
              <stop offset="100%" stopColor={CYAN} stopOpacity="0" />
            </linearGradient>
            <pattern id="hm-grid" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M16 0 L0 0 0 16" fill="none" stroke={CYAN} strokeOpacity="0.08" strokeWidth="0.6" />
            </pattern>
            {/* bevel: lights the blurred alpha as a height map, so every
                plate reads as pressed metal with a lit edge */}
            <filter id="hm-bevel" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur" />
              <feSpecularLighting in="blur" surfaceScale="6" specularConstant="0.6" specularExponent="28" lightingColor="#ffffff" result="spec">
                <fePointLight x="200" y="0" z="300" />
              </feSpecularLighting>
              <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
              <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="0.45" k4="0" />
            </filter>
            <filter id="hm-soft" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
            <clipPath id="hm-clip">
              <path d={SHELL} />
            </clipPath>
          </defs>

          {/* blueprint grid + traced outline — the hologram the metal fills */}
          <path d={SHELL} fill="url(#hm-grid)" />
          <path className="hm-trace" d={SHELL} pathLength={1} fill="none" stroke={CYAN} strokeOpacity="0.9" strokeWidth="1.6" style={{ strokeDasharray: 1, filter: "drop-shadow(0 0 4px rgba(34,211,238,0.6))" }} />

          {/* under-shell: the dark red body the plates dock onto */}
          <path className="hm-base" d={SHELL} fill="url(#hm-red-base)" stroke={SEAM} strokeWidth="2" />

          {/* side plates — right, then mirrored left */}
          <g>{sideHalf}</g>
          <g transform={MIRROR}>{sideHalf}</g>
          {/* crown specular */}
          <ellipse className="hm-shine" cx="150" cy="80" rx="46" ry="16" fill="#fff" fillOpacity="0.35" filter="url(#hm-soft)" transform="rotate(-24 150 80)" />

          {/* faceplate (gold) */}
          <g className="hm-face" style={plate}>
            <path d={FACEPLATE} fill="url(#hm-gold)" stroke="#3b2306" strokeWidth="2" strokeLinejoin="round" filter="url(#hm-bevel)" />
            {/* brow + forehead tab shading */}
            <path d="M174 92 L226 92 L234 128 C222 126 178 126 166 128 Z" fill="#fff6d8" fillOpacity="0.18" />
            <path d="M100 162 C140 150 260 150 300 162" fill="none" stroke="#5a370b" strokeOpacity="0.45" strokeWidth="1.5" />
            {/* centre ridge highlight + cheek reflection */}
            <path d="M200 134 L200 330" stroke="#fffbe8" strokeOpacity="0.35" strokeWidth="2" />
            <ellipse cx="150" cy="268" rx="20" ry="44" fill="#fffbe8" fillOpacity="0.22" filter="url(#hm-soft)" />
            {/* mouth slit + lower vents */}
            <path d="M168 370 L232 370" stroke="#2a1604" strokeWidth="4" strokeLinecap="round" />
            <path d="M176 386 L224 386" stroke="#2a1604" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
            {/* recessed eye sockets so the optics glow out of shadow */}
            <path d="M210 194 L290 178 L282 212 L222 220 Z" fill="#2a1604" fillOpacity="0.8" />
            <path d="M210 194 L290 178 L282 212 L222 220 Z" transform={MIRROR} fill="#2a1604" fillOpacity="0.8" />
            {faceSeams}
            <g transform={MIRROR}>{faceSeams}</g>
          </g>
          {/* seal flash traced over the faceplate edge */}
          <path className="hm-seal" d={FACEPLATE} pathLength={1} fill="none" stroke="#fff4dc" strokeWidth="1.4" style={{ strokeDasharray: 1, opacity: 0.35 }} />

          <g className="hm-chin" style={plate}>
            <path d={CHIN} fill="url(#hm-gold)" stroke="#3b2306" strokeWidth="2" filter="url(#hm-bevel)" />
          </g>

          {/* optics */}
          <path className="hm-eye" d={EYE} fill="#f2feff" style={eyeGlow} />
          <path className="hm-eye" d={EYE} transform={MIRROR} fill="#f2feff" style={eyeGlow} />
          <circle className="hm-flare" cx="200" cy="200" r="40" fill="none" stroke={CYAN_HI} strokeWidth="2" style={{ ...plate, opacity: 0 }} />

          {/* scan beam, clipped to the shell */}
          <g clipPath="url(#hm-clip)">
            <rect className="hm-beam" x="40" y="0" width="320" height="14" fill="url(#hm-beam)" style={{ opacity: 0 }} />
          </g>

          {/* callouts */}
          <g className="hm-callout" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="2.5">
            <path d="M276 196 L320 150 L394 150" fill="none" stroke={CYAN} strokeOpacity="0.6" />
            <text x="326" y="143" fill={CYAN_HI} fillOpacity="0.85">OPTICS</text>
          </g>
          <g className="hm-callout" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="2.5">
            <path d="M130 352 L84 404 L6 404" fill="none" stroke={GOLD} strokeOpacity="0.6" />
            <text x="6" y="397" fill={GOLD} fillOpacity="0.9">FACEPLATE</text>
          </g>
        </svg>

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
