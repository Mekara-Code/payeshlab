"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslations } from "@/components/i18n/dictionary-provider";

const stages = [
  {
    src: "/lab-sequence/stage.png",
    altKey: "labSequence.stage",
    frame: { left: "25.2%", top: "31.35%", width: "76%", height: "66%" },
    sizes:
      "(max-width: 639px) 118vw, (max-width: 1023px) 95vw, (max-width: 1279px) 85vw, (max-width: 1535px) 76vw, 1167px",
    zIndex: 20,
  },
  {
    src: "/lab-sequence/circle.png",
    altKey: "labSequence.circle",
    frame: { left: "16.86%", top: "4.49%", width: "78%", height: "78%" },
    sizes:
      "(max-width: 639px) 121vw, (max-width: 1023px) 98vw, (max-width: 1279px) 87vw, (max-width: 1535px) 78vw, 1198px",
    zIndex: 10,
  },
  {
    src: "/lab-sequence/glass.png",
    altKey: "labSequence.glass",
    frame: { left: "34.77%", top: "24.41%", width: "58%", height: "56%" },
    sizes:
      "(max-width: 639px) 90vw, (max-width: 1023px) 73vw, (max-width: 1279px) 65vw, (max-width: 1535px) 58vw, 891px",
    zIndex: 30,
  },
  {
    src: "/lab-sequence/microscope.png",
    altKey: "labSequence.microscope",
    frame: { left: "30.4%", top: "19.2%", width: "61.5%", height: "61.5%" },
    sizes:
      "(max-width: 639px) 95vw, (max-width: 1023px) 77vw, (max-width: 1279px) 69vw, (max-width: 1535px) 62vw, 945px",
    zIndex: 40,
  },
] as const;

const stageMotion = [
  {
    initial: { opacity: 0, scale: 0.78, y: 110, rotateX: 18, filter: "blur(8px)" },
    animate: { opacity: 1, scale: 1, y: 0, rotateX: 0, filter: "blur(0px)" },
  },
  {
    initial: { opacity: 0, scale: 0.58, rotate: -34, filter: "blur(16px)" },
    animate: { opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" },
  },
  {
    initial: { opacity: 0, scale: 0.9, x: -88, y: 26, rotate: -4, filter: "blur(10px)" },
    animate: { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0, filter: "blur(0px)" },
  },
  {
    initial: { opacity: 0, scale: 1.08, x: 72, y: -36, rotate: 3, filter: "blur(14px) brightness(1.35)" },
    animate: { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0, filter: "blur(0px) brightness(1)" },
  },
] as const;

const stageDuration = 420;
const finalStage = stages.length - 1;

export function LabSequence() {
  const [stageIndex, setStageIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const visibleStage = shouldReduceMotion ? finalStage : stageIndex;
  const { t } = useTranslations();

  useEffect(() => {
    if (shouldReduceMotion || stageIndex === finalStage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setStageIndex((current) => Math.min(current + 1, finalStage));
    }, stageDuration);

    return () => window.clearTimeout(timer);
  }, [shouldReduceMotion, stageIndex]);

  return (
    <section
      aria-label={t("hero.labSequence")}
      className="absolute inset-0 z-10 grid place-items-center overflow-hidden"
    >
      <div className="relative isolate aspect-[3/2] w-[min(155vw,150dvh,96rem)] -translate-x-[14.5%] translate-y-[37%] [perspective:1400px] sm:w-[min(125vw,150dvh,96rem)] sm:-translate-x-[12%] sm:translate-y-[28%] lg:w-[min(112vw,150dvh,96rem)] lg:-translate-x-[8%] lg:translate-y-12 xl:w-[min(100vw,150dvh,96rem)] xl:translate-x-0">
        {stages.map((stage, index) => {
          const currentMotion = stageMotion[index];
          const isVisible = index <= visibleStage;

          return (
            <div
              key={stage.src}
              aria-hidden={!isVisible}
              className="pointer-events-none absolute select-none"
              style={{ ...stage.frame, zIndex: stage.zIndex }}
            >
              <motion.div
                animate={
                  shouldReduceMotion || isVisible
                    ? currentMotion.animate
                    : currentMotion.initial
                }
                className="absolute inset-0 will-change-transform"
                initial={shouldReduceMotion ? false : currentMotion.initial}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 125, damping: 16, mass: 0.78 }
                }
              >
                <Image
                  alt={t(stage.altKey)}
                  className="object-fill"
                  fill
                  loading={index === 0 ? undefined : "eager"}
                  preload={index === 0}
                  sizes={stage.sizes}
                  src={stage.src}
                />
              </motion.div>
            </div>
          );
        })}
      </div>

      <span className="sr-only" aria-live="polite">
        {t("labSequence.progress", {
          current: visibleStage + 1,
          total: stages.length,
        })}
      </span>
    </section>
  );
}
