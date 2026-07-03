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
- **Three.js / React-Three-Fiber + drei + postprocessing (Bloom)** power the hero's
  3D reactor; **GSAP + ScrollTrigger** scrubs both the WebGL progress and the DOM
  overlays; **Framer Motion** for the rest of the UI. (The old "no Three.js, SVG
  only" rule was lifted when the user asked for a true 3D cinematic hero matching the
  EDITH reference video.) The FRIDAY modal reactor + reduced-motion hero fallback are
  still the pure-SVG `ArcReactorStatic`.
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
- `IntroDashboard.tsx` — **the hero**: pinned `h-[320vh]` track + sticky `h-dvh`
  stage. The 3D reactor is `reactor3d/HeroCanvas` (WebGL, absolute inset-0). A GSAP
  timeline scrubbed on the same `#top` track drives the **DOM overlays** in lockstep:
  **A 0–28%** at-rest identity block (2026-07-03 recruiter-first pass: "Welcome to
  the world," is a small eyebrow; NAME at headline scale + readable role line with
  gold OPEN TO INTERNSHIPS + "LET'S DIVE IN", all in flow so nothing overlaps;
  drifts out on scroll); **B 28–74%** the 3D assembly (owned by the canvas) +
  streaming code columns; **C 74–100%** status → name → SPECIALIZING IN → tagline
  "types" on (clip-path wipe + caret, caret hidden outside its 0.85–0.96 window) →
  CTAs; 6 HUD panels stagger in ("CHURN MODEL ACCURACY · XGBOOST" labels the 98.28%
  so it can't be misread). The canvas is wrapped in a div with
  `opacity: calc(0.25 + var(--p)*6)` — scattered parts stay faint at rest so they
  can't glint over the identity text (GSAP can't target the canvas: it mounts after
  the timeline is built). Navbar is ALWAYS visible now (no scroll gate) — the
  RESUME button must be reachable without scrolling. Timeline tween positions
  are in scroll-fraction terms padded to ~1 (`tl.to({},{duration:.001},1)`) so
  position ≈ scroll progress. `.from()` immediateRender hides identity at load; DOM
  renders the FINAL readable state (SSR/SEO safe). **Reduced motion** skips WebGL
  entirely → static `ArcReactorStatic` + all content shown. (History: framer
  `useScroll` and anime.js `onScroll` did NOT track on this page; GSAP ScrollTrigger
  works.) The opening lock-on is the `ScanReticle` DOM/SVG overlay (JARVIS optical
  scanner — spinning dashed rings, tick ring, crosshair, corner brackets, radar
  sweep, "OPTICAL SCAN / CALIBRATING · MK XLII" labels) which GSAP scales+fades out
  entering assembly (replaced the earlier 3D EDITH glasses, which the user cut).
- `reactor3d/` — the WebGL hero. `HeroCanvas.tsx`: client-only `<Canvas>` (mounts
  post-hydration; camera z **9.2**, reactor group offset **y 0.35** — sized/placed so
  the assembled reactor clears the sticky navbar), lights + framed
  `<Environment>`/`<Lightformer>` (no network HDR fetch), `<Bloom>` postprocessing,
  and the single `ScrollTrigger` that writes 0..1 into a `progress` ref (+
  `--p`/`data-seg` on the track). `Reactor3D.tsx`: the Mark XLII rig — torus
  bezel/housing, tick ring, 18 copper coils, extruded triangular rotor + core, corner
  nodes, 4 robotic arms; each part lerps from a scattered/scaled start to its locked
  pose across its own progress window (read in `useFrame`, no React re-render); core
  `pointLight` + emissive **ignite to a flash then CALM** (`win(p,0.8,0.94)`) so the
  name/copy read in segment C (toned 2026-07-03: core light ×4.5, core emissive
  flash ~1.5, coil glass 1.6, Bloom 0.5 @ luminanceThreshold 0.85 — never washes the
  viewport gray). As the core calms the root also **settles** — scales to 0.74
  (0.58 under 640px) and rises (+0.8 / +1.0 world y) so the tick ring parks clear
  of the "3rd-year CS…" kicker line. `parts.tsx`: shared PBR materials (dark/bright metal,
  copper, cyan glass, core glow) + the extruded-triangle geometry helper. **Quirk:**
  in the hidden preview tab rAF is throttled → the R3F loop + ScrollTrigger freeze;
  each `preview_screenshot` pumps a few frames (scroll via eval →
  `dispatchEvent('scroll')` → screenshot). Also: HMR reloads can corrupt the
  screenshot canvas scaling → do a fresh `preview_start` + `preview_resize`.
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
CGPA **8.98/10** (user-corrected 2026-07-02; earlier 8.89/8.7 mentions are stale);
NCF uses **PyTorch, no Keras** (resume PDF edited TensorFlow→PyTorch; backup at
iCloud `NARAM_RESUME.pdf.bak-tensorflow`); Walmart **95.5% R²**; skill groups = ML /
Deep Learning & GenAI / Data Intelligence / Engineering Core; certs (newest first) =
**Claude Code (DeepLearning.AI·Anthropic, Jul 2026)**, Stanford ML, IBM SQL,
Michigan Python, Google·Vanderbilt Prompt Eng — all with real VERIFY links.

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
- Quirk (2026-07-03): preview screenshots go **solid black whenever the page is
  scrolled** — only scroll-0 captures work. Verify scrolled hero states in a real
  tab via `claude-in-chrome` instead: navigate to localhost:3000, scroll with
  `scrollTo({top, behavior:'instant'})` (html has smooth scroll-behavior, which
  never finishes in a hidden tab), and screenshot twice (captures pump rAF there
  too). After a reload that restores scroll, jiggle the scroll ±30px or the canvas
  ScrollTrigger never fires and the reactor renders at p=0.
- Quirk: editing HeroCanvas/Reactor3D under HMR often throws a bogus
  "Cannot read properties of null (reading 'alpha')" at `<Canvas>` — it's an HMR
  artifact; a fresh page load is always clean.
- Next.js 16 refuses two dev servers in the same dir; if another session holds the
  lock, kill its PID (shown in the error) before `preview_start`. launch.json has
  `autoPort: true`.
