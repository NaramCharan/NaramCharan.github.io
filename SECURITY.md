# Portfolio security review

Reviewed on **11 October 2026**. Scope: this portfolio repository, its GitHub Pages deployment, production dependencies, exported HTML, and browser behavior. This is a code/dependency/configuration review, not a penetration-test certification. The separate RSNA API, upload handling, model service and Azure account were not security-audited.

## Results and changes

- The original dependency audit reported **15 flagged packages**: 1 critical, 12 high, 2 moderate. Next.js and its matching ESLint configuration were upgraded from 16.2.9 to **16.4.0**; compatible transitive updates were applied and the lockfile regenerated.
- **Production dependency audit: 0 reported vulnerabilities** after the updates (`npm audit --omit=dev`). The portfolio publishes static files, not a running Next.js server, so the original server-side Next.js advisories were not evidence that the live Pages site could be exploited through those endpoints.
- Added a **hash-based Content Security Policy** to every exported HTML document, including the armor and error pages. The build computes SHA-256 hashes of the exact inline hydration scripts; arbitrary inline JavaScript and string evaluation remain disallowed. It restricts scripts, fonts, connections and images to local resources, with `blob:` / `data:` exceptions for Three.js model textures. Objects, embedded frames, base URL overrides and form submission are disabled.
- `wasm-unsafe-eval` is allowed for the local meshopt WebAssembly decoder. `style-src 'unsafe-inline'` remains a deliberate compatibility exception for Framer Motion, GSAP and dynamic scene styles. Removing it would require reworking those style updates; it is not enabled for JavaScript.
- Escaped `<` in JSON-LD serialization to prevent future content from closing its script element. Current profile data is repository-authored, not visitor-supplied.
- Added an explicit `strict-origin-when-cross-origin` referrer policy. Reviewed external link protections; new-tab links use `noopener noreferrer`.
- Pinned GitHub Actions to verified commit SHAs, disabled persisted checkout credentials, and confined Pages write/OIDC permissions to the deployment job. Pull-request checks run without deployment privileges.
- Added PR lint, type, build, browser and security checks, plus weekly Dependabot updates for npm and GitHub Actions. Deployment blocks on high/critical production audit findings.
- A recognizable-credential pattern scan of **150 available commits** and current source found no matches for private keys, common GitHub/AWS/Slack/OpenAI/Google tokens or credential URLs. This is a heuristic scan; it cannot prove the absence of arbitrary or encoded secrets.
- GitHub Pages configuration confirms `https_enforced: true`. Live HTTP redirects to HTTPS; HTTPS responses include `Strict-Transport-Security: max-age=31556952`.

## Remaining findings

### Development tooling: one underlying high-severity advisory

Full `npm audit` still flags five package entries: `braces`, `micromatch`, `fast-glob`, `@next/eslint-plugin-next`, and `eslint-config-next`. They trace to **one** underlying [braces stack-exhaustion advisory (GHSA-vfj7-8cjw-p6xm)](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). The advisory lists no patched version at the review date.

These are development-only lint dependencies, not shipped browser code. Untrusted deeply nested glob patterns can terminate a Node process using the affected library. Avoid running unreviewed tooling configurations locally. CI has read-only repository permissions and no deployment credentials. Dependabot is configured to surface upstream updates. `npm audit fix --force` suggested downgrading the Next lint configuration to 14.x; that incompatible downgrade was not applied.

### Hosting headers: framing protection remains incomplete

Live Pages responses did not include `Content-Security-Policy`, `X-Frame-Options`, or `X-Content-Type-Options` HTTP headers. The generated CSP meta element supplies the directives supported in HTML, but **cannot supply `frame-ancestors`**. `frame-src 'none'` prevents this site embedding frames; it does not prevent another site embedding the portfolio. See [MDN's frame-ancestors documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors).

Next.js server `headers()` configuration does not run on GitHub Pages static hosting. Complete framing/MIME header protection requires a hosting or proxy layer that can set response headers. At that layer, add `Content-Security-Policy: frame-ancestors 'none'` (alongside the document CSP), `X-Frame-Options: DENY`, and `X-Content-Type-Options: nosniff`. No hosting migration or DNS change was made. This portfolio has no authenticated actions or payment flows, which limits the impact of framing but does not eliminate the missing protection.

### Linked application repaired on 12 October 2026

The RSNA frontend discarded numeric IDs from `/samples` and substituted list positions, requesting `/image/0` for the first stored case. A separate [frontend fix](https://github.com/NaramCharan/RSNA-Pneumonia-Detection/pull/1) preserves safe integer/string IDs and rejects malformed ones. Regression tests cover image and prediction URL identity. The frontend patch was deployed on the existing Azure model/runtime image; Chromium verified that `Case_1` and `Case_42` display their real radiographs through `/image/1` and `/image/42`, with no page errors. No uploads or inference requests were performed. The separate backend, model service and Azure account still have not had a full security audit.

## Validation

- ESLint and TypeScript checks.
- Production static export, with CSP applied to all five HTML documents.
- Three Node security tests covering exact script hashes, policy placement/idempotence, and rejection of malformed export documents.
- Three Chromium browser tests covering immediate project access, evidence images, dialog focus trapping/restoration, background isolation, clipboard and email links, reduced motion, 390px/320px mobile layout, and armor model loading without CSP violations.
- Browser injection probe verified that an unauthorized inline script did not execute.
- Production/full dependency audits, current-source/history credential-pattern scans and live HTTPS/header inspection.

To repeat locally: `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test:security`, `npm run build`, `npx playwright install chromium`, `npm run test:e2e`, `npm run security:secrets`, and `npm audit --omit=dev`. Browser tests serve `out/` using Python 3. Rebuild after any source/content change so CSP hashes match the exported scripts.
