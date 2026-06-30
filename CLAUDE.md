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
- **Framer Motion** for UI motion; **Three.js / @react-three/fiber + drei** for the
  3D arc reactor (lazy-loaded, desktop-only, SVG fallback).
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
- `app/page.tsx` order: DashboardIntro → HudFrame → main[ Hero, StatsBar, Projects,
  Skills, Blueprint, About, Contact ].

### Key components
- `Navbar.tsx` — scroll-aware sticky nav: top scroll-progress line, reveals after
  hero, active-section tracking (IntersectionObserver) with animated `layoutId`
  indicator, RESUME button. Wired in `app/page.tsx`.
- `DashboardIntro.tsx` — **auto-playing** power-on gate (no clicking). Glyph rails
  stream, status lines cycle, lightning/glitch fires on a timeline, dissolves into
  site at ~3.3s. Gated once per session via `sessionStorage('jarvis_entered')`.
- `Hero.tsx` — JARVIS HUD hero: 3D reactor + radar sweep, decoding name, rotating
  "SPECIALIZING IN", flanking telemetry panels (accuracy chart / system feed) on
  desktop, **mobile-specific** compact stat strip (panels hidden <lg), bottom ticker.
- `ArcReactorStatic.tsx` — the **Iron Man 3 (Mark XLII) triangular arc reactor**,
  pure SVG (downward triangle + corner nodes + coil ring + upward-triangle "new
  element" core). Used in both Hero and DashboardIntro. NOTE: `ArcReactor3D.tsx`
  (the old 3D sphere) is now **unused** — kept in repo but not imported.
- `ArcReactorAssemble.tsx` — anime.js (v4) variant used **in the boot intro**: the
  reactor builds part-by-part (bezel → tick ring → coils sweep → triangle spins in →
  nested + corner nodes → core ignites + flash) on a `createTimeline`. Parts are
  hidden via `utils.set(opacity:0)` then revealed; `startedRef` guards StrictMode
  double-mount; reduced-motion renders assembled. Hero still uses `ArcReactorStatic`.
- Hydration safety: GlyphRail glyphs and reactor coil coords are deterministic
  (no `Math.random()` in render) to avoid SSR/client mismatch.
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
CGPA **8.7/10**; NCF uses **PyTorch/Keras** (resume PDF was edited TensorFlow→PyTorch
to match; backup at iCloud `NARAM_RESUME.pdf.bak-tensorflow`); Walmart **95.5% R²**;
skill groups = ML / Deep Learning & GenAI / Data Intelligence / Engineering Core;
certs = Stanford ML, IBM SQL, Michigan Python, Google·Vanderbilt Prompt Eng.
Hero has subtle mouse-parallax on the reactor (desktop, motion-on only).

## Open items / TODO
- Optionally wire the user's generated dashboard PNG as a framed viewport (currently
  the Blueprint SVG is the custom imagery).
- Consider lighter-weight Three.js path or further code-split to defend sub-2s load.

## Status
Built to address the "$10K checklist" (typography, restrained color, breathing
hierarchy, bespoke imagery, whisper-grade motion, designed mobile, a11y/semantics).
Build passes clean; verified in preview at desktop + mobile.

## Preview/verify notes
- Use `mcp__Claude_Preview__preview_*` (launch config: `.claude/launch.json`, name "jarvis").
- Quirk: a `location.reload()` via preview_eval can corrupt the screenshot canvas
  scaling — prefer a fresh `preview_start`, then `preview_resize`, then screenshot.
