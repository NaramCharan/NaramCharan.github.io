# Naram Charan's portfolio

A JARVIS-inspired AI and machine-learning portfolio built with Next.js, TypeScript, Tailwind CSS and Three.js. The live site is https://naramcharan.me; GitHub Pages deploys the static export when changes merge into `main`.

## Develop and verify

```sh
npm ci
npm run dev
```

Portfolio facts, project ordering inputs, case studies and evidence descriptions live in `lib/content.ts`. New projects should include a contribution statement, evaluation context and limitations. Evidence provenance is documented in `public/projects/SOURCES.md`.

```sh
npm run lint
npm run typecheck
npm run test:security
npm run build
npx playwright install chromium
npm run test:e2e
npm run security:secrets
npm audit --omit=dev
```

`npm run build` creates `out/` and adds a hash-based CSP to each HTML document. Always deploy the output of that command rather than calling `next build` alone. `next start` does not serve this static export. The browser tests use Python 3 to serve `out/` locally on port 8188.

PR checks include browser tests. The Pages workflow checks lint, types, security tests and production dependencies before publishing. Dependabot tracks npm and GitHub Actions updates.

See [SECURITY.md](SECURITY.md) for the review scope, validation, remaining development-tooling advisory, and GitHub Pages response-header limitations. The portfolio preserves model credits and licences in its footer and armor page.
