"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Vertical offset in px (default 24) */
  offset?: number;
};

/**
 * Wraps content in a fade-in + slide-up motion that triggers once when the
 * element enters the viewport. Intended for marketing-page sections.
 */
export function Reveal({ children, className, delay = 0, offset = 24 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
