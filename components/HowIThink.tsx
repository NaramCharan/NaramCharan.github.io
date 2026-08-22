"use client";

import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";
import SectionHeading from "./SectionHeading";
import MLTree from "./MLTree";

/**
 * The map of the field, and where my work sits on it.
 *
 * One branch diagram, split by the question that actually decides your whole
 * approach: is the data a table, or isn't it. Left branch is traditional ML
 * on tabular data, right is deep learning on unstructured. Open any model to
 * reach the project built with it.
 *
 * Sits after the origin story: the reader has met the person and seen the
 * work, and this shows the structure behind both.
 */
export default function HowIThink() {
  return (
    <section id="how-i-think" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:px-6 sm:py-28">
      <SectionHeading
        index="04"
        title="How I Think"
        subtitle="The whole field on one branch diagram — split by the question that decides your entire approach: is the data a table, or isn't it. Open any model to see what I built with it."
      />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <MLTree />
      </motion.div>
    </section>
  );
}
