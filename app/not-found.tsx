import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Sector Not Found · Naram Charan",
  description: "The requested sector does not exist in this system.",
};

// JARVIS-styled 404 — served as out/404.html by GitHub Pages for any
// unmatched URL. Server component: no motion deps, loads instantly.
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6 text-center">
      <p className="font-mono text-xs tracking-[0.35em] text-cyan">
        J.A.R.V.I.S · SYSTEM SCAN
      </p>

      <h1 className="mt-6 font-display text-7xl font-bold text-text sm:text-8xl">
        4<span className="text-cyan">0</span>4
      </h1>

      <p className="mt-4 font-mono text-sm tracking-[0.25em] text-gold">
        SECTOR NOT FOUND
      </p>

      <p className="mt-6 max-w-md text-sm leading-relaxed text-text-muted">
        The coordinates you requested don&apos;t map to any known sector of
        this system. The scan returned zero matches.
      </p>

      <Link
        href="/"
        className="mt-10 inline-flex items-center gap-3 rounded border border-line bg-surface px-6 py-3 font-mono text-xs tracking-[0.25em] text-cyan transition-colors hover:border-cyan hover:text-cyan-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan"
      >
        ← RETURN TO BASE
      </Link>

      <p className="mt-12 font-mono text-[10px] tracking-[0.3em] text-text-dim">
        ERR_404 · ROUTE UNRESOLVED · MK XLII
      </p>
    </main>
  );
}
