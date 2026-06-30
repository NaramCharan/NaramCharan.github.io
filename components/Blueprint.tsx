"use client";

import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * Bespoke art-directed schematic of Naram's neural recommendation engine —
 * custom imagery (not stock) that ties directly to his real project specs.
 * Reads like a Stark blueprint: annotated, technical, drawn-on.
 */
export default function Blueprint() {
  const reduced = usePrefersReducedMotion();

  const draw = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { pathLength: 0, opacity: 0 },
          whileInView: { pathLength: 1, opacity: 1 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 1.2, ease: EASE, delay },
        };

  const node = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { scale: 0, opacity: 0 },
          whileInView: { scale: 1, opacity: 1 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.5, ease: EASE, delay },
        };

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

        <div className="relative rounded-2xl border border-line bg-surface/30 p-4 sm:p-8">
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
              <linearGradient id="bp-core" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#7de7f5" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>

            {/* ── Layer labels ───────────────────────────── */}
            {[
              ["x", 90, "INPUT"],
              ["x", 330, "EMBEDDINGS"],
              ["x", 560, "NEURAL NET"],
              ["x", 800, "FAISS INDEX"],
            ].map(([, cx, label], i) => (
              <text
                key={label}
                x={cx as number}
                y="28"
                textAnchor="middle"
                className="mono"
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
            ].map(([cx, cy, lbl], i) => (
              <g key={lbl as string}>
                <motion.rect
                  {...node(0.1 + i * 0.1)}
                  x={(cx as number) - 46}
                  y={(cy as number) - 22}
                  width="92"
                  height="44"
                  rx="6"
                  fill="#0b1220"
                  stroke="#22d3ee"
                  strokeWidth="1.5"
                  style={{ transformOrigin: "center" }}
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
              <motion.path
                key={`c1-${i}`}
                {...draw(0.3 + i * 0.05)}
                d={`M136 ${y} C 220 ${y}, 240 185, 300 185`}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="1.5"
                strokeOpacity="0.7"
              />
            ))}

            {/* ── Embedding stack ────────────────────────── */}
            {[120, 160, 200, 240].map((y, i) => (
              <motion.rect
                key={`emb-${i}`}
                {...node(0.5 + i * 0.06)}
                x="300"
                y={y - 15}
                width="60"
                height="30"
                rx="4"
                fill="#0f1828"
                stroke="#22d3ee"
                strokeWidth="1"
                strokeOpacity="0.6"
                style={{ transformOrigin: "center" }}
              />
            ))}

            {/* ── Neural net nodes (2 hidden layers) ─────── */}
            {[480, 600].map((cx, li) =>
              [110, 160, 210, 260].map((cy, ni) => (
                <motion.circle
                  key={`nn-${li}-${ni}`}
                  {...node(0.7 + li * 0.12 + ni * 0.04)}
                  cx={cx}
                  cy={cy}
                  r="9"
                  fill="#0b1220"
                  stroke="#7de7f5"
                  strokeWidth="1.5"
                  style={{ transformOrigin: "center" }}
                />
              ))
            )}
            {/* mesh connections between layers */}
            {[110, 160, 210, 260].map((y1) =>
              [110, 160, 210, 260].map((y2, j) => (
                <motion.line
                  key={`mesh-${y1}-${y2}`}
                  {...draw(0.9)}
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
            {[120, 160, 200, 240].map((y1, i) =>
              [110, 160, 210, 260].map((y2) => (
                <motion.line
                  key={`e2n-${y1}-${y2}`}
                  {...draw(0.8)}
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
              <motion.path
                key={`n2f-${y}`}
                {...draw(1)}
                d={`M609 ${y} C 700 ${y}, 720 185, 770 185`}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="1"
                strokeOpacity="0.5"
              />
            ))}
            <motion.circle
              {...node(1.1)}
              cx="800"
              cy="185"
              r="44"
              fill="none"
              stroke="#ffb23e"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              style={{ transformOrigin: "center" }}
            />
            <motion.circle
              {...node(1.2)}
              cx="800"
              cy="185"
              r="26"
              fill="url(#bp-core)"
              style={{
                transformOrigin: "center",
                filter: "drop-shadow(0 0 12px rgba(34,211,238,0.7))",
              }}
            />
            <text
              x="800"
              y="250"
              textAnchor="middle"
              className="mono"
              fill="#ffd089"
              fontSize="11"
              letterSpacing="1"
            >
              kNN · L2
            </text>

            {/* ── Annotation callouts (real specs) ───────── */}
            <motion.g
              initial={reduced ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1.3 }}
            >
              <line x1="360" y1="120" x2="360" y2="70" stroke="#ffb23e" strokeWidth="0.75" />
              <circle cx="360" cy="70" r="2" fill="#ffb23e" />
              <text x="368" y="74" className="mono" fill="#ffd089" fontSize="11">
                32-DIM VECTORS
              </text>

              <line x1="800" y1="141" x2="800" y2="100" stroke="#ffb23e" strokeWidth="0.75" />
              <circle cx="800" cy="100" r="2" fill="#ffb23e" />
              <text x="800" y="92" textAnchor="middle" className="mono" fill="#ffd089" fontSize="11">
                &lt;10ms RETRIEVAL
              </text>
            </motion.g>
          </svg>

          {/* Spec footer */}
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 sm:grid-cols-4">
            {[
              ["FRAMEWORK", "PyTorch"],
              ["EMBEDDING DIM", "32"],
              ["INDEX", "FAISS · L2"],
              ["LATENCY", "< 10 ms"],
            ].map(([k, v], i) => (
              <motion.div key={k} {...(reduced ? {} : { initial: { opacity: 0, y: 10 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: 1.3 + i * 0.08, ease: EASE } })}>
                <p className="mono text-[9px] tracking-[0.2em] text-text-dim">{k}</p>
                <p className="mono text-sm text-cyan">{v}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
