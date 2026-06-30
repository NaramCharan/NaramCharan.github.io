"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

const LINES = [
  "> INITIALIZING J.A.R.V.I.S . . .",
  "> CALIBRATING ARC REACTOR . . . OK",
  "> LOADING PROFILE: NARAM_CHARAN",
  "> MOUNTING NEURAL MODULES . . . OK",
  "> ALL SYSTEMS ONLINE",
];

export default function BootSequence() {
  const reduced = usePrefersReducedMotion();
  const [done, setDone] = useState(false);
  const [shown, setShown] = useState(0);

  // Skip entirely if already booted this session, or reduced motion.
  useEffect(() => {
    if (reduced || sessionStorage.getItem("jarvis_booted")) {
      setDone(true);
      return;
    }
    sessionStorage.setItem("jarvis_booted", "1");

    const timers: ReturnType<typeof setTimeout>[] = [];
    LINES.forEach((_, i) =>
      timers.push(setTimeout(() => setShown(i + 1), 280 * (i + 1)))
    );
    timers.push(setTimeout(() => setDone(true), 280 * LINES.length + 650));
    return () => timers.forEach(clearTimeout);
  }, [reduced]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="boot"
          className="fixed inset-0 z-[90] flex items-center justify-center bg-bg"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          role="status"
          aria-label="System boot sequence"
        >
          <div className="hud-grid pointer-events-none absolute inset-0 opacity-50" />
          <div className="relative w-[min(90vw,520px)] px-2">
            <div className="mb-6 flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-60" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan" />
              </span>
              <span className="mono text-xs tracking-[0.4em] text-cyan/70">
                BOOTING
              </span>
            </div>
            <div className="space-y-1.5 mono text-sm text-cyan">
              {LINES.slice(0, shown).map((line) => (
                <motion.p
                  key={line}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18 }}
                  className={
                    line.includes("ONLINE")
                      ? "text-gold glow-gold"
                      : "text-cyan/85"
                  }
                >
                  {line}
                  {line.includes("ONLINE") && (
                    <span className="animate-blink"> _</span>
                  )}
                </motion.p>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
