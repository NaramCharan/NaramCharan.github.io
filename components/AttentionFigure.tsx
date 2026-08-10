"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { animate } from "animejs";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * Interactive self-attention — the mechanism behind every transformer, made
 * pokeable. Pick a query token, switch heads, watch where the weight goes.
 *
 * WHAT IS ACTUALLY REAL HERE (this matters — see the on-screen disclaimer):
 * the weights come from a genuine softmax over a fixed score matrix, computed
 * in the browser. Every row really does sum to 1.00 (the Σw readout is a live
 * check, not a label) and each head produces a genuinely different
 * distribution. What is NOT real: the scores are hand-authored so each head
 * demonstrates a recognisable routing pattern. No model runs on this page.
 *
 * anime.js drives the edge/bar transitions; framer-motion only gates the
 * first paint on viewport entry, matching the rest of the site.
 */

const TOKENS = ["THE", "MODEL", "LEARNS", "FROM", "CONTEXT"] as const;
const HEAD_NAMES = ["LOCAL", "PREVIOUS TOKEN", "CONTENT", "BROAD"] as const;
const N = TOKENS.length;

/** Fixed pre-softmax logits. Each head encodes a different routing behaviour. */
function logits(head: number, i: number, j: number): number {
  switch (head % 4) {
    case 0: // local — attends to itself and its immediate neighbours
      return -Math.abs(i - j) * 1.6 + (i === j ? 1.2 : 0);
    case 1: // previous-token — the classic induction-style offset
      return j === i - 1 ? 2.4 : -Math.abs(i - j) * 0.9;
    case 2: // content — routes to the final, most semantic token
      return j === N - 1 ? 2.2 : j === 0 ? 0.6 : -0.4;
    default: // broad — near-uniform mixing
      return Math.cos((i + 1) * (j + 1) * 0.9) * 0.7;
  }
}

/** Real softmax, max-subtracted for numerical stability. Row sums to 1. */
function softmaxRow(head: number, i: number): number[] {
  const raw = Array.from({ length: N }, (_, j) => logits(head, i, j));
  const max = Math.max(...raw);
  const exp = raw.map((v) => Math.exp(v - max));
  const sum = exp.reduce((a, b) => a + b, 0);
  return exp.map((v) => v / sum);
}

const W = 760;
const H = 60 + N * 64;
const QX = 150;
const KX = 600;
const rowY = (i: number) => 46 + (i / (N - 1)) * (H - 92);

export default function AttentionFigure() {
  const reduced = usePrefersReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const inView = useInView(wrapRef, { margin: "-100px" });

  const [selected, setSelected] = useState(0);
  const [head, setHead] = useState(0);
  const [touched, setTouched] = useState(false);

  const weights = useMemo(() => softmaxRow(head, selected), [head, selected]);
  const sum = weights.reduce((a, b) => a + b, 0);

  /* Curve geometry never changes — compute it once. */
  const paths = useMemo(() => {
    const mid = (QX + KX) / 2;
    return Array.from({ length: N }, (_, i) =>
      Array.from(
        { length: N },
        (_, j) =>
          `M ${QX + 18} ${rowY(i)} C ${mid} ${rowY(i)}, ${mid} ${rowY(j)}, ${KX - 10} ${rowY(j)}`
      )
    );
  }, []);

  /* anime.js retargets the edges + bars whenever (token, head) changes. */
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const edges = svg.querySelectorAll<SVGPathElement>(".af-edge");
    const bars = svg.querySelectorAll<SVGRectElement>(".af-bar");
    const q = svg.querySelector<SVGGElement>(".af-q");

    if (reduced) {
      edges.forEach((el, j) => {
        el.style.opacity = String(0.08 + weights[j] * 0.92);
        el.style.strokeWidth = String(0.6 + weights[j] * 5.4);
      });
      bars.forEach((el, j) => el.setAttribute("width", String(weights[j] * 106)));
      if (q) q.style.transform = `translateY(${rowY(selected)}px)`;
      return;
    }

    // The query marker group carries no transform attribute — its children use
    // cx/cy — so animating translateY here is safe (no attribute clobbering).
    if (q) animate(q, { translateY: rowY(selected), duration: 420, ease: "out(3)" });

    edges.forEach((el, j) => {
      // Opacity AND thickness both track the weight, so a strong edge still
      // reads as strong where subtle alpha differences wash out.
      animate(el, {
        opacity: 0.08 + weights[j] * 0.92,
        strokeWidth: 0.6 + weights[j] * 5.4,
        duration: 480,
        delay: j * 30,
        ease: "out(2)",
      });
    });

    bars.forEach((el, j) => {
      animate(el, {
        width: weights[j] * 106,
        duration: 520,
        delay: j * 30,
        ease: "out(3)",
      });
    });
  }, [weights, selected, reduced]);

  /* Demonstrate itself while on screen — stops for good on first interaction. */
  useEffect(() => {
    if (!inView || touched || reduced) return;
    const id = window.setInterval(() => setSelected((s) => (s + 1) % N), 2800);
    return () => window.clearInterval(id);
  }, [inView, touched, reduced]);

  const pick = useCallback((i: number) => {
    setTouched(true);
    setSelected(((i % N) + N) % N);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      pick(selected + 1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      pick(selected - 1);
    }
  };

  return (
    <div
      ref={wrapRef}
      className="overflow-hidden rounded-xl border border-line bg-surface/50"
    >
      {/* readout + head selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="mono flex flex-wrap gap-x-5 gap-y-1 text-[10px] tracking-[0.2em] text-text-dim">
          <span>
            QUERY <b className="font-normal text-text">{TOKENS[selected]}</b>
          </span>
          <span>
            HEAD <b className="font-normal text-text">{HEAD_NAMES[head]}</b>
          </span>
          <span>
            Σw <b className="font-normal text-cyan">{sum.toFixed(2)}</b>
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {HEAD_NAMES.map((_, h) => (
            <button
              key={h}
              type="button"
              onClick={() => {
                setTouched(true);
                setHead(h);
              }}
              aria-pressed={h === head}
              className={`mono rounded border px-2 py-1 text-[10px] tracking-[0.14em] transition-all duration-200 ${
                h === head
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-line text-text-dim hover:border-cyan/50 hover:text-text"
              }`}
            >
              HEAD {String(h + 1).padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[190px_minmax(0,1fr)]">
        {/* query tokens */}
        <div
          role="tablist"
          aria-label="Query tokens"
          onKeyDown={onKeyDown}
          className="flex gap-1.5 overflow-x-auto border-b border-line p-3 md:flex-col md:overflow-visible md:border-b-0 md:border-r"
        >
          {TOKENS.map((t, i) => {
            const on = i === selected;
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={on}
                tabIndex={on ? 0 : -1}
                onClick={() => pick(i)}
                onPointerEnter={(e) => e.pointerType !== "touch" && pick(i)}
                className={`mono flex shrink-0 items-center gap-2 rounded border px-2.5 py-2.5 text-xs tracking-[0.1em] transition-all duration-200 md:min-h-0 ${
                  on
                    ? "border-cyan bg-cyan/10 text-text"
                    : "border-transparent text-text-muted hover:border-line hover:text-text"
                }`}
              >
                <span
                  className={`rounded border px-1 text-[9px] ${
                    on ? "border-cyan text-cyan" : "border-line text-text-dim"
                  }`}
                >
                  Q
                </span>
                <span className="flex-1 text-left">{t}</span>
                <span className="hidden text-[9px] text-text-dim md:inline">{i}</span>
              </button>
            );
          })}
        </div>

        {/* the diagram */}
        <div className="min-w-0 p-2">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="block h-auto w-full overflow-visible"
            role="img"
            aria-label={`Attention weights from query token ${TOKENS[selected]} to every key token, head ${HEAD_NAMES[head]}. Edge thickness and opacity encode the softmax weight.`}
          >
            {TOKENS.map((_, j) => (
              <path
                key={j}
                className="af-edge"
                d={paths[selected][j]}
                fill="none"
                stroke="var(--color-gold)"
                strokeLinecap="round"
                style={{ opacity: 0, strokeWidth: 0.6 }}
              />
            ))}

            {TOKENS.map((t, j) => {
              const strong = weights[j] > 0.28;
              return (
                <g key={t} transform={`translate(${KX} ${rowY(j)})`}>
                  <rect
                    x="-8"
                    y="-16"
                    width="158"
                    height="32"
                    rx="3"
                    fill={strong ? "rgba(255,178,62,0.08)" : "transparent"}
                    stroke={strong ? "var(--color-gold)" : "var(--color-line)"}
                    className="transition-all duration-300"
                  />
                  <text
                    x="4"
                    y="5"
                    className="mono transition-colors duration-300"
                    fontSize="11"
                    fill={strong ? "var(--color-gold)" : "var(--color-text-dim)"}
                  >
                    K
                  </text>
                  <text
                    x="26"
                    y="5"
                    className="mono transition-colors duration-300"
                    fontSize="12"
                    letterSpacing="0.08em"
                    fill={strong ? "var(--color-text)" : "var(--color-text-muted)"}
                  >
                    {t}
                  </text>
                  <rect x="26" y="10" width="106" height="3" rx="1.5" fill="var(--color-line)" />
                  <rect
                    className="af-bar"
                    x="26"
                    y="10"
                    width="0"
                    height="3"
                    rx="1.5"
                    fill="var(--color-gold)"
                  />
                  <text
                    x="142"
                    y="5"
                    textAnchor="end"
                    className="mono transition-colors duration-300"
                    fontSize="10"
                    fill={strong ? "var(--color-gold)" : "var(--color-text-dim)"}
                  >
                    {weights[j].toFixed(2).replace(/^0/, "")}
                  </text>
                </g>
              );
            })}

            <g className="af-q">
              <circle
                cx={QX}
                cy={0}
                r="17"
                fill="none"
                stroke="var(--color-cyan)"
                strokeWidth="1"
                opacity="0.75"
              />
              <circle cx={QX} cy={0} r="5" fill="var(--color-cyan)" />
            </g>
          </svg>
        </div>
      </div>

      {/* The disclaimer is load-bearing. Do not remove it. */}
      <p className="mono border-t border-line px-4 py-3 text-[10px] leading-relaxed tracking-wide text-text-dim">
        <b className="font-normal text-text-muted">CONCEPTUAL VISUALISATION.</b>{" "}
        Weights are computed by a real softmax over a fixed score matrix — each row
        sums to 1.00 and each head routes differently — but the scores are
        illustrative. No model is running on this page.
      </p>
    </div>
  );
}
