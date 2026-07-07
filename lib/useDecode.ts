"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "./useReducedMotion";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&<>/\\";

/**
 * Reveals `text` with a brief scramble/decode effect.
 * Pass `start=false` to defer until a trigger (e.g. scrolled into view) —
 * until then it returns "" so callers can fall back to the plain text.
 */
export function useDecode(text: string, speed = 32, start = true): string {
  const reduced = usePrefersReducedMotion();
  const [out, setOut] = useState(reduced ? text : "");

  useEffect(() => {
    if (reduced) {
      setOut(text);
      return;
    }
    if (!start) return;
    let frame = 0;
    const total = text.length;
    const id = setInterval(() => {
      frame++;
      const revealed = Math.floor(frame / 2);
      let s = "";
      for (let i = 0; i < total; i++) {
        if (text[i] === " ") s += " ";
        else if (i < revealed) s += text[i];
        else s += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      setOut(s);
      if (revealed >= total) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, reduced, start]);

  return out;
}

/** Cycles through `words`, returning the current one (changes every `ms`). */
export function useRotate(words: string[], ms = 2200): string {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % words.length), ms);
    return () => clearInterval(id);
  }, [words.length, ms]);
  return words[i];
}
