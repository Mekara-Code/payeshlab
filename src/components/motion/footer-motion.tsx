"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { ScrollScene } from "@/components/motion/scroll-scene";

type FooterRevealProps = {
  children: ReactNode;
  className?: string;
  edge?: boolean;
};

export function FooterBackground() {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: backgroundRef,
    offset: ["start 88%", "end 12%"],
  });
  const outerOpacity = useTransform(scrollYProgress, [0, 0.16, 0.84, 1], [0, 0.72, 0.5, 0.14]);
  const outerScale = useTransform(scrollYProgress, [0, 0.16, 0.84, 1], [0.68, 1, 1.05, 1.1]);
  const outerRotate = useTransform(scrollYProgress, [0, 0.16, 0.84, 1], [-22, 0, 5, 10]);
  const innerOpacity = useTransform(scrollYProgress, [0, 0.16, 0.84, 1], [0, 0.62, 0.42, 0.1]);
  const innerScale = useTransform(scrollYProgress, [0, 0.16, 0.84, 1], [0.72, 1, 1.06, 1.12]);
  const lowerOpacity = useTransform(scrollYProgress, [0, 0.2, 0.84, 1], [0, 0.56, 0.48, 0.16]);
  const lowerScale = useTransform(scrollYProgress, [0, 0.2, 0.84, 1], [0.7, 1, 1.05, 1.1]);
  const lowerX = useTransform(scrollYProgress, [0, 0.2, 0.84, 1], [-54, 0, 12, 26]);
  const lineScale = useTransform(scrollYProgress, [0, 0.16, 0.84, 1], [0, 1, 1, 0.84]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" ref={backgroundRef}>
      <motion.span
        className="absolute -right-36 -top-44 size-[30rem] rounded-full border border-white/30"
        style={shouldReduceMotion ? undefined : { opacity: outerOpacity, rotate: outerRotate, scale: outerScale, willChange: "transform, opacity" }}
      />
      <motion.span
        className="absolute -right-20 -top-28 size-[20rem] rounded-full border border-white/20"
        style={shouldReduceMotion ? undefined : { opacity: innerOpacity, scale: innerScale, willChange: "transform, opacity" }}
      />
      <motion.span
        className="absolute -bottom-52 left-[4%] h-[25rem] w-[44rem] -rotate-12 rounded-[46%] border border-white/25"
        style={shouldReduceMotion ? undefined : { opacity: lowerOpacity, rotate: -12, scale: lowerScale, willChange: "transform, opacity", x: lowerX }}
      />
      <motion.span
        className="absolute inset-x-0 top-0 h-px origin-right bg-white/80"
        style={shouldReduceMotion ? undefined : { scaleX: lineScale, willChange: "transform" }}
      />
    </div>
  );
}

export function FooterReveal({ children, className, edge = false }: FooterRevealProps) {
  return (
    <ScrollScene
      className={className}
      distance={40}
      exitOnLeave={!edge}
      offset={edge ? ["start 100%", "end 97%"] : undefined}
    >
      {children}
    </ScrollScene>
  );
}
