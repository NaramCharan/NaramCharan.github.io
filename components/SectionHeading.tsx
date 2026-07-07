"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { EASE } from "@/lib/motion";
import { useDecode } from "@/lib/useDecode";

export default function SectionHeading({
  index,
  title,
  subtitle,
}: {
  index: string;
  title: string;
  subtitle?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  // Scramble-decodes once scrolled into view; "" until then, so we fall
  // back to the plain title (invisible anyway at whileInView opacity 0).
  const decoded = useDecode(title, 28, inView);

  return (
    <div className="mb-14">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mb-4 flex items-center gap-3"
      >
        <span className="mono text-xs tracking-[0.3em] text-gold">{index}</span>
        <motion.span
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          className="h-px w-16 origin-left bg-gradient-to-r from-cyan to-transparent"
        />
        <span className="mono text-[10px] tracking-[0.4em] text-text-dim">
          SYSTEM MODULE
        </span>
      </motion.div>
      <motion.h2
        ref={ref}
        aria-label={title}
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
        className="text-4xl font-semibold tracking-tight sm:text-5xl"
      >
        <span aria-hidden className="glow-cyan">
          {decoded || title}
        </span>
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.18 }}
          className="mt-4 max-w-2xl text-lg leading-relaxed text-text-muted"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
