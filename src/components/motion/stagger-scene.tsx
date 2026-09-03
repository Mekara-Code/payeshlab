"use client";

import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { useRef, type ReactNode } from "react";

type StaggerSceneProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  dir?: "ltr" | "rtl";
  interval?: number;
};

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Reveals a section's primary elements in sequence and fades them out in
 * reverse order once the section leaves the viewport.
 */
export function StaggerScene({
  children,
  className,
  delay = 0.04,
  dir,
  interval = 0.1,
}: StaggerSceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isInView = useInView(sceneRef, { amount: 0.16, once: false });
  const sceneVariants: Variants = {
    hidden: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : interval * 0.68,
        staggerDirection: -1,
      },
    },
    visible: {
      transition: {
        delayChildren: shouldReduceMotion ? 0 : delay,
        staggerChildren: shouldReduceMotion ? 0 : interval,
      },
    },
  };

  return (
    <motion.div
      animate={shouldReduceMotion || isInView ? "visible" : "hidden"}
      className={className}
      dir={dir}
      initial={shouldReduceMotion ? false : "hidden"}
      ref={sceneRef}
      variants={sceneVariants}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  const shouldReduceMotion = useReducedMotion();
  const duration = shouldReduceMotion ? 0 : 0.46;
  const itemVariants: Variants = {
    hidden: {
      filter: "blur(6px)",
      opacity: 0,
      scale: 0.975,
      transition: { duration, ease: [0.22, 1, 0.36, 1] },
      y: 28,
    },
    visible: {
      filter: "blur(0px)",
      opacity: 1,
      scale: 1,
      transition: { duration, ease: [0.22, 1, 0.36, 1] },
      y: 0,
    },
  };

  return (
    <motion.div
      className={className}
      style={shouldReduceMotion ? undefined : { willChange: "transform, opacity, filter" }}
      variants={itemVariants}
    >
      {children}
    </motion.div>
  );
}
