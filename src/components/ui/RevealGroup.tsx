"use client";

import { motion, useReducedMotion } from "motion/react";

type RevealGroupProps = {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
};

/**
 * Stagger container for lists (Events, Gallery, Family, Contact). Children
 * that should cascade in must be `motion.*` elements using
 * `revealItemVariants` (via `variants={revealItemVariants}`, no `initial`/
 * `animate` of their own) -- they inherit the "hidden"/"show" state from
 * this parent's `initial`/`whileInView` through React context.
 */
export default function RevealGroup({ children, className, stagger = 0.08 }: RevealGroupProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: reduceMotion ? 0 : stagger } } }}
    >
      {children}
    </motion.div>
  );
}

export function revealItemVariants(reduceMotion: boolean | null) {
  return {
    hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] as const } },
  };
}
