"use client";

import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";
import SectionHeading from "./SectionHeading";
import AttentionFigure from "./AttentionFigure";
import TransformerFigure from "./TransformerFigure";

/**
 * The mechanisms behind the models — attention and the transformer block,
 * both interactive and both drawn correctly.
 *
 * This section exists because the rest of the site says "I understand this";
 * these two figures are the evidence. It sits after the origin story — the
 * reader has met the person and seen the work, and this is the proof that
 * the understanding behind both is real.
 */
export default function HowIThink() {
  return (
    <section id="how-i-think" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-28">
      <SectionHeading
        index="04"
        title="How I Think"
        subtitle="The two mechanisms every modern model is built on — attention, and the block that scaled it. Both are live: pick a token, switch heads, watch the weight move."
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Attention — the wider of the two, so it leads */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="lg:col-span-7"
        >
          <h3 className="mb-3 text-xl font-semibold text-text">
            Every token decides what to look at.
          </h3>
          <p className="mb-6 max-w-[52ch] text-[15px] leading-relaxed text-text-muted">
            A query is compared against every key to produce a score; a softmax turns
            those scores into weights that sum to one; the values are then mixed in
            exactly those proportions. Different heads learn genuinely different
            routing — head 02 tracks the previous token, head 03 pulls toward the most
            semantic one.
          </p>
          <AttentionFigure />
        </motion.div>

        {/* Transformer block */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.12 }}
          className="lg:col-span-5"
        >
          <h3 className="mb-3 text-xl font-semibold text-text">The block that scaled.</h3>
          <p className="mb-6 max-w-[46ch] text-[15px] leading-relaxed text-text-muted">
            Two sub-layers, each wrapped in a residual connection. Attention mixes
            information between positions; the feed-forward network transforms each
            position on its own. Normalisation sits inside the branch — the residual
            path runs unbroken, which is what lets these stacks train at depth.
          </p>
          <TransformerFigure />
        </motion.div>
      </div>
    </section>
  );
}
