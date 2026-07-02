@AGENTS.md

# Project Memory — JARVIS Portfolio (Naram Charan)

> Living context for this repo. Update as the build evolves.

## What this is
A premium, "$10K-tier" personal portfolio for **Naram Charan** — a 3rd-year CS/AI
student (Iron Man fan → ML obsession). Themed as Tony Stark's **JARVIS / Mark 42
hologram-blue HUD**, but functions as a real, content-complete portfolio. All
content is REAL, sourced from naramcharan.me.

## Stack & conventions
- **Next.js 16 (App Router, Turbopack)** + TypeScript + **Tailwind CSS v4**
  (CSS-first: tokens live in `@theme` in `app/globals.css`, no tailwind.config).
- **GSAP + ScrollTrigger** drives the hero's scroll-scrubbed assembly timeline;
  **Framer Motion** for the rest of the UI motion. No Three.js — all reactors are
  pure SVG.
- Static-export friendly. `npm run dev` → http://localhost:3000. `npm run build` must pass.
- AGENTS.md rule: this is a modified Next.js — check `node_modules/next/dist/docs/` before
  using unfamiliar APIs.

## Design system (locked)
- **Theme:** OLED black-navy `#05080F` base, cyan `#22D3EE` HUD lines, gold `#FFB23E`
  accents. 3–4 colors only. Tokens in `app/globals.css` `@theme`.
- **Typography (chosen, NOT Inter/Roboto):** Space Grotesk (display/headings) +
  Sora (body) + JetBrains Mono (HUD readouts). Headings auto-use display face via
  global `h1–h4` rule. Font vars: `--font-display`, `--font-body`, `--font-mono-face`.
- **Motion language:** one easing curve `EASE = [0.16,1,0.3,1]` in `lib/motion.ts`
  (helpers `enter()` / `reveal()`). Section reveals use a clip-wipe rule line.
- **A11y:** muted text lifted to `#a8c6d2` for WCAG AA; skip link, focus rings,
  `prefers-reduced-motion` honored globally (CSS) + per-component (`lib/useReducedMotion.ts`).

## Architecture
- `lib/content.ts` — **single source of truth** for ALL portfolio data (profile,
  stats, projects, skillSystems, education, certs, contact). Edit content here.
- `lib/motion.ts` — shared easing + reveal helpers.
- `lib/useDecode.ts` — `useDecode()` (scramble-in text) + `useRotate()` (cycling words).
- `lib/useReducedMotion.ts` — SSR-safe reduced-motion hook.
- `app/page.tsx` order: Navbar → HudFrame → main[ IntroDashboard, StatsBar, Projects,
  Skills, Blueprint, About, Contact ]. (No separate Hero/boot gate — IntroDashboard
  IS the hero.)

### Key components
- `Navbar.tsx` — scroll-aware sticky nav: top scroll-progress line, reveals after
  hero, active-section tracking (IntersectionObserver) with animated `layoutId`
  indicator, RESUME button. Wired in `app/page.tsx`.
- `IntroDashboard.tsx` — **the hero**: pinned `h-[300vh]` track + sticky `h-dvh`
  stage, driven by ONE GSAP timeline via `ScrollTrigger` (`scrub: 0.5`, reverses on
  scroll-up). Three segments (user-specced): **A 0–30%** "Welcome to the world /
  LET'S DIVE IN" visible at rest, drifts out; **B 30–70%** the Stark assembly —
  bezel/tick/housing fly in from off-screen corners (`power3.out`), 18 coils stagger
  in radially (function-based x/y off `data-angle`), triangle + nodes + core snap
  with `back.out(1.7)`, glow + flash charge-up, schematic callouts + streaming code
  columns (desktop) dissolve after; **C 70–100%** status → name → SPECIALIZING IN →
  tagline "types" on (clip-path wipe + caret) → CTAs; 6 HUD panels (desktop) stagger
  in. Markup renders the FINAL state (SSR/SEO/reduced-motion safe); GSAP `.from()`
  immediateRender poses the scattered start on mount. `gsap.context` + `ctx.revert()`
  for StrictMode. (History: framer `useScroll` and anime.js `onScroll` did NOT track
  on this page; ScrollTrigger works. If it regresses, fall back to a manual rAF
  scroll listener.)
- `ReactorAssembly.tsx` — the IM3 reactor as a **GSAP rig**: pure SVG rendering the
  assembled state; every part classed (`.ra-bezel/.ra-tick/.ra-housing/.ra-coil×18
  (data-angle)/.ra-tri/.ra-nest/.ra-node/.ra-corewrap/.ra-flash/.ra-glowring/
  .ra-callout/.ra-ghost`) + `.ar-part` (fill-box origin + will-change). The timeline
  in IntroDashboard owns ALL its motion — this file has zero animation code.
- `ArcReactorStatic.tsx` — the same **Iron Man 3 (Mark XLII) reactor**, non-animated
  SVG. Used by `ProjectHologram` (FRIDAY brief modal).
- `ProjectHologram.tsx` — FRIDAY deep-dive dialog opened from project-card chips
  (a11y complete: dialog role, ESC/scrim close, focus + scroll lock). Three-layer
  hologram stack: glass (backdrop-blur 15px + cyan gradient), glow (inset + outer
  cyan shadows), glitch (`.holo-glitch` skew blip every 3s, on an INNER wrapper so
  it can't fight framer's entrance/exit transform).
- **Custom cursor:** Iron Man arrowhead — `public/cursor.svg/.png` (+ gold
  `cursor-pointer.*` for links/buttons), wired in `globals.css` under
  `@media (pointer: fine)`. PNGs regenerable via PIL (see git history).
- Hydration safety: GlyphRail glyphs and reactor coil coords are deterministic
  (no `Math.random()` in render) to avoid SSR/client mismatch.
- Branded favicon: `app/icon.svg` (mini arc reactor). No Three.js deps — the reactors
  are all pure SVG + anime.js/CSS.
- `Projects.tsx` — 5 real repos as HUD scan cards (MK-01…05, FEATURED on Walmart).
- `Skills.tsx` + `SystemIcons.tsx` — "Suit Systems" with **icon emblems, NO numbers**
  (brain=Deep Learning, circuit=ML, database=Data, terminal=Engineering) in rotating reticles.
- `Blueprint.tsx` — **bespoke commissioned-feel** SVG schematic of the neural
  recommendation engine, annotated with real specs (32-dim, <10ms, FAISS·L2).
- `About.tsx` — origin story + education GPAs + cert timeline.
- `Contact.tsx` — terminal-style contact panel (email, GitHub, LinkedIn, WhatsApp).
- `HudFrame.tsx` — fixed decorative corner brackets overlay.

## Content source
All content in `lib/content.ts` is from the **real resume** (`public/NARAM_RESUME.pdf`,
the actual file). Key authoritative facts: name "Naramreddy Charan Kumar Reddy";
CGPA **8.89/10** (user-corrected; do not trust older 8.7/8.98 mentions); NCF uses
**PyTorch, no Keras** (resume PDF edited TensorFlow→PyTorch; backup at iCloud
`NARAM_RESUME.pdf.bak-tensorflow`); Walmart **95.5% R²**; skill groups = ML / Deep
Learning & GenAI / Data Intelligence / Engineering Core; certs = Stanford ML, IBM
SQL, Michigan Python, Google·Vanderbilt Prompt Eng — all with real VERIFY links.

## Open items / TODO
- **Merge `feat/reactor-assembly` → main and push to GitHub**, replacing
  https://github.com/NaramCharan/NaramCharan.github.io so naramcharan.me serves this
  site (needs `output: 'export'` in next.config.ts + `public/CNAME`; confirm with the
  user before force-replacing the live repo).

## Status
Built to address the "$10K checklist" (typography, restrained color, breathing
hierarchy, bespoke imagery, whisper-grade motion, designed mobile, a11y/semantics).
Build passes clean; verified in preview at desktop + mobile.

## Preview/verify notes
- Use `mcp__Claude_Preview__preview_*` (launch config: `.claude/launch.json`, name "jarvis").
- Quirk: a `location.reload()` via preview_eval can corrupt the screenshot canvas
  scaling — prefer a fresh `preview_start`, then `preview_resize`, then screenshot.
- Quirk: the preview tab is `visibilityState: "hidden"` → **rAF never fires**, so
  framer-motion styles/scroll scrubbing appear frozen in evals. Each
  `preview_screenshot` pumps a few frames: scroll via eval → screenshot (pump) →
  eval to read the now-updated styles. Don't mistake the freeze for broken code.
