"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Bespoke art-directed schematic of Naram's neural recommendation engine —
 * custom imagery (not stock) that ties directly to his real project specs.
 *
 * The schematic ASSEMBLES UNDER THE SCROLLBAR: one GSAP timeline scrubbed by
 * ScrollTrigger draws the wires, pops the nodes and rolls the FAISS ring into
 * place as the section traverses the viewport — and disassembles in reverse
 * when you scroll back. (GSAP is the scrub driver because framer/anime scroll
 * tracking is unreliable on this page — see CLAUDE.md.) The SVG renders fully
 * assembled in the DOM: SSR/SEO/no-JS safe, and the reduced-motion experience.
 */
export default function Blueprint() {
  const reduced = usePrefersReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || reduced) return;

    const ctx = gsap.context(() => {
      // Wires draw via the dashoffset trick — measure each geometry's length.
      wrap.querySelectorAll<SVGGeometryElement>(".bp-draw").forEach((p) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = `${len}`;
        p.style.strokeDashoffset = `${len}`;
      });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: wrap,
          start: "top 85%",
          end: "center center",
          scrub: 0.6,
        },
      });

      tl.from(".bp-label", { opacity: 0, y: 8, stagger: 0.05, duration: 0.3 }, 0)
        .from(
          ".bp-input",
          { scale: 0, opacity: 0, transformOrigin: "50% 50%", stagger: 0.1, duration: 0.35, ease: "back.out(1.6)" },
          0.1
        )
        .to(".bp-wire-in", { strokeDashoffset: 0, stagger: 0.08, duration: 0.5 }, 0.35)
        .from(
          ".bp-emb",
          { scale: 0, opacity: 0, transformOrigin: "50% 50%", stagger: 0.06, duration: 0.3, ease: "back.out(1.6)" },
          0.6
        )
        .from(".bp-e2n", { opacity: 0, duration: 0.35 }, 0.85)
        .from(
          ".bp-nn",
          { scale: 0, opacity: 0, transformOrigin: "50% 50%", stagger: 0.045, duration: 0.3, ease: "back.out(1.8)" },
          0.95
        )
        .from(".bp-mesh", { opacity: 0, duration: 0.35 }, 1.2)
        .to(".bp-wire-out", { strokeDashoffset: 0, stagger: 0.06, duration: 0.45 }, 1.35)
        .from(
          ".bp-ring",
          { scale: 0, opacity: 0, rotate: -150, transformOrigin: "50% 50%", duration: 0.5, ease: "back.out(1.4)" },
          1.6
        )
        .from(
          ".bp-core",
          { scale: 0, opacity: 0, transformOrigin: "50% 50%", duration: 0.4, ease: "back.out(2)" },
          1.75
        )
        .from(".bp-callout", { opacity: 0, y: 6, stagger: 0.08, duration: 0.3 }, 2.0)
        .from(".bp-flow", { opacity: 0, duration: 0.3 }, 2.15)
        .from(".bp-spec", { opacity: 0, y: 10, stagger: 0.06, duration: 0.3 }, 2.15);
    }, wrap);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      aria-label="Recommendation engine schematic"
      className="relative overflow-hidden border-b border-line py-24"
    >
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mono mb-2 text-[10px] tracking-[0.4em] text-gold">
              SCHEMATIC · DWG-03
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              <span className="glow-cyan">Neural Recommendation Engine</span>
            </h2>
          </div>
          <p className="mono max-w-xs text-xs leading-relaxed text-text-muted">
            Collaborative filtering with FAISS retrieval — built from scratch,
            indexed for real-time inference.
          </p>
        </div>

        <div ref={wrapRef} className="relative rounded-2xl border border-line bg-surface/30 p-4 sm:p-8">
          {/* Blueprint grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(rgba(34,211,238,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.12) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* corner crosshairs */}
          {[
            "left-3 top-3",
            "right-3 top-3",
            "left-3 bottom-3",
            "right-3 bottom-3",
          ].map((p) => (
            <span
              key={p}
              aria-hidden
              className={`absolute ${p} h-3 w-3 border-cyan/50`}
              style={{ borderTopWidth: 1, borderLeftWidth: 1 }}
            />
          ))}

          <svg
            viewBox="0 0 900 360"
            className="relative w-full"
            role="img"
            aria-label="Diagram: user and item embeddings feed a neural network, producing 32-dimensional vectors indexed by FAISS for sub-10ms retrieval."
          >
            <defs>
              <radialGradient id="bp-core" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#7de7f5" />
                <stop offset="100%" stopColor="#22d3ee" />
              </radialGradient>
            </defs>

            {/* ── Layer labels ───────────────────────────── */}
            {[
              [90, "INPUT"],
              [330, "EMBEDDINGS"],
              [560, "NEURAL NET"],
              [800, "FAISS INDEX"],
            ].map(([cx, label]) => (
              <text
                key={label}
                x={cx as number}
                y="28"
                textAnchor="middle"
                className="mono bp-label"
                fill="#a8c6d2"
                fontSize="11"
                letterSpacing="2"
              >
                {label as string}
              </text>
            ))}

            {/* ── Input nodes (user / item) ──────────────── */}
            {[
              [90, 140, "USER"],
              [90, 230, "ITEM"],
            ].map(([cx, cy, lbl]) => (
              <g key={lbl as string} className="bp-input">
                <rect
                  x={(cx as number) - 46}
                  y={(cy as number) - 22}
                  width="92"
                  height="44"
                  rx="6"
                  fill="#0b1220"
                  stroke="#22d3ee"
                  strokeWidth="1.5"
                />
                <text
                  x={cx as number}
                  y={(cy as number) + 4}
                  textAnchor="middle"
                  className="mono"
                  fill="#eaf7fb"
                  fontSize="12"
                >
                  {lbl as string}
                </text>
              </g>
            ))}

            {/* ── Connections: input → embeddings ────────── */}
            {[140, 230].map((y, i) => (
              <path
                key={`c1-${i}`}
                className="bp-draw bp-wire-in"
                d={`M136 ${y} C 220 ${y}, 240 185, 300 185`}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="1.5"
                strokeOpacity="0.7"
              />
            ))}

            {/* ── Embedding stack ────────────────────────── */}
            {[120, 160, 200, 240].map((y, i) => (
              <rect
                key={`emb-${i}`}
                className="bp-emb"
                x="300"
                y={y - 15}
                width="60"
                height="30"
                rx="4"
                fill="#0f1828"
                stroke="#22d3ee"
                strokeWidth="1"
                strokeOpacity="0.6"
              />
            ))}

            {/* ── Neural net nodes (2 hidden layers) ─────── */}
            {[480, 600].map((cx) =>
              [110, 160, 210, 260].map((cy) => (
                <circle
                  key={`nn-${cx}-${cy}`}
                  className="bp-nn"
                  cx={cx}
                  cy={cy}
                  r="9"
                  fill="#0b1220"
                  stroke="#7de7f5"
                  strokeWidth="1.5"
                />
              ))
            )}
            {/* mesh connections between layers */}
            {[110, 160, 210, 260].map((y1) =>
              [110, 160, 210, 260].map((y2) => (
                <line
                  key={`mesh-${y1}-${y2}`}
                  className="bp-mesh"
                  x1="489"
                  y1={y1}
                  x2="591"
                  y2={y2}
                  stroke="#22d3ee"
                  strokeWidth="0.6"
                  strokeOpacity="0.25"
                />
              ))
            )}
            {/* embedding → first nn layer */}
            {[120, 160, 200, 240].map((y1) =>
              [110, 160, 210, 260].map((y2) => (
                <line
                  key={`e2n-${y1}-${y2}`}
                  className="bp-e2n"
                  x1="360"
                  y1={y1}
                  x2="471"
                  y2={y2}
                  stroke="#22d3ee"
                  strokeWidth="0.5"
                  strokeOpacity="0.18"
                />
              ))
            )}

            {/* ── FAISS core ─────────────────────────────── */}
            {[110, 160, 210, 260].map((y) => (
              <path
                key={`n2f-${y}`}
                className="bp-draw bp-wire-out"
                d={`M609 ${y} C 700 ${y}, 720 185, 770 185`}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="1"
                strokeOpacity="0.5"
              />
            ))}
            <circle
              className="bp-ring"
              cx="800"
              cy="185"
              r="44"
              fill="none"
              stroke="#ffb23e"
              strokeWidth="1.5"
              strokeDasharray="4 6"
            />
            <circle
              className="bp-core"
              cx="800"
              cy="185"
              r="26"
              fill="url(#bp-core)"
              style={{ filter: "drop-shadow(0 0 12px rgba(34,211,238,0.7))" }}
            />
            <text
              x="800"
              y="250"
              textAnchor="middle"
              className="mono bp-callout"
              fill="#ffd089"
              fontSize="11"
              letterSpacing="1"
            >
              kNN · L2
            </text>

            {/* ── Data pulses — dashes flow along the pipeline once assembled,
                   so the schematic clearly reads as live, not a still. ── */}
            {!reduced && (
              <g className="bp-flow">
                {[140, 230].map((y) => (
                  <path
                    key={`flow-in-${y}`}
                    className="animate-dash-flow"
                    d={`M136 ${y} C 220 ${y}, 240 185, 300 185`}
                    fill="none"
                    stroke="#7de7f5"
                    strokeWidth="1.6"
                    strokeOpacity="0.85"
                    strokeLinecap="round"
                    strokeDasharray="3 13"
                  />
                ))}
                {[110, 160, 210, 260].map((y) => (
                  <path
                    key={`flow-out-${y}`}
                    className="animate-dash-flow"
                    d={`M609 ${y} C 700 ${y}, 720 185, 770 185`}
                    fill="none"
                    stroke="#7de7f5"
                    strokeWidth="1.4"
                    strokeOpacity="0.7"
                    strokeLinecap="round"
                    strokeDasharray="3 13"
                  />
                ))}
              </g>
            )}

            {/* ── Annotation callouts (real specs) ───────── */}
            <g className="bp-callout">
              <line x1="360" y1="120" x2="360" y2="70" stroke="#ffb23e" strokeWidth="0.75" />
              <circle cx="360" cy="70" r="2" fill="#ffb23e" />
              <text x="368" y="74" className="mono" fill="#ffd089" fontSize="11">
                32-DIM VECTORS
              </text>
            </g>
            <g className="bp-callout">
              <line x1="800" y1="141" x2="800" y2="100" stroke="#ffb23e" strokeWidth="0.75" />
              <circle cx="800" cy="100" r="2" fill="#ffb23e" />
              <text x="800" y="92" textAnchor="middle" className="mono" fill="#ffd089" fontSize="11">
                &lt;10ms RETRIEVAL
              </text>
            </g>
          </svg>

          {/* Spec footer */}
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 sm:grid-cols-4">
            {[
              ["FRAMEWORK", "PyTorch"],
              ["EMBEDDING DIM", "32"],
              ["INDEX", "FAISS · L2"],
              ["LATENCY", "< 10 ms"],
            ].map(([k, v]) => (
              <div key={k} className="bp-spec">
                <p className="mono text-[9px] tracking-[0.2em] text-text-dim">{k}</p>
                <p className="mono text-sm text-cyan">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
