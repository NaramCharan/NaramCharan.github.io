"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { navLinks, profile } from "@/lib/content";
import { EASE } from "@/lib/motion";
import { triggerResumeDownload } from "@/lib/resume";
import { useMagnetic } from "@/lib/useMagnetic";

export default function Navbar() {
  const magnetic = useMagnetic();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Mobile menu: ESC closes + returns focus; first link focused on open.
  useEffect(() => {
    if (!open) return;
    firstLinkRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Track which section is in view for the active indicator.
  useEffect(() => {
    const ids = navLinks.map((l) => l.href.slice(1));
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {/* Scroll progress line */}
      <motion.div
        aria-hidden
        className="fixed left-0 top-0 z-[62] h-0.5 w-full origin-left bg-gradient-to-r from-cyan via-cyan-bright to-gold"
        style={{ scaleX: progress }}
      />

      {/* Always visible — the RESUME button must be reachable without scrolling. */}
      <header className="fixed inset-x-0 top-0 z-[58] border-b border-line bg-bg/70 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <a
            href="#top"
            className="group flex items-center gap-2.5"
            aria-label="Back to top"
          >
            <span
              aria-hidden
              className="grid h-7 w-7 place-items-center rounded-full border border-cyan/50 text-cyan transition-colors duration-300 group-hover:border-cyan group-hover:bg-cyan/10"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                <polygon points="12,5 18,17 6,17" />
              </svg>
            </span>
            <span className="mono text-sm font-bold tracking-[0.25em] text-cyan glow-cyan">
              NC
            </span>
          </a>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => {
              const id = l.href.slice(1);
              const isActive = active === id;
              return (
                <a
                  key={l.href}
                  href={l.href}
                  className={`relative rounded px-3 py-2 mono text-[11px] tracking-[0.2em] transition-colors duration-300 ${
                    isActive ? "text-cyan" : "text-text-dim hover:text-cyan"
                  }`}
                >
                  {l.label.toUpperCase()}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-2 -bottom-px h-px bg-cyan shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                      transition={{ duration: 0.35, ease: EASE }}
                    />
                  )}
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <a
              ref={magnetic}
              href={profile.resume}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => triggerResumeDownload(profile.resume)}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-gold/60 bg-gold/15 px-4 py-1.5 mono text-[11px] tracking-[0.15em] text-gold transition-all duration-300 hover:bg-gold/25 hover:shadow-[0_0_18px_rgba(255,178,62,0.3)]"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
              </svg>
              RESUME
            </a>

            {/* Mobile menu toggle */}
            <button
              ref={menuBtnRef}
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-md border border-line text-cyan transition-colors duration-300 hover:border-cyan/60 md:hidden"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                {open ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile menu panel */}
        <AnimatePresence>
          {open && (
            <motion.nav
              id="mobile-nav"
              aria-label="Mobile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="overflow-hidden border-t border-line bg-bg/90 backdrop-blur-md md:hidden"
            >
              <ul className="mx-auto max-w-6xl px-6 py-2">
                {navLinks.map((l, i) => {
                  const id = l.href.slice(1);
                  const isActive = active === id;
                  return (
                    <li key={l.href}>
                      <a
                        ref={i === 0 ? firstLinkRef : undefined}
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className={`block border-b border-line/40 py-3.5 mono text-xs tracking-[0.25em] last:border-0 ${
                          isActive ? "text-cyan" : "text-text-muted"
                        }`}
                      >
                        <span aria-hidden className="mr-2 text-gold">{isActive ? "◢" : "·"}</span>
                        {l.label.toUpperCase()}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
