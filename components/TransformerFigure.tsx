"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * The transformer block, drawn correctly and assembled under the scrollbar.
 *
 * WHY THE ORDERING MATTERS — this is the pre-norm residual formulation used by
 * essentially every modern decoder-only LLM:
 *
 *     x = x + Attention(LayerNorm(x))
 *     x = x + FeedForward(LayerNorm(x))
 *
 * So LayerNorm sits INSIDE the residual branch, before the sub-layer — not
 * after the addition. Post-norm (LayerNorm(x + f(x))) was the original 2017
 * arrangement; drawing norm after the add is the single most common error in
 * transformer diagrams. The residual bypasses the whole sub-layer, and the
 * spine runs unbroken from input to output, because that uninterrupted
 * gradient path is precisely why deep stacks train at all.
 *
 * Follows the Blueprint.tsx pattern: GSAP ScrollTrigger scrubs the assembly
 * (reversible), and the SVG renders fully assembled in the DOM so SSR, no-JS
 * and reduced-motion all get the finished diagram.
 */

const W = 520;
const H = 620;
const BX = 130;
const BW = 260;

const ROWS = [
  { y: 158, label: "LAYER NORM", kind: "norm" },
  { y: 208, label: "MULTI-HEAD SELF-ATTENTION", kind: "attn" },
  { y: 262, label: "+  RESIDUAL", kind: "res" },
  { y: 330, label: "LAYER NORM", kind: "norm" },
  { y: 380, label: "FEED FORWARD", kind: "mlp" },
  { y: 434, label: "+  RESIDUAL", kind: "res" },
] as const;

const CAPS = [
  { y: 46, label: "TOKENS", out: false },
  { y: 100, label: "EMBEDDING + POSITION", out: false },
  { y: 500, label: "LOGITS", out: true },
  { y: 560, label: "NEXT-TOKEN DISTRIBUTION", out: true },
] as const;

const rowStroke = (k: string) =>
  k === "attn" ? "var(--color-gold)" : k === "mlp" ? "var(--color-cyan)" : "var(--color-line)";
const rowFill = (k: string) =>
  k === "attn"
    ? "rgba(255,178,62,0.08)"
    : k === "mlp"
    ? "rgba(34,211,238,0.07)"
    : k === "res"
    ? "transparent"
    : "var(--color-surface)";
const rowText = (k: string) =>
  k === "attn"
    ? "var(--color-gold)"
    : k === "mlp"
    ? "var(--color-cyan)"
    : "var(--color-text-dim)";

export default function TransformerFigure() {
  const reduced = usePrefersReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || reduced) return;

    const ctx = gsap.context(() => {
      // Wires draw via the dashoffset trick — same as Blueprint.
      wrap.querySelectorAll<SVGGeometryElement>(".tf-draw").forEach((p) => {
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

      tl.to(".tf-draw", { strokeDashoffset: 0, stagger: 0.12, duration: 0.5 }, 0)
        .from(".tf-block", { opacity: 0, scaleY: 0.86, transformOrigin: "50% 50%", duration: 0.4 }, 0.1)
        .from(".tf-cap", { opacity: 0, y: -10, stagger: 0.06, duration: 0.3 }, 0.15)
        .from(".tf-row", { opacity: 0, x: -14, stagger: 0.07, duration: 0.3 }, 0.25);

      // Activation travelling the residual spine, only while in view.
      const spine = wrap.querySelector<SVGPathElement>(".tf-spine");
      const packet = wrap.querySelector<SVGCircleElement>(".tf-packet");
      if (spine && packet) {
        const len = spine.getTotalLength();
        const proxy = { t: 0 };
        const flow = gsap.to(proxy, {
          t: 1,
          duration: 2.8,
          repeat: -1,
          ease: "sine.inOut",
          paused: true,
          onUpdate: () => {
            const pt = spine.getPointAtLength(proxy.t * len);
            packet.setAttribute("cx", String(pt.x));
            packet.setAttribute("cy", String(pt.y));
            packet.style.opacity =
              proxy.t < 0.06
                ? String(proxy.t / 0.06)
                : proxy.t > 0.94
                ? String((1 - proxy.t) / 0.06)
                : "1";
          },
        });
        ScrollTrigger.create({
          trigger: wrap,
          start: "top 90%",
          end: "bottom 10%",
          onEnter: () => flow.play(),
          onLeave: () => flow.pause(),
          onEnterBack: () => flow.play(),
          onLeaveBack: () => flow.pause(),
        });
      }
    }, wrap);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={wrapRef} className="overflow-hidden rounded-xl border border-line bg-surface/50">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <span className="mono text-[10px] tracking-[0.2em] text-text-dim">
          PRE-NORM RESIDUAL BLOCK
        </span>
        <span className="mono text-[10px] tracking-[0.14em] text-cyan/80">
          x = x + f(norm(x))
        </span>
      </div>

      <div className="grid place-items-center px-3 py-6">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full max-w-[460px] overflow-visible"
          role="img"
          aria-label="A transformer block. Tokens and positional embeddings enter, pass through layer norm, multi-head self-attention and a residual add, then layer norm, feed forward and a second residual add, producing logits and a next-token distribution."
        >
          {/* main spine */}
          <path
            className="tf-draw tf-spine"
            d={`M ${W / 2} 74 L ${W / 2} ${H - 66}`}
            fill="none"
            stroke="var(--color-line)"
            strokeWidth="1.4"
          />
          {/* residual bypasses — they skip AROUND each sub-layer */}
          <path
            className="tf-draw"
            d={`M ${BX - 26} 140 L ${BX - 26} 262`}
            fill="none"
            stroke="var(--color-cyan)"
            strokeWidth="1.4"
            opacity="0.45"
          />
          <path
            className="tf-draw"
            d={`M ${BX - 26} 312 L ${BX - 26} 434`}
            fill="none"
            stroke="var(--color-cyan)"
            strokeWidth="1.4"
            opacity="0.45"
          />

          <rect
            className="tf-block"
            x={BX}
            y={132}
            width={BW}
            height={320}
            rx="6"
            fill="rgba(34,211,238,0.03)"
            stroke="var(--color-line)"
          />
          <text
            x={BX + BW + 14}
            y={146}
            className="mono"
            fontSize="9"
            letterSpacing="0.16em"
            fill="var(--color-text-dim)"
          >
            BLOCK × N
          </text>

          {/* Anchor group owns the translate; the animated child carries no
              transform attribute — GSAP/anime write style.transform, which in
              SVG overrides the attribute and would reset position to 0,0. */}
          {ROWS.map((r, i) => (
            <g key={i} transform={`translate(${BX + 14} ${r.y})`}>
              <g className="tf-row">
                <rect
                  x="0"
                  y="-15"
                  width={BW - 28}
                  height="30"
                  rx="3"
                  fill={rowFill(r.kind)}
                  stroke={rowStroke(r.kind)}
                  strokeDasharray={r.kind === "res" ? "3 3" : undefined}
                />
                <text
                  x={(BW - 28) / 2}
                  y="5"
                  textAnchor="middle"
                  className="mono"
                  fontSize="9.5"
                  letterSpacing="0.13em"
                  fill={rowText(r.kind)}
                >
                  {r.label}
                </text>
              </g>
            </g>
          ))}

          {CAPS.map((c, i) => (
            <g key={i} transform={`translate(${W / 2} ${c.y})`}>
              <g className="tf-cap">
                <rect
                  x="-92"
                  y="-17"
                  width="184"
                  height="34"
                  rx="4"
                  fill="transparent"
                  stroke={c.out ? "var(--color-cyan)" : "var(--color-line)"}
                />
                <text
                  x="0"
                  y="5"
                  textAnchor="middle"
                  className="mono"
                  fontSize="9.5"
                  letterSpacing="0.16em"
                  fill={c.out ? "var(--color-cyan)" : "var(--color-text-muted)"}
                >
                  {c.label}
                </text>
              </g>
            </g>
          ))}

          <circle
            className="tf-packet"
            cx={W / 2}
            cy={74}
            r="4.5"
            fill="var(--color-cyan)"
            opacity="0"
          />
        </svg>
      </div>

      <p className="mono border-t border-line px-4 py-3 text-[10px] leading-relaxed tracking-wide text-text-dim">
        Attention mixes information <em className="text-text-muted not-italic">between</em>{" "}
        positions; the feed-forward network transforms each position independently.
        Normalisation sits inside the branch — the residual path runs unbroken from
        input to output.
      </p>
    </div>
  );
}
