"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ScrollScene } from "@/components/motion/scroll-scene";

type Metric = {
  label: string;
  prefix?: string;
  progress: number;
  suffix?: string;
  value: number;
};

const metrics: readonly Metric[] = [
  { label: "رضایت مراجعین", progress: 98, suffix: "٪", value: 98 },
  { label: "سال تجربه", prefix: "+", progress: 78, value: 15 },
  { label: "آزمایش انجام‌شده", prefix: "+", progress: 91, value: 50_000 },
] as const;

const numberFormatter = new Intl.NumberFormat("fa-IR");
const circleRadius = 44;
const circleCircumference = 2 * Math.PI * circleRadius;

function useCountUp({
  delay,
  isActive,
  shouldReduceMotion,
  target,
}: {
  delay: number;
  isActive: boolean;
  shouldReduceMotion: boolean | null;
  target: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    if (shouldReduceMotion) {
      const animationFrame = window.requestAnimationFrame(() => setCount(target));
      return () => window.cancelAnimationFrame(animationFrame);
    }

    let animationFrame = 0;
    const timer = window.setTimeout(() => {
      const startedAt = performance.now();
      const duration = 1_300;

      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        const easedProgress = 1 - (1 - progress) ** 3;
        setCount(Math.round(target * easedProgress));

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(tick);
        }
      };

      animationFrame = window.requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [delay, isActive, shouldReduceMotion, target]);

  return count;
}

function MetricPie({
  metric,
  index,
}: {
  metric: Metric;
  index: number;
}) {
  const metricRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isInView = useInView(metricRef, { amount: 0.6, once: true });
  const isActive = Boolean(shouldReduceMotion || isInView);
  const count = useCountUp({
    delay: index * 100,
    isActive,
    shouldReduceMotion,
    target: metric.value,
  });
  const completedOffset = circleCircumference * (1 - metric.progress / 100);
  const displayValue = `${metric.prefix ?? ""}${numberFormatter.format(count)}${metric.suffix ?? ""}`;

  return (
    <div className="flex justify-center" ref={metricRef}>
      <div className="relative grid aspect-square w-full max-w-[8rem] place-items-center sm:max-w-[10rem]">
        <svg
          aria-hidden="true"
          className="absolute inset-0 size-full -rotate-90"
          fill="none"
          viewBox="0 0 120 120"
        >
          <circle
            className="text-slate-200"
            cx="60"
            cy="60"
            r={circleRadius}
            stroke="currentColor"
            strokeWidth="8"
          />
          <motion.circle
            animate={{
              strokeDashoffset: isActive ? completedOffset : circleCircumference,
            }}
            className="text-teal-500"
            cx="60"
            cy="60"
            initial={{
              strokeDashoffset: shouldReduceMotion
                ? completedOffset
                : circleCircumference,
            }}
            r={circleRadius}
            stroke="currentColor"
            strokeDasharray={circleCircumference}
            strokeLinecap="round"
            strokeWidth="8"
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    delay: index * 0.1,
                    duration: 1.3,
                    ease: [0.16, 1, 0.3, 1],
                  }
            }
          />
        </svg>

        <div className="relative z-10 flex max-w-[82%] flex-col items-center text-center">
          <span
            aria-label={`${metric.label}: ${displayValue}`}
            className="whitespace-nowrap text-base font-black tracking-[-0.05em] text-teal-500 sm:text-2xl"
          >
            <bdi dir="ltr">{displayValue}</bdi>
          </span>
          <span className="mt-1 text-[9px] font-bold leading-3.5 text-slate-700 sm:text-xs sm:leading-5">
            {metric.label}
          </span>
        </div>
      </div>
    </div>
  );
}

export function HeroContent() {
  return (
    <ScrollScene className="max-w-xl text-right" distance={30}>
      <span className="inline-flex rounded-full bg-white/75 px-4 py-2 text-sm font-bold text-slate-600 backdrop-blur-md">
        دقت • محرمانگی • همراهی بین‌المللی
      </span>

      <h1 className="mt-7 text-[clamp(2.25rem,9vw,4.9rem)] font-black leading-[1.1] tracking-[-0.06em] text-slate-950 sm:text-[clamp(2.8rem,4.8vw,4.9rem)]">
        آزمایشگاه با استانداردهای جهانی
      </h1>

      <p className="mt-7 max-w-lg text-base font-medium leading-9 text-slate-800 sm:text-lg sm:leading-9">
        ارائه خدمات تخصصی پاتولوژی و آزمایشگاهی با تجهیزات مدرن و تیمی متعهد برای سلامت مراجعه کنندگان ایرانی و خارجی.
      </p>

      <a
        className="mt-8 inline-flex min-h-12 w-fit items-center justify-center gap-3 rounded-full bg-teal-500 px-6 py-3.5 text-base font-extrabold text-white shadow-[0_16px_34px_rgba(13,148,136,0.3)] transition hover:-translate-y-0.5 hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500"
        href="#services"
      >
        مشاهده خدمات
        <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
          <path d="M19 12H5m7-7-7 7 7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      </a>
    </ScrollScene>
  );
}

export function HeroStatistics() {
  return (
    <ScrollScene distance={26}>
      <section
        aria-label="آمار آزمایشگاه"
        className="mx-auto max-w-3xl rounded-[1.75rem] border border-white/80 bg-white/75 px-2 py-4 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-md sm:px-6 sm:py-6"
      >
        <dl className="grid grid-cols-3 gap-1 sm:gap-6">
          {metrics.map((metric, index) => (
            <div key={metric.label}>
              <dt className="sr-only">{metric.label}</dt>
              <dd>
                <MetricPie index={index} metric={metric} />
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </ScrollScene>
  );
}
