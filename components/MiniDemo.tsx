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
        t.add($(".md-bar"), {
          scaleY: [0, 1],
          duration: 700,
          delay: stagger(60),
          ease: "outExpo",
        }).add(
          $(".md-line"),
          { strokeDashoffset: [300, 0], duration: 900, ease: "inOutQuad" },
          "-=400"
        );
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
      case "titanic":
        t.add($(".md-sep"), {
          strokeDashoffset: [56, 0],
          duration: 500,
          ease: "inOutQuad",
        })
          .add(
            $('.md-pt[data-side="l"]'),
            { translateX: [0, -62], opacity: [0.35, 1], duration: 750, delay: stagger(45), ease: "outExpo" },
            300
          )
          .add(
            $('.md-pt[data-side="r"]'),
            { translateX: [0, 62], opacity: [0.35, 1], duration: 750, delay: stagger(45), ease: "outExpo" },
            300
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
      const bars = [22, 30, 26, 38, 34, 46, 41, 52, 48, 58];
      const pts = bars
        .map((v, i) => `${18 + i * 22.5},${64 - v - 4}`)
        .join(" ");
      return (
        <Svg label="52-WK FORECAST">
          {bars.map((v, i) => (
            <rect
              key={i}
              className="md-bar"
              x={12 + i * 22.5}
              y={64 - v}
              width="12"
              height={v}
              rx="1.5"
              fill={i % 2 ? "#ffb23e" : "#22d3ee"}
              fillOpacity="0.55"
              style={{ transformBox: "fill-box", transformOrigin: "bottom" }}
            />
          ))}
          <polyline
            className="md-line"
            points={pts}
            fill="none"
            stroke="#7de7f5"
            strokeWidth="1.6"
            strokeDasharray="300"
            strokeDashoffset="0"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 3px rgba(125,231,245,0.6))" }}
          />
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
    case "titanic": {
      const pts = Array.from({ length: 22 }, (_, i) => {
        const survived = i % 2 === 0;
        const gx = 108 + ((i * 37) % 28) - 14;
        const gy = 12 + ((i * 23) % 48);
        return { survived, gx, gy, dx: survived ? -62 : 62 };
      });
      return (
        <Svg label="SURVIVAL SPLIT · 81.6%">
          <line
            className="md-sep"
            x1="120"
            y1="8"
            x2="120"
            y2="64"
            stroke="#88a6b3"
            strokeOpacity="0.4"
            strokeWidth="1"
            strokeDasharray="56"
            strokeDashoffset="0"
          />
          {pts.map((p, i) => (
            <circle
              key={i}
              className="md-pt"
              data-side={p.survived ? "l" : "r"}
              cx={p.gx}
              cy={p.gy}
              r="2.8"
              fill={p.survived ? "#22d3ee" : "#ffb23e"}
              fillOpacity="0.8"
              style={{ transform: `translateX(${p.dx}px)` }}
            />
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
