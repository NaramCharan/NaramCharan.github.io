"use client";

import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import { createTimeline, stagger, type Timeline } from "animejs";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * A tiny living machine per project card (the anime.js feature-card idea):
 * each demo is a real SVG that animates in when the card scrolls into view
 * and replays on hover. Markup renders the FINAL state, so reduced-motion
 * (and SSR) get a complete static visual for free — anime only supplies
 * the journey via from-values.
 */
export default function MiniDemo({ id }: { id: string }) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const tl = useRef<Timeline | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !inView || reduced) return;
    const t = createTimeline();
    const $ = (sel: string) => root.querySelectorAll<SVGElement>(sel);

    switch (id) {
      case "walmart":
        t.add($(".md-actual"), {
          strokeDashoffset: [460, 0],
          duration: 950,
          ease: "inOutQuad",
        })
          .add(
            $(".md-forecast"),
            { opacity: [0, 0.9], duration: 500, ease: "outQuad" },
            "-=350"
          )
          .add(
            $(".md-peak"),
            { scale: [0, 1], opacity: [0, 1], duration: 420, ease: "outBack(2)" },
            "-=220"
          );
        break;
      case "rsna":
        t.add($(".md-film"), {
          scale: [0.6, 1],
          opacity: [0, 1],
          duration: 420,
          delay: stagger(70),
          ease: "outBack(2)",
        })
          .add(
            $(".md-hit"),
            { scale: [0, 1], opacity: [0, 1], duration: 380, delay: stagger(90), ease: "outBack(2.5)" },
            "-=220"
          )
          .add($(".md-miss"), { opacity: [0, 1], duration: 420, ease: "outQuad" }, "-=160");
        break;
      case "churn":
        t.add($(".md-roc"), {
          strokeDashoffset: [340, 0],
          duration: 1100,
          ease: "inOutQuad",
        })
          .add($(".md-auc"), { scale: [0, 1], duration: 450, ease: "outBack(2.5)" }, "-=250")
          .add($(".md-auclabel"), { opacity: [0, 1], duration: 300 }, "-=200");
        break;
      case "recsys":
        t.add($(".md-query"), {
          scale: [0, 1],
          duration: 400,
          ease: "outBack(3)",
        })
          .add(
            $(".md-edge"),
            {
              strokeDashoffset: [60, 0],
              duration: 350,
              delay: stagger(110),
              ease: "outQuad",
            },
            "-=100"
          )
          .add(
            $(".md-hit"),
            {
              scale: [0, 1],
              opacity: [0, 1],
              duration: 320,
              delay: stagger(110),
              ease: "outBack(2)",
            },
            "-=380"
          );
        break;
      case "scraper":
        t.add($(".md-fill"), {
          scaleX: [0, 1],
          duration: 800,
          delay: stagger(140),
          ease: "inOutQuad",
        }).add(
          $(".md-ok"),
          { opacity: [0, 1], duration: 200, delay: stagger(140) },
          "-=700"
        );
        break;
    }
    tl.current = t;
    return () => {
      t.cancel();
      tl.current = null;
    };
  }, [id, inView, reduced]);

  return (
    <div
      ref={ref}
      aria-hidden
      onPointerEnter={() => tl.current?.restart()}
      className="mt-4 overflow-hidden rounded-md border border-line/60 bg-bg-2/50 px-3 py-2"
    >
      <Demo id={id} />
    </div>
  );
}

function Demo({ id }: { id: string }) {
  switch (id) {
    case "walmart": {
      /* Actual vs forecast across the horizon, not a bar chart: the story here
         is how tightly the model tracks a seasonal series (0.9555 R²), and two
         lines show that where bars just show magnitude. Deterministic values —
         no Math.random in render. */
      const actual = [
        0.30, 0.34, 0.31, 0.38, 0.35, 0.42, 0.39, 0.45, 0.41, 0.48, 0.44, 0.52,
        0.49, 0.55, 0.51, 0.58, 0.62, 0.57, 0.64, 0.70, 0.66, 0.79, 0.93, 0.72,
        0.58, 0.54,
      ];
      const X = (i: number) => +(14 + (i * 212) / (actual.length - 1)).toFixed(2);
      const Y = (v: number) => +(62 - v * 50).toFixed(2);
      const aPts = actual.map((v, i) => `${X(i)},${Y(v)}`).join(" ");
      const fPts = actual
        .map((v, i) => `${X(i)},${Y(Math.min(1, Math.max(0.05, v + (((i * 7) % 5) - 2) / 90)))}`)
        .join(" ");
      const peak = actual.indexOf(Math.max(...actual));
      return (
        <Svg label="ACTUAL vs FORECAST · 52 WK">
          <line x1="14" y1="62" x2="226" y2="62" stroke="#88a6b3" strokeOpacity="0.25" strokeWidth="1" />
          <polyline
            className="md-forecast"
            points={fPts}
            fill="none"
            stroke="#ffb23e"
            strokeWidth="1.4"
            strokeDasharray="4 4"
            strokeOpacity="0.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            className="md-actual"
            points={aPts}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="1.9"
            strokeDasharray="460"
            strokeDashoffset="0"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 4px rgba(34,211,238,0.6))" }}
          />
          <circle
            className="md-peak"
            cx={X(peak)}
            cy={Y(actual[peak])}
            r="3.6"
            fill="#ffb23e"
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
              filter: "drop-shadow(0 0 7px rgba(255,178,62,0.9))",
            }}
          />
        </Svg>
      );
    }
    case "rsna": {
      /* 83% recall, said the way the README says it: the model catches roughly
         five in six actual cases. Six film glyphs, five flagged gold, the last
         left hollow — the miss is shown, not hidden. */
      const CAUGHT = 5;
      const TOTAL = 6;
      return (
        <Svg label="CATCHES ~5 IN 6 CASES · 83% RECALL">
          {Array.from({ length: TOTAL }).map((_, i) => {
            const x = 14 + i * 36.5;
            const hit = i < CAUGHT;
            return (
              <g
                key={i}
                className="md-film"
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              >
                {/* the film */}
                <rect
                  x={x}
                  y="12"
                  width="28"
                  height="38"
                  rx="3"
                  fill="#0b1220"
                  stroke={hit ? "#ffb23e" : "#88a6b3"}
                  strokeOpacity={hit ? "0.75" : "0.35"}
                  strokeWidth="1"
                />
                {/* two lungs */}
                <path
                  d={`M${x + 12} 20 C ${x + 6} 24, ${x + 5} 36, ${x + 10} 42 L ${x + 12} 42 Z`}
                  fill="none"
                  stroke="#7de7f5"
                  strokeOpacity="0.45"
                  strokeWidth="1"
                />
                <path
                  d={`M${x + 16} 20 C ${x + 22} 24, ${x + 23} 36, ${x + 18} 42 L ${x + 16} 42 Z`}
                  fill="none"
                  stroke="#7de7f5"
                  strokeOpacity="0.45"
                  strokeWidth="1"
                />
                {hit ? (
                  <circle
                    className="md-hit"
                    cx={x + 18}
                    cy="33"
                    r="3.4"
                    fill="#ffb23e"
                    style={{
                      transformBox: "fill-box",
                      transformOrigin: "center",
                      filter: "drop-shadow(0 0 6px rgba(255,178,62,0.9))",
                    }}
                  />
                ) : (
                  <circle
                    className="md-miss"
                    cx={x + 18}
                    cy="33"
                    r="3.4"
                    fill="none"
                    stroke="#88a6b3"
                    strokeOpacity="0.5"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}
              </g>
            );
          })}
        </Svg>
      );
    }
    case "churn": {
      return (
        <Svg label="ROC · 10-FOLD CV">
          <line x1="14" y1="62" x2="226" y2="8" stroke="#88a6b3" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 5" />
          <path
            className="md-roc"
            d="M14 62 C 40 20, 90 10, 226 8"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeDasharray="340"
            strokeDashoffset="0"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 4px rgba(34,211,238,0.6))" }}
          />
          <circle
            className="md-auc"
            cx="52"
            cy="21"
            r="4"
            fill="#ffb23e"
            style={{ transformBox: "fill-box", transformOrigin: "center", filter: "drop-shadow(0 0 5px rgba(255,178,62,0.8))" }}
          />
          <text className="md-auclabel mono" x="64" y="18" fontSize="10" fill="#ffd089">
            98.28% ACC
          </text>
        </Svg>
      );
    }
    case "recsys": {
      const items: [number, number][] = [
        [40, 18], [80, 40], [60, 58], [130, 14], [150, 50],
        [180, 26], [205, 54], [110, 60], [95, 20], [170, 62],
      ];
      const hits = [0, 8, 1, 3, 5];
      const q: [number, number] = [120, 36];
      return (
        <Svg label="FAISS · k-NN RETRIEVAL">
          {items.map(([x, y], i) => (
            <circle key={`b-${i}`} cx={x} cy={y} r="2.4" fill="#22d3ee" fillOpacity="0.25" />
          ))}
          {hits.map((h, i) => (
            <line
              key={`e-${i}`}
              className="md-edge"
              x1={q[0]}
              y1={q[1]}
              x2={items[h][0]}
              y2={items[h][1]}
              stroke="#22d3ee"
              strokeOpacity="0.55"
              strokeWidth="1"
              strokeDasharray="60"
              strokeDashoffset="0"
            />
          ))}
          {hits.map((h, i) => (
            <circle
              key={`h-${i}`}
              className="md-hit"
              cx={items[h][0]}
              cy={items[h][1]}
              r="3.4"
              fill="#7de7f5"
              style={{ transformBox: "fill-box", transformOrigin: "center", filter: "drop-shadow(0 0 4px rgba(125,231,245,0.7))" }}
            />
          ))}
          <circle
            className="md-query animate-pulse-core"
            cx={q[0]}
            cy={q[1]}
            r="5"
            fill="#ffb23e"
            style={{ transformBox: "fill-box", transformOrigin: "center", filter: "drop-shadow(0 0 6px rgba(255,178,62,0.9))" }}
          />
        </Svg>
      );
    }
    case "scraper": {
      const rows = ["amazon.jobs", "workday", "greenhouse", "lever.co"];
      return (
        <Svg label="PIPELINE · LIVE INGEST">
          {rows.map((r, i) => (
            <g key={r}>
              <text className="mono" x="14" y={16 + i * 15} fontSize="8.5" fill="#a8c6d2">
                {r}
              </text>
              <rect x="90" y={9 + i * 15} width="112" height="5" rx="2.5" fill="#0f1828" />
              <rect
                className="md-fill"
                x="90"
                y={9 + i * 15}
                width="112"
                height="5"
                rx="2.5"
                fill={i % 2 ? "#ffb23e" : "#22d3ee"}
                fillOpacity="0.7"
                style={{ transformBox: "fill-box", transformOrigin: "left" }}
              />
              <text className="md-ok mono" x="210" y={16 + i * 15} fontSize="8.5" fill="#7de7f5">
                OK
              </text>
            </g>
          ))}
        </Svg>
      );
    }
    default:
      return null;
  }
}

function Svg({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <svg viewBox="0 0 240 72" className="w-full">
        {children}
      </svg>
      <p className="mono mt-1 text-[8px] tracking-[0.3em] text-text-dim">{label}</p>
    </>
  );
}
