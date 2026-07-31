"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { UseScrollOptions } from "framer-motion";
import { useRef, type ReactNode } from "react";

type ScrollSceneProps = {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down";
  distance?: number;
  exitOnLeave?: boolean;
  offset?: UseScrollOptions["offset"];
};

/**
 * Keeps section transitions connected to the user's scroll position.
 * A scene settles while it is in view, then gently leaves in the
 * opposite direction instead of abruptly disappearing.
 */
export function ScrollScene({
  children,
  className,
  direction = "up",
  distance = 36,
  exitOnLeave = true,
  offset = ["start 88%", "end 12%"],
}: ScrollSceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset,
  });
  const travelDistance = Math.max(distance * 1.24, 34);
  const enterOffset = direction === "up" ? travelDistance : -travelDistance;
  const exitOffset = -enterOffset * 0.82;
  const enterRotation = direction === "up" ? 0.65 : -0.65;
  const exitRotation = -enterRotation * 0.65;
  const settledOpacity = exitOnLeave ? 0 : 1;
  const settledY = exitOnLeave ? exitOffset : 0;
  const settledRotation = exitOnLeave ? exitRotation : 0;
  const settledScale = exitOnLeave ? 0.985 : 1;
  const opacity = useTransform(scrollYProgress, [0, 0.16, 0.84, 1], [0, 1, 1, settledOpacity]);
  const y = useTransform(
    scrollYProgress,
    [0, 0.16, 0.84, 1],
    [enterOffset, 0, 0, settledY],
  );
  const rotate = useTransform(
    scrollYProgress,
    [0, 0.16, 0.84, 1],
    [enterRotation, 0, 0, settledRotation],
  );
  const scale = useTransform(scrollYProgress, [0, 0.16, 0.84, 1], [0.97, 1, 1, settledScale]);

  return (
    <motion.div
      className={className}
      ref={sceneRef}
      style={
        shouldReduceMotion
          ? undefined
          : {
              opacity,
              rotate,
              scale,
              transformOrigin: "center",
              willChange: "transform, opacity",
              y,
            }
      }
    >
      {children}
    </motion.div>
  );
}
